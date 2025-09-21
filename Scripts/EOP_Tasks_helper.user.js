// ==UserScript==
// @name         EOP Task helper
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      2.0.5
// @description  Hỗ trợ nâng cao khi sử dụng trang web EOP
// @author       QuanVu
// @match        https://eop.edu.vn/study/task/*
// @updateURL    https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/EOP_Tasks_helper.user.js
// @downloadURL  https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/EOP_Tasks_helper.user.js
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @require      https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js
// @require      https://cdn.jsdelivr.net/npm/notyf/notyf.min.js
// @require      https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/EOP_Helper.user.js
// ==/UserScript==

(function () {
    "use strict";
    console.log("EOP Task helper");

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

    function waitForVisible(element, timeout = 10000, delay = 200) {
        return new Promise((resolve, reject) => {
            const end = Date.now() + timeout;
            function check() {
                if (!document.body.contains(element)) {
                    return reject(new Error("❌ Element was removed from DOM"));
                }

                if (getComputedStyle(element).display !== "none") {
                    // console.log(element, ": is visible");
                    return setTimeout(() => resolve(element), delay);
                }

                if (Date.now() > end) {
                    return reject(new Error("⏱️ Timeout: element not visible"));
                }

                requestAnimationFrame(check);
            }

            requestAnimationFrame(check);
        });
    }

    function runOnTaskType(callback, type1 = null, ...type2) {
        const mbody = document.querySelector("div#mbody");
        const firstChild = mbody.children[0];
        let taskType1 = firstChild.classList[0];
        let taskType2 = firstChild.classList[1];

        const callbackName = callback.name || new Error().stack.replace("Error", "Callback: ");

        if (type2 === null) {
            if (taskType1 === type1) {
                console.log(`✅ ${callbackName} :`, type1);
                return callback();
            }
        } else {
            if (taskType1 === type1) {
                for (const t2 of type2) {
                    if (taskType2 === t2) {
                        console.log(`✅ ${callbackName} :`, type1, " / ", t2);
                        return callback();
                    }
                }
            }
        }
        // console.log(`❌ ${callback.name || "'Callback'"} :`, type1, " / ", type2);
    }

    function delay(s) {
        const factor = 0.8 + Math.random() * 0.6;
        const randomS = s * factor;
        return new Promise((resolve) => setTimeout(resolve, randomS * 1000));
    }

    async function forEachList(nodeList, callback) {
        return new Promise(async (resolve) => {
            const lenght = nodeList.length;
            for (const [i, el] of Array.from(nodeList).entries()) {
                await callback(i, el, lenght);
            }
            resolve();
        });
    }

    GM_addStyle(`
      @import url("https://cdn.jsdelivr.net/npm/notyf/notyf.min.css");
    `);
    //===============================================================

    function TimeDoTask() {
        const contentElement = document.querySelector("div.ditem");

        const listeningTime = document.querySelector(".vjs-remaining-time-display");
        if (listeningTime)
            return listeningTime.textContent
                .replace(" -", "")
                .split(":")
                .reduce((acc, time) => 60 * acc + +time, 0);

        if (contentElement) {
            const text = contentElement.textContent;
            const wordMatchRegExp = /[^\s]+/g;
            const words = text.matchAll(wordMatchRegExp);
            const wordCount = [...words].length;
            let readingTime = (wordCount / 320) * 60;
            return readingTime;
        }
    }

    async function clickDone(seconds = 0.2) {
        const mfooter = document.querySelector("div#mfooter");
        const btn = mfooter.querySelector('button.btn.btn-info.dnut[type="button"]');
        await waitForVisible(btn, 10000, seconds * 1000);
        if (btn.children[0].className === "fa fa-check") {
            btn.click();
            console.log("✅ Button done clicked!");
        } else console.error("❌ Wrong button done selected");
    }

    async function clickShowAnswer(seconds = 0.2) {
        const mfooter = document.querySelector("div#mfooter");
        const btn = mfooter.querySelector('button.btn.btn-danger.dnut[type="button"]');
        await waitForVisible(btn, 10000, seconds * 1000);
        if (btn.children[0].className === "fa fa-eye") {
            btn.click();
            console.log("✅ Button answer clicked!");
        } else console.error("❌ Wrong button answer selected");
    }

    async function clickUndo(seconds = 0.2) {
        const mfooter = document.querySelector("div#mfooter");
        const btn = mfooter.querySelector('button.btn.btn-primary.dnut[type="button"]');
        await waitForVisible(btn, 10000, seconds * 1000);
        if (btn.children[0].className === "fa fa-undo") {
            btn.click();
            console.log("✅ Button undo clicked!");
        } else console.error("❌ Wrong button undo selected");
    }

    async function autoChooseAnswer() {
        await waitForSelector(".iCheck-helper");
        const ditem = document.querySelector("div.ditem");
        const questions = ditem.querySelectorAll("div.ques");

        forEachList(questions[0].querySelectorAll(".dchk"), async (i0, el) => {
            await delay(1);
            // console.log(i0);
            if (i0 === 0)
                await forEachList(questions, async (i1, question) => {
                    await delay(2);
                    question.querySelector(".iCheck-helper").click();
                });
            else
                await forEachList(questions, async (i2, question) => {
                    await delay(1.5);
                    const answer = question.querySelectorAll(".dchk");
                    // console.log(answer);
                    // console.log(answer[i0 - 1]);
                    if (answer[i0 - 1].querySelector("label").style.color == "red") {
                        // console.log(answer[i0].querySelector(`.iCheck-helper`));
                        answer[i0].querySelector(`.iCheck-helper`).click();
                    }
                });
            await clickDone(3);
        });
    }

    function normalizeOcrText(text) {
        const numMap = {};

        const charMap = {
            0: "o",
            1: "i",
            5: "s",
            Cc: "C",
        };

        const wordMap = {
            intemet: "internet",
        };

        text = text.trim();
        let output = "";

        for (let token of text.match(/\w+|\W+/g)) {
            if (/^\d+$/.test(token)) {
                output += token;
                continue;
            }
            if (/^\w+$/.test(token)) {
                for (const [wrong, correct] of Object.entries(charMap)) {
                    const regex = new RegExp(wrong, "g");
                    token = token.replace(regex, correct);
                }
            }
            output += token;
        }

        for (const [wrong, correct] of Object.entries(wordMap)) {
            const regex = new RegExp(wrong, "gi");
            output = output.replace(regex, correct);
        }

        return output;
    }

    async function recognizeTextFromListImage(imgList) {
        return new Promise(async (resolve, reject) => {
            try {
                const worker = await Tesseract.createWorker("eng");

                await worker.setParameters({
                    tessedit_char_whitelist:
                        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?;:'\"()- ",
                    tessedit_char_blacklist: "%^&|",
                });

                let listText = [];

                for (const img of imgList) {
                    let {
                        data: { text },
                    } = await worker.recognize(img);

                    text = normalizeOcrText(text);

                    listText.push(text);
                }
                await worker.terminate();

                resolve(listText);
            } catch (error) {
                reject(error);
            }
        });
    }

    async function autoFillAnswer() {
        await waitForSelector("input.danw.dinline[type='text']");
        const ditem = document.querySelector("div.ditem");
        const inputs = ditem.querySelectorAll("input.danw.dinline[type='text']");
        await forEachList(inputs, async (i, input, lenght) => {
            await delay(32 / lenght);
            input.value = "a";
        });

        await clickDone();
        await delay(2);
        await clickShowAnswer();

        await waitForSelector(
            `input.danw.dinline[type='text'][disabled="disabled"][style*="background-image"]`
        );
        const inputsImg = ditem.querySelectorAll(
            `input.danw.dinline[type='text'][disabled="disabled"][style*="background-image"]`
        );

        let listImg64 = [];

        await forEachList(inputsImg, async (i, input) => {
            const base64Match = input.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
            const img64 = base64Match ? base64Match[1] : null;
            if (img64) listImg64.push(img64);
        });

        let listText = [];

        await recognizeTextFromListImage(listImg64)
            .then((result) => {
                listText = result;
            })
            .catch((error) => {
                console.error("Error recognizing text from images:", error);
            });

        console.log(listText);

        await delay(1);

        await clickUndo();

        await forEachList(inputs, async (i, input) => {
            await delay(0.2);
            input.value = listText[i];
        });

        const timeDo = TimeDoTask();
        console.log("Đợi thêm: ", timeDo, "s");
        clickDone(timeDo);
    }

    async function doVocabularyDefault() {
        console.log("Do vocabulary default...");
        await waitForSelector("i.fa.daudio.fa-play-circle");
        const mbody = document.querySelector("div#mbody");
        const playBtns = mbody.querySelectorAll("i.fa.daudio.fa-play-circle");
        console.log(playBtns);

        playBtns[0].addEventListener(
            "click",
            async () => {
                for (const [i, playBtn] of playBtns.entries()) {
                    if (i === 0) continue;
                    await delay(2);
                    playBtn.click();
                }

                await clickDone(3);
            },
            { once: true }
        );
    }

    function enhanceMCQ() {
        const mbody = document.querySelector("div#mbody");
        mbody.querySelectorAll(".dans").forEach((div) => {
            div.addEventListener("click", () => {
                div.querySelector("a").click();
            });
        });
    }

    async function doContent() {
        console.log("View content...");
        const timeDo = TimeDoTask();
        console.log("Đợi thêm: ", timeDo, "s");
		await delay(timeDo);
        clickDone();
    }

    async function uploadContent() {
        console.log("Upload content...");
        const notyf = new Notyf();
        const oDienLink = document.querySelector("#dupload > div > textarea").value;
        let isAutoUpload = await GM_getValue("isAutoUpload", null);
        if (isAutoUpload == null) {
            isAutoUpload = confirm("Tự động điền link (Google drive, padlet,...) ?");
            await GM_setValue("isAutoUpload", isAutoUpload);
        }

        notyf.success("Đã đặt tự động điền link là: " + isAutoUpload);
        console.log("Auto upload is: ", isAutoUpload);

        if (isAutoUpload && !oDienLink) {
            let linkUpLoad = await GM_getValue("linkUpLoad", "");
            while (linkUpLoad == "") {
                console.log("Inputting link upload...");
                linkUpLoad = prompt("Link upload not found. Please enter the link upload: ") || "";
                if (linkUpLoad != "") {
                    await GM_setValue("linkUpLoad", linkUpLoad);

                    console.log("Link upload saved: ", linkUpLoad);
                    notyf.success("Link upload saved: " + linkUpLoad);
                }
            }
            document.querySelector("#dupload > div > textarea").value = linkUpLoad;
            console.log(
                "Link upload = ",
                document.querySelector("#dupload > div > textarea").value
            );
        }
        clickDone(7);
    }

    //===============================================================

    async function run() {
        await waitForSelector("div#mbody");
        console.log("▶️▶️▶️", document.querySelector("div#mbody").children[0].className, "◀️◀️◀️");

        if (document.querySelector("span#dtasktitle")) {
            // Tránh lặp lại
            if (dtasktitle != document.querySelector("span#dtasktitle").textContent.trim())
                dtasktitle = document.querySelector("span#dtasktitle").textContent.trim();
            else return;
        } else return;

        // Unit test
        const timerUnitTest = document.querySelector("div#countdown.timeTo.timeTo-white");
        if (timerUnitTest) {
            console.log("!!! Đây là bài kiểm tra !!!");
            return;
        }

        runOnTaskType(doVocabularyDefault, "dvocabulary", "default");

        runOnTaskType(
            enhanceMCQ,
            "dmcq",
            "word-choose-meaning",
            "audio-choose-word",
            "image-choose-word"
        );

        runOnTaskType(doContent, "dcontent", "view-content");
        runOnTaskType(uploadContent, "dcontent", "upload-content");

        runOnTaskType(
            autoChooseAnswer,
            "dquestion",
            "choose-reading-choose-answer",
            "choose-listening-choose-answer"
        );

        runOnTaskType(
            autoFillAnswer,
            "dquestion",
            "fill-grammar-word-blank",
            "fill-reading-word-blank",
            "fill-listening-write-answer"
        );
    }
    var dtasktitle = "";
    waitForSelector("div#mbody", 10000, 500).then(() => {
        run();
        const observe = new MutationObserver(run);
        observe.observe(document.querySelector("span#dtasktitle"), {
            childList: true,
            characterData: true,
            subtree: true,
        });
        setTimeout(() => {
            const iframe = document.createElement("iframe");
            iframe.id = "shadow";
            document.body.appendChild(iframe);
            GM_addStyle(`
				#shadow {
					position: fixed;
					top: 10px;
					left: 3px;
					width: 70px;
					height: 100px;
					z-index: 999999;
				}
			`);
            const doc = iframe.contentDocument;
            doc.body.style.overflow = "hidden";
            doc.body.style.margin = "0";
            const shadow = doc.body.attachShadow({ mode: "closed" });
            const shadowStyle = document.createElement("style");
            shadowStyle.textContent = `
				#shadow-container {
					margin: 2px;
					padding: 5px;
					width: 100%;
					height: 100%;
					background-color: #ffffffff;
					cursor: nw-resize;
				}
			`;
            shadow.appendChild(shadowStyle);
            const container = document.createElement("div");
            container.id = "shadow-container";
            shadow.appendChild(container);

            const btnShadow = document.createElement("button");
            btnShadow.textContent = "👾";
            container.appendChild(btnShadow);

            container.addEventListener("mousedown", initResize, { once: true });

            function initResize(e) {
                e.preventDefault();
                window.addEventListener("mousemove", resize, { once: true });
                window.addEventListener("mouseup", stopResize);
            }

            function resize(e) {
                iframe.style.width = e.clientX + "px";
                iframe.style.height = e.clientY + "px";
            }

            function stopResize() {
                window.removeEventListener("mousemove", resize);
                window.removeEventListener("mouseup", stopResize);
            }
        }, 100);
    });
    //===============================================================
})();
