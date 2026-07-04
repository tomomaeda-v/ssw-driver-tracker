/* ============================================================
   データ層 / Lapisan data （認証対応版）
   - config.js に Supabase の値があれば「本番モード」(共有DB＋ログイン)
   - 空なら「デモモード」(下記サンプルを localStorage に保存／旧・役割選択)
   ============================================================ */
(function(){
  var cfg = window.APP_CONFIG||{};
  var LIVE = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  var sb = null;
  if(LIVE && window.supabase){ sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY); }

  // 本人コード → 認証メールの変換規則（コードは小文字で扱う）
  var CODE_DOMAIN = "@ssw-code.local";
  function codeToEmail(code){ return String(code||"").trim().toLowerCase() + CODE_DOMAIN; }
  function codeToPass(code){ return String(code||"").trim().toLowerCase(); }

  /* ---------- サンプル(デモ)データ ---------- */
  var SEED = {
    companies:[
      {id:"c1", name:"東京ロジスティクス株式会社"},
      {id:"c2", name:"関西運輸サービス株式会社"},
      {id:"c3", name:"中部物流株式会社"}
    ],
    candidates:[
      { id:"p1", name_ja:"アグス・サントソ", name_id:"Agus Santoso", company_id:"c1",
        intake_date:"2025-03-15", entry_date:"2026-02-01", status:"pre",
        coe:"applied", visa:"審査中", flight:"未手配", housing:"手配済",
        jft:{acquired:true, level:"A2", score:"215/250", date:"2024-11-20"},
        ssw:{ status:"pass", next_exam:"", attempts:[ {date:"2025-03-10", result:"pass", score:"78/100", note:"一発合格"} ] },
        license:{ application_date:"", written_date:"", skill_date:"", result:"notyet", app_installed:true, app_freq:4, app_lastused:"2026-06-20",
          mocks:[ {date:"2026-06-05",score:7,total:10}, {date:"2026-06-18",score:9,total:10} ] },
        jp:{ lessons:[ {date:"2026-05-08", attended:true, reason:""}, {date:"2026-05-15", attended:true, reason:""},
            {date:"2026-05-22", attended:false, reason:"仕事(残業)"}, {date:"2026-05-29", attended:true, reason:""},
            {date:"2026-06-05", attended:true, reason:""}, {date:"2026-06-12", attended:true, reason:""} ],
          self_study:[ {date:"2026-05-23", minutes:40, content:"アプリで復習"}, {date:"2026-06-08", minutes:60, content:"漢字N4"} ], prep_status:"inprog" } },
      { id:"p2", name_ja:"デウィ・レスタリ", name_id:"Dewi Lestari", company_id:"c1",
        intake_date:"2025-04-02", entry_date:"2026-03-01", status:"pre",
        coe:"applied", visa:"審査中", flight:"未手配", housing:"未手配",
        jft:{acquired:true, level:"A2", score:"205/250", date:"2024-12-10"},
        ssw:{ status:"fail", next_exam:"2026-07-12", attempts:[ {date:"2025-03-10", result:"fail", score:"61/100", note:"あと一歩"}, {date:"2025-05-18", result:"fail", score:"68/100", note:"長文で失点"} ] },
        license:{ application_date:"", written_date:"", skill_date:"", result:"notyet", final_result:"inprog", s1_doc_status:"ok", s1_doc_defects:1, s1_depth_status:"pending", written_attempts:[{date:"2025-03-10",score:"43",result:"fail"},{date:"2025-05-18",score:"44",result:"fail"}], skill_attempts:[], app_installed:false, app_freq:0, app_lastused:"", mocks:[] },
        jp:{ lessons:[ {date:"2026-05-08", attended:false, reason:"仕事"}, {date:"2026-05-15", attended:false, reason:"仕事"},
            {date:"2026-05-22", attended:true, reason:""}, {date:"2026-05-29", attended:false, reason:"体調不良"},
            {date:"2026-06-05", attended:false, reason:"仕事"}, {date:"2026-06-12", attended:true, reason:""} ], self_study:[], prep_status:"notyet" } },
      { id:"p3", name_ja:"ブディ・ウタモ", name_id:"Budi Utomo", company_id:"c2",
        intake_date:"2025-02-20", entry_date:"2025-12-01", status:"injp",
        coe:"done", visa:"特定活動", flight:"完了", housing:"手配済",
        jft:{acquired:true, level:"A2", score:"230/250", date:"2024-10-05"},
        ssw:{ status:"pass", next_exam:"", attempts:[ {date:"2025-03-10", result:"pass", score:"85/100", note:""} ] },
        license:{ application_date:"2026-04-10", written_date:"2026-05-20", skill_date:"2026-06-30", result:"inprog", final_result:"inprog", s1_doc_status:"ok", s1_depth_status:"retry", s1_depth_retries:1, written_attempts:[{date:"2026-05-20",score:"47",result:"pass"}], skill_attempts:[{date:"2026-06-10",points:"60",result:"fail",fails:["sakamichi","dasharin"]},{date:"2026-06-25",points:"66",result:"fail",fails:["sakamichi","ichiji"]}], app_installed:true, app_freq:5, app_lastused:"2026-06-22",
          mocks:[ {date:"2026-05-01",score:6,total:10}, {date:"2026-05-15",score:8,total:10}, {date:"2026-06-10",score:9,total:10} ] },
        jp:{ lessons:[ {date:"2026-05-08", attended:true, reason:""}, {date:"2026-05-15", attended:true, reason:""},
            {date:"2026-05-22", attended:true, reason:""}, {date:"2026-05-29", attended:true, reason:""} ], self_study:[ {date:"2026-06-01", minutes:90, content:"運転ルール用語"} ], prep_status:"inprog" } },
      { id:"p4", name_ja:"シティ・ヌルハリザ", name_id:"Siti Nurhaliza", company_id:"c2",
        intake_date:"2025-05-10", entry_date:"2026-04-01", status:"pre",
        coe:"applied", visa:"準備中", flight:"未手配", housing:"未手配",
        jft:{acquired:true, level:"A2", score:"200/250", date:"2025-01-15"},
        ssw:{ status:"notyet", next_exam:"2026-08-09", attempts:[] },
        license:{ application_date:"", written_date:"", skill_date:"", result:"notyet", app_installed:true, app_freq:1, app_lastused:"2026-05-30", mocks:[ {date:"2026-05-29",score:5,total:10} ] },
        jp:{ lessons:[ {date:"2026-05-08", attended:true, reason:""}, {date:"2026-05-15", attended:false, reason:"仕事"},
            {date:"2026-05-22", attended:true, reason:""}, {date:"2026-05-29", attended:true, reason:""},
            {date:"2026-06-05", attended:true, reason:""}, {date:"2026-06-12", attended:false, reason:"家庭の事情"} ], self_study:[ {date:"2026-06-02", minutes:30, content:"会話練習"} ], prep_status:"inprog" } },
      { id:"p5", name_ja:"リョ・ハルトノ", name_id:"Rio Hartono", company_id:"c3",
        intake_date:"2025-01-30", entry_date:"2025-11-01", status:"work",
        coe:"done", visa:"特定技能1号", flight:"完了", housing:"手配済",
        jft:{acquired:true, level:"A2", score:"240/250", date:"2024-09-01"},
        ssw:{ status:"pass", next_exam:"", attempts:[ {date:"2025-03-10", result:"pass", score:"90/100", note:""} ] },
        license:{ application_date:"2026-01-15", written_date:"2026-02-20", skill_date:"2026-03-25", result:"done", final_result:"acquired", s1_doc_status:"ok", s1_depth_status:"ok", written_attempts:[{date:"2026-02-20",score:"48",result:"pass"}], skill_attempts:[{date:"2026-03-25",points:"75",result:"pass",fails:[]}], app_installed:true, app_freq:3, app_lastused:"2026-03-20",
          mocks:[ {date:"2026-02-01",score:8,total:10}, {date:"2026-02-15",score:9,total:10} ] },
        jp:{ lessons:[ {date:"2026-05-08", attended:true, reason:""}, {date:"2026-05-15", attended:true, reason:""} ], self_study:[ {date:"2026-05-20", minutes:45, content:"業務日本語"} ], prep_status:"done" } }
    ]
  };

  var LS_KEY="ssw_tracker_demo_v1";
  function loadDemo(){ try{ var raw=localStorage.getItem(LS_KEY); if(raw) return JSON.parse(raw);}catch(e){} return JSON.parse(JSON.stringify(SEED)); }
  function saveDemo(db){ try{ localStorage.setItem(LS_KEY, JSON.stringify(db)); }catch(e){} }
  var demoDB = loadDemo();

  /* ---------- 課題管理(デモ) ---------- */
  function I(step,title,content,impact,cm,owner,status,sort){return {id:"i"+sort,step:step,title:title,content:content,impact:impact,countermeasure:cm,owner:owner,status:status,updates:[],sort:sort};}
  var ISSUES_SEED=[
    I("step1","書類不備（インドネシア警察発行）","免許クラス記載ミスなど現地警察発行書類の誤記が複数件発生","受験不可・やり直しによる時間ロス","FTI経由でフォーマット指示＋2社ダブルチェックで対応","FTI","対応済",11),
    I("step1","パスポート・書類要件","発行日により現地免許取得後3ヶ月経過が確認できず不受理のケース","書類審査通過まで複数回かかるリスク","事前確認フローを強化（発行日と取得日の突合）","FTI","対応中",12),
    I("step1","深視力検査","準中型以上に必須(3回平均誤差20mm以下)。鮫洲は府中より難しい傾向","複数回受験が必要なケースあり","民間施設での事前練習を推奨。実施状況を要管理","自動車学校","監視中",13),
    I("step2","出題範囲が広く毎回変動","標識・牽引・雪道・バス優先通行帯など広範囲から毎回異なる出題","特定分野だけの対策では不十分","YST授業＋対策アプリ自主学習を推奨","YST","対応中",21),
    I("step2","1点差での不合格が頻発","44点(合格45点)での不合格が複数名・複数回発生","繰り返し受験による時間・費用ロス","アプリ使用頻度・模擬試験結果を本アプリで把握","YST","対応中",22),
    I("step2","入国前学習管理の不備（最重要）","週1授業の出席率が低く欠席者の自学状況も不明","入国後のスタートが遅れる","出席率・自学・対策アプリを可視化し管理","YST","対応中",23),
    I("step3","逆走（右折後に対向車線へ）","T字路・交差点の右折時に対向車線へ進入。左側通行の意識不足","検定中止（即不合格）","入国前から左側通行・右折手順を習慣化。学校で重点指導","自動車学校","対応中",31),
    I("step3","坂道発進での後退（最多）","クラッチ操作不十分で車両が後方へ。最多・複数名で反復発生","重い減点〜中止","坂道発進を事前練習に重点組込み","自動車学校","対応中",32),
    I("step3","クランク・S字での脱輪","狭路の内輪差の感覚不足。複数回脱輪のケース","重い減点〜中止","内輪差感覚の事前練習。学校コースで反復","自動車学校","対応中",33),
    I("step3","速度不足（直線50km/h未達）","直線で40km/h前後にとどまる","20点減点","直線での加速指導を追加","自動車学校","対応中",34),
    I("step3","一時停止・安全不確認","停止線での完全停止不足・早発進・目視不足","重い減点〜中止／減点蓄積","停止＋目視動作の型を入国前から習慣化","自動車学校","対応中",35),
    I("future","試験場混雑の深刻化（府中）","予約が取りにくく次回まで間隔が空く。在留期限で断念ケースも","外免切替を断念するリスク","入国前に仕上げ受験回数を最小化。予約戦略を検討","YST","監視中",41),
    I("future","入国前育成の徹底（4取り組み）","①授業出席率の可視化 ②対策アプリ管理 ③左側通行・安全確認の習慣化 ④坂道発進等の重点練習","入国後開始では手遅れリスク","本アプリで①〜④を継続管理しPDCAで改善","YST/FTI/自動車学校","対応中",42)
  ];
  var LS_ISS="ssw_tracker_issues_v1";
  function loadIssues(){ try{var r=localStorage.getItem(LS_ISS); if(r) return JSON.parse(r);}catch(e){} return JSON.parse(JSON.stringify(ISSUES_SEED)); }
  function saveIssues(a){ try{localStorage.setItem(LS_ISS, JSON.stringify(a));}catch(e){} }
  var demoIssues=loadIssues();

  window.DATA = {
    isLive:function(){ return LIVE; },
    resetDemo:function(){ localStorage.removeItem(LS_KEY); demoDB=loadDemo(); },

    /* ---------- 認証 ---------- */
    authSignInEmail: async function(email, password){
      if(!LIVE) return {error:"not live"};
      var r = await sb.auth.signInWithPassword({ email:String(email||"").trim(), password:password });
      return { error: r.error ? r.error.message : null };
    },
    authSignInCode: async function(code){
      if(!LIVE) return {error:"not live"};
      var r = await sb.auth.signInWithPassword({ email:codeToEmail(code), password:codeToPass(code) });
      return { error: r.error ? r.error.message : null };
    },
    authSignUp: async function(email, password){
      if(!LIVE) return {error:"not live"};
      var r = await sb.auth.signUp({ email:String(email||"").trim(), password:password });
      if(r.error) return { error:r.error.message };
      return { error:null, session: !!(r.data && r.data.session) };
    },
    // 本人コード → 認証メール変換（アカウント管理画面用）
    codeToEmail: codeToEmail,
    // 管理者用: 自分のセッションを維持したまま新規ユーザーを作成
    // （Supabase側で「Confirm email」をOFFにしておくと、メール認証なしで即ログイン可能なアカウントになります）
    adminCreateUser: async function(email, password){
      if(!LIVE) return {error:"not live"};
      var tmp = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY,
        { auth:{ persistSession:false, autoRefreshToken:false, detectSessionInUrl:false } });
      var r = await tmp.auth.signUp({ email:String(email||"").trim().toLowerCase(), password:password });
      if(r.error){
        var already = /already|registered|exists/i.test(r.error.message||"");
        return { error:r.error.message, already:already };
      }
      try{ await tmp.auth.signOut(); }catch(e){}
      return { error:null, confirmed: !!(r.data && r.data.session) };
    },
    // app_users（役割・範囲の対応表）の管理 ※yst/fti のRLSポリシーが必要（admin_users.sql）
    listAppUsers: async function(){
      if(!LIVE) return [];
      var r = await sb.from("app_users").select("email,role,company_id,candidate_id,note").order("email");
      return r.data||[];
    },
    upsertAppUser: async function(u){
      if(!LIVE) return {error:"not live"};
      var r = await sb.from("app_users").upsert(u, { onConflict:"email" });
      return { error: r.error ? r.error.message : null };
    },
    deleteAppUser: async function(email){
      if(!LIVE) return {error:"not live"};
      var r = await sb.from("app_users").delete().eq("email", email);
      return { error: r.error ? r.error.message : null };
    },
    authSignOut: async function(){ if(LIVE && sb) await sb.auth.signOut(); },
    getSession: async function(){ if(!LIVE) return null; var r=await sb.auth.getSession(); return r.data ? r.data.session : null; },
    // ログインユーザーの役割・範囲（app_users から）
    getMyProfile: async function(){
      if(!LIVE) return null;
      var r = await sb.from("app_users").select("email,role,company_id,candidate_id").limit(1);
      if(r.error || !r.data || !r.data.length) return null;
      return r.data[0];
    },

    /* ---------- データ取得・更新（本番はRLSで自動的に範囲制限） ---------- */
    getCompanies: async function(){
      if(LIVE){ var r=await sb.from("companies").select("*").order("name"); return r.data||[]; }
      return demoDB.companies;
    },
    getCandidates: async function(filter){
      var list;
      if(LIVE){
        var q=sb.from("candidates").select("*");
        if(filter&&filter.company_id) q=q.eq("company_id",filter.company_id);
        if(filter&&filter.candidate_id) q=q.eq("id",filter.candidate_id);
        var r=await q; list=r.data||[];
      } else {
        list = demoDB.candidates.slice();
        if(filter&&filter.company_id) list=list.filter(function(c){return c.company_id===filter.company_id;});
        if(filter&&filter.candidate_id) list=list.filter(function(c){return c.id===filter.candidate_id;});
      }
      return list;
    },
    getCandidate: async function(id){
      if(LIVE){ var r=await sb.from("candidates").select("*").eq("id",id).single(); return r.data; }
      return demoDB.candidates.find(function(c){return c.id===id;});
    },

    /* ---------- 課題管理 ---------- */
    getIssues: async function(){
      if(LIVE){ var r=await sb.from("issues").select("*").order("sort"); return r.data||[]; }
      return demoIssues.slice().sort(function(a,b){return (a.sort||100)-(b.sort||100);});
    },
    addIssue: async function(it){
      if(LIVE){ await sb.from("issues").insert(it); return; }
      it.id="i"+Date.now(); it.updates=it.updates||[]; it.sort=it.sort||100; demoIssues.push(it); saveIssues(demoIssues);
    },
    updateIssue: async function(id, patch){
      if(LIVE){ await sb.from("issues").update(patch).eq("id",id); return; }
      var x=demoIssues.find(function(i){return i.id===id;}); if(x){ Object.assign(x,patch); saveIssues(demoIssues); }
    },
    updateCandidate: async function(id, patch){
      if(LIVE){ await sb.from("candidates").update(patch).eq("id",id); return; }
      var c=demoDB.candidates.find(function(x){return x.id===id;});
      if(c){ Object.assign(c,patch); saveDemo(demoDB); }
    }
  };
})();
