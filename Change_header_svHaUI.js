// ==UserScript==
// @name         Change header sv HaUI
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      1.0
// @description  Change header sv HaUI
// @author       QuanVu
// @match        https://sv.haui.edu.vn/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const newTitle = document.querySelector("div.panel-heading").textContent;
    document.title = newTitle;
})();