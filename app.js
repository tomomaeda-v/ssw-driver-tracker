/* ============================================================
   メインロジック / Logika utama
   ============================================================ */
window.STATE = { lang:"ja", role:null, user:null, companyId:null, candidateId:null,
                 view:"login", detailId:null, modTab:"overview" };
var APP = document.getElementById("app");
var T = window.t;
var FAIL_TAGS=["gyakuso","sakamichi","dasharin","sokudo","ichiji","gear","kihon","anzen","enst","fumikiri"];
function todayStr(){ return new Date().toISOString().slice(0,10); }
function roleShort(){ return {yst:"YST",fti:"FTI",school:"自動車学校",company:"企業",self:"本人"}[STATE.role]||""; }
function finalBadge(r){ if(r==="acquired") return '<span class="badge b-ok">'+T("fr_acquired")+'</span>'; if(r==="giveup") return '<span class="badge b-bad">'+T("fr_giveup")+'</span>'; if(r==="inprog") return '<span class="badge b-warn">'+T("fr_inprog")+'</span>'; return '<span class="badge b-neutral">'+T("notyet")+'</span>'; }
function issueStatusBadge(st){ var m={"対応済":"b-ok","対応中":"b-warn","監視中":"b-neutral","新規":"b-info"}; return '<span class="badge '+(m[st]||"b-neutral")+'">'+esc(st)+'</span>'; }

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
  var r=l.final_result||l.result;
  if(r==="acquired"||r==="done") return '<span class="badge b-ok">'+T("fr_acquired")+'</span>';
  if(r==="giveup") return '<span class="badge b-bad">'+T("fr_giveup")+'</span>';
  if(r==="inprog") return '<span class="badge b-warn">'+T("inprog")+'</span>';
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

/* ---------- 認証ログイン（本番・役割別導線） ---------- */
async function renderLogin(){
  if(!DATA.isLive()) return renderDemoLogin();
  var lg=(new URLSearchParams(location.search).get("login")||"staff").toLowerCase();
  if(lg==="self") return renderLoginSelf();
  return renderLoginEmail(lg);
}
function loginShell(title, inner){
  var err = STATE.authError ? '<div class="login-err">'+esc(STATE.authError)+'</div>' : '';
  var info = STATE.authInfo ? '<div class="login-info">'+esc(STATE.authInfo)+'</div>' : '';
  return '<div class="login-wrap"><div class="login-card">'+
     '<h1>'+esc(title)+'</h1>'+
     '<p class="sub">'+(window.APP_CONFIG.ORG_NAME||"")+'</p>'+
     err + info + inner +
     '<div><span class="mode-badge mode-live">'+T('liveMode')+'</span></div>'+
   '</div></div>';
}
function renderLoginEmail(lg){
  var titles={company:T('login_company_title'),school:T('login_school_title'),admin:T('login_staff_title'),staff:T('login_staff_title'),yst:T('login_staff_title'),fti:T('login_staff_title')};
  var title=titles[lg]||T('login_staff_title');
  var mode=STATE.authMode||'login';
  var tabs='<div class="auth-tabs">'+
    '<button class="'+(mode==='login'?'on':'')+'" data-action="authmode" data-mode="login">'+T('tab_login')+'</button>'+
    '<button class="'+(mode==='signup'?'on':'')+'" data-action="authmode" data-mode="signup">'+T('tab_signup')+'</button></div>';
  var form;
  if(mode==='signup'){
    form='<div class="field"><label>'+T('email')+'</label><input id="loginEmail" type="email" autocomplete="username" placeholder="name@example.com"></div>'+
         '<div class="field"><label>'+T('password')+'</label><input id="loginPass" type="password" autocomplete="new-password" placeholder="'+T('signup_pwhint')+'"></div>'+
         '<button class="btn-primary" data-action="authsignup">'+T('signup_btn')+'</button>';
  } else {
    form='<div class="field"><label>'+T('email')+'</label><input id="loginEmail" type="email" autocomplete="username" placeholder="name@example.com"></div>'+
         '<div class="field"><label>'+T('password')+'</label><input id="loginPass" type="password" autocomplete="current-password"></div>'+
         '<button class="btn-primary" data-action="authemail">'+T('enter')+'</button>';
  }
  APP.innerHTML=loginShell(title, tabs+form);
}
function renderLoginSelf(){
  var form='<div class="field"><label>'+T('login_code')+'</label><input id="loginCode" type="password" autocomplete="off" placeholder="••••••••"></div>'+
           '<button class="btn-primary" data-action="authcode">'+T('enter')+'</button>';
  APP.innerHTML=loginShell(T('login_self_title'), form);
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
  var roleLabel = {yst:T("role_yst"),fti:T("role_fti"),self:T("role_self"),company:T("role_company"),school:T("role_school")}[STATE.role];
  var nav="";
  if(STATE.role==="yst"||STATE.role==="fti"||STATE.role==="school"){
    var onDash=(STATE.view==="dashboard"||STATE.view==="detail");
    nav='<div class="topnav">'+
      '<button class="'+(onDash?"on":"")+'" data-action="gonav" data-view="dashboard">'+T("nav_dash")+'</button>'+
      '<button class="'+(STATE.view==="issues"?"on":"")+'" data-action="gonav" data-view="issues">'+T("nav_issues")+'</button></div>';
  }
  return '<div class="topbar"><span class="logo">🚚 '+T("appName")+'</span>'+
      '<span class="role-tag">'+roleLabel+'</span>'+nav+'<span class="spacer"></span>'+
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

  var banner = (role==="yst"||role==="fti"||role==="school") ? '<div class="hint">'+T("issue_banner")+'</div>' : '';

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
  var canEdit = (STATE.role==="yst"||STATE.role==="fti"||STATE.role==="school");
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

/* ---------- module: 外免切替 (3STEP化・失敗タグ) ---------- */
function modLicense(c,canEdit){
  var l=c.license||{};
  function sel(field,val,opts){ var o=opts.map(function(x){return '<option value="'+x[0]+'"'+(val===x[0]?' selected':'')+'>'+x[1]+'</option>';}).join("");
    if(!canEdit){ var f=opts.find(function(x){return x[0]===val;}); return f?esc(f[1]):'-'; }
    return '<select data-action="lic_field" data-field="'+field+'">'+o+'</select>'; }
  function numf(field,val){ return canEdit?'<input type="number" min="0" value="'+(val||0)+'" data-action="lic_field" data-field="'+field+'" style="width:70px;padding:6px 8px;border:1px solid var(--line);border-radius:8px">':(val||0); }
  function datef(field,val){ return '<input type="date" id="'+field+'" value="'+esc(val||"")+'" '+(canEdit?'data-action="lic_field" data-field="'+field+'"':'disabled')+' style="padding:6px 8px;border:1px solid var(--line);border-radius:8px">'; }
  var stv=[["ok",T("vstat_ok")],["ng",T("vstat_ng")],["pending",T("vstat_pending")]];
  var dstv=[["ok",T("vstat_ok")],["retry",T("st_doing")],["pending",T("vstat_pending")]];

  // 最終結果
  var fr=[["notyet",T("notyet")],["inprog",T("fr_inprog")],["acquired",T("fr_acquired")],["giveup",T("fr_giveup")]];
  var finalP='<div class="panel"><div class="panel-head"><h3>'+T("mod_license")+' — '+T("lic_final")+'</h3><span class="spacer"></span>'+finalBadge(l.final_result)+'</div>'+
    '<dl class="kv"><dt>'+T("lic_final")+'</dt><dd>'+sel("final_result",l.final_result,fr)+'</dd></dl></div>';

  // STEP1 事前審査
  var step1='<div class="panel"><div class="panel-head"><h3>'+T("lic_step1")+'</h3></div><dl class="kv">'+
    '<dt>'+T("lic_docstatus")+'</dt><dd>'+sel("s1_doc_status",l.s1_doc_status,stv)+'</dd>'+
    '<dt>'+T("lic_docdefect")+'</dt><dd>'+numf("s1_doc_defects",l.s1_doc_defects)+'</dd>'+
    '<dt>'+T("lic_depth")+'</dt><dd>'+sel("s1_depth_status",l.s1_depth_status,dstv)+'</dd>'+
    '<dt>'+T("lic_depthretry")+'</dt><dd>'+numf("s1_depth_retries",l.s1_depth_retries)+'</dd>'+
    '</dl></div>';

  // STEP2 学科
  var wa=(l.written_attempts||[]);
  var wrows=wa.map(function(a){ var sc=parseInt(a.score,10); var pass=(a.result==="pass")||(sc>=45);
    var b=pass?'<span class="badge b-ok">'+T("pass")+'</span>':'<span class="badge b-bad">'+T("fail")+'</span>';
    return '<div class="tl-item"><div class="tl-date">'+esc(a.date)+'</div><div>'+b+' <b>'+esc(a.score||"-")+T("lic_score50")+'</b> <span class="note">'+esc(a.note||"")+'</span></div></div>';}).join("");
  var waddf=canEdit?'<div class="add-row"><input type="date" id="w_d"><input type="number" id="w_s" placeholder="'+T("lic_score50")+'" style="width:100px"><input id="w_n" placeholder="'+T("note")+'"><button data-action="written_add">'+T("add")+'</button></div>':'';
  var step2='<div class="panel"><div class="panel-head"><h3>'+T("lic_step2")+'</h3></div><div class="timeline">'+(wrows||'<div class="empty">'+T("noData")+'</div>')+'</div>'+waddf+'</div>';

  // 対策アプリ + 模擬試験
  var freq=l.app_freq||0; var fcls=l.app_installed?(freq>=3?"b-ok":(freq>=1?"b-warn":"b-bad")):"b-bad";
  var appCard='<div class="panel"><div class="panel-head"><h3>'+T("lic_apptool")+'</h3><span class="spacer"></span><span class="badge '+fcls+'">'+(l.app_installed?T("used"):T("notused"))+'</span></div>'+
    '<dl class="kv">'+
      '<dt>'+T("lic_installed")+'</dt><dd>'+sel("app_installed",l.app_installed?"1":"0",[["1",T("yes")],["0",T("no")]])+'</dd>'+
      '<dt>'+T("lic_freq")+'</dt><dd>'+numf("app_freq",freq)+' '+T("times_week")+'</dd>'+
      '<dt>'+T("lic_lastused")+'</dt><dd>'+datef("app_lastused",l.app_lastused)+'</dd>'+
    '</dl>';
  var mocks=(l.mocks||[]);
  var mrows=mocks.map(function(m){ var p=Math.round(m.score/m.total*100); var cls=barClass(p);
    return '<div class="tl-item"><div class="tl-date">'+esc(m.date)+'</div><div style="flex:1"><div class="attend-cell"><div class="bar '+cls+'" style="width:140px"><i style="width:'+p+'%"></i></div><span>'+m.score+'/'+m.total+'</span></div></div></div>';}).join("");
  var addMock=canEdit?'<div class="add-row"><input type="date" id="mk_d"><input type="number" id="mk_s" placeholder="'+T("score")+'" style="width:80px"> / <input type="number" id="mk_t" placeholder="'+T("total")+'" value="10" style="width:80px"><button data-action="mock_add">'+T("lic_addmock")+'</button></div>':'';
  appCard+='<div class="panel-head" style="border-top:1px solid var(--line)"><h3 style="font-size:13px">'+T("lic_mock")+'</h3></div><div class="timeline">'+(mrows||'<div class="empty">'+T("noData")+'</div>')+'</div>'+addMock+'</div>';

  // STEP3 技能 + 失敗タグ
  var ska=(l.skill_attempts||[]);
  var srows=ska.map(function(a){ var pts=parseInt(a.points,10); var pass=(a.result==="pass")||(pts>=70);
    var b=pass?'<span class="badge b-ok">'+T("pass")+'</span>':'<span class="badge b-bad">'+T("fail")+'</span>';
    var tags=(a.fails||[]).map(function(t){return '<span class="badge b-neutral">'+T("ft_"+t)+'</span>';}).join(" ");
    return '<div class="tl-item"><div class="tl-date">'+esc(a.date)+'</div><div style="flex:1">'+b+' <b>'+esc(a.points||"-")+T("lic_points")+'</b> <span class="note">'+esc(a.note||"")+'</span>'+(tags?'<div style="margin-top:5px;display:flex;gap:4px;flex-wrap:wrap">'+tags+'</div>':'')+'</div></div>';}).join("");
  var tagChecks=FAIL_TAGS.map(function(t){return '<label class="ftchk"><input type="checkbox" id="sf_'+t+'">'+T("ft_"+t)+'</label>';}).join("");
  var saddf=canEdit?'<div class="add-row" style="flex-direction:column;align-items:stretch">'+
    '<div style="display:flex;gap:8px;flex-wrap:wrap"><input type="date" id="s_d"><input type="number" id="s_p" placeholder="'+T("lic_points")+'" style="width:100px"><input id="s_n" placeholder="'+T("note")+'" style="flex:1;min-width:120px"></div>'+
    '<div class="ftchk-row"><b>'+T("lic_failtags")+'</b> '+tagChecks+'</div>'+
    '<div><button data-action="skill_add">'+T("lic_addskill")+'</button></div></div>':'';
  var step3='<div class="panel"><div class="panel-head"><h3>'+T("lic_step3")+'</h3></div><div class="timeline">'+(srows||'<div class="empty">'+T("noData")+'</div>')+'</div>'+saddf+'</div>';

  return finalP+step1+step2+appCard+step3;
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
   課題管理ボード (PDCA)
   ============================================================ */
async function renderIssues(){
  var issues = await DATA.getIssues();
  window.ISSUE_CACHE={}; issues.forEach(function(i){ window.ISSUE_CACHE[i.id]=i; });
  var canEdit = (STATE.role==="yst"||STATE.role==="fti"||STATE.role==="school");
  // 失敗パターン頻度
  var cands = await DATA.getCandidates();
  var freq={}; FAIL_TAGS.forEach(function(t){freq[t]=0;});
  cands.forEach(function(c){ var sa=(c.license&&c.license.skill_attempts)||[]; sa.forEach(function(a){ (a.fails||[]).forEach(function(t){ if(freq[t]!=null) freq[t]++; }); }); });
  var vals=FAIL_TAGS.map(function(t){return freq[t];}); var maxf=Math.max.apply(null,[1].concat(vals));
  var freqRows=FAIL_TAGS.filter(function(t){return freq[t]>0;}).sort(function(a,b){return freq[b]-freq[a];}).map(function(t){
    var p=Math.round(freq[t]/maxf*100);
    return '<div class="tl-item"><div class="tl-date" style="min-width:140px">'+T("ft_"+t)+'</div><div style="flex:1"><div class="attend-cell"><div class="bar r" style="flex:1"><i style="width:'+p+'%"></i></div><span>'+freq[t]+'</span></div></div></div>';}).join("");
  var freqPanel='<div class="panel"><div class="panel-head"><h3>'+T("fail_freq")+'</h3></div><div class="timeline">'+(freqRows||'<div class="empty">'+T("noData")+'</div>')+'</div></div>';
  // ボード
  var steps=[["step1","step1"],["step2","step2"],["step3","step3"],["future","step_future"],["other","step_other"]];
  var board=steps.map(function(st){
    var items=issues.filter(function(i){return (i.step||"other")===st[0];});
    if(!items.length) return "";
    return '<div class="section-label">'+T(st[1])+'</div>'+items.map(function(i){return issueCard(i,canEdit);}).join("");
  }).join("");
  var addForm = canEdit ? issueAddForm() : "";
  var head='<div class="page-head"><h2>'+T("issues_title")+'</h2><p>'+T("issues_sub")+'</p></div>';
  APP.innerHTML = shell(freqPanel+board+addForm, head);
}
function issueCard(i,canEdit){
  var ups=(i.updates||[]).map(function(u){return '<div class="tl-item"><div class="tl-date">'+esc(u.date||"")+'</div><div><b>'+esc(u.by||"")+'</b> <span class="note">'+esc(u.note||"")+'</span></div></div>';}).join("");
  var statusCtl = canEdit ? '<select data-action="issue_status" data-id="'+i.id+'">'+["新規","対応中","対応済","監視中"].map(function(x){return '<option'+(i.status===x?" selected":"")+'>'+x+'</option>';}).join("")+'</select>' : issueStatusBadge(i.status);
  var cm = canEdit ? '<textarea id="ic_'+i.id+'" class="iss-cm">'+esc(i.countermeasure||"")+'</textarea> <button class="mini-btn" data-action="issue_cm_save" data-id="'+i.id+'">'+T("issue_save")+'</button>' : '<div class="note">'+esc(i.countermeasure||"")+'</div>';
  var addup = canEdit ? '<div class="add-row"><input id="iu_'+i.id+'" placeholder="'+T("issue_addupdate")+'" style="flex:1"><button data-action="issue_addupdate" data-id="'+i.id+'">'+T("add")+'</button></div>' : '';
  return '<div class="panel"><div class="panel-head"><h3>'+esc(i.title)+'</h3><span class="spacer"></span><span class="pill">'+esc(i.owner||"")+'</span>'+statusCtl+'</div>'+
    '<dl class="kv"><dt>'+T("issue_content")+'</dt><dd style="font-weight:400">'+esc(i.content||"")+'</dd>'+
    '<dt>'+T("issue_impact")+'</dt><dd style="font-weight:400">'+esc(i.impact||"")+'</dd>'+
    '<dt>'+T("issue_cm")+'</dt><dd>'+cm+'</dd></dl>'+
    (ups?'<div class="panel-head" style="border-top:1px solid var(--line)"><h3 style="font-size:13px">'+T("issue_updates")+'</h3></div><div class="timeline">'+ups+'</div>':'')+addup+'</div>';
}
function issueAddForm(){
  var steps=[["step1",T("step1")],["step2",T("step2")],["step3",T("step3")],["future",T("step_future")],["other",T("step_other")]];
  return '<div class="panel"><div class="panel-head"><h3>'+T("issue_add")+'</h3></div><div class="add-row" style="flex-direction:column;align-items:stretch">'+
   '<div style="display:flex;gap:8px;flex-wrap:wrap"><select id="ni_step">'+steps.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>';}).join("")+'</select>'+
   '<input id="ni_title" placeholder="'+T("issue_title")+'" style="flex:1;min-width:160px"><input id="ni_owner" placeholder="'+T("issue_owner")+'" style="width:130px"></div>'+
   '<input id="ni_content" placeholder="'+T("issue_content")+'"><input id="ni_impact" placeholder="'+T("issue_impact")+'"><input id="ni_cm" placeholder="'+T("issue_cm")+'">'+
   '<div><button data-action="issue_add">'+T("issue_add")+'</button></div></div></div>';
}

/* ============================================================
   ROUTER
   ============================================================ */
async function render(){
  if(STATE.view==="login") return renderLogin();
  if(STATE.view==="issues") return renderIssues();
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
  if(a==="authmode"){ STATE.authMode=el.getAttribute("data-mode"); STATE.authError=null; STATE.authInfo=null; return renderLogin(); }
  if(a==="authemail"){ STATE.authError=null; STATE.authInfo=null; var er=await DATA.authSignInEmail(val("loginEmail"), val("loginPass"));
    if(er.error){ STATE.authError=T("login_failed"); return renderLogin(); } return afterLogin(); }
  if(a==="authsignup"){ STATE.authError=null; STATE.authInfo=null; var sr=await DATA.authSignUp(val("loginEmail"), val("loginPass"));
    if(sr.error){ STATE.authError=sr.error; return renderLogin(); }
    if(sr.session){ return afterLogin(); }
    STATE.authMode="login"; STATE.authInfo=T("signup_done"); return renderLogin(); }
  if(a==="authcode"){ STATE.authError=null; STATE.authInfo=null; var ec=await DATA.authSignInCode(val("loginCode"));
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
  if(a==="gonav"){ STATE.view=el.getAttribute("data-view"); if(STATE.view==="dashboard") STATE.detailId=null; return render(); }
  if(a==="issue_status"){ await DATA.updateIssue(el.getAttribute("data-id"),{status:el.value}); return renderIssues(); }
  if(a==="issue_cm_save"){ var ci=el.getAttribute("data-id"); await DATA.updateIssue(ci,{countermeasure:val("ic_"+ci)}); return renderIssues(); }
  if(a==="issue_addupdate"){ var ui=el.getAttribute("data-id"); var nt=val("iu_"+ui); if(!nt) return;
    var cur=(window.ISSUE_CACHE||{})[ui]; var ups=(cur&&cur.updates)?cur.updates.slice():[];
    ups.push({date:todayStr(),by:roleShort(),note:nt}); await DATA.updateIssue(ui,{updates:ups}); return renderIssues(); }
  if(a==="issue_add"){ var nti=val("ni_title"); if(!nti) return;
    await DATA.addIssue({step:val("ni_step"),title:nti,content:val("ni_content"),impact:val("ni_impact"),countermeasure:val("ni_cm"),owner:val("ni_owner"),status:"新規",updates:[],sort:100}); return renderIssues(); }
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
  if(a==="written_add"){ var wd=val("w_d"); if(!wd) return; var ws=parseInt(val("w_s")||0,10);
    await pushArray(id,"license","written_attempts",{date:wd,score:val("w_s"),result:(ws>=45?"pass":"fail"),note:val("w_n")}); return renderDetail(); }
  if(a==="skill_add"){ var skd=val("s_d"); if(!skd) return; var skp=parseInt(val("s_p")||0,10);
    var fails=FAIL_TAGS.filter(function(t){var e=document.getElementById("sf_"+t); return e&&e.checked;});
    await pushArray(id,"license","skill_attempts",{date:skd,points:val("s_p"),result:(skp>=70?"pass":"fail"),fails:fails,note:val("s_n")}); return renderDetail(); }
});

APP.addEventListener("change", async function(e){
  var el=e.target.closest("[data-action]"); if(!el) return;
  var a=el.getAttribute("data-action"); var id=STATE.detailId;
  if(a==="ssw_next"){ await patchModule(id,"ssw",{next_exam:el.value}); return; }
  if(a==="prep_set"){ await patchModule(id,"jp",{prep_status:el.value}); return renderDetail(); }
  if(a==="lic_field"){ var f=el.getAttribute("data-field"); var v=el.value;
    if(f==="app_installed") v=(v==="1");
    if(f==="app_freq"||f==="s1_doc_defects"||f==="s1_depth_retries") v=parseInt(v||0,10);
    var o={}; o[f]=v; await patchModule(id,"license",o);
    if(/^(final_result|result|app_installed|s1_)/.test(f)) return renderDetail(); return; }
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
