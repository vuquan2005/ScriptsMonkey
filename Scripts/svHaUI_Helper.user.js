// ==UserScript==
// @name         sv.HaUI
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      1.0.1
// @description  Công cụ hỗ trợ cho sinh viên HaUI
// @author       QuanVu
// @downloadURL  https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/svHaUI_Helper.user.js
// @updateURL    https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/svHaUI_Helper.user.js
// @match        https://sv.haui.edu.vn/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
    "use strict";

    function waitForSelector(selector, timeout = 10000, delay = 10) {
        return new Promise((resolve, reject) => {
            const existing = document.querySelector(selector);
            if (existing) {
                return setTimeout(() => resolve(existing), delay);
            }

            let timeoutId;
            if (timeout > 0) {
                timeoutId = setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Timeout: Không tìm thấy "${selector}" trong ${timeout}ms.`));
                }, timeout);
            }

            const observer = new MutationObserver(() => {
                const el = document.querySelector(selector);
                if (el) {
                    clearTimeout(timeoutId);
                    observer.disconnect();
                    setTimeout(() => resolve(el), delay);
                }
            });

            observer.observe(document.documentElement, {
                childList: true,
                subtree: true,
            });
        });
    }

    function runOnUrl(callback, ...validLinks) {
        const href = window.location.href;
        const pathname = window.location.pathname;

        for (const link of validLinks) {
            if (typeof link === "string") {
                if (link === pathname || link === href || link === "") {
                    console.log(`${callback.name || "'Callback'"} :`, link);
                    return callback();
                }
            } else if (link instanceof RegExp) {
                if (link.test(href)) {
                    console.log(`${callback.name || "'Callback'"} :`, link);
                    return callback();
                }
            }
        }
        console.log(`! ${callback.name || "'Callback'"} :`, validLinks);
    }

    async function fetchDOM(url) {
        try {
            const response = await fetch(url, {
                method: "GET",
                credentials: "include",
                headers: {
                    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "accept-language": "vi,en-US;q=0.9,en;q=0.8",
                    "upgrade-insecure-requests": "1",
                },
            });
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            return doc;
        } catch (err) {
            console.error("Lỗi khi fetch dữ liệu:", err);
            throw err;
        }
    }

    function getTimeDifference(inputDateTime) {
        // Chuyển đổi chuỗi thời gian đầu vào (định dạng: "15h00 01/03/2024")
        const [time, date] = inputDateTime.split(" ");
        const [hour, minute] = time.split("h").map(Number);
        const [day, month, year] = date.split("/").map(Number);

        // Tạo đối tượng Date từ đầu vào (tháng trong JavaScript bắt đầu từ 0)
        const inputDate = new Date(year, month - 1, day, hour, minute);

        const currentDate = new Date();

        // Tính khoảng cách thời gian (miligiây)
        const diffMs = Math.abs(currentDate - inputDate);

        const days = Math.floor(diffMs / 86400000);
        const hours = Math.floor((diffMs % 86400000) / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);

        // Xác định thời gian đầu vào nằm trong quá khứ hay tương lai
        const direction = inputDate < currentDate ? -1 : 1;

        // Trả về kết quả
        return {
            days,
            hours,
            minutes,
            seconds,
            direction,
            toString: ({
                showDays = true,
                showHours = true,
                showMinutes = false,
                showSeconds = false,
            } = {}) => {
                const parts = [];
                if (showDays && days > 0) parts.push(`${days} ngày`);
                if (showHours && hours > 0) parts.push(`${hours} giờ`);
                if (showMinutes && minutes > 0) parts.push(`${minutes} phút`);
                if (showSeconds && seconds > 0) parts.push(`${seconds} giây`);

                const timeString = parts.length > 0 ? parts.join(", ") : "0 giây";
                return inputDate < currentDate ? `${timeString} trước` : `Còn ${timeString}`;
            },
        };
    }

    //===============================================================
    function changeTitle() {
        let title = document.querySelector("span.k-panel-header-text:first-child")?.textContent;
        if (title) {
            title = title
                .replace(/trường đại học công nghiệp hà nội/gi, "🏫")
                .replace(/đại học công nghiệp hà nội/gi, "🏫")
                .replace("CHI TIẾT HỌC PHẦN", "ℹ️")
                .replace("CHI TIẾT", "ℹ️")
                .replace("Kết quả thi các môn", "🎯 Điểm học phần")
                .replace("Kết quả học tập các học phần", "🎯 Điểm TX");
            document.title = title;
        }
    }

    function changeHomePagePath() {
        const sideBar = document.querySelector("div.left-sidebar-content");
        const homeElement = sideBar.querySelector("a[href='/']");
        homeElement.href = "/home";
    }

    function autoSurvey() {
        waitForSelector("table.card-body.table-responsive.table.table-bordered.table-striped").then(
            (el) => {
                const scores = el.querySelectorAll("thead > tr:nth-child(2) > td");
                for (const score of scores) {
                    const scoreId = score.textContent.trim().match(/\d+/)[0];
                    const inputSelectScore = document.createElement("input");
                    inputSelectScore.type = "radio";
                    inputSelectScore.name = "select_score";
                    inputSelectScore.value = scoreId;
                    score.appendChild(inputSelectScore);

                    inputSelectScore.addEventListener("change", function () {
                        const scoreElements = el.querySelectsorAll(
                            `td[title="${scoreId} điểm"] > input`
                        );
                        for (const scoreElement of scoreElements) {
                            scoreElement.checked = true;
                        }
                    });
                }
            }
        );
    }

    function customizeHomePage() {
        const frmMain = document.querySelector("form#frmMain");
        if (frmMain) {
            const html = `
            <div class="panel panel-default panel-border-color panel-border-color-primary">
    			<div id="short-cut-panel">
					<div class="panel-heading">
						<h3 class="panel-title">Chức năng chính</h3>
					</div>

					<ul class="shortcut-list">
						<li>
							<a href="/sso/blearning">
								<svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm0 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
								</svg>
								<span>Học kết hợp</span>
							</a>
						</li>
						<li>
							<a href="/training/viewcourseindustry">
								<svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M4 19h16V5H4v14zm2-12h12v10H6V7z"/>
								</svg>
								<span>Khung chương trình</span>
							</a>
						</li>
						<li>
							<a href="/training/programmodulessemester">
								<svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M5 5v14h14V5H5zm2 2h10v10H7V7z"/>
								</svg>
								<span>Khung theo kỳ</span>
							</a>
						</li>
						<li>
							<a href="/register/dangkyhocphan">
								<svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
								</svg>
								<span>ĐK HP dự kiến</span>
							</a>
						</li>
						<li>
							<a href="/register/">
								<svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M12 8v8m-4-4h8"/>
								</svg>
								<span>Đăng ký học phần</span>
							</a>
						</li>
						<li>
							<a href="/student/result/studyresults">
								<svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
								</svg>
								<span>Kết quả học tập</span>
							</a>
						</li>
						<li>
							<a href="/student/result/examresult">
								<svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2 4h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/>
								</svg>
								<span>Kết quả thi</span>
							</a>
						</li>
					</ul>
				</div>
				
				
				<div id="exam-plan-panel">
					<div class="panel-heading">
						<h3 class="panel-title">
							<svg class="panel-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
							</svg>
							<a href="/student/schedulefees/examplant">Kế hoạch thi</a>
						</h3>
					</div>
					<table class="table table-bordered table-striped">
						<thead>
							<tr class="kTableHeader">
								<th>STT</th>
								<th>Mã lớp độc lập</th>
								<th>Tên học phần</th>
								<th>Ngày thi</th>
								<th>Ca thi</th>
								<th>Lần thi</th>
								<th>Lớp ưu tiên</th>
								<th>Khoa</th>
							</tr>
						</thead>
						<tbody id="exam-plan-body">
						</tbody>
					</table>
				</div>

				<div id="exam-schedule-panel">
					<div class="panel-heading">
						<h3 class="panel-title">
							<svg class="panel-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
							</svg>
							<a href="/student/schedulefees/transactionmodules">Lịch thi</a>
						</h3>
					</div>
					<table class="table table-bordered table-striped">
						<thead>
							<tr class="kTableHeader">
								<th>STT</th>
								<th>Môn thi</th>
								<th>Ngày thi</th>
								<th>Ca thi</th>
								<th>SBD</th>
								<th>Lần thi</th>
								<th>Vị trí thi</th>
								<th>Phòng thi</th>
								<th>Tòa nhà</th>
								<th>Cơ sở</th>
								<th>Tiền VP PVT</th>
								<th>Tham gia thi</th>
								<th>Tình trạng</th>
							</tr>
						</thead>
						<tbody id="exam-schedule-body">
						</tbody>
					</table>
				</div>
			</div>
            `;
            frmMain.innerHTML = html;
            GM_addStyle(`
				.panel {
					border-radius: 8px;
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
					overflow: hidden;
					margin-bottom: 20px;
					padding: 10px;
				}

				.panel-border-color-primary {
					border: 2px solid #eaf3fdff;
				}

				.panel-heading {
					color: black;
					padding: 12px 16px;
					border-bottom: 1px solid #0056b3;
				}

				.panel-title {
					margin: 0;
					font-size: 18px;
					font-weight: 500;
					display: flex;
					align-items: center;
					gap: 8px;
				}

				.panel-title a {
					color: black;
					text-decoration: none;
					transition: color 0.3s;
				}

				.panel-title a:hover {
					color: #3a68ffff;
				}

				.panel-icon {
					stroke: white;
				}

				.shortcut-list {
					list-style: none;
					padding: 0;
					margin: 0;
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
					gap: 10px;
					padding: 16px;
				}

				.shortcut-list li {
					display: flex;
				}

				.shortcut-list a {
					display: flex;
					flex-direction: column;
					align-items: center;
					text-align: center;
					text-decoration: none;
					color: #333;
					padding: 12px;
					border-radius: 6px;
					transition: background-color 0.3s, transform 0.2s;
					width: 100%;
				}

				.shortcut-list a:hover {
					background-color: #f1f5f9;
					transform: translateY(-2px);
				}

				.shortcut-list .icon {
					width: 24px;
					height: 24px;
					margin-bottom: 8px;
					stroke: #007bff;
					transition: stroke 0.3s;
				}

				.shortcut-list a:hover .icon {
					stroke: #0056b3;
				}

				.shortcut-list span {
					font-weight: 400;
					line-height: 1.4;
				}

				.table {
					width: 100%;
					border-collapse: collapse;
					margin: 16px 20px 0;
				}

				.table-bordered th,
				.table-bordered td {
					border: 1px solid #dee2e6;
					padding: 10px;
					text-align: left;
				}

				.table-striped tbody tr:nth-of-type(odd) {
					background-color: #f8f9fa;
				}

				.kTableHeader {
					background-color: #e9ecef;
					font-weight: 500;
					color: #333;
				}

				.table tbody tr:hover {
					background-color: #e0e7ff;
				}

				@media (max-width: 600px) {
					.shortcut-list {
						grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
					}

					.shortcut-list a {
						padding: 8px;
					}

					.shortcut-list span {
						font-size: 0.85rem;
					}

					.table {
						font-size: 0.85rem;
					}

					.table th,
					.table td {
						padding: 8px;
					}
				}
            `);
        }

        showExamPlanInHomePage();
        showExamScheduleInHomePage();
    }

    async function showExamPlanInHomePage() {}

    async function showExamScheduleInHomePage() {
        const examScheduleDOM = await fetchDOM(
            "https://sv.haui.edu.vn/student/schedulefees/transactionmodules"
        );
        const examSchedule = examScheduleDOM.querySelectorAll("tr.kTableAltRow, tr.kTableRow");
        let i = 0;
        let listExamSchedule = [];
        for (const examScheduleElement of examSchedule) {
            const examDate = examScheduleElement.children[2].textContent.trim();
            const examHour = examScheduleElement.children[3].textContent.trim();
            const examTime = `${examHour} ${examDate}`;
            // Kiểm tra thời gian thi
            const diffTime = getTimeDifference(examTime);

            if ((diffTime.direction === -1 && diffTime.days <= 20) || diffTime.direction === 1) {
                i++;
                const checkItem = examScheduleElement.children[13];
                const indexItem = examScheduleElement.children[0];

                checkItem.remove();
                indexItem.textContent = `${i}`;

                if (diffTime.direction === 1) {
                    // Nếu chưa đến ngày thi thì tô màu vàng
                    examScheduleElement.style.backgroundColor = "rgb(248,226,135)";
                    // Hiển thị khoảng cách ngày
                    examScheduleElement.children[2].innerHTML += `<br>(${diffTime.toString()})`;
                } else {
                    // Hiển thị khoảng cách ngày
                    examScheduleElement.children[2].innerHTML += `<br>(${diffTime.toString()})`;
                }

                listExamSchedule.push(examScheduleElement);
                const examScheduleContainer = document.querySelector("#exam-schedule-body");
                examScheduleContainer.appendChild(examScheduleElement);
            }
        }
		if (i === 0) console.warn("Không có lịch thi nào.");
    }

    function sortExamSchedule() {
        // xắp xếp lịch thi
        const examScheduleContainer = document.querySelector(
            "div.kGrid > div > table:nth-child(3) > tbody"
        );
        const examSchedule = document.querySelectorAll("tr.kTableAltRow, tr.kTableRow");
        // console.log("examSchedule: ", examSchedule);
        for (let i = examSchedule.length - 1; i >= 0; i--) {
            examScheduleContainer.appendChild(examSchedule[i]);
        }
    }
    function highlightExamSchedule() {
        const examSchedule = document.querySelectorAll("tr.kTableAltRow, tr.kTableRow");
        for (const examElement of examSchedule) {
            const examDate = examElement.children[2].textContent.trim();
            const examHour = examElement.children[3].textContent.trim();
            const examTime = `${examHour} ${examDate}`;
            // Kiểm tra thời gian thi
            const diffTime = getTimeDifference(examTime);

            if (diffTime.direction === 1) {
                examElement.style.backgroundColor = "rgb(248,226,135)";
                // Hiển thị khoảng cách ngày
                examElement.children[2].innerHTML += `<br>(${diffTime.toString()})`;
            }
        }
    }

    //===============================================================

    function run() {
        console.log("sv.HaUI loaded: " + window.location.href);

        runOnUrl(changeTitle, "");
        runOnUrl(changeHomePagePath, "");

        runOnUrl(autoSurvey, /\/survey\//);

        runOnUrl(customizeHomePage, "/home");

        runOnUrl(sortExamSchedule, "/student/schedulefees/transactionmodules");
        runOnUrl(highlightExamSchedule, "/student/schedulefees/transactionmodules");
    }

    waitForSelector("#frmMain", 5000, 100)
        .then((el) => {
            run();
        })
        .catch((err) => {
            console.error("Lỗi:", err);
        });
    // ================================================================
})();
