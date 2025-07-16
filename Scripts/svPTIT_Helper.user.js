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

    function suaDiem() {
        console.log("Sửa điểm");

        const editbtn = document.createElement("button");
        editbtn.className = "btn btn-outline-primary text-nowrap";
        editbtn.textContent = "Sửa điểm";

        const buttonContainer = document.querySelector(".col-12.text-right.ng-star-inserted");
        if (buttonContainer) {
            buttonContainer.appendChild(editbtn);
        }

        document.addEventListener("click", function (event) {
            const maintable = document.querySelector("#excel-table > tbody");
            const rows = maintable.querySelectorAll("tr");

            rows.forEach((row) => {
                if (row.classList.contains("text-center")) {
                    row.children[7].setAttribute("contenteditable", "true");
                }
            });
        });
    }
    setTimeout(() => {
        if (location.href === "https://qldt.ptit.edu.vn/#/diem") {
            const maintable = document.querySelector("#excel-table > tbody");
            if (maintable) {
                suaDiem();
                showGPA();
            }
        }
    }, 5000);
})();
