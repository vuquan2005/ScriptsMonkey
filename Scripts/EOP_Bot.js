// ==UserScript==
// @name         EOP Bot
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      4.11
// @description  A bot working on eop.edu.vn
// @author       QuanVu
// @match        https://eop.edu.vn/study/*
// @updateURL    https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/EOP_Bot.js
// @downloadURL  https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/EOP_Bot.js
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js
// ==/UserScript==

(function () {
    "use strict";
    //
    const taskTitleElement = document.querySelector("span#dtasktitle");
    if (!taskTitleElement) {
        console.error("It's not a task");
        return;
    }
    let taskTitle = "";
    setInterval(() => {
        if (taskTitleElement.textContent !== taskTitle) {
            taskTitle = taskTitleElement.textContent;
            setTimeout(run, 1000);
        }
    }, 1000);
    function run() {
        console.log("\nNew Task");
        var timeDoTask = TimeDoTask();
        const elementHandlers = [
            { selector: "div.dvocabulary", handler: handleVocab },
            { selector: "div.dmcq", handler: handleDMCQ },
            { selector: "div.dquestion", handler: handleQuestion },
            { selector: "div.dcontent", handler: handleContent },
        ];
        elementHandlers.forEach(({ selector, handler }) => {
            const el = document.querySelector(selector);
            if (el) {
                console.log("Tìm thấy phần tử: ", selector);
                handler(el, timeDoTask);
            }
        });
    }
    ///

    function handleVocab(el) {
        console.log("Vocabulary...");
        console.log("Can't do this");
    }
    function handleDMCQ(el) {
        console.log("DMCQ...");
        console.log("Can't do this, because i think so");
    }
    function handleQuestion(el, timeDoTask) {
        console.log("Question...");
        const chooseQuestion = el.querySelector("p.dchk");
        if (chooseQuestion) {
            console.log("Can't do the choose question, Please choose your answer!");
            setTimeout(() => {
                const btnDone = document.querySelector('button.btn.btn-info.dnut[type="button"]');
                btnDone.click();
            }, timeDoTask * 1000);
        } else {
            console.log("Bot do");
            console.log("Task will be completed in: ", timeDoTask + 30, " s");
            questionFill();
        }
    }
    async function handleContent(el, timeDoTask) {
        if (document.querySelector("div.dcontent.upload-content")) {
            console.log("Upload content...");
            let oDienLink = document.querySelector("#dupload > div > textarea").value;
            let isAutoUpload = await GM_getValue("isAutoUpload", null);
            if (isAutoUpload == null) {
                isAutoUpload = confirm("Do you want to upload content link (Google drive, padlet,...) automatically?");
                await GM_setValue("isAutoUpload", isAutoUpload);
            }
            console.log("Auto upload is: ", isAutoUpload);
            if (isAutoUpload && !oDienLink) {
                let linkUpLoad = await GM_getValue("linkUpLoad", "");
                while (linkUpLoad == "") {
                    console.log("Inputting link upload...");
                    linkUpLoad =
                        prompt("Link upload not found. Please enter the link upload: ") || "";
                    if (linkUpLoad != "") {
                        await GM_setValue("linkUpLoad", linkUpLoad);
                        console.log("Link upload saved: ", linkUpLoad);
                    }
                }
                document.querySelector("#dupload > div > textarea").value = linkUpLoad;
                console.log("Link upload = ", document.querySelector("#dupload > div > textarea").value);
            }
            setTimeout(() => {
                const btnDone = document.querySelector('button.btn.btn-info.dnut[type="button"]');
                btnDone.click();
            }, timeDoTask * 1000);
        }
        if (document.querySelector("div.dcontent.view-content")) {
            console.log("View content...");
            setTimeout(() => {
                const btnDone = document.querySelector('button.btn.btn-info.dnut[type="button"]');
                btnDone.click();
            }, timeDoTask * 1000);
        }
    }
    ///
    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
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
            if (listenQuestion) readingTime += 90;
            return readingTime;
        }
    }
    ///
    async function questionFill() {
        await document.querySelectorAll("input.danw.dinline").forEach((input) => {
            if (input.type !== "file") {
                input.value = "a";
            }
        });
        const btnDone = document.querySelector('button.btn.btn-info.dnut[type="button"]');
        if (btnDone) {
            btnDone.click();
        }
        const mfooter = document.getElementById("mfooter");
        const clockBtn = document.createElement("button");
        clockBtn.className = "btn dnut";
        clockBtn.style = "display: inline-block;";
        mfooter.appendChild(clockBtn);
        const btnPreview = document.querySelector('button.btn.btn-danger.dnut[type="button"]');
        if (btnPreview) {
            let countdown = 30;
            clockBtn.textContent = `Xem đáp án sau: ${countdown}`;
            const countdownInterval = setInterval(() => {
                countdown -= 1;
                clockBtn.textContent = `Xem đáp án sau: ${countdown}`;
                if (countdown <= 0) {
                    clearInterval(countdownInterval);

                    btnPreview.click();
                    clockBtn.textContent = "Đã có đáp án";
                }
            }, 1000);
        }
        await delay(31000);
        let inputs = document.querySelectorAll('input[style*="background-image"]');
        while (inputs.length === 0) {
            await delay(500);
            inputs = document.querySelectorAll('input[style*="background-image"]');
        }
        const answersImg = getAnswer(inputs);
        console.log("Imgs: ", answersImg);
        var answersTxt = [];
        await imgToTxt(answersImg)
            .then((results) => {
                results.forEach((text) => {
                    answersTxt.push(text.text);
                });
            });

        console.log("Answers: ", answersTxt);
        await delay(100);
        const btnReW = document.querySelector('button.btn.btn-primary.dnut[type="button"]');
        if (btnReW) btnReW.click();
        const inputFields = document.querySelectorAll("input[type='text']");
        inputFields.forEach((input, index) => {
            if (answersTxt[index]) {
                input.value = answersTxt[index];
            }
        });
        let timeDo = Math.round(TimeDoTask());
        clockBtn.textContent = "Đã điền xong, chờ " + timeDo + "s";
        await delay(timeDo * 1000);
        const btnDone2 = document.querySelector('button.btn.btn-info.dnut[type="button"]');
        if (btnDone2) {
            btnDone2.click();
        }
    }
    function getAnswer(inputs) {
        const imageArray = [];
        for (const input of inputs)
        {
            const style = input.style.backgroundImage;
            const url = style.slice(5, -2);
            imageArray.push(url);
        }
        return imageArray;
    }
    async function imgToTxt(images) {
        let results = [];
        let timRedo = 0;
        while (1)
        {
            results = [];
            for (const imagePath of images) {
                const {
                    data: { text },
                } = await Tesseract.recognize(imagePath, "eng");
                results.push({ text });
            }
            console.log("Recognized text: ", results);
            if (results.some((result) => result.text == "")) {
                console.log("Somethings is enror, retrying...");
                timRedo++;
                if (timRedo > 5) {
                    console.log("Too many errors, stopping...");
                    break;
                }
                await delay(500);
            } else {
                break;
            }
        }
        for (let i = 0; i < results.length; i++) {
            // Remove some unwanted character
            results[i].text = results[i].text.replace(/[^a-zA-Z0-9]/g, " ");
            results[i].text = results[i].text.replace(/\n/g, "");
            // Fix some errors
            if (results[i].text == "Cc")
                results[i].text = "C";
            results[i].text = results[i].text.replace(/\|/g, "i");
        }
        return results;
    }
    //End
})();
