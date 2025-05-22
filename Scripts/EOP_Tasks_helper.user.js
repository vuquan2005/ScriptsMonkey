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
        if (taskType[0] === "dvocabulary" && taskType[1] === "default") {
            doVocabularyDefault();
        }
        if (taskType[0] === "dmcq") {
            doMCQ();
        }
        if (taskType[0] === "dquestion") {
            doQuestion();
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
    // ====================================================================================
    // Do task
    function doVocabularyDefault() {
        console.log("Can't do vocabulary default");
    }
    function doMCQ() {
        console.log("Can't do MCQ");
    }
    function doQuestion() {
        console.log("Can't do question");
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
