// ==UserScript==
// @name         PTIT Helper
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      0.0.1
// @description  Công cụ hỗ trợ cho sinh viên PTIT
// @author       QuanVu
// @match        https://qldt.ptit.edu.vn/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
    "use strict";
    GM_addStyle(`
		body > app-root > div > div > div > div.contentshow.ng-star-inserted > div > div > div.px-md-0.frame_left {
			flex: 3;
		}
		body > app-root > div > div > div > div.contentshow.ng-star-inserted > div > div > div.frame_right.pr-0.ng-star-inserted {
			flex: 1;
		}
	`);

    if (location.pathname === "/#/diem") {
        const maintable = document.querySelector("#excel-table > tbody");
        if (maintable) {
        }
    }

    function suaDiem() {
        const maintable = document.querySelector("#excel-table > tbody");

        const rows = maintable.querySelectorAll("tr");
        const semesters = [];
        let currentSemester = null;
        let isParsingSubjects = false;

        rows.forEach((row) => {
            const rowText = row.textContent.trim();

            if (
                row.classList.contains("table-primary") &&
                row.classList.contains("ng-star-inserted")
            ) {
                if (currentSemester) semesters.push(currentSemester);
                currentSemester = {
                    title: rowText,
                    subjects: [],
                    summary: {},
                };
                isParsingSubjects = true;
            }

            else if (
                isParsingSubjects &&
                row.classList.contains("text-center") &&
                row.classList.contains("ng-star-inserted")
            ) {
                const cells = Array.from(row.querySelectorAll("td")).map((td) =>
                    td.textContent.trim()
                );
                if (cells.length >= 5) {
                    currentSemester.subjects.push({
                        stt: cells[0],
                        code: cells[1],
                        group: cells[2],
                        name: cells[3],
                        credits: cells[4],
                    });
                }
            }

            else if (
                rowText.includes("- tbHK:") &&
                row.classList.contains("m-0") &&
                row.classList.contains("ng-star-inserted")
            ) {
                const tables = row.querySelectorAll("table");
                const tbHK = tables[0].querySelector("tr:nth-child(1) > td:nth-child(2)");
                const soTin = tables[0].querySelector("tr:nth-child(3) > td:nth-child(2)");
                const tbttl = tables[1].querySelector("tr:nth-child(1) > td:nth-child(2)");
                const tinTichLuy = tables[1].querySelector("tr:nth-child(3) > td:nth-child(2)");

                if (currentSemester) {
                    currentSemester.summary = {
                        tbHK: parseFloat(),
                        soTin: parseInt(matches[3]),
                        tbTichLuy: parseFloat(matches[4]),
                        tinTichLuy: parseInt(matches[6]),
                    };
                    isParsingSubjects = false;
                }
            }
        });

        if (currentSemester) {
            semesters.push(currentSemester);
        }

        console.log(semesters);
    }
})();
