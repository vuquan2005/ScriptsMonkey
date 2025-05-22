// ==UserScript==
// @name         EOP Task helper
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      0.0.1
// @description  Hỗ trợ nâng cao khi sử dụng trang web EOP
// @author       QuanVu
// @match        https://eop.edu.vn/study/*
// @updateURL    https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/EOP_Tasks_helper.user.js
// @downloadURL  https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/EOP_Tasks_helper.user.js
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
    "use strict";
    console.log("EOP Task helper");
    // ====================================================================================
    const currentURL = window.location.href;
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => scope.querySelectorAll(selector);
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
    // ====================================================================================
    let timeToLoad = 0;
    let mbody = null;
    let taskContent = null;
    GM_addStyle(`
        [translated_content]::after {
            content: attr(translated_content);
            position: fixed;
            left: 5px;
            top: 5px;
            background-color: #ccc;
            color: #000;
            padding: 3px;
            border-radius: 5px;
            opacity: 0;
            visibility: hidden;
            z-index: 99;
        }
        [translated_content]:hover::after {
            visibility: visible;
            opacity: 0.9;
        }
    `);
    // ====================================================================================
    // Wait to web load
    const waitWebLoad = controlInterval(() => {
        timeToLoad++;
        if (mbody) {
            taskContent = mbody.children[0];
            if (taskContent.className !== "loading") {
                runTaskHelper();
                console.log("Time to load: " + (timeToLoad * 25) / 1000 + "s");
                waitWebLoad.stop();
            }
        } else {
            mbody = $("div#mbody");
        }
    }, 25);
    // Get task type
    function getTaskType() {
        const classList = mbody.children[0].className;
        const classListArray = classList.split(" ");
        return classListArray;
    }
    // Handle task
    function handleTask() {
        let taskType = getTaskType();
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
        // Choose reading choose answer
        if (taskType[0] === "dquestion" && taskType[1] === "choose-reading-choose-answer") {
            doQuestionChooseReading();
        }
        // Choose listening choose answer
        if (taskType[0] === "dquestion" && taskType[1] === "choose-listening-choose-answer") {
            doQuestionChooseListening();
        }
        // Fill grammar word blank
        if (taskType[0] === "dquestion" && taskType[1] === "fill-grammar-word-blank") {
            doQuestionFillGrammar();
        }
    }
    // Send to LLM
    async function sendToLLM(prompt) {
        const response = await fetch("http://localhost:1234/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "qwen3-0.6b",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
            }),
        });
        const data = await response.json();
        return data.choices[0].message.content;
    }
    // Translate content by LLM
    async function translateByLLM(content) {
        const prompt = `Translate the following content to Vietnamese: "${content}" /no_think`;
        let translatedContent = await sendToLLM(prompt) + "";
        translatedContent = translatedContent.replace(`<think>\n\n</think>\n\n`, "");
        translatedContent = translatedContent.replaceAll(`\"`, "");
        return translatedContent;
    }
    // Select all leaf node in taskContent
    function selectAllLeafNode(selector) {
        const allElements = $$("p", selector);
        return allElements;
    }
    // Translate all leaf node in taskContent
    async function translateAllLeafNode(selector) {
        const leafElements = selectAllLeafNode(selector);
        for (const leafElement of leafElements) {
            let translatedContent = await translateByLLM(leafElement.textContent);
            leafElement.setAttribute("translated_content", translatedContent);
        }
    }
    // ====================================================================================
    // Do task
    function doVocabularyDefault() {
        console.log("Can't do vocabulary default");
    }
    function doMCQ() {
        console.log("Can't do MCQ");
    }
    function doContent() {
        console.log("Can't do content");
        //translateAllLeafNode(taskContent);
    }
    function doUploadContent() {
        console.log("Can't do upload content");
    }
    function doQuestionChooseReading() {
        console.log("Can't do question choose reading");
    }
    function doQuestionChooseListening() {
        console.log("Can't do question choose listening");
    }
    function doQuestionFillGrammar() {
        console.log("Can't do question fill grammar");
    }
    function doQuestionFillListening() {
        console.log("Can't do question fill listening");
    }
    // ====================================================================================
    // Run
    function runTaskHelper() {
        handleTask();
    }
    if (currentURL.includes("study/task/")) {
        waitWebLoad.start(25, false);
    }
    if (currentURL.includes("study/unit/")) {
    }
})();
