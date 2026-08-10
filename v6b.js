function v6RenderRows(){
  if(!sheetCtx)return;const {base,headers,map,mode}=sheetCtx;
  let filtered=base.filter(x=>{
    if(sheetCampus&&x.c!==sheetCampus)return false;if(sheetStatus&&x.e!==sheetStatus)return false;if(sheetPeriod&&x.pe!==sheetPeriod)return false;
    if(sheetSearch){const r=rowForStudent(x,map),hay=Object.values(r).join(' ').toLowerCase();if(!hay.includes(sheetSearch))return false}return true;
  });
  const pages=Math.max(1,Math.ceil(filtered.length/sheetPageSize));sheetPage=Math.max(0,Math.min(sheetPage,pages-1));const pageRows=filtered.slice(sheetPage*sheetPageSize,(sheetPage+1)*sheetPageSize);const opts=v6RequestOptions(mode);
  $('#excelBody').innerHTML=pageRows.map((x,ri)=>{
    const r=rowForStudent(x,map),last=latestFollow(x.i,mode==='recovery'?'Comercial':'Operativo');const absolute=sheetPage*sheetPageSize+ri+1;
    return `<tr data-rowid="${esc(x.i)}"><td class="rowNum">${absolute}</td>${headers.map((h,i)=>`<td class="${v6HeaderClass(i)} ${h==='Estatus de Alumno'?'statusCell':''}" style="width:${V6_WIDTHS[i]||165}px;min-width:${V6_WIDTHS[i]||165}px;max-width:${V6_WIDTHS[i]||165}px" title="${esc(r[h]??'')}">${v6Cell(h,r[h])}</td>`).join('')}<td class="adjustCell currentCell fr0" style="width:160px;min-width:160px;max-width:160px"><div class="sheetCurrent">${v6CurrentHTML(last)}</div></td><td class="adjustCell fr1" style="width:190px;min-width:190px;max-width:190px"><select class="sheetType">${opts}</select></td><td class="adjustCell fr2" style="width:300px;min-width:300px;max-width:300px"><input class="sheetComment" placeholder="${mode==='recovery'?'Resultado de la gestión…':'Describe el ajuste solicitado…'}"><span class="rowNote"></span></td><td class="adjustCell fr3" style="width:96px;min-width:96px;max-width:96px"><button class="btn primary sendBtn" data-id="${esc(x.i)}">${mode==='recovery'?'Guardar':'Enviar'}</button></td></tr>`;
  }).join('')||`<tr><td colspan="${headers.length+5}" class="empty">Sin resultados.</td></tr>`;
  $('#excelCount').textContent=`${fmt(filtered.length)} resultados · página ${sheetPage+1} de ${pages}`;$('#xprev').disabled=sheetPage<=0;$('#xnext').disabled=sheetPage>=pages-1;
  $$('.sendBtn').forEach(btn=>btn.onclick=()=>v6SaveInline(btn,mode));$$('#excelBody tr').forEach(tr=>tr.onclick=e=>{if(e.target.closest('input,select,button'))return;$$('#excelBody tr').forEach(x=>x.classList.remove('rowFocus'));tr.classList.add('rowFocus')});
  v6WireFreeze();
}

function v6SaveInline(btn,mode){
  const tr=btn.closest('tr'),mat=btn.dataset.id,x=students.find(s=>normMat(s.i)===normMat(mat)),type=tr.querySelector('.sheetType').value,comment=tr.querySelector('.sheetComment').value.trim(),note=tr.querySelector('.sheetComment').nextElementSibling;
  note.className='rowNote';if(!type){note.textContent='Selecciona una opción.';note.classList.add('err');return}if(!comment){note.textContent='Escribe el detalle.';note.classList.add('err');tr.querySelector('.sheetComment').focus();return}
  const t=getF(),id=Math.max(3000,...t.map(y=>Number(y.id)||0))+1,recovery=mode==='recovery',done=recovery&&(type==='RECUPERADO'||type==='NO RECUPERABLE');
  t.push({id,matricula:mat,campus:x?.c||selectedCampus,tipo:recovery?'Recuperación':type,resultado:recovery?type:'',descripcion:comment,area:recovery?'Comercial':role==='manager'?'Gestor':'Campus',estatus:done?'RESUELTA':recovery?'EN REVISIÓN':'NUEVA',responsable:'',created:new Date().toISOString(),updated:new Date().toISOString(),demo:false});setF(t);
  tr.querySelector('.sheetType').value='';tr.querySelector('.sheetComment').value='';note.textContent='✓ Guardado';note.classList.add('ok');const last=latestFollow(mat,recovery?'Comercial':'Operativo');tr.querySelector('.sheetCurrent').innerHTML=v6CurrentHTML(last);btn.textContent='✓';setTimeout(()=>btn.textContent=recovery?'Guardar':'Enviar',1100);
}

renderStudents=function(){v6RenderGrid('request')};
renderCommercialPortfolio=function(){v6RenderGrid('recovery')};

renderUpload=function(){
  const ss=countBy(students,'e');$('#managerUpload').innerHTML=`<h2>Cargar base Salesforce</h2><div class="sub">La estructura ya está definida. Puedes cargar el mismo export de Salesforce en .xls o .xlsx.</div><div class="note"><b>Sin mapeo:</b> se toman las columnas en el orden del archivo y se reemplaza el corte operativo de esta sesión.</div><div class="uploadBox"><b>Seleccionar REPORTE UTC</b><input id="excelFile" type="file" accept=".xls,.xlsx"><div id="uploadResult" class="uploadResult"></div></div><div class="baseMeta"><div class="fact"><small>Registros</small><b>${fmt(students.length)}</b></div><div class="fact"><small>Columnas</small><b>${fmt(rawHeaders.length||28)}</b></div><div class="fact"><small>Admitidos</small><b>${fmt(ss.Admitido||0)}</b></div><div class="fact"><small>Bajas + riesgo</small><b>${fmt(recoveryStudents().length)}</b></div></div>`;$('#excelFile').onchange=v6LoadFile;
};
async function v6LoadFile(ev){
  const file=ev.target.files?.[0];if(!file)return;const out=$('#uploadResult');out.innerHTML='<span class="sub">Procesando…</span>';
  try{
    const buf=await file.arrayBuffer(),probe=new TextDecoder('windows-1252').decode(buf.slice(0,700));let headers,matrix;
    if(/<table|<tr|<th/i.test(probe)){
      const text=new TextDecoder('windows-1252').decode(buf),doc=new DOMParser().parseFromString(text,'text/html'),trs=[...doc.querySelectorAll('tr')];if(trs.length<2)throw new Error('El archivo no contiene filas.');headers=[...trs[0].querySelectorAll('th,td')].map(c=>c.textContent.trim());matrix=trs.slice(1).map(tr=>[...tr.querySelectorAll('th,td')].map(c=>c.textContent.trim())).filter(r=>r.length).map(r=>(r.concat(Array(headers.length).fill(''))).slice(0,headers.length));
    }else{
      const wb=XLSX.read(buf,{type:'array',cellDates:true}),ws=wb.Sheets['BASE TOTAL']||wb.Sheets[wb.SheetNames[0]],aoa=XLSX.utils.sheet_to_json(ws,{header:1,defval:'',raw:false,dateNF:'dd/mm/yyyy'});headers=aoa[0].map(x=>String(x||'').trim());matrix=aoa.slice(1).filter(r=>r.some(v=>String(v||'').trim()!=='')).map(r=>(r.concat(Array(headers.length).fill(''))).slice(0,headers.length));
    }
    const must=['Matrícula','Contacto: Nombre completo','Campus: Nombre de la cuenta','Estatus de Alumno'];const missing=must.filter(h=>!headers.includes(h));if(missing.length)throw new Error('Faltan columnas esperadas: '+missing.join(', '));v6ApplyBase(headers,matrix,file.name);out.innerHTML=`<div class="note" style="margin-bottom:0"><b>✓ Base cargada</b><br>${fmt(matrix.length)} alumnos · ${fmt(headers.length)} columnas.<br><button class="btn primary" id="openGrid" style="margin-top:8px">Abrir hoja operativa</button></div>`;$('#openGrid').onclick=()=>showView('studentsView');
  }catch(e){out.innerHTML=`<div class="note warn"><b>Error:</b> ${esc(e.message)}</div>`}
}

const oldTop=$('#newFollowTop');if(oldTop){oldTop.style.display='none'}
v6LoadEmbedded();
