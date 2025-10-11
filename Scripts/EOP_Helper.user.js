// ==UserScript==
// @name         EOP Helper
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      3.0.1
// @description  Hỗ trợ nâng cao khi sử dụng trang web EOP
// @author       QuanVu
// @match        https://eop.edu.vn/*
// @updateURL    https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/EOP_Helper.user.js
// @downloadURL  https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/EOP_Helper.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/notyf/notyf.min.js
// ==/UserScript==

(function () {
    "use strict";
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

    function runOnUrl(callback, ...validLinks) {
        const href = window.location.href;
        const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
        const callbackName = callback.name;

        for (let link of validLinks) {
            if (typeof link === "string") {
                link = link.replace(/\/$/, "");
                if (link === pathname || link === href || link === "") {
                    console.log(`✅ ${callbackName} :`, link || "All");
                    return callback();
                }
            } else if (link instanceof RegExp) {
                if (link.test(href)) {
                    console.log(`✅ ${callbackName} :`, link);
                    return callback();
                }
            }
        }
        console.log(`❌ ${callback.name || "'Callback'"} :`, validLinks);
    }

    GM_addStyle(`
      @import url("https://cdn.jsdelivr.net/npm/notyf/notyf.min.css");
    `);

    var notyf;
    // =====================================================================================
    // Bỏ chặn một số thứ
    function BoChan() {
        const events = ["copy", "cut", "paste", "contextmenu"];
        for (const event of events) {
            window.addEventListener(
                event,
                (e) => {
                    e.stopPropagation();
                },
                true
            );
        }
        const keyEvents = ["keydown", "keypress", "keyup"];
        for (const event of keyEvents) {
            window.addEventListener(
                event,
                (event) => {
                    if (event.ctrlKey && event.key === "s") {
                        event.stopPropagation();
                        event.preventDefault();
                        console.log("Save as blocked.");
                    }
                    if (event.ctrlKey || event.key == "F12") event.stopPropagation();
                },
                true
            );
        }
    }
    // =====================================================================================
    // Auto viết hoa captcha
    function captchaHelper() {
        const captchaInput = document.querySelector("div.dgcaptcha > input#txtcaptcha");
        captchaInput.setAttribute("lang", "en");
        captchaInput.setAttribute("placeholder", "");
        captchaInput.style.textTransform = "uppercase";
        const captchaSubmit = document.querySelector(
            "button.btn.btn-info[title='Xem kết quả học tập']"
        );

        let isPassCaptcha = true;

        captchaInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                if (captchaInput.value.length == 4) captchaInput.blur();
            }
        });

        captchaInput.addEventListener("blur", (e) => {
            captchaInput.value = captchaInput.value.trim().toUpperCase();
            captchaInput.value = captchaInput.value
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/Đ/g, "D");
            if (captchaInput.value.length == 4) captchaSubmit.click();
        });

        captchaSubmit.addEventListener("click", function () {
            isPassCaptcha = true;
            waitForSelector("div.modal.fade.dgmodal", 2000, 0).then(() => {
                waitForSelector("button.btn.btn-secondary", 2000, 0).then((element) => {
                    element.click();
                    isPassCaptcha = false;
                    notyf.error("Mã xác thực Captcha không đúng.");

                    setTimeout(() => {
                        window.scrollTo({
                            top: document.body.scrollHeight,
                            behavior: "smooth",
                        });
                    }, 1000);
                });
            });
            waitForSelector("div.diemht", 2000, 500).then(() => {
                if (isPassCaptcha) {
                    highlightAbsence();
                    showCalculateScore();
                    setTimeout(() => {
                        window.scrollTo({
                            top: document.body.scrollHeight,
                            behavior: "smooth",
                        });
                    }, 500);
                }
            });
        });
    }
    // =====================================================================================
    // Tô màu số tiết nghỉ
    function highlightAbsence() {
        const absenceElements = document.querySelector(
            "div.diemht > table > tbody > tr > td:nth-child(1)"
        );
        if (!absenceElements) return;
        let absenceCount = absenceElements.textContent.trim();
        absenceCount = Number(absenceCount.match(/\d+/)?.[0] || 0);
        let rgb = "#00FF00";
        if (absenceCount >= 30) {
            rgb = "#9D00FF";
            absenceElements.innerText = absenceElements.innerText.replaceAll(/[^0-9.]/g, "") + "💀";
        } else if (absenceCount > 25) rgb = "#FF0000";
        else if (absenceCount > 20) rgb = "#FF643D";
        else if (absenceCount > 15) rgb = "#FF9900";
        else if (absenceCount > 10) rgb = "#FFFF00";
        else if (absenceCount > 5) rgb = "#CCFF00";
        else if (absenceCount > 0) rgb = "#66FF00";
        absenceElements.style.backgroundColor = rgb;
    }
    // =====================================================================================
    // Tính điểm
    function calculateScore() {
        const TX1 = Number(
            document
                .querySelector("div.diemht > table > tbody > tr > td:nth-child(4)")
                .textContent?.trim() || 0
        );
        const TX2 = Number(
            document
                .querySelector("div.diemht > table > tbody > tr > td:nth-child(5)")
                .textContent?.trim() || 0
        );
        const GK = Number(
            document
                .querySelector("div.diemht > table > tbody > tr > td:nth-child(7)")
                .textContent?.trim() || 0
        );
        let tolalScore = TX1 * 0.1 + TX2 * 0.1 + GK * 0.2;
        document.querySelector("#tolalScore").textContent = tolalScore.toFixed(2);

        const gradeTargets = {
            a: 8.5,
            bplus: 7.7,
            b: 7.0,
            cplus: 6.2,
            c: 5.5,
            dplus: 4.7,
            d: 4.0,
        };

        const targetScores = {};
        const targetScoresfix = {};

        for (const [key, target] of Object.entries(gradeTargets)) {
            const value = (target - tolalScore) / 0.6;
            const fixed = Math.ceil((Math.round(value * 10) / 10) * 2) / 2;

            targetScores[key] = value.toFixed(1);
            targetScoresfix[key] = fixed;
        }

        const scoreSelectors = {
            a: "targetScores-a",
            afix: "targetScores-afix",
            b: "targetScores-b",
            bfix: "targetScores-bfix",
            bplus: "targetScores-bplus",
            bplusfix: "targetScores-bplusfix",
            c: "targetScores-c",
            cfix: "targetScores-cfix",
            cplus: "targetScores-cplus",
            cplusfix: "targetScores-cplusfix",
            d: "targetScores-d",
            dfix: "targetScores-dfix",
            dplus: "targetScores-dplus",
            dplusfix: "targetScores-dplusfix",
        };

        for (const key in gradeTargets) {
            const el = document.querySelector(`#${scoreSelectors[key]}`);
            const elfix = document.querySelector(`#${scoreSelectors[key]}fix`);
            console.log(el, elfix);
            if (el) el.textContent = targetScores[key];
            if (elfix) elfix.textContent = targetScoresfix[key];
        }
    }

    function showCalculateScore() {
        const container = document.querySelector(".diemht");

        const scoreElement = document.createElement("div");
        scoreElement.className = "tinhDiem";
        scoreElement.style.fontSize = "16px";
        scoreElement.style.margin = "20px";

        scoreElement.innerHTML = `<p>Điểm hiện có: <span id="tolalScore"></span><br>A &nbsp;&nbsp;🎯: <span id="targetScores-a"></span> ➡️ <span id="targetScores-afix"></span><br>B+ 🎯: <span id="targetScores-bplus"></span> ➡️ <span id="targetScores-bplusfix"></span><br>B &nbsp;&nbsp;🎯: <span id="targetScores-b"></span> ➡️ <span id="targetScores-bfix"></span><br>C+ 🎯: <span id="targetScores-cplus"></span> ➡️ <span id="targetScores-cplusfix"></span><br>C &nbsp;&nbsp;🎯: <span id="targetScores-c"></span> ➡️ <span id="targetScores-cfix"></span><br>D+ 🎯: <span id="targetScores-dplus"></span> ➡️ <span id="targetScores-dplusfix"></span><br>D &nbsp;&nbsp;🎯: <span id="targetScores-d"></span> ➡️ <span id="targetScores-dfix"></span><br></p>`;
        container.appendChild(scoreElement);
        setTimeout(calculateScore, 700);
    }
    // =====================================================================================
    // Hiển thị toàn bộ task trong unit
    function showTasks() {
        document.querySelector(".content > .row > .col-md-3").remove();

        const container = document.querySelector("div.tab-content.dgunit");
        const panels = container.querySelectorAll("div.tab-pane");

        const panelNames = ["Vocabulary", "Grammar", "Listening", "Reading", "Writing", "Speaking"];
        for (let i = 0; i < panels.length && i < panels.length; i++) {
            const insertElement = `<p style="font-size: 1.6rem; font-weight: 550; margin: auto; padding: 5px 20px; color: #003500;">${panelNames[i]}</p>`;
            panels[i].insertAdjacentHTML("afterbegin", insertElement);
            if (!panels[i].classList.contains("active")) {
                panels[i].classList.add("active");
            }
        }

        GM_addStyle(`
			.tab-content.dgunit {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
				gap: 1rem;
				align-items: start;
			}

			.tab-pane.active {
				display: block;
				grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
				gap: 0.5rem;
				padding: 1rem;
				background: #f7f7f7;
				border-radius: 10px;
			}

			.tab-content.dgunit a.dpop {
				display: block;
				align-items: center;
				justify-content: center;
				border-radius: 8px;
				text-decoration: none;
				font-weight: 500;
				transition: all 0.3s ease;
			}

			.tab-content.dgunit a:hover {
				color: #000000;
				background: #e6f3e6;
				transform: translateY(-2px);
			}

			.col-md-9 {
				width: 95% !important;
				float: none !important;
				margin: auto !important;
			}
		`);
    }
    function showTaskType() {
        const taskElements = document.querySelectorAll("a.dpop.allow");
        for (let taskElement of taskElements) {
            let taskType = taskElement.querySelector("b").title.match(/(?<=\/).+/)[0];
            taskType = taskType.replaceAll("-", " ");
            taskElement.querySelector("em").textContent = " --- " + taskType;
        }
        GM_addStyle(`
                em {
                    color: #d8dbd7;
                }
            `);
    }
    // =====================================================================================
    // Tắt tiếng khi làm buổi tối
    function turnOffDoneSound() {
        const doneSound = document.querySelector("a#dsound");
        if (doneSound && new Date().getHours() >= 22 && doneSound.classList.contains("dsoundon")) {
            doneSound.click();
        }
    }
    // =====================================================================================

    waitForSelector("div.panel-body", 10000, 50)
        .then(() => {
            // console.log("✅ " + window.location);
            notyf = new Notyf({
                duration: 3500,
                dismissible: true,
            });
            BoChan();
            runOnUrl(showTasks, /study\/unit\/\w+\?id=/);
            runOnUrl(showTaskType, /study\/unit\/\w+\?id=/);

            runOnUrl(captchaHelper, /study\/course\/\w+\?id=/);

            runOnUrl(turnOffDoneSound, /study\/task\/\w+\?id=/);
        })
        .catch((error) => {
            console.error(error);
        });
})();
