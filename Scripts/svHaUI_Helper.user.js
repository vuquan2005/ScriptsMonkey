// ==UserScript==
// @name         sv.HaUI
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      2.2
// @description  Do some things on sv.haui.edu.vn
// @author       QuanVu
// @downloadURL  https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/svHaUI_Helper.user.js
// @updateURL    https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/svHaUI_Helper.user.js
// @match        https://sv.haui.edu.vn/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";
    // Change header
    setTimeout(() => {
        const newTitle = document.querySelector("div.panel-heading").textContent;
        document.title = newTitle;
    }, 700);
    // add Học kết hợp to sidebar
    const tabToAddElement = document.querySelector("ul.sidebar-elements > li:nth-child(2)");
    if (tabToAddElement) {
        let studyTabNext = `
            <li>
                <a href="/sso/blearning">
                    <i class="fa flaticon-science1 icon"></i>
                    <span>Học kết hợp!</span>
                </a>
            </li>
        `;
        tabToAddElement.insertAdjacentHTML("afterend", studyTabNext);
    }
})();
