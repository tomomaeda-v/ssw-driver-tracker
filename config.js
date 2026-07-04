/* ============================================================
   設定ファイル / File konfigurasi
   ------------------------------------------------------------
   本番モード（共有DB＋全員で同期）に接続済みです。
   Supabaseプロジェクト: ssw-driver-tracker
   ============================================================ */
window.APP_CONFIG = {
  SUPABASE_URL: "https://uvkzkrekiwagdvgaydie.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_fHwuQPialm79FEVAOehTXw_Zr7KkEf2",
  ORG_NAME: "株式会社YSタレント",
  // true = ログイン認証なし（役割選択のみで入れる・全員が共有DBに直接アクセス）
  AUTH_DISABLED: true
};
