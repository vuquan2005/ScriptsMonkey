// ==UserScript==
// @name         Download captcha svHaUI
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      4.0
// @description  Tự động tải captcha của svHaUI
// @match        https://sv.haui.edu.vn/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";
    // ==================================================
    const $ = (selector) => document.querySelector(selector);

    // 1. Gộp logic xử lý Captcha tại trang đăng nhập/đăng ký
    async function setupCaptchaObserver(inputSelector, imgSelector) {
        const captchaInput = $(inputSelector);
        const captchaImg = $(imgSelector);

        if (!captchaInput || !captchaImg) return;

        // Chờ ảnh load xong mới lấy Base64 thay vì setTimeout 2s
        captchaImg.onload = () => {
            const base64 = convertImageToBase64(captchaImg);
            GM_setValue("captchaImg", base64);
        };

        // Nếu ảnh đã load từ trước (cache)
        if (captchaImg.complete) {
            GM_setValue("captchaImg", convertImageToBase64(captchaImg));
        }

        let captchaLabel = "";
        captchaInput.addEventListener("input", (e) => {
            captchaLabel = e.target.value;
        });

        window.addEventListener("beforeunload", () => {
            GM_setValue("lastURL", window.location.href);
            GM_setValue("isLoginPassed", true);
            if (captchaLabel.length === 5) {
                GM_setValue("captchaLabel", captchaLabel);
            }
        });
    }

    // 2. Tối ưu hàm download: Thêm kiểm tra dữ liệu
    function downloadCaptcha(base64, label) {
        if (!base64 || !label) return;

        const a = document.createElement("a");
        a.href = base64;
        a.download = `captcha_svHaUI__${label}.png`; // PNG tốt hơn cho captcha
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Reset lại trạng thái
        GM_setValue("isLoginPassed", false);
        GM_setValue("captchaLabel", "");
    }

    // 3. Chuyển Canvas sang Base64 chuẩn hơn
    function convertImageToBase64(img) {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL("image/png");
    }

    // 4. Hàm điều phối chính (Main Run)
    async function run() {
        const currentURL = window.location.href;
        const lastURL = await GM_getValue("lastURL", "");
        const isLoginPassed = await GM_getValue("isLoginPassed", false);

        // TRƯỜNG HỢP 1: Trang chỉ có ảnh captcha (Trang lấy mẫu)
        if (currentURL.includes("AImages.aspx")) {
            const image = $("img");
            if (image) {
                const base64 = convertImageToBase64(image);
                let label = prompt("Nhập label captcha (5 ký tự):", "");
                if (label && label.length === 5) {
                    downloadCaptcha(base64, label);
                    setTimeout(() => location.reload(), 500);
                } else {
                    location.reload();
                }
            }
        }
        // TRƯỜNG HỢP 2: Trang đăng nhập SSO
        else if (currentURL.includes("sso?token=")) {
            setupCaptchaObserver("input#ctl00_txtimgcode", "img#ctl00_Image1");
        }
        // TRƯỜNG HỢP 3: Trang đăng ký học phần
        else if (currentURL.includes("register/")) {
            if (isLoginPassed && $("div#tab0_data")) {
                const img64 = await GM_getValue("captchaImg", "");
                const label = await GM_getValue("captchaLabel", "");
                downloadCaptcha(img64, label);
            } else {
                setupCaptchaObserver("input#ctl02_txtimgcode", "img#ctl02_Image1");
            }
        }
        // TRƯỜNG HỢP 4: Quay lại trang chủ sau khi login thành công
        else if ($("span.user-name") && isLoginPassed) {
            const img64 = await GM_getValue("captchaImg", "");
            const label = await GM_getValue("captchaLabel", "");
            downloadCaptcha(img64, label);
        }
    }

    run();
    setTimeout(run, 500);
})();
