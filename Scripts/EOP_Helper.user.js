// ==UserScript==
// @name         EOP Helper
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      1.0
// @description  A useful tool to use on the eop.edu.vn
// @author       QuanVu
// @match        https://eop.edu.vn/*
// @updateURL    https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/EOP_Helper.user.js
// @downloadURL  https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/EOP_Helper.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';
    // Auto viết hoa captcha
    const currentURL = window.location.href;
    // nếu web hiện tại có dạng https://eop.edu.vn/study/course/
    if (currentURL.includes('/study/course/')) {
        const captchaInput = document.querySelector("div.dgcaptcha > input#txtcaptcha");
        if (captchaInput) {
            // Dùng event input để tự động chuyển đổi chữ thường thành chữ hoa liên tục (khác với onchange)
            captchaInput.addEventListener('input', function() {
                this.value = this.value.toUpperCase();
            });
        }
    }
    //
})();