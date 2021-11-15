/* disable to save telemetry pings and datareporting/archived
ヘルスレポートなどの記録・送信を無効化、 datareporting、saved-telemetry-pingsフォルダ不要になり、プロファイルを大幅に縮小。 */
user_pref("toolkit.telemetry.archive.enabled", false);
user_pref("toolkit.telemetry.enabled", false);
user_pref("toolkit.telemetry.unified", false);

/* 検索履歴を検索順に並べる */
user_pref("browser.formfill.bucketSize", -1);
user_pref("browser.formfill.maxTimeGroupings", -1);
user_pref("browser.formfill.timeGroupingSize", -1);

/* IPv6を無効化 */
user_pref("network.dns.disableIPv6", true);

/* ディスクキャッシュをoff */
user_pref("browser.cache.disk.enable", false);

/* メモリキャッシュをon */
user_pref("browser.cache.memory.enable", true);

/* 最後のタブを閉じても終了しない　*/
user_pref("browser.tabs.closeWindowWithLastTab", false);

/* 右クリックを離すとコンテキストメニューが開いてしまわないように　*/
user_pref("dom.event.contextmenu.enabled", true);

/* AMO内のページでマウスジェスチャを動作させる */
user_pref("privacy.resistFingerprinting.block_mozAddonManager", true);

/* ブックマークのバックアップ個数 */
user_pref("browser.bookmarks.max_backups", 2);

/* AMO内のページでジェスチャを動作させる */
user_pref("privacy.resistFingerprinting.block_mozAddonManager", true);

/* MacやLinux系OSで「Gesture Button」にマウス右ボタンを設定した状態でジェスチャーを入力する際にコンテキストメニューが表示されてしまう場合があるので対策 */
// user_pref("dom.event.contextmenu.enabled", true);
// user_pref("input.contextMmenu.onRelease", true);
// user_pref("ui.context_menus.after_mouseup", true);

/* タブ幅を指定 */
user_pref("browser.tabs.tabMinWidth", 128);

/* セッションを保存する間隔を長く 15分に */
user_pref("browser.sessionstore.interval", 900000);

