// ==UserScript==
// @name         Copy Wayground question
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      1.0
// @description  Copy formatted text from #questionText when clicking on specific pill element
// @author       QuanVu
// @match        https://wayground.com/join/game/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";
    function waitForSelector(selector, timeout = 10000, delay = 100, scope = document) {
        return new Promise((resolve, reject) => {
            const element = scope.querySelector(selector);
            if (element) {
                return setTimeout(() => resolve(element), delay);
            }

            let timeoutId;
            if (timeout > 0) {
                timeoutId = setTimeout(() => {
                    observer.disconnect();
                    reject(
                        new Error(`⏱️ Timeout: Không tìm thấy "${selector}" trong ${timeout}ms.`)
                    );
                }, timeout);
            }

            const observer = new MutationObserver(() => {
                const element = scope.querySelector(selector);
                if (element) {
                    clearTimeout(timeoutId);
                    observer.disconnect();
                    setTimeout(() => resolve(element), delay);
                }
            });

            observer.observe(scope.documentElement, {
                childList: true,
                subtree: true,
            });
        });
    }

    async function run() {
        await waitForSelector(
            "div.pill.rounded-full.absolute.align-middle.flex.flex-row",
            10000,
            1000
        );
        const targetPill = document.querySelector(
            "div.pill.rounded-full.absolute.align-middle.flex.flex-row"
        );

        await waitForSelector('span[data-cy="current-question-number"]', 10000, 500);
        const questionNum = document.querySelector('span[data-cy="current-question-number"]');

        console.log("Running...\n", questionNum.textContent.trim(), " : ", numOfQues);

        if (numOfQues != questionNum.textContent.trim()) numOfQues = questionNum.textContent.trim();
        else return;

        console.log("Ques: ", numOfQues);

        targetPill.addEventListener("click", function () {
            const questionText = document.getElementById("questionText");
            let textToCopy = questionText.innerHTML
                .replace(/<br\s*\/?>/gi, "\n")
                // .replace(/<(b|strong)>(.*?)<\/(b|strong)>/gi, "**$2**")
                // .replace(/<i>(.*?)<\/i>/gi, "*$1*")
                .replace(/<u>(.*?)<\/u>/gi, "_$1_")
                .replace(/<\/?[^>]+(>|$)/g, "")
                .trim();
            navigator.clipboard.writeText(textToCopy).catch((err) => {
                console.error("Lỗi khi sao chép:", err);
                alert("Lỗi sao chép: " + (err.message || "Không xác định"));
            });
        });
    }

    var numOfQues = "";
    waitForSelector("div.pill.rounded-full.absolute.align-middle.flex.flex-row", 20000).then(
        (el) => {
            run();
			setInterval(() => { run(); }, 5000);
            const observe = new MutationObserver(run);
            observe.observe(document.querySelector(".quiz-container-inner"), {
                childList: true,
                characterData: true,
                subtree: true,
            });
        }
    );
})();
