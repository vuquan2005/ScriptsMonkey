// ==UserScript==
// @name         EOP Helper
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      2.2.2
// @description  A useful tool to use on the eop.edu.vn
// @author       QuanVu
// @match        https://eop.edu.vn/*
// @updateURL    https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/EOP_Helper.user.js
// @downloadURL  https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/EOP_Helper.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    "use strict";
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => scope.querySelectorAll(selector);
    const currentURL = window.location.href;
    // =====================================================================================
    // Bỏ chặn một số thứ
    function BoChan() {
        const events = [
            "copy",
            "cut",
            "paste",
            "contextmenu",
            "mousedown",
            "mouseup",
            "keydown",
            "keypress",
            "keyup",
        ];
        events.forEach((evt) => {
            window.addEventListener(
                evt,
                (e) => {
                    e.stopPropagation();
                },
                true
            );
        });
    }
    // =====================================================================================
    // Auto viết hoa captcha
    function autoUpperCaseCaptcha() {
        const captchaInput = $("div.dgcaptcha > input#txtcaptcha");
        if (captchaInput) {
            captchaInput.setAttribute("lang", "en");
            // Dùng event input để tự động chuyển đổi chữ thường thành chữ hoa liên tục
            captchaInput.addEventListener("input", function () {
                this.value = this.value.toUpperCase();
            });
            // Tự động click vào nút xem kết quả học tập khi nhấn enter hoặc ngừng nhập,...
            const btnCheck = $("button.btn.btn-info[title='Xem kết quả học tập']");
            captchaInput.addEventListener("change", function () {
                btnCheck.click();
            });
            btnCheck.addEventListener("click", function () {
                setTimeout(() => {
                    console.log("EOP Helper: highlightAbsence()");
                    highlightAbsence();
                    console.log("EOP Helper: calculateScore()");
                    calculateScore();
                }, 500);
            });
        }
    }
    // =====================================================================================
    // Tô màu số tiết nghỉ
    function highlightAbsence() {
        const absenceElements = $("div.diemht > table > tbody > tr > td:nth-child(1)");
        const absenceCount = Number(absenceElements.innerText.trim());
        console.log("Số tiết nghỉ", absenceCount);
        const ratio = (absenceCount - 0) / (30 - 0);
        let r = Math.floor(255 * ratio);
        let g = Math.floor(255 * (1 - ratio));
        let b = 0;
        let rgb = `rgb(${r}, ${g}, ${b})`;
        absenceElements.style.backgroundColor = rgb;
    }
    // =====================================================================================
    // Tính điểm
    function calculateScore() {
        const TX1 = Number($("div.diemht > table > tbody > tr > td:nth-child(4)").innerText.trim());
        const TX2 = Number($("div.diemht > table > tbody > tr > td:nth-child(5)").innerText.trim());
        const GK = Number($("div.diemht > table > tbody > tr > td:nth-child(7)").innerText.trim());
        let tolalScore = TX1*0.1 + TX2*0.1 + GK*0.2;
        const totalScoreElement = $("div.diemht");
        // Tạo một phần tử mới để hiển thị điểm
        const scoreElement = document.createElement("p");
        // 4, 4.7, 5.5, 6.2, 7, 7.7, 8.5
        scoreElement.innerHTML = `Điểm tổng chưa tính điểm thi: ${tolalScore.toFixed(1)}<br>
        Điểm thi cần để đạt D&nbsp;&nbsp;: ${((4 - tolalScore) / 0.6).toFixed(1)} > ${Math.ceil(((4 - tolalScore) / 0.6).toFixed(1) * 2) / 2}<br>
        Điểm thi cần để đạt D+: ${((4.7 - tolalScore) / 0.6).toFixed(1)} > ${Math.ceil(((4.7 - tolalScore) / 0.6).toFixed(1) * 2) / 2}<br>
        Điểm thi cần để đạt C&nbsp;&nbsp;: ${((5.5 - tolalScore) / 0.6).toFixed(1)} > ${Math.ceil(((5.5 - tolalScore) / 0.6).toFixed(1) * 2) / 2}<br>
        Điểm thi cần để đạt C+: ${((6.2 - tolalScore) / 0.6).toFixed(1)} > ${Math.ceil(((6.2 - tolalScore) / 0.6).toFixed(1) * 2) / 2}<br>
        Điểm thi cần để đạt B&nbsp;&nbsp;: ${((7 - tolalScore) / 0.6).toFixed(1)} > ${Math.ceil(((7 - tolalScore) / 0.6).toFixed(1) * 2) / 2}<br>
        Điểm thi cần để đạt B+: ${((7.7 - tolalScore) / 0.6).toFixed(1)} > ${Math.ceil(((7.7 - tolalScore) / 0.6).toFixed(1) * 2) / 2}<br>
        Điểm thi cần để đạt A&nbsp;&nbsp;: ${((8.5 - tolalScore) / 0.6).toFixed(1)} > ${Math.ceil(((8.5 - tolalScore) / 0.6).toFixed(1) * 2) / 2}<br>
        `;
        totalScoreElement.appendChild(scoreElement);
    }
    // =====================================================================================
    // Hiển thị toàn bộ task trong unit hoặc đến task chưa hoàn thành nếu có
    function showTasks() {
        let areTasksFinished = true;
        const taskElements = $$("a.dpop.allow");
        taskElements.forEach((taskElement) => {
            if (!taskElement.classList.contains("dgtaskdone")) {
                areTasksFinished = false;
            }
        });
        const vocabPanel = $("div#tpvocabulary");
        const grammarPanel = $("div#tpgrammar");
        const listeningPanel = $("div#tplistening");
        const readingPanel = $("div#tpreading");
        const writingPanel = $("div#tpwriting");
        const speakingPanel = $("div#tpspeaking");
        const panels = [
            vocabPanel,
            grammarPanel,
            listeningPanel,
            readingPanel,
            writingPanel,
            speakingPanel,
        ];
        if (!areTasksFinished) {
            /* Nếu có task chưa done */ // Tìm task chưa hoàn thành đầu tiên
            const firstUnfinishedTask = Array.from(taskElements).find((taskElement) => {
                return !taskElement.classList.contains("dgtaskdone");
            });
            // Hook phần tử mẹ của firstUnfinishedTask
            const parentElement = firstUnfinishedTask.closest("div.tab-pane");
            // Ẩn toàn bộ task
            panels.forEach((panel) => {
                panel.classList.remove("active");
            });
            // Hiện task chưa hoàn thành đầu tiên
            parentElement.classList.add("active");
        } /* Nếu tất cả task đã done */ else {
            const panelNames = [
                "Vocabulary",
                "Grammar",
                "Listening",
                "Reading",
                "Writing",
                "Speaking",
            ];
            for (let i = 0; i < panels.length && i < panelNames.length; i++) {
                const insertElement = `<a class="dpop" style="color:rgb(32, 161, 32);"><b>${panelNames[i]}</b></br>========================================================================================================================================</a>`;
                panels[i].insertAdjacentHTML("afterbegin", insertElement);
                if (!panels[i].classList.contains("active")) {
                    panels[i].classList.add("active");
                }
            }
        }
    }
    // =====================================================================================
    setTimeout(() => {
        BoChan();
        if (currentURL.includes("/study/unit/")) {
            console.log("EOP Helper: showTasks()");
            showTasks();
        }
        if (currentURL.includes("/study/course/")) {
            console.log("EOP Helper: autoUpperCaseCaptcha()");
            autoUpperCaseCaptcha();
        }
    }, 500);
    //
})();
