const V6_GROUPS=[
  {label:'IDENTIFICACIÓN',start:0,end:3,cls:'grp-id'},
  {label:'ACADÉMICO',start:4,end:10,cls:'grp-acad'},
  {label:'PAGO / PROMOCIÓN',start:11,end:19,cls:'grp-pay'},
  {label:'ESTATUS / CONTROL',start:20,end:27,cls:'grp-status'}
];
const V6_WIDTHS=[200,110,125,250,92,145,160,140,125,270,170,175,135,210,285,120,165,165,165,165,135,190,180,125,180,180,130,140];
const V6_ACTIONS=[
  {key:'current',label:'Seguimiento actual',w:160},
  {key:'type',label:'Tipo de ajuste',w:190},
  {key:'comment',label:'Solicitud / comentario',w:300},
  {key:'send',label:'Enviar',w:96}
];
let v6FreezeLeft=true,v6FreezeRight=true,v6Dense=true,v6Loading=true;

const v6Style=document.createElement('style');
v6Style.textContent=`
main{max-width:none!important;padding:14px 16px 18px!important}
.excelHero{display:flex;justify-content:space-between;align-items:end;gap:12px;flex-wrap:wrap}
.excelHero h2{margin:0}.excelMeta{display:flex;gap:7px;flex-wrap:wrap;align-items:center}
.excelToolbar{display:grid;grid-template-columns:minmax(260px,2fr) minmax(150px,1fr) minmax(145px,1fr) minmax(125px,.8fr) 95px auto auto;gap:8px;align-items:end;margin:12px 0 8px}
.freezeBar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0 10px;padding:8px 10px;background:#fff;border:1px solid var(--border);border-radius:9px}
.freezeBar .freezeLabel{font-size:11px;color:var(--muted);font-weight:700;margin-right:2px}.freezeBtn.active{background:#eef4ff;border-color:#9bb3ff;color:#2445b8}.freezeBtn{padding:7px 10px!important}
.excelWrap{position:relative;background:#fff;border:1px solid #cfd5df;border-radius:8px;overflow:auto;max-height:calc(100vh - 235px);min-height:500px;box-shadow:0 1px 2px #1018280a}
.excelTable{border-collapse:separate;border-spacing:0;width:max-content;min-width:100%;table-layout:fixed;font-size:11px;color:#172033}
.excelTable th,.excelTable td{border-right:1px solid #dfe3ea;border-bottom:1px solid #dfe3ea;padding:0 7px;white-space:nowrap;background:#fff;height:34px;overflow:hidden;text-overflow:ellipsis}
.excelTable tbody tr:nth-child(even) td:not(.adjustCell){background:#fbfcfe}.excelTable tbody tr:hover td{background:#eef4ff!important}.excelTable tbody tr.rowFocus td{background:#e8f0ff!important}
.excelTable thead th{font-weight:700;color:#344054}
.excelTable .groupRow th{position:sticky;top:0;z-index:8;height:27px;text-align:center;letter-spacing:.04em;font-size:10px;border-bottom:1px solid #cfd5df}
.excelTable .headerRow th{position:sticky;top:27px;z-index:8;height:38px;background:#f7f8fa;text-align:left;line-height:1.15;white-space:normal}
.excelTable .grp-id{background:#eef4ff}.excelTable .grp-acad{background:#f4f3ff}.excelTable .grp-pay{background:#fff7e8}.excelTable .grp-status{background:#ecfdf3}.excelTable .grp-adjust{background:#e8efff;color:#2445b8}
.excelTable .rowNum{width:44px;min-width:44px;max-width:44px;text-align:center;color:#667085;background:#f4f5f7!important;font-variant-numeric:tabular-nums}
.excelTable .statusCell .pill{font-size:10px;padding:3px 6px}.excelTable .longCell{max-width:100%;overflow:hidden;text-overflow:ellipsis}.excelTable td[title]{cursor:default}
.excelTable input,.excelTable select{height:28px;border-radius:5px;padding:3px 7px;font-size:11px;border:1px solid #cbd2dc;background:#fff}.excelTable input:focus,.excelTable select:focus{outline:2px solid #9bb3ff;outline-offset:-1px}
.excelTable .adjustCell{background:#f8faff!important}.excelTable .currentCell{line-height:1.15}.excelTable .sendBtn{height:28px;padding:4px 10px!important;border-radius:5px!important;font-size:11px}.excelTable .rowNote{display:block;font-size:9px;color:var(--muted);margin-top:2px;max-width:280px;overflow:hidden;text-overflow:ellipsis}.excelTable .rowNote.ok{color:var(--good)}.excelTable .rowNote.err{color:var(--bad)}
.excelTable.dense th,.excelTable.dense td{height:30px}.excelTable.dense .headerRow th{height:34px}.excelTable.dense input,.excelTable.dense select,.excelTable.dense .sendBtn{height:25px}
.excelWrap.freeze-left .rowNum{position:sticky;left:0;z-index:11}
.excelWrap.freeze-left .fl0{position:sticky;left:44px;z-index:10;background:#fff}
.excelWrap.freeze-left .fl1{position:sticky;left:244px;z-index:10;background:#fff}
.excelWrap.freeze-left .fl2{position:sticky;left:354px;z-index:10;background:#fff}
.excelWrap.freeze-left .fl3{position:sticky;left:479px;z-index:10;background:#fff;box-shadow:5px 0 8px -7px #344054}
.excelWrap.freeze-left thead .rowNum,.excelWrap.freeze-left thead .fl0,.excelWrap.freeze-left thead .fl1,.excelWrap.freeze-left thead .fl2,.excelWrap.freeze-left thead .fl3{z-index:16}
.excelWrap.freeze-left tbody tr:nth-child(even) .fl0,.excelWrap.freeze-left tbody tr:nth-child(even) .fl1,.excelWrap.freeze-left tbody tr:nth-child(even) .fl2,.excelWrap.freeze-left tbody tr:nth-child(even) .fl3{background:#fbfcfe}
.excelWrap.freeze-right .fr3{position:sticky;right:0;z-index:12;background:#f8faff!important}
.excelWrap.freeze-right .fr2{position:sticky;right:96px;z-index:12;background:#f8faff!important}
.excelWrap.freeze-right .fr1{position:sticky;right:396px;z-index:12;background:#f8faff!important}
.excelWrap.freeze-right .fr0{position:sticky;right:586px;z-index:12;background:#f8faff!important;box-shadow:-5px 0 8px -7px #344054}
.excelWrap.freeze-right thead .fr0,.excelWrap.freeze-right thead .fr1,.excelWrap.freeze-right thead .fr2,.excelWrap.freeze-right thead .fr3{z-index:17;background:#e8efff!important}
.excelPager{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:8px}.excelPagerActions{display:flex;gap:6px;align-items:center}.excelPager select{width:80px;padding:6px 8px;border-radius:7px}
.loadingSheet{display:grid;place-items:center;min-height:420px;color:var(--muted)}
@media(max-width:1200px){.excelToolbar{grid-template-columns:2fr 1fr 1fr 1fr}.excelToolbar .toolbarExtra{grid-column:auto}.excelWrap{max-height:650px}}
@media(max-width:760px){.excelToolbar{grid-template-columns:1fr 1fr}.freezeBar{align-items:stretch}.freezeBar .btn{flex:1}.excelWrap{min-height:440px}}
`;
document.head.appendChild(v6Style);

function v6ApplyBase(headers,matrix,name='Base cargada'){
  rawHeaders=headers.slice();
  rawRows=matrix.map(vals=>{const o={};headers.forEach((h,i)=>o[h]=vals[i]??'');return o});
  students=rawRows.map((r,idx)=>({
    i:normMat(r['Matrícula']||`SIN-${idx+1}`),
    name:String(r['Contacto: Nombre completo']||''),
    c:String(r['Campus: Nombre de la cuenta']||''),
    p:String(r['Programa 1: Curso: Nombre del curso']||''),
    pe:String(r['Periodo: Nombre de plazo']||''),
    n:String(r['Nivel']||''),
    e:String(r['Estatus de Alumno']||''),
    doc:String(r['Documentos']||''),
    pay:String(r['Estatus de pago']||''),
    z:'',ai:Number(String(r['Asistencia inducción']||'0').replace(',','.'))||0
  }));
  uploadMeta={name,when:new Date().toLocaleString('es-MX')};
  if(!selectedCampus||!campuses().includes(selectedCampus)) selectedCampus=campuses()[0]||'';
  v6Loading=false;
  sheetPage=0;sheetSearch='';sheetCampus='';sheetStatus='';sheetPeriod='';
}

async function v6LoadEmbedded(){
  if(!window.UTC_BASE_GZ){v6Loading=false;return}
  try{
    const bin=Uint8Array.from(atob(window.UTC_BASE_GZ),c=>c.charCodeAt(0));
    let jsonText;
    if('DecompressionStream' in window){
      const stream=new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'));
      jsonText=await new Response(stream).text();
    }else{
      throw new Error('El navegador no soporta descompresión nativa. Usa Chrome o Edge actualizado.');
    }
    const data=JSON.parse(jsonText);
    v6ApplyBase(data.headers,data.rows,'report1786383079888.xls');
    renderSidebar();
    showView(role==='manager'?'managerDashboard':role==='commercial'?'commercialHome':'studentsView');
  }catch(e){
    console.error(e);v6Loading=false;
    const target=$('#studentsView');if(target)target.innerHTML=`<div class="note warn"><b>No se pudo cargar la base integrada.</b><br>${esc(e.message)}</div>`;
  }
}

function v6GroupsHTML(headers,mode){
  let cells='<th class="rowNum" rowspan="2">#</th>';
  V6_GROUPS.forEach(g=>{
    const start=Math.max(0,g.start),end=Math.min(headers.length-1,g.end);
    if(end>=start)cells+=`<th class="${g.cls}" colspan="${end-start+1}">${g.label}</th>`;
  });
  if(headers.length>28)cells+=`<th colspan="${headers.length-28}">OTROS CAMPOS</th>`;
  cells+=`<th class="grp-adjust" colspan="4">${mode==='recovery'?'GESTIÓN DE RECUPERACIÓN':'AJUSTES / SEGUIMIENTO'}</th>`;
  return `<tr class="groupRow">${cells}</tr>`;
}
function v6HeaderClass(i){return i<4?`fl${i}`:''}
function v6ActionHeader(a,i){return `<th class="grp-adjust fr${i}" style="width:${a.w}px;min-width:${a.w}px;max-width:${a.w}px">${esc(a.label)}</th>`}
function v6TableHeaders(headers,mode){
  const acts=mode==='recovery' ? [
    {key:'current',label:'Última gestión',w:160},{key:'type',label:'Resultado / acción',w:190},{key:'comment',label:'Comentario de gestión',w:300},{key:'send',label:'Guardar',w:96}
  ] : V6_ACTIONS;
  return `${v6GroupsHTML(headers,mode)}<tr class="headerRow"><th class="rowNum">Fila</th>${headers.map((h,i)=>`<th class="${v6HeaderClass(i)}" style="width:${V6_WIDTHS[i]||165}px;min-width:${V6_WIDTHS[i]||165}px;max-width:${V6_WIDTHS[i]||165}px" title="${esc(h)}">${esc(h)}</th>`).join('')}${acts.map(v6ActionHeader).join('')}</tr>`;
}

function v6FilterOptions(vals,current,all='Todos'){
  return `<option value="">${all}</option>`+[...new Set(vals.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'es')).map(v=>`<option value="${esc(v)}" ${v===current?'selected':''}>${esc(v)}</option>`).join('');
}
function v6FreezeControls(){
  return `<div class="freezeBar"><span class="freezeLabel">Inmovilizar:</span><button class="btn freezeBtn ${v6FreezeLeft?'active':''}" id="freezeLeft">📌 Alumno</button><button class="btn freezeBtn ${v6FreezeRight?'active':''}" id="freezeRight">📌 Ajustes</button><button class="btn freezeBtn ${v6Dense?'active':''}" id="denseRows">↕ Compacto</button><span class="sub">“Alumno” fija desde Id. de oportunidad hasta Nombre. “Ajustes” fija las 4 columnas editables del final.</span></div>`;
}
function v6WireFreeze(){
  const wrap=$('#excelWrap'),table=$('#excelTable');if(!wrap)return;
  const refresh=()=>{wrap.classList.toggle('freeze-left',v6FreezeLeft);wrap.classList.toggle('freeze-right',v6FreezeRight);table?.classList.toggle('dense',v6Dense);$('#freezeLeft')?.classList.toggle('active',v6FreezeLeft);$('#freezeRight')?.classList.toggle('active',v6FreezeRight);$('#denseRows')?.classList.toggle('active',v6Dense)};
  $('#freezeLeft').onclick=()=>{v6FreezeLeft=!v6FreezeLeft;refresh()};
  $('#freezeRight').onclick=()=>{v6FreezeRight=!v6FreezeRight;refresh()};
  $('#denseRows').onclick=()=>{v6Dense=!v6Dense;refresh()};refresh();
}
function v6CurrentHTML(last){return last?`<span class="pill ${statusClass(last.estatus)}">${esc(last.estatus)}</span><span class="rowNote">${esc(last.resultado||last.tipo||'')}</span>`:'<span class="sub">Sin seguimiento</span>'}
function v6Cell(h,v){const val=(v===null||v===undefined)?'':String(v);if(h==='Estatus de Alumno'&&val)return `<span class="pill ${statusClass(val)}">${esc(val)}</span>`;return val?esc(val):'—'}
function v6RequestOptions(mode){const vals=mode==='recovery'?['','CONTACTADO','SIN CONTACTO','EN NEGOCIACIÓN','RECUPERADO','NO RECUPERABLE','SOLICITAR APOYO']:['','Cambio de ciclo','Pago / reclasificación','Validación','Admisión','Documentos','Accesos','Cupón / promoción','Programa / horario','Otro'];return vals.map((v,i)=>`<option value="${esc(v)}">${i===0?'Seleccionar…':esc(v)}</option>`).join('')}

function v6RenderGrid(mode='request'){
  const isRecovery=mode==='recovery';
  const base=isRecovery?recoveryStudents():(role==='campus'?students.filter(x=>x.c===selectedCampus):students.slice());
  const headers=rawHeaders.length?rawHeaders:(typeof UTC_SHEET_HEADERS!=='undefined'?UTC_SHEET_HEADERS:[]);
  if(v6Loading){const target=isRecovery?$('#commercialPortfolio'):$('#studentsView');target.innerHTML='<div class="loadingSheet">Cargando base…</div>';return}
  const statuses=[...new Set(base.map(x=>x.e).filter(Boolean))];const periods=[...new Set(base.map(x=>x.pe).filter(Boolean))];const cs=isRecovery?[...new Set(base.map(x=>x.c).filter(Boolean))]:(role==='campus'?[selectedCampus]:campuses());
  if(role==='campus'&&!isRecovery)sheetCampus=selectedCampus;
  const target=isRecovery?$('#commercialPortfolio'):$('#studentsView');
  const title=isRecovery?'Cartera de recuperación':role==='manager'?'Consulta operativa':'Hoja operativa del plantel';
  const subtitle=isRecovery?'Sólo Baja y En riesgo de baja. Registra la gestión en las columnas inmovilizadas del lado derecho.':'Salesforce queda en sólo lectura. Captura el ajuste directamente al final de la misma fila.';
  target.innerHTML=`
    <div class="excelHero"><div><h2>${title}</h2><div class="sub">${subtitle}</div></div><div class="excelMeta"><span class="pill">${fmt(base.length)} alumnos</span><span class="pill">${headers.length} columnas base</span><span class="pill">4 columnas de ${isRecovery?'gestión':'ajuste'}</span></div></div>
    <div class="excelToolbar">
      <div><label>Buscar en toda la hoja</label><input id="xq" value="${esc(sheetSearch)}" placeholder="Matrícula, nombre, programa, cupón, comentario..."></div>
      <div><label>Plantel</label><select id="xc" ${(role==='campus'&&!isRecovery)?'disabled':''}>${(role==='manager'||isRecovery)?'<option value="">Todos</option>':''}${cs.sort((a,b)=>a.localeCompare(b,'es')).map(c=>`<option value="${esc(c)}" ${c===sheetCampus?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
      <div><label>Estatus</label><select id="xs">${v6FilterOptions(statuses,sheetStatus)}</select></div>
      <div><label>Periodo</label><select id="xp">${v6FilterOptions(periods,sheetPeriod)}</select></div>
      <div><label>Filas</label><select id="xps"><option ${sheetPageSize===50?'selected':''}>50</option><option ${sheetPageSize===100?'selected':''}>100</option><option ${sheetPageSize===200?'selected':''}>200</option></select></div>
      <button class="btn toolbarExtra" id="toStart">← Alumno</button><button class="btn primary toolbarExtra" id="toAdjust">Ajustes →</button>
    </div>
    ${v6FreezeControls()}
    <div class="excelWrap freeze-left freeze-right" id="excelWrap"><table class="excelTable dense" id="excelTable"><thead>${v6TableHeaders(headers,mode)}</thead><tbody id="excelBody"></tbody></table></div>
    <div class="excelPager"><span class="sub" id="excelCount"></span><div class="excelPagerActions"><button class="btn" id="xprev">← Anterior</button><button class="btn" id="xnext">Siguiente →</button></div></div>`;
  sheetCtx={base,headers,map:rawMapNow(),mode};
  const apply=(reset=true)=>{sheetSearch=$('#xq').value.trim().toLowerCase();sheetCampus=$('#xc').value;sheetStatus=$('#xs').value;sheetPeriod=$('#xp').value;sheetPageSize=Number($('#xps').value)||100;if(reset)sheetPage=0;v6RenderRows()};
  $('#xq').addEventListener('input',()=>apply(true));['xc','xs','xp','xps'].forEach(id=>$('#'+id).addEventListener('change',()=>apply(true)));
  $('#toStart').onclick=()=>{$('#excelWrap').scrollLeft=0};$('#toAdjust').onclick=()=>{const w=$('#excelWrap');w.scrollLeft=w.scrollWidth};
  $('#xprev').onclick=()=>{if(sheetPage>0){sheetPage--;v6RenderRows()}};$('#xnext').onclick=()=>{sheetPage++;v6RenderRows()};
  v6WireFreeze();v6RenderRows();
}
