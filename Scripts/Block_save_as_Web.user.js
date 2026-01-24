// ==UserScript==
// @name            Block save as (ctrl + s)
// @name:vi         Chặn lưu trang (ctrl + s)
// @name:ja         ページ保存をブロック (ctrl + s)
// @name:zh-CN      阻止保存为 (ctrl + s)
// @name:ru         Блокировка сохранения (ctrl + s)
// @name:es         Bloquear guardar como (ctrl + s)
// @name:fr         Bloquer enregistrer sous (ctrl + s)
// @name:de         Speichern unter blockieren (ctrl + s)
// @name:ko         다른 이름으로 저장 차단 (ctrl + s)
// @description     Block save as (ctrl + s) in web pages. Turn on CapsLock to bypass.
// @description:vi  Chặn lưu trang bằng phím tắt ctrl + s. Bật CapsLock để bỏ qua.
// @description:ja  Webページでの保存 (ctrl + s) をブロックします。バイパスするにはCapsLockをオンにしてください。
// @description:zh-CN 在网页中阻止保存为 (ctrl + s)。开启 CapsLock 可绕过。
// @description:ru  Блокирует сохранение (ctrl + s) на веб-страницах. Включите CapsLock, чтобы обойти.
// @description:es  Bloquear guardar como (ctrl + s) en páginas web. Active CapsLock para omitir.
// @description:fr  Bloquer enregistrer sous (ctrl + s) dans les pages web. Activez CapsLock pour contourner.
// @description:de  Speichern unter (ctrl + s) auf Webseiten blockieren. Schalten Sie CapsLock ein, um dies zu umgehen.
// @description:ko  웹 페이지에서 다른 이름으로 저장 (ctrl + s) 차단. 우회하려면 CapsLock을 켜십시오.
// @author          QuanVu
// @namespace       https://github.com/vuquan2005/ScriptsMonkey
// @version         1.1.0
// @match           *://*/*
// @grant           none
// @run-at          document-start
// @license         MIT
// ==/UserScript==

(function () {
    "use strict";

    document.addEventListener("keydown", function (event) {
        if ((event.ctrlKey || event.metaKey) && (event.key === "s" || event.key === "S")) {
            if (!event.getModifierState("CapsLock")) {
                event.preventDefault();
                console.log("❌ Block Save As: Blocked. Turn on CapsLock to bypass.");
            }
        }
    }, { capture: true });
})();