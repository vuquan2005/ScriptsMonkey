// ==UserScript==
// @name         PTIT Helper
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      0.1.0
// @description  Công cụ hỗ trợ cho sinh viên PTIT
// @author       QuanVu
// @match        https://qldt.ptit.edu.vn/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
    "use strict";

    console.log("PTIT");

    GM_addStyle(`
		body > app-root > div > div > div > div.contentshow.ng-star-inserted > div > div > div.px-md-0.frame_left {
			flex: 3;
		}
		body > app-root > div > div > div > div.contentshow.ng-star-inserted > div > div > div.frame_right.pr-0.ng-star-inserted {
			flex: 1;
		}
		.infoElement {
			position: absolute;
			top: 0;
			left: 0;
		}
	`);

    const letterScoreTo4 = {
        "A+": 4.0,
        A: 3.7,
        "B+": 3.5,
        B: 3.0,
        "C+": 2.5,
        C: 2.0,
        "D+": 1.5,
        D: 1.0,
        F: 0.0,
    };

    let originListHP = [];

    function showGPA() {
        console.log("Hiển thị GPA");
        const container = document.querySelector("app-right");

        const gpaDivContainer = document.createElement("div");
        gpaDivContainer.className = "card shadow-lg ng-star-inserted";
        const gpaDiv = document.createElement("div");
        gpaDiv.className = "card shadow-lg ng-star-inserted infoElement";

        gpaDiv.innerHTML = `
			<table>
				<tr>
					<td class="text-nowrap" >Điểm trung bình tích lũy: </td>
					<td class="text-nowrap" id="gpa" >0.00 </td>
				</tr>
				<tr>
					<td class="text-nowrap" >Tín tích lũy: </td>
					<td class="text-nowrap" id="tin" >0.00 </td>
				</tr>
				<tr>
					<td class="text-nowrap" >Tín còn lại: </td>
					<td class="text-nowrap" id="tinConLai" >0.00 </td>
				</tr>
				<tr>
					<td class="text-nowrap" >Các môn còn lại cần để đạt GPA 3.2: </td>
					<td class="text-nowrap" id="gpa3.2" >0.00 </td>
				</tr>
				<tr>
					<td class="text-nowrap" >Các môn còn lại cần để đạt GPA 3.6: </td>
					<td class="text-nowrap" id="gpa3.6" >0.00 </td>
				</tr>
			</table>
		`;

        gpaDivContainer.insertAdjacentElement("beforeend", gpaDiv);
        container.insertAdjacentElement("beforeend", gpaDivContainer);
    }

    function highlight() {
        const scoresBoxColor = {
            4.0: "rgba(72, 214, 89, 1)", // A+
            3.7: "rgba(52, 157, 52, 1)", // A
            3.5: "rgb(49, 163, 255)", // B+
            3.0: "rgb(20, 120, 230)", // B
            2.5: "rgb(255,186,0)", // C+
            2.0: "rgb(255,144,0)", // C
            1.5: "rgb(255, 50, 0)", // D+
            1.0: "rgb(200, 0, 0)", // D
            0.0: "rgb(157, 0, 255)", // F
        };
        const creditsBoxColor = {
            5: "rgb(200, 0, 100)",
            4: "rgb(255, 0, 0)",
            3: "rgb(255, 165, 0)",
            2: "rgb(0, 191, 255)",
            1: "rgb(46, 204, 64)",
        };

        const maintable = document.querySelector("#excel-table > tbody");
        const rows = maintable.querySelectorAll("tr.text-center");

        for (const row of rows) {
            if (row.children[8].textContent.trim() === "P") continue;

            // row.children[4].style.backgroundColor =
                // creditsBoxColor[row.children[4].textContent.trim()] || "transparent";

            row.children[8].style.backgroundColor =
                scoresBoxColor[letterScoreTo4[row.children[8].textContent.trim()]] || "transparent";
        }
    }

    function getListHP() {
        const maintable = document.querySelector("#excel-table > tbody");
        const rows = maintable.querySelectorAll("tr.text-center");
        const listHP = [];

        let boQuaHPTA = 0;
        for (const row of rows) {
            if (row.children[8].textContent.trim() === "P") continue;
            if (row.children[8].textContent.trim() == "") continue;
            if (boQuaHPTA < 2) {
                if (row.children[1].textContent.trim() == "BAS1157") {
                    boQuaHPTA++;
                    continue;
                }
                if (row.children[1].textContent.trim() == "BAS1158") {
                    boQuaHPTA++;
                    continue;
                }
            }

            const hp = {
                code: row.children[1].textContent.trim(),
                credits: parseInt(row.children[4].textContent.trim()),
                score: row.children[7].textContent.trim(),
            };
            listHP.push(hp);
        }

        console.log("Get done");
        return listHP;
    }

    function calculateGPA() {
        const listHP = getListHP();

        console.log("Calculate GPA");

        let totalCredits = 0;
        let totalPoints = 0;
        // let totalCreditsLeft = 0;
        // let totalPointsNeeded3_2 = 0;
        // let totalPointsNeeded3_6 = 0;

        for (const hp of listHP) {
            const score = hp.score;
            if (score !== undefined) {
                totalCredits += hp.credits;
                totalPoints += score * hp.credits;
            }
        }
        const gpa = totalPoints / totalCredits;
        // const gpa3_2 = (totalPointsNeeded3_2 - totalPoints) / (totalCredits + totalCreditsLeft);
        // const gpa3_6 = (totalPointsNeeded3_6 - totalPoints) / (totalCredits + totalCreditsLeft);
        document.getElementById("gpa").textContent = gpa.toFixed(2);
        document.getElementById("tin").textContent = totalCredits.toFixed(2);
        // document.getElementById("tinConLai").textContent = totalCreditsLeft.toFixed(2);
        // document.getElementById("gpa3.2").textContent = gpa3_2.toFixed(2);
        // document.getElementById("gpa3.6").textContent = gpa3_6.toFixed(2);
    }

    function suaDiem() {
        const maintable = document.querySelector("#excel-table > tbody");
        const rows = maintable.querySelectorAll("tr.text-center");

        for (const row of rows) {
            row.children[8].setAttribute("contenteditable", "true");
        }
    }

    function convertLetterScoreTo4() {
        const maintable = document.querySelector("#excel-table > tbody");
        const rows = maintable.querySelectorAll("tr.text-center");

        for (const row of rows) {
            let match = row.children[8].textContent.match(/([a-zA-Z]\+?)/);
            if (match) {
                row.children[8].textContent = match[0].toUpperCase();
            }
            row.children[7].textContent = letterScoreTo4[row.children[8].textContent.trim()];
        }
    }

    setTimeout(() => {
        if (location.href === "https://qldt.ptit.edu.vn/#/diem") {
            const maintable = document.querySelector("#excel-table > tbody");
            if (maintable) {
                suaDiem();
                showGPA();

                originListHP = getListHP();

                setInterval(() => {
                    convertLetterScoreTo4();
                    highlight();
                    calculateGPA();
                }, 1000);
            }
        }
    }, 5000);
})();
