/* ============================================================
   メインロジック / Logika utama
   ============================================================ */
window.STATE = { lang:"ja", role:null, user:null, companyId:null, candidateId:null,
                 view:"login", detailId:null, modTab:"overview" };
var APP = document.getElementById("app");
var T = window.t;

/* ---------- helpers ---------- */
function esc(s){ s=(s==null?"":String(s)); return s.replace(/[&<>"']/g,function(m){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
function companyName(db,id){ var c=(db||[]).find(function(x){return x.id===id;}); return c?c.name:"-"; }
function attendance(jp){ var L=(jp&&jp.lessons)||[]; if(!L.length) return null;
  var a=L.filter(function(x){return x.attended;}).length; return Math.round(a/L.length*100); }
function barClass(p){ return p>=80?"g":(p>=60?"y":"r"); }
function statusBadge(st){
  if(st==="pre") return '<span class="badge b-info">'+T("st_pre")+'</span>';
  if(st==="injp") return '<span class="badge b-warn">'+T("st_injp")+'</span>';
  if(st==="work") return '<span class="badge b-ok">'+T("st_work")+'</span>';
  return '<span class="badge b-neutral">-</span>'; }
function sswBadge(s){
  if(!s) return '<span class="badge b-neutral">-</span>';
  if(s.status==="pass") return '<span class="badge b-ok">'+T("pass")+'</span>';
  if(s.status==="fail") return '<span class="badge b-bad">'+T("fail")+'</span>';
  return '<span class="badge b-neutral">'+T("notyet")+'</span>'; }
function licBadge(l){
  if(!l) return '<span class="badge b-neutral">-</span>';
  if(l.result==="done") return '<span class="badge b-ok">'+T("done")+'</span>';
  if(l.result==="inprog") return '<span class="badge b-warn">'+T("inprog")+'</span>';
  return '<span class="badge b-neutral">'+T("notyet")+'</span>'; }
function lastMock(l){ var m=(l&&l.mocks)||[]; return m.length?m[m.length-1]:null; }

/* ============================================================
   LOGIN
   ============================================================ */
async function renderDemoLogin(){
  var companies = await DATA.getCompanies();
  var cands = await DATA.getCandidates();
  var live = DATA.isLive();
  var roles=[["yst","role_yst","role_yst_d"],["fti","role_fti","role_fti_d"],
             ["self","role_self","role_self_d"],["company","role_company","role_company_d"]];
  var r=STATE.role;
  var roleBtns=roles.map(function(x){
    return '<button class="role-btn'+(r===x[0]?' active':'')+'" data-action="role" data-role="'+x[0]+'">'+
      '<div class="ttl">'+T(x[1])+'</div><div class="desc">'+T(x[2])+'</div></button>';}).join("");
  var sub="";
  if(r==="self"){
    sub='<div class="field"><label>'+T("selectUser")+'</label><select id="selUser">'+
      cands.map(function(c){return '<option value="'+c.id+'">'+esc(c.name_id)+' / '+esc(c.name_ja)+'</option>';}).join("")+
      '</select></div>';
  } else if(r==="company"){
    sub='<div class="field"><label>'+T("selectCompany")+'</label><select id="selCompany">'+
      companies.map(function(c){return '<option value="'+c.id+'">'+esc(c.name)+'</option>';}).join("")+
      '</select></div>';
  }
  APP.innerHTML =
   '<div class="login-wrap"><div class="login-card">'+
     '<h1>'+T("appName")+'</h1>'+
     '<p class="sub">'+(window.APP_CONFIG.ORG_NAME||"")+'<br>'+T("selectRole")+'</p>'+
     '<div class="role-grid">'+roleBtns+'</div>'+
     sub+
     (r?'<button class="btn-primary" data-action="login">'+T("enter")+'</button>':'')+
     '<div><span class="mode-badge '+(live?'mode-live':'mode-demo')+'">'+
        (live?T("liveMode"):T("demoMode"))+'</span></div>'+
   '</div></div>';
}

/* ---------- 認証ログイン（本番） ---------- */
async function renderLogin(){
  if(!DATA.isLive()) return renderDemoLogin();
  var tab = STATE.authTab||'email';
  var err = STATE.authError ? '<div class="login-err">'+esc(STATE.authError)+'</div>' : '';
  var tabs = '<div class="auth-tabs">'+
    '<button class="'+(tab==='email'?'on':'')+'" data-action="authtab" data-tab="email">'+T('login_admincorp')+'</button>'+
    '<button class="'+(tab==='code'?'on':'')+'" data-action="authtab" data-tab="code">'+T('login_self')+'</button></div>';
  var form;
  if(tab==='email'){
    form = '<div class="field"><label>'+T('email')+'</label><input id="loginEmail" type="email" autocomplete="username" placeholder="name@example.com"></div>'+
           '<div class="field"><label>'+T('password')+'</label><input id="loginPass" type="password" autocomplete="current-password"></div>'+
           '<button class="btn-primary" data-action="authemail">'+T('enter')+'</button>';
  } else {
    form = '<div class="field"><label>'+T('login_code')+'</label><input id="loginCode" type="password" autocomplete="off" placeholder="••••••••"></div>'+
           '<button class="btn-primary" data-action="authcode">'+T('enter')+'</button>';
  }
  APP.innerHTML =
   '<div class="login-wrap"><div class="login-card">'+
     '<h1>'+T('appName')+'</h1>'+
     '<p class="sub">'+(window.APP_CONFIG.ORG_NAME||"")+'</p>'+
     tabs + err + form +
     '<div><span class="mode-badge mode-live">'+T('liveMode')+'</span></div>'+
   '</div></div>';
}
async function afterLogin(){
  var p = await DATA.getMyProfile();
  if(!p){ STATE.authError = T('login_noprofile'); await DATA.authSignOut(); return renderLogin(); }
  STATE.role = p.role;
  STATE.companyId = p.company_id||null;
  STATE.candidateId = p.candidate_id||null;
  STATE.lang = (p.role==='fti'||p.role==='self') ? 'id' : 'ja';
  STATE.authError = null; STATE.view = 'dashboard';
  return render();
}

/* ============================================================
   SHELL
   ============================================================ */
function shell(inner, head){
  var langBtns='<div class="lang">'+
    '<button class="'+(STATE.lang==="ja"?"on":"")+'" data-action="lang" data-lang="ja">日本語</button>'+
    '<button class="'+(STATE.lang==="id"?"on":"")+'" data-action="lang" data-lang="id">ID</button></div>';
  var roleLabel = {yst:T("role_yst"),fti:T("role_fti"),self:T("role_self"),company:T("role_company")}[STATE.role];
  return '<div class="topbar"><span class="logo">🚚 '+T("appName")+'</span>'+
      '<span class="role-tag">'+roleLabel+'</span><span class="spacer"></span>'+
      langBtns+'<button class="logout" data-action="logout">'+T("logout")+'</button></div>'+
    '<div class="container">'+(head||"")+inner+'</div>';
}

/* ============================================================
   DASHBOARD (list)
   ============================================================ */
async function renderDashboard(){
  var role=STATE.role;
  var filter={};
  if(role==="company") filter.company_id=STATE.companyId;
  if(role==="self") filter.candidate_id=STATE.candidateId;
  var cands=await DATA.getCandidates(filter);
  var companies=await DATA.getCompanies();

  // self -> jump straight to own detail
  if(role==="self"){ STATE.detailId=STATE.candidateId; STATE.view="detail"; return renderDetail(); }

  var subKey = role==="fti"?"dash_sub_fti":(role==="company"?"dash_sub_company":"dash_sub_yst");
  var head='<div class="page-head"><h2>'+T("dash_overview")+'</h2><p>'+T(subKey)+'</p></div>';

  // KPIs
  var total=cands.length;
  var sswPass=cands.filter(function(c){return c.ssw&&c.ssw.status==="pass";}).length;
  var sswPend=cands.filter(function(c){return c.ssw&&c.ssw.status!=="pass";}).length;
  var lowAtt=cands.filter(function(c){var a=attendance(c.jp);return a!=null&&a<60;}).length;
  var licDone=cands.filter(function(c){return c.license&&c.license.result==="done";}).length;
  var appUnused=cands.filter(function(c){return c.license&&!c.license.app_installed;}).length;
  var kpis=[
    ["kpi_total",total,T("persons"),false],
    ["kpi_ssw_pending",sswPend,T("needAttention"),sswPend>0],
    ["kpi_attn_low",lowAtt,T("needAttention"),lowAtt>0],
    ["kpi_app_unused",appUnused,T("needAttention"),appUnused>0]
  ];
  if(role==="company"){ kpis=[["kpi_total",total,T("persons"),false],
    ["kpi_ssw_pass",sswPass,T("persons"),false],
    ["kpi_license_done",licDone,T("persons"),false]]; }
  var kpiHtml='<div class="kpi-row">'+kpis.map(function(k){
    return '<div class="kpi'+(k[3]?' alert':'')+'"><div class="k-label">'+T(k[0])+'</div>'+
      '<div class="k-val">'+k[1]+'</div><div class="k-sub">'+k[2]+'</div></div>';}).join("")+'</div>';

  var banner = (role==="yst"||role==="fti") ? '<div class="hint">'+T("issue_banner")+'</div>' : '';

  // table rows
  var rows=cands.map(function(c){
    var att=attendance(c.jp);
    var attHtml = att==null?'<span class="note">-</span>':
      '<div class="attend-cell"><div class="bar '+barClass(att)+'" style="flex:1"><i style="width:'+att+'%"></i></div><span>'+att+'%</span></div>';
    var lm=lastMock(c.license);
    var next = c.ssw&&c.ssw.next_exam ? '<span class="badge b-warn">'+esc(c.ssw.next_exam)+'</span>' : '<span class="note">-</span>';
    var appCell = c.license&&c.license.app_installed ?
        '<span class="badge b-ok">'+T("used")+' '+(c.license.app_freq||0)+T("times_week")+'</span>' :
        '<span class="badge b-bad">'+T("notused")+'</span>';
    return '<tr class="click" data-action="open" data-id="'+c.id+'">'+
      '<td class="name-cell">'+esc(c.name_id)+'<small>'+esc(c.name_ja)+'</small></td>'+
      '<td>'+esc(companyName(companies,c.company_id))+'</td>'+
      '<td>'+statusBadge(c.status)+'</td>'+
      '<td>'+sswBadge(c.ssw)+'</td>'+
      '<td>'+next+'</td>'+
      '<td>'+attHtml+'</td>'+
      '<td>'+licBadge(c.license)+'</td>'+
      '<td>'+appCell+'</td></tr>';
  }).join("");

  var table='<div class="panel"><div class="panel-head"><h3>'+T("h_name")+' ('+total+')</h3></div>'+
    '<div class="panel-body" style="overflow-x:auto"><table><thead><tr>'+
      '<th>'+T("h_name")+'</th><th>'+T("h_company")+'</th><th>'+T("h_status")+'</th>'+
      '<th>'+T("h_ssw")+'</th><th>'+T("h_next")+'</th><th>'+T("h_jp")+'</th>'+
      '<th>'+T("h_license")+'</th><th>'+T("h_app")+'</th></tr></thead>'+
      '<tbody>'+(rows||'<tr><td colspan="8" class="empty">'+T("noData")+'</td></tr>')+'</tbody></table></div></div>';

  APP.innerHTML = shell(banner+kpiHtml+table, head);
}

/* ============================================================
   CANDIDATE DETAIL
   ============================================================ */
async function renderDetail(){
  var c=await DATA.getCandidate(STATE.detailId);
  var companies=await DATA.getCompanies();
  if(!c){ STATE.view="dashboard"; return renderDashboard(); }
  var canEdit = (STATE.role==="yst"||STATE.role==="fti");
  var tabs=[["overview","mod_overview"],["ssw","mod_ssw"],["license","mod_license"],
            ["jp","mod_jp"],["proc","mod_proc"]];
  var tabHtml='<div class="mod-tabs">'+tabs.map(function(x){
    return '<button class="'+(STATE.modTab===x[0]?"on":"")+'" data-action="tab" data-tab="'+x[0]+'">'+T(x[1])+'</button>';}).join("")+'</div>';

  var body="";
  if(STATE.modTab==="overview") body=modOverview(c,companies);
  else if(STATE.modTab==="ssw") body=modSSW(c,canEdit);
  else if(STATE.modTab==="license") body=modLicense(c,canEdit);
  else if(STATE.modTab==="jp") body=modJP(c,canEdit);
  else if(STATE.modTab==="proc") body=modProc(c);

  var backBtn = STATE.role==="self" ? "" : '<button class="back-link" data-action="back">'+T("back")+'</button>';
  var head='<div class="page-head">'+backBtn+
    '<h2>'+esc(c.name_id)+' <span style="font-size:15px;opacity:.7">/ '+esc(c.name_ja)+'</span></h2>'+
    '<p>'+esc(companyName(companies,c.company_id))+' ・ '+T("st_"+ (c.status==="injp"?"injp":(c.status==="work"?"work":"pre")) )+'</p></div>';

  APP.innerHTML = shell('<div class="panel">'+tabHtml+'</div>'+body, head);
}

/* ---------- module: overview ---------- */
function modOverview(c,companies){
  function row(k,v){ return '<dt>'+k+'</dt><dd>'+esc(v||"-")+'</dd>'; }
  var jft=c.jft||{};
  return '<div class="detail-grid">'+
    '<div class="panel"><div class="panel-head"><h3>'+T("mod_overview")+'</h3></div>'+
      '<dl class="kv">'+
        row(T("f_name_id"),c.name_id)+ row(T("f_company"),companyName(companies,c.company_id))+
        row(T("f_intake"),c.intake_date)+ row(T("f_entry"),c.entry_date)+
      '</dl></div>'+
    '<div class="panel"><div class="panel-head"><h3>'+T("mod_jft")+'</h3>'+
        '<span class="spacer"></span><span class="badge b-ok">'+T("pass")+'</span></div>'+
      '<dl class="kv">'+ row("Level",jft.level)+ row(T("ssw_score"),jft.score)+ row(T("date"),jft.date)+'</dl></div>'+
   '</div>';
}

/* ---------- module: SSW (課題①) ---------- */
function modSSW(c,canEdit){
  var s=c.ssw||{attempts:[]};
  var att=(s.attempts||[]);
  var last=att.length?att[att.length-1]:null;
  // 合格までの距離(目安): 最新スコア/100
  var gap="";
  if(last&&last.score){ var num=parseInt(String(last.score).split("/")[0],10);
    if(!isNaN(num)){ var cls=barClass(num);
      gap='<div class="kv"><dt>'+T("ssw_gap")+'</dt><dd><div class="attend-cell">'+
        '<div class="bar '+cls+'" style="width:160px"><i style="width:'+num+'%"></i></div><span>'+num+'/100</span></div></dd></div>'; } }
  var rows=att.map(function(a){
    var b=a.result==="pass"?'<span class="badge b-ok">'+T("pass")+'</span>':'<span class="badge b-bad">'+T("fail")+'</span>';
    return '<div class="tl-item"><div class="tl-date">'+esc(a.date)+'</div><div>'+b+
      ' &nbsp;<b>'+esc(a.score||"-")+'</b> <span class="note">'+esc(a.note||"")+'</span></div></div>';}).join("");
  var nextEdit = '<div class="kv"><dt>'+T("ssw_next")+'</dt><dd>'+
    (canEdit ? '<input type="date" id="ssw_next" value="'+esc(s.next_exam||"")+'" data-action="ssw_next" style="padding:6px 8px;border:1px solid var(--line);border-radius:8px">' :
      (s.next_exam?'<span class="badge b-warn">'+esc(s.next_exam)+'</span>':"-"))+'</dd></div>';
  var addForm = canEdit ? '<div class="add-row">'+
    '<input type="date" id="ssw_d"><select id="ssw_r"><option value="fail">'+T("fail")+'</option><option value="pass">'+T("pass")+'</option></select>'+
    '<input id="ssw_s" placeholder="'+T("ssw_score")+' (例 68/100)" style="width:130px">'+
    '<input id="ssw_n" placeholder="'+T("note")+'">'+
    '<button data-action="ssw_add">'+T("add")+'</button></div>' : '';
  return '<div class="panel"><div class="panel-head"><h3>'+T("ssw_status")+'</h3><span class="spacer"></span>'+sswBadge(s)+'</div>'+
    nextEdit+gap+
    '<div class="panel-head" style="border-top:1px solid var(--line)"><h3>'+T("ssw_history")+'</h3></div>'+
    '<div class="timeline">'+(rows||'<div class="empty">'+T("noData")+'</div>')+'</div>'+
    addForm+'</div>';
}

/* ---------- module: License (課題②) ---------- */
function modLicense(c,canEdit){
  var l=c.license||{mocks:[]};
  function inp(id,val,type){ return '<input '+(type?'type="'+type+'" ':'')+'id="'+id+'" value="'+esc(val||"")+'" '+
     (canEdit?'data-action="lic_field" data-field="'+id+'"':'disabled')+' style="padding:6px 8px;border:1px solid var(--line);border-radius:8px">'; }
  var dates='<dl class="kv">'+
    '<dt>'+T("lic_app")+'</dt><dd>'+inp("application_date",l.application_date,"date")+'</dd>'+
    '<dt>'+T("lic_written")+'</dt><dd>'+inp("written_date",l.written_date,"date")+'</dd>'+
    '<dt>'+T("lic_skill")+'</dt><dd>'+inp("skill_date",l.skill_date,"date")+'</dd>'+
    '<dt>'+T("lic_result")+'</dt><dd>'+ (canEdit?
       '<select data-action="lic_field" data-field="result"><option value="notyet"'+(l.result==="notyet"?" selected":"")+'>'+T("notyet")+'</option>'+
       '<option value="inprog"'+(l.result==="inprog"?" selected":"")+'>'+T("inprog")+'</option>'+
       '<option value="done"'+(l.result==="done"?" selected":"")+'>'+T("done")+'</option></select>' : licBadge(l))+'</dd>'+
   '</dl>';
  // app usage card (課題②)
  var freq=l.app_freq||0; var fcls=l.app_installed?(freq>=3?"b-ok":(freq>=1?"b-warn":"b-bad")):"b-bad";
  var appCard='<div class="panel-head" style="border-top:1px solid var(--line)"><h3>'+T("lic_apptool")+'</h3>'+
      '<span class="spacer"></span><span class="badge '+fcls+'">'+(l.app_installed?T("used"):T("notused"))+'</span></div>'+
    '<dl class="kv">'+
      '<dt>'+T("lic_installed")+'</dt><dd>'+ (canEdit?
        '<select data-action="lic_field" data-field="app_installed"><option value="1"'+(l.app_installed?" selected":"")+'>'+T("yes")+'</option><option value="0"'+(!l.app_installed?" selected":"")+'>'+T("no")+'</option></select>'
        : (l.app_installed?T("yes"):T("no")))+'</dd>'+
      '<dt>'+T("lic_freq")+'</dt><dd>'+ (canEdit?
        '<input type="number" min="0" max="7" value="'+freq+'" data-action="lic_field" data-field="app_freq" style="width:70px;padding:6px 8px;border:1px solid var(--line);border-radius:8px"> '+T("times_week")
        : freq+T("times_week"))+'</dd>'+
      '<dt>'+T("lic_lastused")+'</dt><dd>'+inp("app_lastused",l.app_lastused,"date")+'</dd>'+
    '</dl>';
  // mocks (課題②: 模擬試験結果の記録)
  var mocks=(l.mocks||[]);
  var mrows=mocks.map(function(m){ var p=Math.round(m.score/m.total*100); var cls=barClass(p);
    return '<div class="tl-item"><div class="tl-date">'+esc(m.date)+'</div><div style="flex:1"><div class="attend-cell">'+
      '<div class="bar '+cls+'" style="width:140px"><i style="width:'+p+'%"></i></div><span>'+m.score+'/'+m.total+'</span></div></div></div>';}).join("");
  var addMock = canEdit ? '<div class="add-row"><input type="date" id="mk_d">'+
    '<input type="number" id="mk_s" placeholder="'+T("score")+'" style="width:90px"> / '+
    '<input type="number" id="mk_t" placeholder="'+T("total")+'" value="10" style="width:90px">'+
    '<button data-action="mock_add">'+T("lic_addmock")+'</button></div>' : '';
  return '<div class="panel"><div class="panel-head"><h3>'+T("mod_license")+'</h3><span class="spacer"></span>'+licBadge(l)+'</div>'+
    dates+appCard+
    '<div class="panel-head" style="border-top:1px solid var(--line)"><h3>'+T("lic_mock")+'</h3></div>'+
    '<div class="timeline">'+(mrows||'<div class="empty">'+T("noData")+'</div>')+'</div>'+addMock+'</div>';
}

/* ---------- module: Japanese (課題③ 最重要) ---------- */
function modJP(c,canEdit){
  var jp=c.jp||{lessons:[],self_study:[]};
  var att=attendance(jp);
  var attCard = att==null?'':'<div class="kv"><dt>'+T("jp_attendrate")+'</dt><dd><div class="attend-cell">'+
    '<div class="bar '+barClass(att)+'" style="width:180px"><i style="width:'+att+'%"></i></div><span>'+att+'%</span></div></dd></div>';
  var lrows=(jp.lessons||[]).map(function(x){
    var b=x.attended?'<span class="badge b-ok">'+T("jp_present")+'</span>':'<span class="badge b-bad">'+T("jp_absent")+'</span>';
    return '<div class="tl-item"><div class="tl-date">'+esc(x.date)+'</div><div>'+b+' <span class="note">'+esc(x.reason||"")+'</span></div></div>';}).join("");
  var addLesson = canEdit ? '<div class="add-row"><input type="date" id="ls_d">'+
    '<select id="ls_a"><option value="1">'+T("jp_present")+'</option><option value="0">'+T("jp_absent")+'</option></select>'+
    '<input id="ls_r" placeholder="'+T("h_reason")+'">'+
    '<button data-action="lesson_add">'+T("add")+'</button></div>' : '';
  // self study (本人も追加可)
  var canSelf = canEdit || STATE.role==="self";
  var srows=(jp.self_study||[]).map(function(x){
    return '<div class="tl-item"><div class="tl-date">'+esc(x.date)+'</div><div><b>'+(x.minutes||0)+T("minutes")+'</b> <span class="note">'+esc(x.content||"")+'</span></div></div>';}).join("");
  var addSelf = canSelf ? '<div class="add-row"><input type="date" id="ss_d">'+
    '<input type="number" id="ss_m" placeholder="'+T("minutes")+'" style="width:90px">'+
    '<input id="ss_c" placeholder="'+T("h_content")+'">'+
    '<button data-action="self_add">'+T("jp_addself")+'</button></div>' : '';
  var prep='<div class="kv"><dt>'+T("jp_prep")+'</dt><dd>'+ (canEdit?
    '<select data-action="prep_set"><option value="notyet"'+(jp.prep_status==="notyet"?" selected":"")+'>'+T("notyet")+'</option>'+
    '<option value="inprog"'+(jp.prep_status==="inprog"?" selected":"")+'>'+T("inprog")+'</option>'+
    '<option value="done"'+(jp.prep_status==="done"?" selected":"")+'>'+T("done")+'</option></select>'
    : (jp.prep_status==="done"?T("done"):(jp.prep_status==="inprog"?T("inprog"):T("notyet"))))+'</dd></div>';
  return '<div class="panel"><div class="panel-head"><h3>'+T("jp_class")+'</h3>'+
      '<span class="spacer"></span>'+(att!=null?'<span class="badge '+(att>=80?"b-ok":att>=60?"b-warn":"b-bad")+'">'+att+'%</span>':"")+'</div>'+
    attCard+
    '<div class="timeline">'+(lrows||'<div class="empty">'+T("noData")+'</div>')+'</div>'+addLesson+
    '<div class="panel-head" style="border-top:1px solid var(--line)"><h3>'+T("jp_self")+'</h3></div>'+
    '<div class="timeline">'+(srows||'<div class="empty">'+T("noData")+'</div>')+'</div>'+addSelf+
    prep+'</div>';
}

/* ---------- module: procedures ---------- */
function modProc(c){
  function row(k,v){ return '<dt>'+k+'</dt><dd>'+esc(v||"-")+'</dd>'; }
  return '<div class="panel"><div class="panel-head"><h3>'+T("mod_proc")+'</h3></div>'+
    '<dl class="kv">'+ row(T("f_coe"),c.coe)+ row(T("f_visa"),c.visa)+
      row(T("f_flight"),c.flight)+ row(T("f_housing"),c.housing)+ row(T("f_status"),T("st_"+(c.status==="injp"?"injp":(c.status==="work"?"work":"pre"))))+'</dl></div>';
}

/* ============================================================
   ROUTER
   ============================================================ */
async function render(){
  if(STATE.view==="login") return renderLogin();
  if(STATE.view==="detail") return renderDetail();
  return renderDashboard();
}

/* ============================================================
   EVENTS
   ============================================================ */
function val(id){ var e=document.getElementById(id); return e?e.value:""; }
async function patchModule(id, key, obj){
  var c=await DATA.getCandidate(id); var cur=c[key]||{};
  var next=Object.assign({},cur,obj); var p={}; p[key]=next;
  await DATA.updateCandidate(id,p);
}
async function pushArray(id,key,arrField,item){
  var c=await DATA.getCandidate(id); var mod=Object.assign({},c[key]||{});
  var arr=(mod[arrField]||[]).slice(); arr.push(item);
  arr.sort(function(a,b){return (a.date||"")<(b.date||"")?-1:1;});
  mod[arrField]=arr; var p={}; p[key]=mod; await DATA.updateCandidate(id,p);
}

APP.addEventListener("click", async function(e){
  var el=e.target.closest("[data-action]"); if(!el) return;
  var a=el.getAttribute("data-action");
  if(a==="authtab"){ STATE.authTab=el.getAttribute("data-tab"); STATE.authError=null; return renderLogin(); }
  if(a==="authemail"){ STATE.authError=null; var er=await DATA.authSignInEmail(val("loginEmail"), val("loginPass"));
    if(er.error){ STATE.authError=T("login_failed"); return renderLogin(); } return afterLogin(); }
  if(a==="authcode"){ STATE.authError=null; var ec=await DATA.authSignInCode(val("loginCode"));
    if(ec.error){ STATE.authError=T("login_failed"); return renderLogin(); } return afterLogin(); }
  if(a==="role"){ STATE.role=el.getAttribute("data-role");
    STATE.lang = (STATE.role==="fti"||STATE.role==="self")?"id":"ja"; return renderLogin(); }
  if(a==="lang"){ STATE.lang=el.getAttribute("data-lang"); return render(); }
  if(a==="logout"){ if(DATA.isLive()) await DATA.authSignOut();
    STATE.view="login"; STATE.role=null; STATE.detailId=null; STATE.companyId=null; STATE.candidateId=null; STATE.modTab="overview"; STATE.authError=null; return renderLogin(); }
  if(a==="login"){
    if(STATE.role==="self") STATE.candidateId=val("selUser");
    if(STATE.role==="company") STATE.companyId=val("selCompany");
    STATE.view="dashboard"; return render(); }
  if(a==="open"){ STATE.detailId=el.getAttribute("data-id"); STATE.modTab="overview"; STATE.view="detail"; return renderDetail(); }
  if(a==="back"){ STATE.view="dashboard"; return renderDashboard(); }
  if(a==="tab"){ STATE.modTab=el.getAttribute("data-tab"); return renderDetail(); }
  var id=STATE.detailId;
  if(a==="ssw_add"){ var d=val("ssw_d"); if(!d) return;
    await pushArray(id,"ssw","attempts",{date:d,result:val("ssw_r"),score:val("ssw_s"),note:val("ssw_n")});
    // 合格なら status更新
    var res=val("ssw_r"); await patchModule(id,"ssw",{status:res});
    return renderDetail(); }
  if(a==="mock_add"){ var md=val("mk_d"); if(!md) return;
    await pushArray(id,"license","mocks",{date:md,score:parseInt(val("mk_s")||0,10),total:parseInt(val("mk_t")||10,10)});
    return renderDetail(); }
  if(a==="lesson_add"){ var ld=val("ls_d"); if(!ld) return;
    await pushArray(id,"jp","lessons",{date:ld,attended:val("ls_a")==="1",reason:val("ls_r")});
    return renderDetail(); }
  if(a==="self_add"){ var sd=val("ss_d"); if(!sd) return;
    await pushArray(id,"jp","self_study",{date:sd,minutes:parseInt(val("ss_m")||0,10),content:val("ss_c")});
    return renderDetail(); }
});

APP.addEventListener("change", async function(e){
  var el=e.target.closest("[data-action]"); if(!el) return;
  var a=el.getAttribute("data-action"); var id=STATE.detailId;
  if(a==="ssw_next"){ await patchModule(id,"ssw",{next_exam:el.value}); return; }
  if(a==="prep_set"){ await patchModule(id,"jp",{prep_status:el.value}); return renderDetail(); }
  if(a==="lic_field"){ var f=el.getAttribute("data-field"); var v=el.value;
    if(f==="app_installed") v=(v==="1"); if(f==="app_freq") v=parseInt(v||0,10);
    var o={}; o[f]=v; await patchModule(id,"license",o);
    if(f==="result"||f==="app_installed") return renderDetail(); return; }
});

/* boot */
async function boot(){
  if(DATA.isLive()){
    var sesh = await DATA.getSession();
    if(sesh){ return afterLogin(); }
  }
  STATE.view="login"; return renderLogin();
}
boot();
