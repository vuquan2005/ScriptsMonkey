// ==UserScript==
// @name         Download captcha svHaUI
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      1.1
// @description  Tự động tải captcha của svHaUI
// @match        https://sv.haui.edu.vn/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    let captchaLabel = "";
    const canvas = document.createElement("canvas");

    function loginWeb() {
        console.log("loginWeb");
        // get captcha image
        const image = document.querySelector("img#ctl00_Image1");
        convertImageToCanvas(image);
        // get captcha input
        const inputCaptcha = document.querySelector("input#ctl00_txtimgcode");
        inputCaptcha.addEventListener("change", function () {
            captchaLabel = this.value;
        });
        const btnVerify = document.querySelector("input#ctl00_butLogin");
        btnVerify.addEventListener("click", function () {
            if (inputCaptcha.value.length === 5) {
                downloadCaptcha(captchaLabel);
            }
        });
    }

    function captchaWeb() {
        console.log("captchaWeb");
        // get captcha image
        const image = document.querySelector("body > img");
        convertImageToCanvas(image);
        // Hỏi tên file
        captchaLabel =
            prompt("Nhập tên file (5 ký tự, không cần đuôi .jpg):", "") || "";
        if (captchaLabel.length !== 5) {
            location.reload();
        } else {
            downloadCaptcha(captchaLabel);
            // reload page
            location.reload();
        }
    }

    function convertImageToCanvas(image) {
        // convert image to canvas
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
    }

    function downloadCaptcha(labelCaptcha) {
        const tagaDownload = document.createElement("a");
        tagaDownload.href = canvas.toDataURL("image/jpeg");
        tagaDownload.download = `(captcha svHaUI)${labelCaptcha}.jpg`;
        document.body.appendChild(tagaDownload);
        tagaDownload.click();
    }

    setTimeout(() => {
        // check web is login page or captcha page
        if (window.location.href.includes("https://sv.haui.edu.vn/AImages.aspx")) {
            captchaWeb();
        } else if (window.location.href.includes("https://sv.haui.edu.vn/sso?token=")) {
            loginWeb();
        }
    }, 500);
})();
