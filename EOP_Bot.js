// ==UserScript==
// @name         EOP Bot
// @namespace    https://github.com/vuquan2005
// @version      0.3.3
// @description  A bot working on eop.edu.vn
// @author       QuanVu
// @include      https://eop.edu.vn/study/*
// @updateURL    https://raw.githubusercontent.com/vuquan2005/ScriptsMonkey/refs/heads/main/EOP_Bot.js
// @downloadURL  https://raw.githubusercontent.com/vuquan2005/ScriptsMonkey/refs/heads/main/EOP_Bot.js
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js
// ==/UserScript==

(function () {
    "use strict";
    //
    const taskTitleElement = document.querySelector("span#dtasktitle");
    let taskTitle = taskTitleElement.textContent;

    setInterval(() => {
        if (taskTitleElement.textContent !== taskTitle) {
            taskTitle = taskTitleElement.textContent;
            setTimeout(run, 1000);
        }
    }, 1000);

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function run() {
        console.log("New Task");

        // Fill in the answers
        await document.querySelectorAll("input").forEach((input) => {
            if (input.type !== "file") {
                input.value = "a";
            }
        });

        // Click the Done buttons
        const btnDone = document.querySelector(
            'button.btn.btn-info.dnut[type="button"]'
        );
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
        //random 2-30s

        let random = Math.floor(Math.random() * 30000) + 2000;
        clockBtn.textContent = `Đã điền xong, chờ ${random.toFixed(1) / 1000}s`;
        await delay(random);
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