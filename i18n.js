/* 多言語辞書 / Kamus dwibahasa (ja=日本語, id=Bahasa Indonesia) */
window.I18N = {
  ja:{
    appName:"特定技能ドライバー 進捗管理", login:"ログイン", selectRole:"役割を選択",
    role_yst:"管理者（YST）", role_yst_d:"全体管理・全候補者",
    role_fti:"管理者（FTI）", role_fti_d:"インドネシア現地・入国前",
    role_self:"本人", role_self_d:"自分の進捗",
    role_company:"受入れ企業", role_company_d:"自社の候補者",
    selectUser:"ユーザー", selectCompany:"企業", password:"パスワード（任意・デモ）",
    enter:"入る", demoMode:"デモモード（サンプルデータ）", liveMode:"本番モード（Supabase接続済）",
    email:"メールアドレス", login_admincorp:"管理者・企業", login_self:"本人（コード）", login_code:"ログインコード", login_failed:"ログインに失敗しました。入力をご確認ください。", login_noprofile:"アカウント設定が見つかりません。管理者にお問い合わせください。",
    logout:"ログアウト", back:"← 一覧へ戻る",
    // dashboards
    dash_overview:"全体ダッシュボード", dash_sub_yst:"SSW・外免切替・日本語学習の進捗を一元管理",
    dash_sub_fti:"入国前の学習進捗（日本語・SSW・外免対策）",
    dash_sub_self:"あなたの進捗状況", dash_sub_company:"受入れ予定の候補者進捗",
    // KPI
    kpi_total:"候補者数", kpi_ssw_pass:"SSW合格", kpi_ssw_pending:"SSW未合格", kpi_attn_low:"出席率 要注意",
    kpi_license_done:"外免切替完了", kpi_app_unused:"対策アプリ未使用",
    persons:"名", needAttention:"要対応",
    // table headers
    h_name:"氏名", h_company:"受入れ企業", h_status:"在留状況", h_ssw:"SSW", h_license:"外免切替",
    h_jp:"日本語(出席率)", h_next:"次回受験", h_score:"スコア", h_app:"対策アプリ", h_result:"結果",
    h_date:"日付", h_reason:"理由", h_attend:"出席", h_minutes:"時間(分)", h_content:"内容",
    h_action:"操作", h_freq:"使用頻度", h_mock:"模擬試験",
    // status values
    st_pre:"入国前", st_injp:"入国後(特定活動)", st_work:"稼働中",
    pass:"合格", fail:"不合格", notyet:"未受験", inprog:"対策中", done:"完了", applied:"申請済",
    attended:"出席", absent:"欠席", used:"使用", notused:"未使用", reported:"本人報告",
    // modules
    mod_overview:"基本情報", mod_jft:"JFT", mod_ssw:"SSW(特定技能試験)", mod_license:"外免切替", mod_jp:"日本語学習", mod_proc:"入国手続き",
    // overview fields
    f_name_id:"氏名(ローマ字)", f_company:"受入れ企業", f_intake:"内定日", f_entry:"入国予定日", f_status:"在留状況",
    f_coe:"COE(在留資格認定)", f_visa:"在留資格/ビザ", f_flight:"航空券", f_housing:"宿舎手配",
    // ssw
    ssw_status:"SSW状況", ssw_next:"次回受験予定日", ssw_history:"受験履歴", ssw_score:"スコア",
    ssw_addtitle:"受験記録を追加", ssw_gap:"合格までの距離（目安）",
    // license
    lic_app:"申請日", lic_written:"学科試験日", lic_skill:"技能試験日", lic_result:"結果(本人報告)",
    lic_apptool:"知識確認 対策アプリ", lic_installed:"インストール", lic_freq:"使用頻度(回/週)", lic_lastused:"最終使用",
    lic_mock:"模擬試験結果", lic_addmock:"模擬試験を追加",
    // japanese
    jp_class:"オンライン授業 出席状況（荻野先生・週1）", jp_attendrate:"出席率",
    jp_addlesson:"授業記録を追加", jp_self:"自学学習ログ", jp_addself:"自学記録を追加",
    jp_prep:"知識確認 対策（入国前）", jp_present:"出席", jp_absent:"欠席",
    // generic
    add:"追加", save:"保存", date:"日付", note:"備考", score:"点数", total:"満点", freq_unit:"回/週",
    times_week:"回/週", minutes:"分", noData:"データがありません", select:"選択", yes:"あり", no:"なし",
    issue_banner:"⚠ 現場の重点課題: ① SSW未合格者の次回受験日・スコア管理 / ② 外免対策アプリの使用状況 / ③ 入国前の日本語授業 出席率管理",
    update_done:"更新しました"
  },
  id:{
    appName:"Manajemen Progres Sopir SSW", login:"Masuk", selectRole:"Pilih peran",
    role_yst:"Admin (YST)", role_yst_d:"Manajemen menyeluruh",
    role_fti:"Admin (FTI)", role_fti_d:"Lokal Indonesia・sebelum berangkat",
    role_self:"Diri sendiri", role_self_d:"Progres saya",
    role_company:"Perusahaan penerima", role_company_d:"Kandidat kami",
    selectUser:"Pengguna", selectCompany:"Perusahaan", password:"Kata sandi (opsional・demo)",
    enter:"Masuk", demoMode:"Mode demo (data contoh)", liveMode:"Mode live (terhubung Supabase)",
    email:"Email", login_admincorp:"Admin・Perusahaan", login_self:"Diri sendiri (kode)", login_code:"Kode login", login_failed:"Gagal masuk. Mohon periksa kembali isian Anda.", login_noprofile:"Pengaturan akun tidak ditemukan. Hubungi admin.",
    logout:"Keluar", back:"← Kembali ke daftar",
    dash_overview:"Dasbor menyeluruh", dash_sub_yst:"Kelola progres SSW・konversi SIM・bahasa Jepang",
    dash_sub_fti:"Progres belajar sebelum berangkat (Bahasa Jepang・SSW・persiapan SIM)",
    dash_sub_self:"Status progres Anda", dash_sub_company:"Progres kandidat yang akan diterima",
    kpi_total:"Jumlah kandidat", kpi_ssw_pass:"Lulus SSW", kpi_ssw_pending:"Belum lulus SSW", kpi_attn_low:"Kehadiran rendah",
    kpi_license_done:"Konversi SIM selesai", kpi_app_unused:"Aplikasi belum dipakai",
    persons:"orang", needAttention:"perlu perhatian",
    h_name:"Nama", h_company:"Perusahaan", h_status:"Status tinggal", h_ssw:"SSW", h_license:"Konversi SIM",
    h_jp:"Bhs Jepang(hadir)", h_next:"Ujian berikut", h_score:"Skor", h_app:"Aplikasi", h_result:"Hasil",
    h_date:"Tanggal", h_reason:"Alasan", h_attend:"Hadir", h_minutes:"Menit", h_content:"Materi",
    h_action:"Aksi", h_freq:"Frekuensi", h_mock:"Ujian simulasi",
    st_pre:"Sebelum berangkat", st_injp:"Setelah masuk(Tokutei Katsudo)", st_work:"Bekerja",
    pass:"Lulus", fail:"Tidak lulus", notyet:"Belum ujian", inprog:"Persiapan", done:"Selesai", applied:"Sudah ajukan",
    attended:"Hadir", absent:"Absen", used:"Dipakai", notused:"Belum dipakai", reported:"Lapor sendiri",
    mod_overview:"Info dasar", mod_jft:"JFT", mod_ssw:"SSW(Ujian SSW)", mod_license:"Konversi SIM", mod_jp:"Belajar Bhs Jepang", mod_proc:"Prosedur masuk",
    f_name_id:"Nama(latin)", f_company:"Perusahaan penerima", f_intake:"Tgl diterima", f_entry:"Rencana masuk", f_status:"Status tinggal",
    f_coe:"COE(CoE)", f_visa:"Status tinggal/Visa", f_flight:"Tiket pesawat", f_housing:"Tempat tinggal",
    ssw_status:"Status SSW", ssw_next:"Rencana ujian berikutnya", ssw_history:"Riwayat ujian", ssw_score:"Skor",
    ssw_addtitle:"Tambah catatan ujian", ssw_gap:"Perkiraan jarak ke kelulusan",
    lic_app:"Tgl pengajuan", lic_written:"Tgl ujian teori", lic_skill:"Tgl ujian praktik", lic_result:"Hasil(lapor sendiri)",
    lic_apptool:"Aplikasi persiapan teori", lic_installed:"Terpasang", lic_freq:"Frekuensi(x/minggu)", lic_lastused:"Terakhir dipakai",
    lic_mock:"Hasil ujian simulasi", lic_addmock:"Tambah ujian simulasi",
    jp_class:"Kehadiran kelas online (Guru Ogino・1x/minggu)", jp_attendrate:"Tingkat kehadiran",
    jp_addlesson:"Tambah catatan kelas", jp_self:"Log belajar mandiri", jp_addself:"Tambah belajar mandiri",
    jp_prep:"Persiapan konfirmasi pengetahuan (sebelum berangkat)", jp_present:"Hadir", jp_absent:"Absen",
    add:"Tambah", save:"Simpan", date:"Tanggal", note:"Catatan", score:"Nilai", total:"Maks", freq_unit:"x/minggu",
    times_week:"x/minggu", minutes:"menit", noData:"Tidak ada data", select:"Pilih", yes:"Ya", no:"Tidak",
    issue_banner:"⚠ Fokus utama: ① Tgl ujian & skor kandidat SSW belum lulus / ② Pemakaian aplikasi SIM / ③ Tingkat kehadiran kelas Bhs Jepang sebelum berangkat",
    update_done:"Tersimpan"
  }
};
window.t = function(key){ var L=window.STATE&&window.STATE.lang||'ja'; return (I18N[L]&&I18N[L][key])||(I18N.ja[key])||key; };
