const UTC_SHEET_HEADERS=[
'Id. de oportunidad 18 dígitos','Asesor Postventa: Nombre completo','Matrícula','Matrícula de Origen','Programa de Origen','Importe','Contacto: Nombre completo','Contacto: Apellidos','Contacto: Nombre','Periodo: Nombre de plazo','Campus: Nombre de la cuenta','Nivel','Programa 1: Curso: Nombre del curso','Admisiones - Selecciona código STYPE','Fecha de Nacimiento','CURP','Email de la Universidad','Contraseña','Correo electrónico','Móvil','Teléfono','Fecha de Pago (Admisiones)','Total de pagos','Saldo a favor','Descuento de colegiatura','Descuento segunda colegiatura','Descuento tercer colegiatura','Descuento cuarta colegiatura','Descuento en titulación','Cupón: % Beca después de promoción','Cupón: Nombre de Cupón','Vigencia cupón','Descripción Cupón','Día de preferencia','Empresa Convenio: Nombre de la cuenta','Contacto: Matrícula de quien refiere','Contacto: Nombre de quien refiere','Celular de quien refiere','Email de quien refiere','Propietario de oportunidad: Nombre completo','Propietario de oportunidad: Supervisor: Nombre completo','Envío de accesos','Fecha de curso de inducción','Asistencia inducción','Estatus de Alumno','Detalle de estatus','Subcategoria','Documentos','Carpeta de documentos','Certificado Académico / Revalidación','Oportunidad de doble titulación','Análisis académico','Contratos / Hoja de registro','Acta de nacimiento','INE','CURP2','Responsiva documentos','T&C Plataforma estudiante','Datos ADE','Fecha de cambio a estatus Pagado','Fecha de cambio a estatus Inscrito','Primer actividad postventa','Fecha original a estado Validado PV','Fecha original a estatus Admitido','Región del propietario','Origen del prospecto','Incidencia asesor de venta','Tipo de incidencia asesor postventa','Turno','Horario','Venta compartida','Cita activa','Comentarios','Estatus de pago','Asistencia','ZONA','Fecha de venta'
];

const v5Style=document.createElement('style');
v5Style.textContent=`
main{max-width:none!important;padding:18px!important}.students{display:block!important}.studentcard{display:none!important}
.sheetToolbar{display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto auto;gap:8px;align-items:end;margin:12px 0}.sheetHint{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin:8px 0 10px}.sheetWrap{background:#fff;border:1px solid var(--border);border-radius:10px;overflow:auto;max-height:calc(100vh - 235px);min-height:460px}.sheetTable{border-collapse:separate;border-spacing:0;width:max-content;min-width:100%;font-size:11px}.sheetTable th,.sheetTable td{border-right:1px solid #e7eaf0;border-bottom:1px solid #e7eaf0;padding:6px 8px;white-space:nowrap;background:#fff;height:38px}.sheetTable th{position:sticky;top:0;z-index:3;background:#f7f8fa;color:#475467;font-weight:700;max-width:210px}.sheetTable tr:hover td{background:#fafcff}.sheetTable .cellClip{display:block;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sheetTable .wideCell{max-width:340px}.sheetTable .followHead{background:#eaf0ff;color:#2445b8}.sheetTable .followCell{background:#f8faff}.sheetTable tr:hover .followCell{background:#f3f6ff}.sheetType{min-width:190px;padding:6px 8px!important;border-radius:6px!important}.sheetComment{min-width:280px;padding:6px 8px!important;border-radius:6px!important}.sheetSend{padding:7px 11px!important;border-radius:7px!important}.sheetCurrent{min-width:135px}.sheetRowMsg{display:block;font-size:10px;margin-top:3px;color:var(--muted)}.sheetRowMsg.ok{color:var(--good)}.sheetRowMsg.err{color:var(--bad)}.sheetPager{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-top:9px}.sheetPagerActions{display:flex;gap:6px}.sheetLocked{background:#f9fafb!important}.sheetEditable{box-shadow:inset 3px 0 0 #3157d520}.sheetStatusCell .pill{font-size:10px;padding:3px 6px}#newFollowTop{display:none!important}
@media(max-width:1000px){.sheetToolbar{grid-template-columns:1fr 1fr}.sheetWrap{max-height:620px}}
@media(max-width:600px){.sheetToolbar{grid-template-columns:1fr}.sheetHint{align-items:stretch}.sheetHint .btn{width:100%}}
`;
document.head.appendChild(v5Style);

let sheetPage=0;
let sheetPageSize=50;
let sheetSearch='';
let sheetCampus='';
let sheetStatus='';
let sheetPeriod='';
let sheetCtx=null;

function normMat(v){return String(v??'').trim().replace(/\.0$/,'')}
function rawMapNow(){const m=new Map();if(rawRows?.length)rawRows.forEach(r=>m.set(normMat(r['Matrícula']),r));return m}
function syntheticRow(x){const r={};UTC_SHEET_HEADERS.forEach(h=>r[h]='');r['Matrícula']=x.i||'';r['Contacto: Nombre completo']=x.name||'Identidad protegida en publicación pública';r['Periodo: Nombre de plazo']=x.pe||'';r['Campus: Nombre de la cuenta']=x.c||'';r['Nivel']=x.n||'';r['Programa 1: Curso: Nombre del curso']=x.p||'';r['Asistencia inducción']=x.ai??'';r['Estatus de Alumno']=x.e||'';r['Documentos']=x.doc||'';r['Estatus de pago']=x.pay||'';r['ZONA']=x.z||'';return r}
function rowForStudent(x,map){return map.get(normMat(x.i))||syntheticRow(x)}
function latestFollow(mat,area){const all=getF().filter(f=>normMat(f.matricula)===normMat(mat)&&(area==='Comercial'?f.area==='Comercial':f.area!=='Comercial'));all.sort((a,b)=>new Date(a.created)-new Date(b.created));return all[all.length-1]||null}
function cellHTML(h,v){const val=(v===null||v===undefined||v==='')?'':String(v);if(h==='Estatus de Alumno'&&val)return `<span class="pill ${statusClass(val)}">${esc(val)}</span>`;const wide=['Descripción Cupón','Comentarios','Programa 1: Curso: Nombre del curso'].includes(h)?' wideCell':'';return `<span class="cellClip${wide}" title="${esc(val)}">${val?esc(val):'—'}</span>`}
function requestTypes(){return ['','Cambio de ciclo','Validación','Admisión','Pago','Documentos','Accesos','Horario / materias','Otro']}
function recoveryTypes(){return ['','CONTACTADO','SIN CONTACTO','EN NEGOCIACIÓN','RECUPERADO','NO RECUPERABLE','SOLICITAR APOYO']}
function optionHTML(values){return values.map((v,i)=>`<option value="${esc(v)}">${i===0?'Seleccionar…':esc(v)}</option>`).join('')}
function rowSearchText(x,r){return rawRows?.length?Object.values(r).join(' ').toLowerCase():[x.i,x.name,x.c,x.p,x.pe,x.e,x.doc,x.pay,x.z].join(' ').toLowerCase()}

function renderStudents(){
  const base=role==='campus'?students.filter(x=>x.c===selectedCampus):students.slice();
  const headers=rawHeaders?.length?rawHeaders:UTC_SHEET_HEADERS;
  const map=rawMapNow();
  const cs=role==='campus'?[selectedCampus]:campuses();
  const statuses=[...new Set(base.map(x=>x.e).filter(Boolean))].sort();
  const periods=[...new Set(base.map(x=>x.pe).filter(Boolean))].sort();
  if(role==='campus')sheetCampus=selectedCampus;
  $('#studentsView').innerHTML=`
    <h2>${role==='manager'?'Consulta operativa':'Base del plantel'}</h2>
    <div class="sub">La información de Salesforce es sólo lectura. El seguimiento se captura directamente al final de cada fila.</div>
    <div class="sheetToolbar">
      <div><label>Buscar en la hoja</label><input id="sq" value="${esc(sheetSearch)}" placeholder="Matrícula, alumno, programa, cupón, comentario..."></div>
      <div><label>Plantel</label><select id="sCampus" ${role==='campus'?'disabled':''}>${role==='manager'?'<option value="">Todos</option>':''}${cs.map(c=>`<option ${c===sheetCampus?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
      <div><label>Estatus</label><select id="sStatus"><option value="">Todos</option>${statuses.map(s=>`<option ${s===sheetStatus?'selected':''}>${esc(s)}</option>`).join('')}</select></div>
      <div><label>Periodo</label><select id="sPeriod"><option value="">Todos</option>${periods.map(p=>`<option ${p===sheetPeriod?'selected':''}>${esc(p)}</option>`).join('')}</select></div>
      <button class="btn" id="sheetStart">← Inicio</button><button class="btn primary" id="sheetEnd">Solicitud →</button>
    </div>
    <div class="sheetHint"><span class="pill">${headers.length} columnas Salesforce</span><span class="sub">+ 4 columnas de seguimiento al final</span><span class="sub">Desplázate horizontalmente como en Excel.</span></div>
    <div class="sheetWrap" id="sheetWrap"><table class="sheetTable"><thead><tr>${headers.map(h=>`<th title="${esc(h)}">${esc(h)}</th>`).join('')}<th class="followHead">Seguimiento actual</th><th class="followHead">Motivo de solicitud</th><th class="followHead">Solicitud / comentario</th><th class="followHead">Enviar</th></tr></thead><tbody id="sheetBody"></tbody></table></div>
    <div class="sheetPager"><span class="sub" id="sheetCount"></span><div class="sheetPagerActions"><button class="btn" id="sheetPrev">← Anterior</button><button class="btn" id="sheetNext">Siguiente →</button></div></div>`;
  sheetCtx={base,headers,map,mode:'request'};
  const apply=()=>{sheetSearch=$('#sq').value.trim().toLowerCase();sheetCampus=$('#sCampus').value;sheetStatus=$('#sStatus').value;sheetPeriod=$('#sPeriod').value;sheetPage=0;renderSheetRows()};
  $('#sq').addEventListener('input',apply);['sCampus','sStatus','sPeriod'].forEach(id=>$('#'+id).addEventListener('change',apply));
  $('#sheetStart').onclick=()=>{$('#sheetWrap').scrollLeft=0};$('#sheetEnd').onclick=()=>{const w=$('#sheetWrap');w.scrollLeft=w.scrollWidth};
  $('#sheetPrev').onclick=()=>{if(sheetPage>0){sheetPage--;renderSheetRows()}};$('#sheetNext').onclick=()=>{sheetPage++;renderSheetRows()};
  renderSheetRows();
}

function renderSheetRows(){
  if(!sheetCtx)return;const {base,headers,map,mode}=sheetCtx;
  let f=base.filter(x=>{if(sheetCampus&&x.c!==sheetCampus)return false;if(sheetStatus&&x.e!==sheetStatus)return false;if(sheetPeriod&&x.pe!==sheetPeriod)return false;const r=rowForStudent(x,map);if(sheetSearch&&!rowSearchText(x,r).includes(sheetSearch))return false;return true});
  const pages=Math.max(1,Math.ceil(f.length/sheetPageSize));if(sheetPage>=pages)sheetPage=pages-1;if(sheetPage<0)sheetPage=0;const rows=f.slice(sheetPage*sheetPageSize,(sheetPage+1)*sheetPageSize);
  $('#sheetBody').innerHTML=rows.map(x=>{const r=rowForStudent(x,map),last=latestFollow(x.i,mode==='recovery'?'Comercial':'Operativo');const current=last?`<span class="pill ${statusClass(last.estatus)}">${esc(last.estatus)}</span><span class="sheetRowMsg">${esc(last.resultado||last.tipo||'')}</span>`:'<span class="sub">Sin seguimiento</span>';const opts=mode==='recovery'?optionHTML(recoveryTypes()):optionHTML(requestTypes());return `<tr data-rowid="${esc(x.i)}">${headers.map(h=>`<td>${cellHTML(h,r[h])}</td>`).join('')}<td class="followCell sheetStatusCell"><div class="sheetCurrent">${current}</div></td><td class="followCell sheetEditable"><select class="sheetType">${opts}</select></td><td class="followCell"><input class="sheetComment" placeholder="Escribe la solicitud..."><span class="sheetRowMsg"></span></td><td class="followCell"><button class="btn primary sheetSend" data-id="${esc(x.i)}">Enviar</button></td></tr>`}).join('')||`<tr><td colspan="${headers.length+4}" class="empty">Sin resultados.</td></tr>`;
  $('#sheetCount').textContent=`${fmt(f.length)} resultados · página ${sheetPage+1} de ${pages}`;$('#sheetPrev').disabled=sheetPage<=0;$('#sheetNext').disabled=sheetPage>=pages-1;
  $$('.sheetSend').forEach(b=>b.onclick=()=>saveInlineSheet(b,mode));
}

function saveInlineSheet(btn,mode){
  const tr=btn.closest('tr'),mat=btn.dataset.id,x=students.find(s=>normMat(s.i)===normMat(mat)),type=tr.querySelector('.sheetType').value,comment=tr.querySelector('.sheetComment').value.trim(),msg=tr.querySelector('.sheetComment').nextElementSibling;
  msg.className='sheetRowMsg';
  if(!type){msg.textContent='Selecciona un motivo.';msg.classList.add('err');return}
  if(!comment){msg.textContent='Escribe la solicitud.';msg.classList.add('err');tr.querySelector('.sheetComment').focus();return}
  const t=getF(),id=Math.max(3000,...t.map(y=>Number(y.id)||0))+1,recovery=mode==='recovery';
  const done=recovery&&(type==='RECUPERADO'||type==='NO RECUPERABLE');
  t.push({id,matricula:mat,campus:x?.c||selectedCampus,tipo:recovery?'Recuperación':type,resultado:recovery?type:'',descripcion:comment,area:recovery?'Comercial':role==='manager'?'Gestor':'Campus',estatus:done?'RESUELTA':recovery?'EN REVISIÓN':'NUEVA',responsable:'',created:new Date().toISOString(),updated:new Date().toISOString(),demo:false});
  setF(t);tr.querySelector('.sheetComment').value='';tr.querySelector('.sheetType').value='';msg.textContent='✓ Seguimiento enviado';msg.classList.add('ok');
  const last=latestFollow(mat,recovery?'Comercial':'Operativo');tr.querySelector('.sheetCurrent').innerHTML=`<span class="pill ${statusClass(last.estatus)}">${esc(last.estatus)}</span><span class="sheetRowMsg">${esc(last.resultado||last.tipo||'')}</span>`;btn.textContent='✓ Enviado';setTimeout(()=>btn.textContent='Enviar',1300);
}

renderCommercialPortfolio=function(){
  const base=recoveryStudents(),headers=rawHeaders?.length?rawHeaders:UTC_SHEET_HEADERS,map=rawMapNow(),cs=[...new Set(base.map(x=>x.c).filter(Boolean))].sort();
  $('#commercialPortfolio').innerHTML=`
    <h2>Cartera de recuperación</h2><div class="sub">Sólo Bajas y En riesgo de baja. La gestión se registra directamente en la fila.</div>
    <div class="sheetToolbar" style="grid-template-columns:2fr 1fr 1fr auto auto"><div><label>Buscar en la hoja</label><input id="sq" placeholder="Matrícula, alumno, programa..."></div><div><label>Plantel</label><select id="sCampus"><option value="">Todos</option>${cs.map(c=>`<option>${esc(c)}</option>`).join('')}</select></div><div><label>Estatus</label><select id="sStatus"><option value="">Todos</option><option>Baja</option><option>En riesgo de baja</option></select></div><button class="btn" id="sheetStart">← Inicio</button><button class="btn primary" id="sheetEnd">Gestión →</button></div>
    <div class="sheetHint"><span class="pill">${headers.length} columnas Salesforce</span><span class="sub">+ gestión comercial al final.</span></div>
    <div class="sheetWrap" id="sheetWrap"><table class="sheetTable"><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}<th class="followHead">Última gestión</th><th class="followHead">Resultado / acción</th><th class="followHead">Comentario</th><th class="followHead">Guardar</th></tr></thead><tbody id="sheetBody"></tbody></table></div>
    <div class="sheetPager"><span class="sub" id="sheetCount"></span><div class="sheetPagerActions"><button class="btn" id="sheetPrev">← Anterior</button><button class="btn" id="sheetNext">Siguiente →</button></div></div>`;
  sheetPage=0;sheetSearch='';sheetCampus='';sheetStatus='';sheetPeriod='';sheetCtx={base,headers,map,mode:'recovery'};
  const apply=()=>{sheetSearch=$('#sq').value.trim().toLowerCase();sheetCampus=$('#sCampus').value;sheetStatus=$('#sStatus').value;sheetPeriod='';sheetPage=0;renderSheetRows()};
  $('#sq').addEventListener('input',apply);['sCampus','sStatus'].forEach(id=>$('#'+id).addEventListener('change',apply));$('#sheetStart').onclick=()=>{$('#sheetWrap').scrollLeft=0};$('#sheetEnd').onclick=()=>{const w=$('#sheetWrap');w.scrollLeft=w.scrollWidth};$('#sheetPrev').onclick=()=>{if(sheetPage>0){sheetPage--;renderSheetRows()}};$('#sheetNext').onclick=()=>{sheetPage++;renderSheetRows()};renderSheetRows();
};

const oldCampusHome=renderCampusHome;
renderCampusHome=function(){oldCampusHome();const quick=$('#quickFollow');if(quick){quick.textContent='Ver mis seguimientos';quick.onclick=()=>showView('campusFollowups')}const p=$('#campusHome .panel p.sub');if(p)p.textContent='Abre la base como una hoja de cálculo y captura tu solicitud al final de la fila.'};

const oldSetRoleV5=setRole;
setRole=function(r){oldSetRoleV5(r);const top=$('#newFollowTop');if(top)top.style.display='none'};

const oldManagerF=renderManagerF;
renderManagerF=function(){oldManagerF();const b=$('#managerNew');if(b)b.style.display='none'};

if(currentView==='studentsView')renderStudents();
if(currentView==='commercialPortfolio')renderCommercialPortfolio();
const topV5=$('#newFollowTop');if(topV5)topV5.style.display='none';