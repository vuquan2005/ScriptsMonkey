// ==UserScript==
// @name         EOP Helper
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      1.1
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
    //* Bỏ chặn một số thứ *//
    const events = ['copy', 'cut', 'paste', 'contextmenu', 'mousedown', 'mouseup', 'keydown', 'keypress', 'keyup'];
    events.forEach(evt => {
        window.addEventListener(evt, e => {
            e.stopPropagation();
        }, true);
    });
    //* Auto viết hoa captcha *//
    const currentURL = window.location.href;
    // nếu web hiện tại có dạng https://eop.edu.vn/study/course/
    if (currentURL.includes('/study/course/')) {
        const captchaInput = document.querySelector("div.dgcaptcha > input#txtcaptcha");
        if (captchaInput) {
            // Dùng event input để tự động chuyển đổi chữ thường thành chữ hoa liên tục
            captchaInput.addEventListener('input', function() {
                this.value = this.value.toUpperCase();
            });
            // Tự động click vào nút xem kết quả học tập khi nhấn enter hoặc ngừng nhập,...
            captchaInput.addEventListener('change', function() {
                document.querySelector('button.btn.btn-info[title="Xem kết quả học tập"]').click();
            });
        }
    }
    //
})();