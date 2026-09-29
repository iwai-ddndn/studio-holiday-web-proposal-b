/* microCMSの接続設定。
 * 管理画面（https://<serviceDomain>.microcms.io）で作った値を入れると、
 * FVのステッカー事例（works）とニュースレター（newsletter）がCMSから読み込まれる。
 * 空のままでもリポジトリ内のフォールバックデータで今まで通り表示される。
 * サービスの作り方・APIスキーマは CMS-SETUP.md を参照 */
window.MICROCMS_CONFIG = {
  serviceDomain: 'sthl', // 例: 'studioholiday'（xxxx.microcms.io の xxxx 部分）
  apiKey: 'vIHTkxXH6B2X1NxElT9PqyTTj9ROlqnBSDAQ',        // GET専用のAPIキー（コンテンツ参照のみの権限にすること）
};
