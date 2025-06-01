// ==UserScript==
// @name           	Save the multiple choice questions qldt.haui.edu.vn
// @description		Lưu lại câu hỏi trắc nghiệm trên hệ thống quản lý học tập qldt.haui.edu.vn
// @author         	QuanVu
// @namespace      	https://github.com/vuquan2005/ScriptsMonkey
// @version        	0.0.1
// @match          	https://qlht.haui.edu.vn/mod/quiz/attempt.php*
// @match          	https://qlht.haui.edu.vn/mod/quiz/summary.php*
// @grant          	GM_setValue
// @grant          	GM_getValue
// @updateURL		https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/Save_the_multiple_questions.user.js
// @downloadURL		https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/Save_the_multiple_questions.user.js
// ==/UserScript==

(function () {
    "use strict";
    const currentURL = window.location.href;
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => scope.querySelectorAll(selector);
    // ===========================================================================
    let quizData = GM_getValue("quizData", {});

    function run() {
        const container = $("form#responseform > div > div.multichoice");
        const info = $("div.info", container);
        const questionNumber = $("span.qno", info).textContent.trim();
        const content = $("div.content", container);
        const question = $("div.qtext", content).textContent.trim();
        const answersContainer = $("div.answer", content);
        const answers = $$("div", answersContainer);

        let answersData = [];
        let correctAnswer = null;

        answers.forEach((answer) => {
            const radio = $("input[type='radio']", answer);
            let label = $("label", answer).textContent;
            label = label.replace(/^\w\.\s/, "");

            answersData.push(label);
            // console.log(label);

            if (radio.checked) correctAnswer = radio.value;

            radio.addEventListener("change", function () {
                if (radio.checked) {
                    quizData[questionNumber] = {
                        index: questionNumber,
                        question: question,
                        answers: answersData,
                        correct: correctAnswer,
                    };
                    console.log(`Bạn chọn: ${radio.value}`);
                    console.log(quizData[questionNumber]);
                }
            });
        });

        quizData[questionNumber] = {
            index: questionNumber,
            question: question,
            answers: answersData,
            correct: correctAnswer,
        };

        console.log(quizData[questionNumber]);
    }

    window.addEventListener("beforeunload", function () {
        GM_setValue("quizData", quizData);
    });

    const waitToWebsiteLoaded = setInterval(() => {
        if (
            $("span.answernumber")
                ? $("span.answernumber").textContent === "a. "
                : false && currentURL.includes("attempt.php")
        ) {
            clearInterval(waitToWebsiteLoaded);
            run();
        }
        if (currentURL.includes("summary.php")) {
            clearInterval(waitToWebsiteLoaded);
            const totalQuiz = GM_getValue("quizData", {});
            console.log(totalQuiz);

			const lesson = $("title").textContent.match(/bài\s\d+/)[0];
			console.log(lesson);

			// Save the quiz data to a json file
			const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(totalQuiz, null, 2));
			const downloadAnchorNode = document.createElement("a");
			downloadAnchorNode.setAttribute("href", dataStr);
			downloadAnchorNode.setAttribute("download", `quiz_data_${lesson}.json`);
			document.body.appendChild(downloadAnchorNode); // required for firefox
			downloadAnchorNode.click();
			downloadAnchorNode.remove();

			GM_setValue("quizData", {});
        }
    }, 100);

    // quizData.push({ question: `${question.textContent.trim()}`, answers: [...], correct: 1 });
})();
