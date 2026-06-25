/* ============================================================
   データ層 / Lapisan data
   - config.js に Supabase の値があれば「本番モード」(共有DB)
   - 空なら「デモモード」(下記サンプルを localStorage に保存)
   ============================================================ */
(function(){
  var cfg = window.APP_CONFIG||{};
  var LIVE = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  var sb = null;
  if(LIVE && window.supabase){ sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY); }

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
        ssw:{ status:"pass", next_exam:"", attempts:[
          {date:"2025-03-10", result:"pass", score:"78/100", note:"一発合格"} ] },
        license:{ application_date:"", written_date:"", skill_date:"", result:"notyet",
          app_installed:true, app_freq:4, app_lastused:"2026-06-20",
          mocks:[ {date:"2026-06-05",score:7,total:10}, {date:"2026-06-18",score:9,total:10} ] },
        jp:{ lessons:[
            {date:"2026-05-08", attended:true, reason:""},
            {date:"2026-05-15", attended:true, reason:""},
            {date:"2026-05-22", attended:false, reason:"仕事(残業)"},
            {date:"2026-05-29", attended:true, reason:""},
            {date:"2026-06-05", attended:true, reason:""},
            {date:"2026-06-12", attended:true, reason:""} ],
          self_study:[ {date:"2026-05-23", minutes:40, content:"アプリで復習"},
            {date:"2026-06-08", minutes:60, content:"漢字N4"} ],
          prep_status:"inprog" } },

      { id:"p2", name_ja:"デウィ・レスタリ", name_id:"Dewi Lestari", company_id:"c1",
        intake_date:"2025-04-02", entry_date:"2026-03-01", status:"pre",
        coe:"applied", visa:"審査中", flight:"未手配", housing:"未手配",
        jft:{acquired:true, level:"A2", score:"205/250", date:"2024-12-10"},
        ssw:{ status:"fail", next_exam:"2026-07-12", attempts:[
            {date:"2025-03-10", result:"fail", score:"61/100", note:"あと一歩"},
            {date:"2025-05-18", result:"fail", score:"68/100", note:"長文で失点"} ] },
        license:{ application_date:"", written_date:"", skill_date:"", result:"notyet",
          app_installed:false, app_freq:0, app_lastused:"",
          mocks:[] },
        jp:{ lessons:[
            {date:"2026-05-08", attended:false, reason:"仕事"},
            {date:"2026-05-15", attended:false, reason:"仕事"},
            {date:"2026-05-22", attended:true, reason:""},
            {date:"2026-05-29", attended:false, reason:"体調不良"},
            {date:"2026-06-05", attended:false, reason:"仕事"},
            {date:"2026-06-12", attended:true, reason:""} ],
          self_study:[],
          prep_status:"notyet" } },

      { id:"p3", name_ja:"ブディ・ウタモ", name_id:"Budi Utomo", company_id:"c2",
        intake_date:"2025-02-20", entry_date:"2025-12-01", status:"injp",
        coe:"done", visa:"特定活動", flight:"完了", housing:"手配済",
        jft:{acquired:true, level:"A2", score:"230/250", date:"2024-10-05"},
        ssw:{ status:"pass", next_exam:"", attempts:[
            {date:"2025-03-10", result:"pass", score:"85/100", note:""} ] },
        license:{ application_date:"2026-04-10", written_date:"2026-05-20", skill_date:"2026-06-30", result:"inprog",
          app_installed:true, app_freq:5, app_lastused:"2026-06-22",
          mocks:[ {date:"2026-05-01",score:6,total:10}, {date:"2026-05-15",score:8,total:10},
                  {date:"2026-06-10",score:9,total:10} ] },
        jp:{ lessons:[
            {date:"2026-05-08", attended:true, reason:""},
            {date:"2026-05-15", attended:true, reason:""},
            {date:"2026-05-22", attended:true, reason:""},
            {date:"2026-05-29", attended:true, reason:""} ],
          self_study:[ {date:"2026-06-01", minutes:90, content:"運転ルール用語"} ],
          prep_status:"inprog" } },

      { id:"p4", name_ja:"シティ・ヌルハリザ", name_id:"Siti Nurhaliza", company_id:"c2",
        intake_date:"2025-05-10", entry_date:"2026-04-01", status:"pre",
        coe:"applied", visa:"準備中", flight:"未手配", housing:"未手配",
        jft:{acquired:true, level:"A2", score:"200/250", date:"2025-01-15"},
        ssw:{ status:"notyet", next_exam:"2026-08-09", attempts:[] },
        license:{ application_date:"", written_date:"", skill_date:"", result:"notyet",
          app_installed:true, app_freq:1, app_lastused:"2026-05-30",
          mocks:[ {date:"2026-05-29",score:5,total:10} ] },
        jp:{ lessons:[
            {date:"2026-05-08", attended:true, reason:""},
            {date:"2026-05-15", attended:false, reason:"仕事"},
            {date:"2026-05-22", attended:true, reason:""},
            {date:"2026-05-29", attended:true, reason:""},
            {date:"2026-06-05", attended:true, reason:""},
            {date:"2026-06-12", attended:false, reason:"家庭の事情"} ],
          self_study:[ {date:"2026-06-02", minutes:30, content:"会話練習"} ],
          prep_status:"inprog" } },

      { id:"p5", name_ja:"リョ・ハルトノ", name_id:"Rio Hartono", company_id:"c3",
        intake_date:"2025-01-30", entry_date:"2025-11-01", status:"work",
        coe:"done", visa:"特定技能1号", flight:"完了", housing:"手配済",
        jft:{acquired:true, level:"A2", score:"240/250", date:"2024-09-01"},
        ssw:{ status:"pass", next_exam:"", attempts:[
            {date:"2025-03-10", result:"pass", score:"90/100", note:""} ] },
        license:{ application_date:"2026-01-15", written_date:"2026-02-20", skill_date:"2026-03-25", result:"done",
          app_installed:true, app_freq:3, app_lastused:"2026-03-20",
          mocks:[ {date:"2026-02-01",score:8,total:10}, {date:"2026-02-15",score:9,total:10} ] },
        jp:{ lessons:[
            {date:"2026-05-08", attended:true, reason:""},
            {date:"2026-05-15", attended:true, reason:""} ],
          self_study:[ {date:"2026-05-20", minutes:45, content:"業務日本語"} ],
          prep_status:"done" } }
    ]
  };

  /* ---------- デモ用ストレージ ---------- */
  var LS_KEY="ssw_tracker_demo_v1";
  function loadDemo(){
    try{ var raw=localStorage.getItem(LS_KEY); if(raw) return JSON.parse(raw); }catch(e){}
    return JSON.parse(JSON.stringify(SEED));
  }
  function saveDemo(db){ try{ localStorage.setItem(LS_KEY, JSON.stringify(db)); }catch(e){} }
  var demoDB = loadDemo();

  /* ---------- 公開API ---------- */
  window.DATA = {
    isLive:function(){ return LIVE; },
    resetDemo:function(){ localStorage.removeItem(LS_KEY); demoDB=loadDemo(); },

    getCompanies: async function(){
      if(LIVE){ var r=await sb.from("companies").select("*").order("name"); return r.data||[]; }
      return demoDB.companies;
    },
    getCandidates: async function(filter){
      // filter: {company_id, candidate_id, status:'pre'|...}
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
    // 部分更新（モジュール単位）
    updateCandidate: async function(id, patch){
      if(LIVE){ await sb.from("candidates").update(patch).eq("id",id); return; }
      var c=demoDB.candidates.find(function(x){return x.id===id;});
      if(c){ Object.assign(c,patch); saveDemo(demoDB); }
    }
  };
})();
