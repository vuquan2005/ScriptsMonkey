// ==UserScript==
// @name         EOP Task helper
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      1.1.5
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
                    reject(new Error(`Timeout: Không tìm thấy "${selector}" trong ${timeout}ms.`));
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
        const listenQuestion = document.querySelector("div.dta-main");
        const randomNumber = Math.floor(Math.random() * 15);
        if (contentElement) {
            const text = contentElement.textContent;
            const wordMatchRegExp = /[^\s]+/g;
            const words = text.matchAll(wordMatchRegExp);
            const wordCount = [...words].length;
            let readingTime = (wordCount / 320) * 60;
            readingTime += randomNumber;
            if (listenQuestion) readingTime += 30;
            return readingTime;
        }
    }

    async function clickDone(seconds) {
        await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
        const mfooter = document.querySelector("div#mfooter");
        await waitForSelector("button.btn.btn - info.dnut[(type = button)]", 1000, 100, mfooter);
        const btnDone = mfooter.querySelector('button.btn.btn-info.dnut[type="button"]');
        if (/submit/.test(btnDone.id)) {
            btnDone.click();
            console.log("Button done clicked!");
        }
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

    async function autoFillAnswer() {
        await waitForSelector("input.danw.dinline[type='text']");
        const ditem = document.querySelector("div.ditem");
        const inputs = ditem.querySelectorAll("input.danw.dinline[type='text']");
        await forEachList(inputs, async (i, input, lenght) => {
            await delay(32 / lenght);
            input.value = "a";
        });

        clickDone(2);

        await delay(30);
        const mfooter = document.getElementById("mfooter");
        const btnPreview = mfooter.querySelector('button.btn.btn-danger.dnut[type="button"]');
        if (/answer/.test(btnPreview.id)) {
            btnPreview.click();
            console.log("Button preview clicked!");
        }

        await waitForSelector(
            `input.danw.dinline[type='text'][disabled="disabled"][style*="background-image"]`
        );
        const inputsImg = ditem.querySelectorAll(
            `input.danw.dinline[type='text'][disabled="disabled"][style*="background-image"]`
        );

        let listImg64 = [];
        let listText = [];

        await forEachList(inputsImg, async (i, input) => {
            const base64Match = input.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
            const img64 = base64Match ? base64Match[1] : null;
            if (img64) listImg64.push(img64);
        });

        const worker = await Tesseract.createWorker("eng");

        for (const img of listImg64) {
            let {
                data: { text },
            } = await worker.recognize(img);

            text = text.replace("|", "i").replace("Cc", "c").replace("\n", "");
            listText.push(text);
            console.log(text);
        }
        await worker.terminate();

        const btnRedo = mfooter.querySelector('button.btn.btn-primary.dnut[type="button"]');
        if (/answer/.test(btnRedo.id)) {
            btnRedo.click();
            console.log("Button redo clicked!");
        }

        forEachList(inputs, async (i, input) => {
            await delay(1);
            input.value = listText[i];
        });

        const timeDo = TimeDoTask();
        console.log("Đợi thêm: ", timeDo, "s");
        clickDone(timeDo);
    }

    //===============================================================
    // Do task
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

    function doMCQ() {
        console.log("Can't do MCQ");
    }

    function doContent() {
        console.log("View content...");
        const timeDo = TimeDoTask();
        console.log("Đợi thêm: ", timeDo, "s");
        clickDone(timeDo);
    }

    async function doUploadContent() {
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
        const timeDo = TimeDoTask();
        console.log("Đợi thêm: ", timeDo, "s");
        clickDone(timeDo);
    }

    function doQuestionChooseReading() {
        console.log("Do choose reading question...");
        autoChooseAnswer();
    }

    function doQuestionChooseListening() {
        console.log("Do choose listening question");
        autoChooseAnswer();
    }

    function doQuestionFillGrammar() {
        console.log("Do question fill grammar...");
        autoFillAnswer();
    }

    function doQuestionFillReading() {
        console.log("Do question fill reading...");
        autoFillAnswer();
    }

    function doQuestionFillListening() {
        console.log("Do question fill listening...");
        autoFillAnswer();
    }
    //===============================================================

    async function run() {
        await waitForSelector("div#mbody");
        console.log("----------------------------------");
        const mbody = document.querySelector("div#mbody");
        const classList = mbody.children[0].className;
        const classListArray = classList.split(" ");
        let taskType = classListArray;

        if (dtasktitle != document.querySelector("span#dtasktitle").textContent.trim())
            dtasktitle = document.querySelector("span#dtasktitle").textContent.trim();
        else return;

        const timerUnitTest = document.querySelector("div#countdown.timeTo.timeTo-white");
        if (timerUnitTest) {
            console.log("!!! Đây là bài kiểm tra !!!");
            return;
        }
        const taskTitleElement = document.querySelector("span#dtasktitle");
        if (!taskTitleElement) {
            console.error("It's not a task");
            return;
        }

        console.log("Task type: " + taskType[0] + " - " + taskType[1]);
        // Vocabulary
        if (taskType[0] === "dvocabulary" && taskType[1] === "default") {
            doVocabularyDefault();
        }
        // MCQ
        if (taskType[0] === "dmcq") {
            doMCQ();
        }
        // Content
        if (taskType[0] === "dcontent" && taskType[1] === "view-content") {
            doContent();
        }
        // Upload content
        if (taskType[0] === "dcontent" && taskType[1] === "upload-content") {
            doUploadContent();
        }
        // Question
        // Reading choose answer
        if (taskType[0] === "dquestion" && taskType[1] === "choose-reading-choose-answer") {
            doQuestionChooseReading();
        }
        // Listening choose answer
        if (taskType[0] === "dquestion" && taskType[1] === "choose-listening-choose-answer") {
            doQuestionChooseListening();
        }
        // Fill word blank
        if (taskType[0] === "dquestion" && taskType[1] === "fill-grammar-word-blank") {
            doQuestionFillGrammar();
        }
        // Fill word blank
        if (taskType[0] === "dquestion" && taskType[1] === "fill-reading-word-blank") {
            doQuestionFillReading();
        }
        // Fill word blank in Listening
        if (taskType[0] === "dquestion" && taskType[1] === "fill-listening-write-answer") {
            doQuestionFillListening();
        }
    }
    var dtasktitle = "";
    waitForSelector("div#mbody").then(() => {
        run();
        const observe = new MutationObserver(run);
        observe.observe(document.querySelector("span#dtasktitle"), {
            childList: true,
            characterData: true,
            subtree: true,
        });
    });
    //===============================================================
})();
