// ==UserScript==
// @name         Download captcha svHaUI
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      2.2
// @description  Tự động tải captcha của svHaUI
// @match        https://sv.haui.edu.vn/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";
    // ==================================================
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => scope.querySelectorAll(selector);
    const currentURL = window.location.href;
    // ==================================================
    function loginWeb() {
        let captchaLabel = "";
        const captchaInput = $("input#ctl00_txtimgcode");
        setTimeout(() => {
            const captchaImg = $("img#ctl00_Image1");
            let captchaImgBase64 = "";
            captchaImgBase64 = convertImageToBase64(captchaImg);
            GM_setValue("captchaImg", captchaImgBase64);
            console.log(captchaImgBase64);
        }, 2000);

        captchaInput.addEventListener("change", function () {
            captchaLabel = this.value;
        });
        window.addEventListener("beforeunload", function () {
            GM_setValue("lastURL", currentURL);
            GM_setValue("isLoginPassed", true);
            if (captchaLabel.length === 5) {
                GM_setValue("captchaLabel", captchaLabel);
            }
        });
    }
    async function captchaWeb() {
        const image = $("body > img");
        let captchaImgBase64 = await convertImageToBase64(image);
        console.log(captchaImgBase64);
        let captchaLabel = prompt("Nhập label captcha:", "");
        if (captchaLabel.length !== 5) {
            console.log("Captcha label is not 5 characters");
            setTimeout(captchaWeb, 300);
        } else {
            downloadCaptcha(captchaImgBase64, captchaLabel);
            setTimeout(location.reload(), 100);
        }
    }
    // ==================================================
    async function downloadCaptcha(captchaImgBase64, captchaLabel) {
        const a = document.createElement("a");
        a.href = captchaImgBase64;
        a.download = `captcha_svHaUI__${captchaLabel}.jpg`;
        a.click();
        a.remove();
        GM_setValue("isLoginPassed", false);
    }
    async function captchaIsPassed() {
        const captchaImgBase64 = await GM_getValue("captchaImg", "");
        const captchaLabel = await GM_getValue("captchaLabel", "");
        if (captchaLabel.length === 5) {
            console.log("Captcha is passed");
            downloadCaptcha(captchaImgBase64, captchaLabel);
        }
    }
    function convertImageToBase64(image) {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        return canvas.toDataURL("image/png");
    }
    // ==================================================
    async function run() {
        const lastURL = await GM_getValue("lastURL", "");
        const isLoginPassed = await GM_getValue("isLoginPassed", false);

        if (currentURL == "https://sv.haui.edu.vn/AImages.aspx") {
            console.log("Captcha web");
            setTimeout(captchaWeb, 300);
        } else if (currentURL.includes("https://sv.haui.edu.vn/sso?token=")) {
            console.log("Login web");
            loginWeb();
        } else if (
            currentURL == "https://sv.haui.edu.vn/" &&
            $("span.user-name") &&
            isLoginPassed &&
            lastURL.includes("https://sv.haui.edu.vn/sso?token=")
        ) {
            captchaIsPassed();
        } else {
            console.log(
                "currentURL: ",
                currentURL,
                "\nisLoginPassed: ",
                isLoginPassed,
                "\nlastURL: ",
                lastURL
            );
        }
    }
    setTimeout(run, 200);
})();
