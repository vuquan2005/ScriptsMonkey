// ==UserScript==
// @name         EOP Helper
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      2.4.4
// @description  Hỗ trợ nâng cao khi sử dụng trang web EOP
// @author       QuanVu
// @match        https://eop.edu.vn/*
// @updateURL    https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/EOP_Helper.user.js
// @downloadURL  https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/EOP_Helper.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    "use strict";

    console.log("EOP Helper: Script loaded successfully!");

    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => scope.querySelectorAll(selector);
    const currentURL = window.location.href;
    function controlInterval(func, delayDefault = 1000) {
        let intervalId = null;
        return {
            start: (delay = delayDefault, startImmediate = false) => {
                if (intervalId) {
                    clearInterval(intervalId);
                }
                intervalId = setInterval(func, delay);
                if (startImmediate) {
                    func();
                }
            },
            stop: () => {
                clearInterval(intervalId);
                intervalId = null;
            },
        };
    }

    function waitForSelector(selector, timeout = 10000, delay = 10) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                return setTimeout(() => resolve(element), delay);
            }

            let timeoutId;
            if (timeout > 0) {
                timeoutId = setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Timeout: Không tìm thấy "${selector}" trong ${timeout}ms.`));
                }, timeout);
            }

            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    clearTimeout(timeoutId);
                    observer.disconnect();
                    setTimeout(() => resolve(element), delay);
                }
            });

            observer.observe(document.documentElement, {
                childList: true,
                subtree: true,
            });
        });
    }
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
            captchaInput.setAttribute("placeholder", "");
            captchaInput.style.textTransform = "uppercase";
            const captchaSubmit = $("button.btn.btn-info[title='Xem kết quả học tập']");

            captchaInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    captchaInput.blur();
                }
            });

            captchaInput.addEventListener("blur", (e) => {
                captchaInput.value = captchaInput.value.trim().toUpperCase();
                captchaInput.value = captchaInput.value
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/Đ/g, "D");

                if (captchaInput.value.length == 4) {
                    intervalCheckDiemht0.start(50, false);
                    captchaSubmit.click();
                }
            });

            // khi click vào nút xem kết quả học tập
            captchaSubmit.addEventListener("click", function () {
                intervalCheckDiemht0.start(200, false);
            });

            const intervalCheckDiemht0 = controlInterval(() => {
                if ($("div.modal.fade.dgmodal.in")) {
                    intervalCheckDiemht0.stop();
                    intervalCheckDiemht1.stop();
                } else if ($("div.diemht")) {
                    intervalCheckDiemht1.start(2500, true);
                    intervalCheckDiemht0.stop();
                }
            });
            const intervalCheckDiemht1 = controlInterval(() => {
                console.log("EOP Helper: highlightAbsence()");
                highlightAbsence();
                console.log("EOP Helper: calculateScore()");
                calculateScore();
            });
        }
    }
    // =====================================================================================
    // Tô màu số tiết nghỉ
    function highlightAbsence() {
        const absenceElements = $("div.diemht > table > tbody > tr > td:nth-child(1)");
        const absenceCount = Number(absenceElements.innerText.replaceAll(/[^0-9.]/g, ""));
        console.log("Số tiết nghỉ: ", absenceCount);
        let rgb = "#FFFFFF";
        if (absenceCount >= 30) {
            rgb = "#9D00FF";
            absenceElements.innerText = absenceElements.innerText.replaceAll(/[^0-9.]/g, "") + "💀";
        } else if (absenceCount > 25) rgb = "#FF0000";
        else if (absenceCount > 20) rgb = "#FF643D";
        else if (absenceCount > 15) rgb = "#FF9900";
        else if (absenceCount > 10) rgb = "#FFFF00";
        else if (absenceCount > 5) rgb = "#CCFF00";
        else if (absenceCount > 0) rgb = "#66FF00";
        else if (absenceCount == 0) rgb = "#00FF00";
        absenceElements.style.backgroundColor = rgb;
    }
    // =====================================================================================
    // Tính điểm
    function calculateScore() {
        const TX1 = Number($("div.diemht > table > tbody > tr > td:nth-child(4)").innerText.trim());
        const TX2 = Number($("div.diemht > table > tbody > tr > td:nth-child(5)").innerText.trim());
        const GK = Number($("div.diemht > table > tbody > tr > td:nth-child(7)").innerText.trim());
        let tolalScore = TX1 * 0.1 + TX2 * 0.1 + GK * 0.2;
        const totalScoreElement = $("div.diemht");
        // Xóa các phần tử trước đó
        const existingScoreElements = $("p.tinhDiem");
        if (existingScoreElements) {
            existingScoreElements.remove();
        }
        // Tạo một phần tử mới để hiển thị điểm
        const scoreElement = document.createElement("p");
        scoreElement.className = "tinhDiem";
        scoreElement.style.fontSize = "16px";
        // 4, 4.7, 5.5, 6.2, 7, 7.7, 8.5
        scoreElement.innerHTML = `Điểm tổng chưa tính điểm thi: ${tolalScore.toFixed(1)}<br>
        Điểm thi cần để đạt:<br>
        D&nbsp;&nbsp;: ${((4 - tolalScore) / 0.6).toFixed(1)} => ${
            Math.ceil(((4 - tolalScore) / 0.6).toFixed(1) * 2) / 2
        }<br>
        D+: ${((4.7 - tolalScore) / 0.6).toFixed(1)} => ${
            Math.ceil(((4.7 - tolalScore) / 0.6).toFixed(1) * 2) / 2
        }<br>
        C&nbsp;&nbsp;: ${((5.5 - tolalScore) / 0.6).toFixed(1)} => ${
            Math.ceil(((5.5 - tolalScore) / 0.6).toFixed(1) * 2) / 2
        }<br>
        C+: ${((6.2 - tolalScore) / 0.6).toFixed(1)} => ${
            Math.ceil(((6.2 - tolalScore) / 0.6).toFixed(1) * 2) / 2
        }<br>
        B&nbsp;&nbsp;: ${((7 - tolalScore) / 0.6).toFixed(1)} => ${
            Math.ceil(((7 - tolalScore) / 0.6).toFixed(1) * 2) / 2
        }<br>
        B+: ${((7.7 - tolalScore) / 0.6).toFixed(1)} => ${
            Math.ceil(((7.7 - tolalScore) / 0.6).toFixed(1) * 2) / 2
        }<br>
        A&nbsp;&nbsp;: ${((8.5 - tolalScore) / 0.6).toFixed(1)} => ${
            Math.ceil(((8.5 - tolalScore) / 0.6).toFixed(1) * 2) / 2
        }<br>
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
    function showTaskType() {
        const taskElements = $$("a.dpop.allow");
        for (let taskElement of taskElements) {
            let taskType = $("b", taskElement).title;
            taskType = taskType.replaceAll("/", " -> ");
            taskType = taskType.replaceAll("-", " ");
            $("em", taskElement).textContent = " --- " + taskType;
        }
        GM_addStyle(`
                em {
                    color:#dfdfdf;
                    font-weight: italic;
                }
            `);
    }
    // =====================================================================================
    // Tắt tiếng khi làm buổi tối
    function turnOffDoneSound() {
        const doneSound = $("a#dsound");
        if (doneSound && new Date().getHours() >= 22 && doneSound.classList.contains("dsoundon")) {
            doneSound.click();
        }
    }
    // =====================================================================================

    waitForSelector("div.panel-body", 10000, 50)
        .then(() => {
            console.log("EOP Helper: waitForSelector div.panel-body loaded");
            BoChan();
            if (currentURL.includes("/study/unit/")) {
                console.log("EOP Helper: showTasks()");
                showTasks();
                showTaskType();
            }
            if (currentURL.includes("/study/course/")) {
                console.log("EOP Helper: autoUpperCaseCaptcha()");
                autoUpperCaseCaptcha();
            }
            if (currentURL.includes("/study/task/")) {
                console.log("EOP Helper: turnOffDoneSound()");
                turnOffDoneSound();
            }
        })
        .catch((error) => {
            console.error(error);
        });
})();
