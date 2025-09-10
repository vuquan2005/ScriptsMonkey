// ==UserScript==
// @name         PTIT Helper
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      0.2.3
// @description  Công cụ hỗ trợ cho sinh viên PTIT
// @author       QuanVu
// @downloadURL  https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/svPTIT_Helper.user.js
// @updateURL    https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/svPTIT_Helper.user.js
// @match        https://qldt.ptit.edu.vn/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
    "use strict";

    console.log("PTIT");

    GM_addStyle(`
			@media (min-width: 769px) {
			body > app-root > div > div > div > div.contentshow.ng-star-inserted > div > div > div.px-md-0.frame_left {
				width:75% !important;
			}
			body > app-root > div > div > div > div.contentshow.ng-star-inserted > div > div > div.frame_right.pr-0.ng-star-inserted {
				width:25% !important;
			}
		}

		@media (max-width: 768px) {
			body > app-root > div > div > div > div.contentshow.ng-star-inserted > div > div > div.px-md-0.frame_left {
			width:100% !important;
		}
		body > app-root > div > div > div > div.contentshow.ng-star-inserted > div > div > div.frame_right.pr-0.ng-star-inserted {
			width:0% !important;
		}
		}

		.infoElement {
			position: sticky;
			top: 0;
			margin: 5px;
			font-size: auto;			
		}
		#gpa-table {
			width: 100%;
			max-width: 600px;
			margin: 5px auto;
		}

		#gpa-table tr {
			border-bottom: 1px solid #ddd;
		}

		#gpa-table td {
			padding: 5px 6px;
			vertical-align: top;
		}

		#gpa-table td:first-child {
			font-weight: bold;
			width: 70%;
		}

		#gpa-table td:last-child {
			width: 30%;
			color: #2a7ae2;
		}
	`);

    function waitForElement(selector, callback, delayAfterFound = 0) {
        const observer = new MutationObserver(() => {
            const el = document.querySelector(selector);
            if (el) {
                observer.disconnect();
                if (delayAfterFound > 0) {
                    setTimeout(() => callback(el), delayAfterFound);
                } else {
                    callback(el);
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function showInfo() {
        const container = document.querySelector("app-right");

        const gpaDivContainer = document.createElement("div");
        gpaDivContainer.className = "card shadow-lg ng-star-inserted";
        const gpaDiv = document.createElement("div");
        gpaDiv.className = "card shadow-lg ng-star-inserted infoElement";

        gpaDiv.innerHTML = `
			<table id="gpa-table">
				<tr>
					<td class="text-nowrap" >Tổng số tín chương trình: </td>
					<td class="text-nowrap" id="tongSoTin" contenteditable="true" >130 </td>
				</tr>
				<tr>
					<td class="text-nowrap" >GPA: </td>
					<td class="text-nowrap" id="gpa" >0.00 </td>
				</tr>
				<tr>
					<td class="text-nowrap" >Tín tích lũy: </td>
					<td class="text-nowrap" id="tin" >0 </td>
				</tr>
				<tr>
					<td class="text-nowrap" >Tín còn lại: </td>
					<td class="text-nowrap" id="tinConLai" >0 </td>
				</tr>
				<tr>
					<td>Điểm sau khi sửa✏️: </td>
				</tr>
				<tr>
					<td class="text-nowrap" >GPA ✏️: </td>
					<td class="text-nowrap" id="edit_gpa" >0.00 </td>
				</tr>
				<tr>
					<td class="text-nowrap" >Tín tích lũy ✏️: </td>
					<td class="text-nowrap" id="edit_tin" >0 </td>
				</tr>
				<tr>
					<td class="text-nowrap" >Tín còn lại ✏️: </td>
					<td class="text-nowrap" id="edit_tinConLai" >0 </td>
				</tr>
				<tr>
					<td class="text-nowrap" >Các môn còn lại cần để đạt: </td>
				<tr>
					<td class="text-nowrap" >GPA 3.2: </td>
					<td class="text-nowrap" id="gpa3.2" >0.00 </td>
				</tr>
				<tr>
					<td class="text-nowrap" >GPA 3.6: </td>
					<td class="text-nowrap" id="gpa3.6" >0.00 </td>
				</tr>
			</table>
			<p style="color: red;" >* Có thể sửa 'tổng số tín' và 'điểm chữ các môn'.</p>
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

            row.children[4].style.backgroundColor =
                creditsBoxColor[row.children[4].textContent.trim()] || "transparent";

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

        return listHP;
    }

    function calculateGPA() {
        const listHP = getListHP();

        let totalCredits = 0;
        let totalPoints = 0;
        let totalCreditsAll = parseInt(document.querySelector("#tongSoTin").textContent.trim());

        for (const hp of listHP) {
            const score = hp.score;
            if (score !== undefined) {
                totalCredits += hp.credits;
                totalPoints += score * hp.credits;
            }
        }
        const gpa = totalPoints / totalCredits;
        document.getElementById("gpa").textContent = gpa.toFixed(2);
        document.getElementById("tin").textContent = totalCredits.toFixed(0);
        document.getElementById("tinConLai").textContent = totalCreditsAll - totalCredits;
    }

    function calculateEditGPA() {
        const listHP = getListHP();

        let totalCredits = 0;
        let totalPoints = 0;
        let totalCreditsAll = parseInt(document.querySelector("#tongSoTin").textContent.trim());

        for (const hp of listHP) {
            const score = hp.score;
            if (score !== undefined) {
                totalCredits += hp.credits;
                totalPoints += score * hp.credits;
            }
        }
        const gpa = totalPoints / totalCredits;
        const gpa3_2 =
            (3.2 * totalCreditsAll - gpa * totalCredits) / (totalCreditsAll - totalCredits);
        const gpa3_6 =
            (3.6 * totalCreditsAll - gpa * totalCredits) / (totalCreditsAll - totalCredits);
        document.getElementById("edit_gpa").textContent = gpa.toFixed(2);
        document.getElementById("edit_tin").textContent = totalCredits.toFixed(0);
        document.getElementById("edit_tinConLai").textContent = totalCreditsAll - totalCredits;
        document.getElementById("gpa3.2").textContent = gpa3_2.toFixed(2);
        document.getElementById("gpa3.6").textContent = gpa3_6.toFixed(2);
    }

    function suaDiem() {
        const maintable = document.querySelector("#excel-table > tbody");
        const rows = maintable.querySelectorAll("tr.text-center");

        for (const row of rows) {
            row.children[8].setAttribute("contenteditable", "true");
			row.children[8].addEventListener("keydown", (e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        row.children[8].blur();
                    }
                });
            row.children[8].addEventListener("blur", (event) => {
                convertLetterScoreTo4();
                highlight();
                calculateEditGPA();
            });
        }
    }

    function convertLetterScoreTo4() {
        const maintable = document.querySelector("#excel-table > tbody");
        const rows = maintable.querySelectorAll("tr.text-center");

        for (const row of rows) {
            const cell = row.children[8];
            cell.textContent = cell.textContent.trim().toUpperCase();
            cell.textContent = cell.textContent.replace(/^A.+$/g, "A+");
            cell.textContent = cell.textContent.replace(/^B.+$/g, "B+");
            cell.textContent = cell.textContent.replace(/^C.+$/g, "C+");
            cell.textContent = cell.textContent.replace(/^D.+$/g, "D+");

            if (!["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"].includes(cell.textContent)) {
                alert("Điểm không hợp lệ! \nVui lòng nhập lại (A+, A, B+, B, C+, C, D+, D, F)");
                cell.textContent = originalScore;
            }

            row.children[7].textContent =
                {
                    "A+": 4.0,
                    A: 3.7,
                    "B+": 3.5,
                    B: 3.0,
                    "C+": 2.5,
                    C: 2.0,
                    "D+": 1.5,
                    D: 1.0,
                    F: 0.0,
                }[cell.textContent];
        }
    }

    if (location.href === "https://qldt.ptit.edu.vn/#/diem") {
        waitForElement(
            "#excel-table > tbody",
            () => {
                suaDiem();
                showInfo();
                calculateGPA();
                highlight();
            },
            700
        );
    }
})();
