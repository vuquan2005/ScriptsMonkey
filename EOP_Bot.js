// ==UserScript==
// @name         EOP Bot
// @namespace    https://github.com/vuquan2005
// @version      3.1
// @description  A bot working on eop.edu.vn
// @author       QuanVu
// @include      https://eop.edu.vn/study/task/*
// @updateURL    https://raw.githubusercontent.com/vuquan2005/ScriptsMonkey/refs/heads/main/EOP_Bot.js
// @downloadURL  https://raw.githubusercontent.com/vuquan2005/ScriptsMonkey/refs/heads/main/EOP_Bot.js
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js
// ==/UserScript==

(function () {
    "use strict";

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
        // Định nghĩa các phần tử và hàm xử lý tương ứng
        const elementHandlers = [
            { selector: "div.dvocabulary", handler: handleVocab },
            { selector: "div.dmcq", handler: handleDMCQ },
            { selector: "div.dquestion", handler: handleQuestion },
            { selector: "div.dcontent", handler: handleContent },
        ];

        // Duyệt và xử lý phần tử tương ứng
        elementHandlers.forEach(({ selector, handler }) => {
            const el = document.querySelector(selector);
            if (el) {
                console.log("Tìm thấy phần tử: ", selector);
                handler(el);
            }
        });

        // Các hàm xử lý tương ứng
        function handleVocab(el) {
            console.log("Handling vocabulary...");
            console.log(
                "Can't do this, because the EOP detect:\n\"Uncaught (in promise) NotAllowedError: play() failed because the user didn't interact with the document first.\""
            );
            // el.querySelectorAll('i.daudio').forEach((input) => {
            //     if (input) {
            //         setInterval(() => {
            //             input.click();
            //             input.log('Playing audio...');
            //         }, 3000);
            //     }
            // });
        }

        function handleDMCQ(el) {
            console.log("Handling DMCQ...");
            console.log("Can't do this, because i think so");
        }

        function handleQuestion(el) {
            console.log("Handling question...");
            const chooseQuestion = el.querySelector("p.dchk");
            if (chooseQuestion) {
                console.log("Can't do the choose question");
            } else {
                console.log("Bot do");
                // Call questionFill() in "scripts/questionFill.js"
                var timeDoTask = TimeDoTask();
                console.log("Task will be completed in: ", timeDoTask + 30, " s");
                questionFill();
            }
        }

        function handleContent(el) {
            console.log("Handling content...");
            setInterval(() => {
                const btnDone = document.querySelector(
                    'button.btn.btn-info.dnut[type="button"]'
                );
                if (btnDone) {
                    btnDone.click();
                }
            }, 5000);
        }
    }

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function TimeDoTask() {
        const contentElement = document.querySelector("div.ditem");
        const listenQuestion = document.querySelector("div.dta-main");     
        if (contentElement) {
            const text = contentElement.textContent;
            const wordMatchRegExp = /[^\s]+/g;
            const words = text.matchAll(wordMatchRegExp);
            const wordCount = [...words].length;
            let readingTime = (wordCount / 300)*60;
            if (listenQuestion) readingTime += 90;
            return readingTime;
        }
    }
    async function questionFill() {
        // Fill in the answers
        await document.querySelectorAll("input").forEach((input) => {
            if (input.type !== "file") {
                input.value = "a";
            }
        });

        // Click the Done buttons
        const btnDone = document.querySelector('button.btn.btn-info.dnut[type="button"]');
        if (btnDone) {
            btnDone.click();
        }

        // Create a button inside <div id="mfooter">
        const mfooter = document.getElementById("mfooter");
        const clockBtn = document.createElement("button");
        clockBtn.className = "btn dnut";
        clockBtn.style = "display: inline-block;";
        mfooter.appendChild(clockBtn);

        // Find the Preview button and click it
        const btnPreview = document.querySelector(
            'button.btn.btn-danger.dnut[type="button"]'
        );
        // Auto click the Preview button after 30 seconds
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
        // Wait 31s for the answers 
        await delay(31000);
        // Create an array containing images from input elements
        const answersImg = getAnswer();
        // Use Tesseract to recognize the text in the images
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

        // Fill in the recognized text into the input fields
        const inputFields = document.querySelectorAll("input[type='text']");
        inputFields.forEach((input, index) => {
            if (answersTxt[index]) {
                input.value = answersTxt[index];
            }
        });

        let timeDo = Math.round(TimeDoTask());
        clockBtn.textContent = 'Đã điền xong, chờ ' + timeDo + 's';
        await delay(timeDo * 1000);
        // Click the Done buttons
        const btnDone2 = document.querySelector(
            'button.btn.btn-info.dnut[type="button"]'
        );
        if (btnDone2) {
            btnDone2.click();
        }

        //end
    }

    function getAnswer() {
        const inputs = document.querySelectorAll(
            'input[style*="background-image"]'
        );
        const imageArray = [];
        inputs.forEach((input) => {
            const style = input.style.backgroundImage;
            const url = style.slice(5, -2); // Extract URL from 'url("...")'
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
                alert(
                    "Lỗi trong quá trình nhận diện:",
                    err
                );
                console.error("Error recognizing image:", err);
            }
        }

        return results;
    }
    //End
})();