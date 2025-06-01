// ==UserScript==
// @name           	Save the multiple choice questions qldt.haui.edu.vn
// @description		Lưu lại câu hỏi trắc nghiệm trên hệ thống quản lý học tập qldt.haui.edu.vn
// @author         	QuanVu
// @namespace      	https://github.com/vuquan2005/ScriptsMonkey
// @version        	0.1.0
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

    function saveJSON(jsonData, filename) {
        const dataStr =
            "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonData, null, 2));
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `quiz_data_${filename}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    function saveTxt(jsonData, filename) {
		// Câu 1.1;${question};${answer1} ||${answer2} ||${answer3} ||${answer4} ;${correctAnswer}
		const lesson = filename.match(/\d+/)[0];
        let txtContent = "";
        for (const key in jsonData) {
            const item = jsonData[key];
            const question = item.question.replace(/;/g, ","); // Remove semicolons to avoid breaking the format
			const answers = item.answers.map((answer) => answer.replace(/;/g, ",")).join(" ||");
			const correctAnswer = item.correct ? item.correct : "";
			txtContent += `Câu ${lesson}.${item.index};${question};${answers} ;${correctAnswer}\n`;

            txtContent += "\n";
        }
        const blob = new Blob([txtContent], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `quiz_data_${filename}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    function jsonToHtml(jsonData) {
        let html = '<div class="quiz-container">\n';

        for (const key in jsonData) {
            const item = jsonData[key];
            html += `  <div class="question-block">\n`;
            html += `    <h3>Câu ${item.index}: ${item.question}</h3>\n`;
            html += `    <ul>\n`;

            item.answers.forEach((answer, index) => {
                const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                const isCorrect = item.correct && parseInt(item.correct) === index + 1;
                const correctClass = isCorrect ? ' class="correct-answer"' : "";
                html += `      <li${correctClass}>${optionLabel}. ${answer}</li>\n`;
            });

            html += `    </ul>\n`;
            html += `  </div>\n`;
        }

        html += "</div>";
        return html;
    }

    function saveJsonToHtml(jsonData, filename) {
        const htmlContent = `
			<!DOCTYPE html>
			<html lang="vi">
				<head>
					<meta charset="UTF-8">
					<title>Quiz</title>
					<style>
						.quiz-container { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
						.question-block { margin-bottom: 20px; }
						h3 { color: #333; }
						ul { list-style-type: none; padding: 0; }
						li { margin: 10px 0; }
						.correct-answer { background-color: #fff9c4; }
					</style>
				</head>
				<body>
					${jsonToHtml(jsonData)}
				</body>
			</html>
		`;

        // Create a Blob with the HTML content
        const blob = new Blob([htmlContent], { type: "text/html" });

        // Create a temporary link to download the file
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `quiz_data_${filename}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    const waitToWebsiteLoaded = setInterval(() => {
        if (
            ($("span.answernumber") ? $("span.answernumber").textContent === "a. " : false) &&
            currentURL.includes("attempt.php")
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

            // saveJSON(totalQuiz, lesson);
            saveJsonToHtml(totalQuiz, lesson);
			saveTxt(totalQuiz, lesson);

            GM_setValue("quizData", {});
        }
    }, 100);

    // quizData.push({ question: `${question.textContent.trim()}`, answers: [...], correct: 1 });
})();
