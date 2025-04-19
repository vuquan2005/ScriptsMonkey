// ==UserScript==
// @name         EOP Bot
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      4.2
// @description  A bot working on eop.edu.vn
// @author       QuanVu
// @match        https://eop.edu.vn/study/task/*
// @updateURL    https://raw.githubusercontent.com/vuquan2005/ScriptsMonkey/refs/heads/main/EOP_Bot.js
// @downloadURL  https://raw.githubusercontent.com/vuquan2005/ScriptsMonkey/refs/heads/main/EOP_Bot.js
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js
// ==/UserScript==

(function () {
    "use strict";
    //
    const taskTitleElement = document.querySelector("span#dtasktitle");
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
                handler(el);
            }
        });
        function handleVocab(el) {
            console.log("Vocabulary...");
            console.log(
                "Can't do this, because the EOP detect:\n\"Uncaught (in promise) NotAllowedError: play() failed because the user didn't interact with the document first.\""
            );
        }
        function handleDMCQ(el) {
            console.log("DMCQ...");
            console.log("Can't do this, because i think so");
        }
        function handleQuestion(el) {
            console.log("Question...");
            const chooseQuestion = el.querySelector("p.dchk");
            if (chooseQuestion) {
                arlet(
                    "Can't do the choose question, Please choose your answer!"
                );
                setTimeout(() => {
                    const btnDone = document.querySelector(
                        'button.btn.btn-info.dnut[type="button"]'
                    );
                    btnDone.click();
                }, timeDoTask * 1000);
            } else {
                console.log("Bot do");
                console.log(
                    "Task will be completed in: ",
                    timeDoTask + 30,
                    " s"
                );
                questionFill();
            }
        }
        async function handleContent(el) {
            if (document.querySelector("div.dcontent.upload-content")) {
                console.log("Upload content...");
                let isAutoUpload = await GM_getValue("isAutoUpload", null);
                if (isAutoUpload == null) {
                    isAutoUpload = confirm(
                        "Do you want to upload content automatically?"
                    );
                    await GM_setValue("isAutoUpload", isAutoUpload);
                }
                if (isAutoUpload) {
                    let linkUpLoad = await GM_getValue("linkUpLoad", "");
                    while (linkUpLoad == "") {
                        console.log("Inputting link upload...");
                        linkUpLoad =
                            prompt(
                                "Link upload not found. Please enter the link upload: "
                            ) || "";
                        if (linkUpLoad != "") {
                            await GM_setValue("linkUpLoad", linkUpLoad);
                            console.log("Link upload saved: ", linkUpLoad);
                        }
                    }
                    document.querySelector("#dupload > div > textarea").value =
                        linkUpLoad;
                    console.log("Link upload = ", linkUpLoad);
                }
                setTimeout(() => {
                    const btnDone = document.querySelector(
                        'button.btn.btn-info.dnut[type="button"]'
                    );
                    btnDone.click();
                }, timeDoTask * 1000);
            }
            if (document.querySelector("div.dcontent.view-content")) {
                console.log("View content...");
                setTimeout(() => {
                    const btnDone = document.querySelector(
                        'button.btn.btn-info.dnut[type="button"]'
                    );
                    btnDone.click();
                }, timeDoTask * 1000);
            }
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
        await document
            .querySelectorAll("input.danw.dinline")
            .forEach((input) => {
                if (input.type !== "file") {
                    input.value = "a";
                }
            });
        const btnDone = document.querySelector(
            'button.btn.btn-info.dnut[type="button"]'
        );
        if (btnDone) {
            btnDone.click();
        }
        const mfooter = document.getElementById("mfooter");
        const clockBtn = document.createElement("button");
        clockBtn.className = "btn dnut";
        clockBtn.style = "display: inline-block;";
        mfooter.appendChild(clockBtn);
        const btnPreview = document.querySelector(
            'button.btn.btn-danger.dnut[type="button"]'
        );
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
        const answersImg = getAnswer();
        console.log(answersImg);
        var answersTxt = [];
        await imgToTxt(answersImg)
            .then((results) => {
                results.forEach((text) => {
                    answersTxt.push(text.text);
                });
            })
            .catch((err) => {
                alert("Lỗi trong quá trình nhận diện:", err);
            });

        console.log(answersTxt);
        await delay(100);
        const btnReW = document.querySelector(
            'button.btn.btn-primary.dnut[type="button"]'
        );
        if (btnReW) {
            btnReW.click();
        }
        const inputFields = document.querySelectorAll("input[type='text']");
        inputFields.forEach((input, index) => {
            if (answersTxt[index]) {
                // Remove any unwanted characters from the recognized text
                answersTxt[index] == "Cc" ? (answersTxt[index] = "C") : answersTxt[index];
                answersTxt[index] = answersTxt[index].replace(/\|/g, "i");
                // fill the input field with the recognized text
                input.value = answersTxt[index];
            }
        });
        let timeDo = Math.round(TimeDoTask());
        clockBtn.textContent = "Đã điền xong, chờ " + timeDo + "s";
        await delay(timeDo * 1000);
        const btnDone2 = document.querySelector(
            'button.btn.btn-info.dnut[type="button"]'
        );
        if (btnDone2) {
            btnDone2.click();
        }
    }
    function getAnswer() {
        const inputs = document.querySelectorAll(
            'input[style*="background-image"]'
        );
        const imageArray = [];
        inputs.forEach((input) => {
            const style = input.style.backgroundImage;
            const url = style.slice(5, -2);
            imageArray.push(url);
        });
        return imageArray;
    }
    async function imgToTxt(images) {
        const results = [];

        for (const imagePath of images) {
            try {
                const {
                    data: { text },
                } = await Tesseract.recognize(imagePath, "eng");
                results.push({ image: imagePath, text });
            } catch (err) {
                results.push({ image: imagePath, text: null });
                alert("Lỗi trong quá trình nhận diện:", err);
                console.error("Error recognizing image:", err);
            }
        }
        return results;
    }
    //End
})();
