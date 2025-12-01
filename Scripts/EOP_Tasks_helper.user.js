// ==UserScript==
// @name         EOP Task helper en
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      2.4.14
// @description  Hỗ trợ nâng cao khi sử dụng trang web EOP
// @author       QuanVu
// @match        https://eop.edu.vn/*
// @updateURL    https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/EOP_Bot.user.js
// @downloadURL  https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/EOP_Bot.user.js
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @require      https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js
// @require      https://cdn.jsdelivr.net/npm/notyf/notyf.min.js
// @require      https://github.com/vuquan2005/ScriptsMonkey/raw/refs/heads/main/Scripts/EOP_Helper.user.js
// ==/UserScript==

(function () {
    "use strict";
    console.log("EOP Task helper");

    let defaultDelayTime = GM_getValue("defaultDelayTime", null);
    if (!defaultDelayTime) {
        defaultDelayTime = {
            timeDoTaskFactor: 1,
            clickDone: 2,
            autoChooseAnswer: 1,
            doVocabularyDefault: 1.5,
            mcq: 1,
        };
        GM_setValue("defaultDelayTime", defaultDelayTime);
    }

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

    function runOnTaskType(callback, type1 = null, ...type2) {
        const mbody = document.querySelector("div#mbody");
        const firstChild = mbody.children[0];
        let taskType1 = firstChild.classList[0];
        let taskType2 = firstChild.classList[1];

        const callbackName = callback.name || new Error().stack.replace("Error", "Callback: ");

        if (type2 === null) {
            if (taskType1 === type1) {
                console.log(`🧪 ${callbackName} :`, type1);
                return callback();
            }
        } else {
            if (taskType1 === type1) {
                for (const t2 of type2) {
                    if (taskType2 === t2 || (t2 instanceof RegExp && t2.test(taskType2))) {
                        console.log(`🧪 ${callbackName} :`, type1, " / ", t2);
                        return callback();
                    }
                }
            }
        }
        // console.log(`❌🧪 ${callback.name || "'Callback'"} :`, type1, " / ", type2);
    }

    function delay(s, sRandom = true) {
        if (s <= 0) s = 0.1;
        let factor = 1;
        if (sRandom) factor = 0.8 + Math.random() * 0.4;
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

    async function callLMStudio(promptText, systemPromt = "You are a helpful assistant.") {
        console.log("Calling LMStudio with prompt:", promptText);

        const url = "http://127.0.0.1:1234/v1/chat/completions";
        const body = {
            model: "qwen/qwen3-4b",
            messages: [
                { role: "system", content: systemPromt },
                { role: "user", content: promptText },
            ],
        };

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const t = await res.text();
                throw new Error(`HTTP ${res.status}: ${t}`);
            }

            const data = await res.json();
            let reply = data.choices?.[0]?.message?.content ?? JSON.stringify(data);
            reply = reply
                .replace(/<think>[\s\S]*?<\/think>/gi, "")
                .replace(/\s+/g, " ")
                .trim();
            return reply;
        } catch (err) {
            console.error("Error calling LMStudio:", err);
            throw err;
        }
    }

    GM_addStyle(`
      @import url("https://cdn.jsdelivr.net/npm/notyf/notyf.min.css");
    `);
    //===============================================================

    function TimeDoTask() {
        const contentElement = document.querySelector("div.ditem");

        const listeningTime = document.querySelector(".vjs-remaining-time-display");
        if (listeningTime)
            return (
                listeningTime.textContent
                    .replace(" -", "")
                    .split(":")
                    .reduce((acc, time) => 40 * acc + +time, 0) * defaultDelayTime.timeDoTaskFactor
            );

        if (contentElement) {
            const text = contentElement.textContent;
            const wordMatchRegExp = /[^\s]+/g;
            const words = text.matchAll(wordMatchRegExp);
            const wordCount = [...words].length;
            let readingTime = (wordCount / 620) * 60;
            if (readingTime > 30) readingTime = (wordCount / 900) * 60;
            return readingTime * defaultDelayTime.timeDoTaskFactor;
        }
    }

    async function clickDone(seconds = 0.5) {
        const mfooter = document.querySelector("div#mfooter");
        const btn = mfooter.querySelector('button.btn.btn-info.dnut[type="button"]');
        await delay(seconds);
        if (btn.children[0].className === "fa fa-check") {
            btn.click();
            console.log("▶️ Button done clicked!");
        } else console.error("❌ Wrong button done selected");
    }

    async function clickShowAnswer(seconds = 0.2) {
        const mfooter = document.querySelector("div#mfooter");
        const btn = mfooter.querySelector('button.btn.btn-danger.dnut[type="button"]');
        await delay(seconds);
        if (btn.children[0].className === "fa fa-eye") {
            btn.click();
            console.log("▶️ Button answer clicked!");
        } else console.error("❌ Wrong button answer selected");
    }

    async function clickUndo(seconds = 0.2) {
        const mfooter = document.querySelector("div#mfooter");
        const btn = mfooter.querySelector('button.btn.btn-primary.dnut[type="button"]');
        await delay(seconds);
        if (btn.children[0].className === "fa fa-undo") {
            btn.click();
            console.log("▶️ Button undo clicked!");
        } else console.error("❌ Wrong button undo selected");
    }

    function finishTask(oldTaskTitle = null) {
        if (!oldTaskTitle) oldTaskTitle = dtasktitle;
        setTimeout(() => {
            console.log("Check captcha...");
            if (dtasktitle === oldTaskTitle) {
                if (document.querySelector("i.fa.fa-close")) {
                    document.querySelector("i.fa.fa-close").click();
                    console.log("✅ Close captcha");
                    clickDone();
                    finishTask(oldTaskTitle);
                }
            }
        }, 3000);
    }

    async function autoChooseAnswer() {
        await waitForSelector(".iCheck-helper");
        const ditem = document.querySelector("div.ditem");
        const questions = ditem.querySelectorAll("div.ques");

        forEachList(questions[0].querySelectorAll(".dchk"), async (i0, el) => {
            await delay(1);
            if (i0 === 0)
                await forEachList(questions, async (i1, question) => {
                    await delay(defaultDelayTime.autoChooseAnswer);
                    question.querySelector(".iCheck-helper").click();
                });
            else
                await forEachList(questions, async (i2, question) => {
                    await delay(defaultDelayTime.autoChooseAnswer);
                    const answer = question.querySelectorAll(".dchk");
                    // console.log(answer);
                    // console.log(answer[i0 - 1]);
                    if (answer[i0 - 1].querySelector("label").style.color == "red") {
                        // console.log(answer[i0].querySelector(`.iCheck-helper`));
                        answer[i0].querySelector(`.iCheck-helper`).click();
                    }
                });
            await clickDone(defaultDelayTime.clickDone);
        });

        finishTask();
    }

    function normalizeOcrText(text) {
        try {
            const numMap = {};

            const charMap = {
                0: "o",
                1: "i",
                5: "s",
                Cc: "C",
            };

            const wordMap = {
                intemet: "internet",
                inthe: "in the",
            };

            text = text.trim();
            let output = "";

            for (let token of text.match(/\w+|\W+/g)) {
                // console.log("Token:", token);
                if (/^\d+.*$/.test(token)) {
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

            if (output == "") output = "i";
            return output;
        } catch (error) {
            console.error("Error in normalizeOcrText:", error);
            return text;
        }
    }

    async function recognizeTextFromListImage(imgList) {
        return new Promise(async (resolve, reject) => {
            try {
                const worker = await Tesseract.createWorker("eng");

                let listText = [];

                for (const img of imgList) {
                    let {
                        data: { text },
                    } = await worker.recognize(img);

                    // console.log("✏️ ", text);
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
        const totalInputsChar = Array.from(inputs).reduce((a, i) => {
            const charsForThis = i.clientWidth <= 35 ? 1 : Math.round(i.clientWidth / 10);
            return a + charsForThis;
        }, 0);
        const timeEachChar = 30 / totalInputsChar;
        await forEachList(inputs, async (i, input, lenght) => {
            const chars = "abcdefghijklmnopqrstuvwxyz";
            const width = input.clientWidth;
            const estimatedChars = width <= 35 ? 1 : Math.round(width / 10);
            for (let c = 0; c < estimatedChars; c++) {
                const randomChar = chars.charAt(Math.floor(Math.random() * chars.length));
                await delay(timeEachChar);
                input.value += randomChar;
            }
        });

        await delay(0.5);
        await clickDone();
        await delay(1);
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

        finishTask();
    }

    async function enhanceAutoFillAnswer() {
        let listAns = [];
        let listenerAttached = false;

        await waitForSelector("div#mfooter button.btn.btn-danger.dnut", 500000);
        const btnDone = document.querySelector('#mfooter button.btn.btn-info.dnut[type="button"]');
        btnDone.addEventListener("click", () => {
            if (!listenerAttached) {
                listenerAttached = true;
                waitForSelector("div#mfooter button.btn.btn-danger.dnut", 500000).then(() => {
                    const btn = document.querySelector("div#mfooter button.btn.btn-danger.dnut");
                    const inputs = document.querySelectorAll(
                        "div.ditem input.danw.dinline[type='text']"
                    );

                    btn.addEventListener(
                        "click",
                        async () => {
                            if (btn.matches(".btn-danger")) {
                                listAns = [];
                                for (let i = 0; i < inputs.length; i++) {
                                    listAns.push(inputs[i].value);
                                }
                                console.log("List answers saved:", listAns);
                            } else {
                                console.log("Fill answers:", listAns);
                                for (let i = 0; i < inputs.length; i++) {
                                    await new Promise((resolve) => setTimeout(resolve, 50));
                                    inputs[i].value = listAns[i];
                                }
                            }
                        },
                        true
                    );
                });
            }
        });
    }

    async function doVocabulary() {
        console.log("Do vocabulary default...");
        await waitForSelector("i.fa.daudio.fa-play-circle");
        const mbody = document.querySelector("div#mbody");
        const playBtns = mbody.querySelectorAll("i.fa.daudio.fa-play-circle");

        playBtns[0].addEventListener(
            "click",
            async () => {
                for (const [i, playBtn] of playBtns.entries()) {
                    if (i === 0) continue;
                    await delay(defaultDelayTime.doVocabularyDefault);
                    playBtn.click();
                }

                await clickDone(3);
            },
            { once: true }
        );
    }

    function enhanceWriteWord() {
        const mbody = document.querySelector("div#mbody");

        const ques = mbody.querySelectorAll('[id^="qid"]');

        const choicesChar = async (question, answer) => {
            answer = answer.toUpperCase();
            const choosedChar = question.querySelectorAll("ul.dview.sortable li");
            await forEachList(choosedChar, async (i, li) => {
                await delay(0.1);
                li.click();
            });

            const answerChars = answer.split("");
            forEachList(answerChars, async (i, char) => {
                await delay(0.1);

                const allChar = question.querySelectorAll("ul.dstore.sortable li");

                for (const li of allChar) {
                    if (li.textContent === char) {
                        li.click();
                        await delay(0.1);
                        break;
                    }
                }
            });
        };

        const getAnswer = async (question) => {
            const allChar = question.querySelectorAll(
                "ul.dstore.sortable li, ul.dview.sortable li"
            );
            const letters = Array.from(allChar)
                .map((li) => li.textContent.trim())
                .join(", ");

            // Bài phát âm
            const pronun = question.querySelector("p.title");
            if (pronun) {
                callLMStudio(
                    "Pronunciation: " + pronun.textContent.trim(),
                    `Give only the word (no explanation)./no_think`,
                    128
                )
                    .then((text) => {
                        choicesChar(question, text);
                        console.log("Answer:", text);
                    })
                    .catch(() => {});
            }

            // Bài nghe
            const audioEl = question.querySelector("i.fa.daudio");
            if (audioEl && audioEl.offsetParent != null) {
                console.log("Detect audio question");
                callLMStudio(
                    letters,
                    `Provide only one valid, meaningful English word using the following letters. Use all letters, no explanation /no_think`
                )
                    .then((text) => {
                        choicesChar(question, text);
                        console.log("Answer:", text);
                    })
                    .catch(() => {});
            }

            // Nhập đáp án
            let answer = "";
            question.querySelector("p.dqtit").addEventListener("click", async () => {
                answer = prompt("Nhập đáp án: ", answer) || answer;
                choicesChar(question, answer);
            });
        };

        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    const el = mutation.target;
                    if (el.classList.contains("active")) {
                        getAnswer(el);
                    }
                }
            }
        });

        ques.forEach((el) => {
            observer.observe(el, { attributes: true });
        });

        mbody.addEventListener(
            "click",
            () => {
                getAnswer(ques[0]);
            },
            { once: true }
        );

        GM_addStyle(`
			p.dqtit::after {
				content: " 👈 Click";
			}
		`);
    }

    function enhanceMCQ() {
        const mbody = document.querySelector("div#mbody");
        mbody.querySelectorAll(".dans").forEach((div) => {
            div.addEventListener("click", () => {
                div.querySelector("a").click();
            });
        });
    }

    async function doMCQ() {
        const mbody = document.querySelector("div#mbody");

        const ques = mbody.querySelectorAll('[id^="qid"]');

        const chooseAnswer = async (question) => {
            const answers = question.querySelectorAll(".dans");
            await forEachList(answers, async (i, div) => {
                await delay(defaultDelayTime.mcq);
                div.querySelector("a").click();
            });
        };

        const observer = new MutationObserver(async (mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    const el = mutation.target;
                    if (el.classList.contains("active")) {
                        await chooseAnswer(el);
                    }

                    if (el === ques[ques.length - 1]) clickDone(2);
                }
            }
        });

        mbody.addEventListener(
            "click",
            () => {
                chooseAnswer(ques[0]);
                ques.forEach((el) => {
                    observer.observe(el, { attributes: true });
                });
            },
            { once: true }
        );
    }

    async function doContent() {
        console.log("View content...");
        const timeDo = TimeDoTask();
        console.log("Đợi thêm: ", timeDo, "s");
        await delay(timeDo);
        clickDone();

        finishTask();
    }

    async function uploadContent() {
        console.log("Upload content...");
        const notyf = new Notyf();
        const oDienLink = document.querySelector("#dupload > div > textarea");
        const file = document.querySelector("#dupload a.fname");

        if (oDienLink || oDienLink.value.trim() != "" || file.textContent.trim() != "") return;

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
            oDienLink.value = linkUpLoad;
            console.log("Link upload = ", oDienLink.value);
        }
        clickDone(5);
    }

    //===============================================================
    var dtasktitle = "";
    var lastTime = 0;

    async function run() {
        await waitForSelector("div#mbody");
        console.log("✏️✏️✏️", document.querySelector("div#mbody").children[0].className, "✏️✏️✏️");

        if (lastTime == 0) {
            console.log("⏱️ Start: ", new Date().toLocaleTimeString());
            lastTime = new Date();
        } else {
            const diffMs = Math.abs(new Date() - lastTime);
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
            console.log(`⏱️ Time: ${diffMinutes}p ${diffSeconds}s`);
            lastTime = new Date();
        }

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

        runOnTaskType(doVocabulary, "dvocabulary", "default");

        runOnTaskType(
            enhanceMCQ,
            "dmcq",
            "word-choose-meaning",
            "audio-choose-word",
            "audio-choose-image",
            "image-choose-word",
            /^\w+-choose-\w+$/
        );

        runOnTaskType(
            doMCQ,
            "dmcq",
            "word-choose-meaning",
            "audio-choose-word",
            "image-choose-word",
            /^\w+-choose-\w+$/
        );

        runOnTaskType(enhanceWriteWord, "dmcq", /-write-word$/);

        runOnTaskType(doContent, "dcontent", "view-content");
        runOnTaskType(uploadContent, "dcontent", "upload-content");

        runOnTaskType(
            autoChooseAnswer,
            "dquestion",
            "choose-manual",
            "choose-reading-choose-answer",
            "choose-listening-choose-answer"
        );

        runOnTaskType(
            enhanceAutoFillAnswer,
            "dquestion",
            "fill-vocabulary-block-blank",
            "fill-grammar-word-blank",
            "fill-reading-word-blank",
            "fill-listening-write-answer",
            /^fill.*blank$/
        );

        runOnTaskType(
            autoFillAnswer,
            "dquestion",
            "fill-vocabulary-block-blank",
            "fill-grammar-word-blank",
            "fill-reading-word-blank",
            "fill-listening-write-answer",
            /^fill.*blank$/
        );
    }
    waitForSelector("div#mbody", 10000, 500).then(() => {
        if (window.location.href.startsWith("https://eop.edu.vn/study/task/")) run();
        const observe = new MutationObserver(run);
        observe.observe(document.querySelector("span#dtasktitle"), {
            childList: true,
            characterData: true,
            subtree: true,
        });
    });
    //===============================================================
})();
