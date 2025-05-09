// ==UserScript==
// @name         sv.HaUI
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      2.3
// @description  Công cụ hỗ trợ cho sinh viên HaUI
// @author       QuanVu
// @downloadURL  https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/svHaUI_Helper.user.js
// @updateURL    https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/svHaUI_Helper.user.js
// @match        https://sv.haui.edu.vn/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";
    // =====================================================================================
    // Change header
    function changeHeader() {
        if (!document.querySelector("div.panel-heading")) return;
        let newTitle = document.querySelector("div.panel-heading").textContent;
        console.log("Last title: ", newTitle);
        newTitle = newTitle.replace("\n", "");
        newTitle = newTitle.replace("\t", "");
        newTitle = newTitle.replace("TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP HÀ NỘI", "");
        newTitle = newTitle.replace("Đại học công nghiệp Hà Nội", "");
        newTitle = newTitle.replace("CHI TIẾT HỌC PHẦN CDIO: ", "");
        document.title = newTitle;
    }
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
    // ======================================================================================
    changeHeader();
    setInterval(() => {
        changeHeader();
    }, 10000);
})();
