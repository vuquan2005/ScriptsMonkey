// ==UserScript==
// @name         sv.HaUI
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      20.16.7
// @description  Công cụ hỗ trợ cho sinh viên HaUI
// @author       QuanVu
// @downloadURL  https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/svHaUI_Helper.user.js
// @updateURL    https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/svHaUI_Helper.user.js
// @match        https://sv.haui.edu.vn/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @require      https://cdn.jsdelivr.net/npm/notyf/notyf.min.js
// ==/UserScript==

(function () {
    "use strict";

    function waitForSelector(selector, timeout = 10000, delay = 10) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                return setTimeout(() => resolve(element), delay);
            }

            let timeoutId;
            if (timeout > 0) {
                timeoutId = setTimeout(() => {
                    observer.disconnect();
                    reject(
                        new Error(`⏱️ Timeout: Không tìm thấy "${selector}" trong ${timeout}ms.`)
                    );
                }, timeout);
            }

            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    clearTimeout(timeoutId);
                    observer.disconnect();
                    setTimeout(() => resolve(element), delay);
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
        const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
        const callbackName = callback.name; // || new Error().stack.replace("Error", "Callback: ");

        for (const link of validLinks) {
            if (typeof link === "string") {
                if (link === pathname || link === href || link === "") {
                    console.log(`✅ ${callbackName} :`, link || "All");
                    return callback();
                }
            } else if (link instanceof RegExp) {
                if (link.test(href)) {
                    console.log(`✅ ${callbackName} :`, link);
                    return callback();
                }
            }
        }
        // console.log(`❌ ${callback.name || "'Callback'"} :`, validLinks);
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
            console.error("❌ Lỗi khi fetch dữ liệu:", err);
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

    // From repo AdBlock
    GM_addStyle(`
        [href="/sso/qpan"],
        #sub_testonline,
        #sub_testonlineqpan,
        #sub_dakltnonline {
            display: none !important;
        }
    `);

    GM_addStyle(`
      @import url("https://cdn.jsdelivr.net/npm/notyf/notyf.min.css");
    `);

    var notyf;

    const creditsBoxColor = {
        "5.0": "rgb(200, 0, 100)",
        "4.0": "rgb(255, 0, 0)",
        "3.0": "rgb(255, 165, 0)",
        "2.0": "rgb(0, 191, 255)",
        "1.0": "rgb(46, 204, 64)",
    };
    const scoresBoxColor = {
        4: "rgb(64,212,81)", // A
        3.5: "rgb(49, 163, 255)", // B+
        3: "rgb(20, 120, 230)", // B
        2.5: "rgb(255,186,0)", // C+
        2: "rgb(255,144,0)", // C
        1.5: "rgb(255, 50, 0)", // D+
        1: "rgb(200, 0, 0)", // D
        0: "rgb(157, 0, 255)", // F
    };

    //===============================================================
    // Sửa tiêu đề trang
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

            title =
                runOnUrl(
                    () => {
                        const kgrid = document.querySelector("div.kGrid");
                        const name = kgrid
                            .querySelector("table > tbody > tr > td:nth-child(2)")
                            .textContent.trim();
                        const className = kgrid
                            .querySelector("table > tbody > tr:nth-child(3) > td:nth-child(2)")
                            .textContent.trim();

                        title = title.replace("🎯 Điểm học phần", "🎯 Điểm: ");
                        title = title.replace("Kết quả học tập các môn", "🎯 Điểm TX: ");

                        return (
                            title + " " + (name ? name : "") + ": " + (className ? className : "")
                        );
                    },
                    "/student/result/viewexamresult",
                    "/student/result/viewstudyresult"
                ) || title;

            title =
                runOnUrl(
                    () => {
                        const className = document
                            .querySelector("table > tbody > tr > td:nth-child(2)")
                            .textContent.trim();
                        const classCode = document
                            .querySelector("table > tbody > tr:nth-child(3) > td:nth-child(2)")
                            .textContent.trim();

                        title = title.replace("Kết quả học tập trên lớp", "🎯 Điểm TX: ");
                        title = title.replace("Bảng kết quả thi", "🎯 Điểm thi: ");

                        return (
                            title +
                            " " +
                            (className ? className : "") +
                            ": " +
                            (classCode ? classCode : "")
                        );
                    },
                    "/student/result/viewexamresultclass",
                    "/student/result/viewstudyresultclass"
                ) || title;

            document.title = title;
        }
    }

    // Thay đổi đường dẫn trang chủ
    function changeHomePagePath() {
        const homeElement = document.querySelector("div.left-sidebar-content a[href='/']");
        homeElement.href = "/home";
        const logo = document.querySelector(".navbar-brand");
        logo.href = "/home";
    }

    // Hiển thị GPA trên thanh menu
    function displayGPA() {
        const info = GM_getValue("yourInfo") || {};
        const menuTitle = document.querySelector("ul.sidebar-elements");

        const container = document.createElement("li");
        container.className = "bar-container";
        container.innerHTML = `
			<div><a class="bar-data" href="/student/result/examresult">GPA: ${
                info.currentGPA || "..."
            }</a></div>
			<div><a class="bar-data" href="/training/viewcourseindustry">${info.currentCredits || "..."} / ${
            info.totalCredits || "..."
        }</a></div>
		`;
        menuTitle.insertAdjacentElement("afterbegin", container);

        GM_addStyle(`
			.bar-container {
				width: 80%;
				margin: auto;
				display: flex;
			}
			.bar-data {
				color: #1c274d;
				font-size: 14px;
				font-weight: bold;
				padding: 10px;
				margin: auto;
				background-color: white;
				border-radius: 8px;
				text-align: center;
				display: inline-block;
			}
		`);
    }

    // Khảo sát nhanh
    function fastSurvey() {
        waitForSelector("table.card-body.table-responsive.table.table-bordered.table-striped").then(
            (element) => {
                const scores = element.querySelectorAll("thead > tr:nth-child(2) > td");
                for (const score of scores) {
                    const scoreId = score.textContent.trim().match(/\d+/)[0];
                    const inputSelectScore = document.createElement("input");
                    inputSelectScore.type = "radio";
                    inputSelectScore.name = "select_score";
                    inputSelectScore.value = scoreId;
                    score.prepend(inputSelectScore);

                    inputSelectScore.addEventListener("change", function () {
                        const scoreElements = element.querySelectorAll(
                            `td[title="${scoreId} điểm"] > input`
                        );
                        for (const scoreElement of scoreElements) {
                            scoreElement.checked = true;
                        }
                        notyf.success(`Đã chọn ${scoreId} điểm`);
                    });
                }
            }
        );
    }

    // Hỗ trợ captcha
    function captchaHelper(captchaInput, captchaSubmit) {
        captchaInput.style.textTransform = "lowercase";

        captchaInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                if (captchaInput.value.length == 5) captchaInput.blur();
            }
        });

        captchaInput.addEventListener("blur", (e) => {
            captchaInput.value = captchaInput.value.trim().toLowerCase();
            captchaInput.value = captchaInput.value
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/đ/g, "d");
            if (captchaInput.value.length == 5) captchaSubmit.click();
        });
    }

    function captchaHelperLogin() {
        captchaHelper(
            document.querySelector("input#ctl00_txtimgcode"),
            document.querySelector("input#ctl00_butLogin")
        );
    }

    function captchaHelperRegister() {
        captchaHelper(
            document.querySelector("input#ctl02_txtimgcode"),
            document.querySelector("input#ctl02_btnSubmit")
        );
    }

    // Tùy biến trang chủ
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
								<svg xmlns="http://www.w3.org/2000/svg" class="shortcut-icon" version="1.1" viewBox="144 144 512 512">
									<defs>
										<style>.cls-1{fill:#ff7900;}</style>
									</defs>
									<path class="cls-1" d="m183.92 148.09c-19.652 0-35.828 16.176-35.828 35.828v261.88h22.902v-261.88c0-7.3633 5.5625-12.926 12.926-12.926h432.16c7.3594 0 12.926 5.5625 12.926 12.926v284.78h-480.91v44.324c0 19.652 16.176 35.828 35.828 35.828h156.01l-17.824 80.152h-59.508v22.902h274.8v-22.902h-59.242l-17.824-80.152h155.74c19.648 0 35.824-16.176 35.824-35.828v-329.1c0-19.652-16.176-35.828-35.824-35.828zm-12.926 343.51h458.01v21.426c0 7.3555-5.5664 12.922-12.926 12.922h-432.16c-7.3633 0-12.926-5.5664-12.926-12.926zm192.39 57.25h73.488l17.824 80.152h-109.14z"/>
									<path class="cls-1" d="m400.11 205.23c-1.4336 0.035156-2.9062 0.35547-4.1367 0.84766l-137.4 51.527c-9.8711 3.7305-9.8711 17.695 0 21.426l49.402 18.516v79.547c0 4.1172 2.2109 7.918 5.7891 9.9531l80.578 45.801c3.5078 1.9922 7.8086 1.9922 11.316 0l80.578-45.801h-0.003906c3.582-2.0352 5.793-5.8359 5.793-9.9531v-79.547l33.926-12.727v69.375h22.902v-85.875c-0.078124-5.8086-3.6758-8.8359-7.4258-10.711l-137.4-51.527c-1.0898-0.64844-2.4805-0.88672-3.9141-0.84766zm-0.10938 23.77 104.82 39.316-104.82 39.293-104.82-39.293zm-69.125 77.133 65.102 24.422c2.5938 0.97266 5.457 0.97266 8.0508 0l65.102-24.422v64.297l-69.129 39.293-69.129-39.293z"/>
								</svg>
								<span>Học kết hợp</span>
							</a>
						</li>
						<li>
							<a href="/timestable/calendarcl">
								<svg xmlns="http://www.w3.org/2000/svg" class="shortcut-icon" viewBox="0 0 25 25">
									<defs>
										<style>.cls-1{fill:#ff7900;}</style>
									</defs>
									<g data-name="calendar 2" id="calendar_2">
										<path class="cls-1" d="M23,8.52l.84-5.84A1.48,1.48,0,0,0,22.38,1H2.62A1.48,1.48,0,0,0,1.16,2.68L2,8.52l-.92,11.9A1.47,1.47,0,0,0,2.55,22H3v1.05A1,1,0,0,0,4,24h17.1a1,1,0,0,0,.95-.95V22h.45a1.47,1.47,0,0,0,1.47-1.58ZM2.26,2.16A.48.48,0,0,1,2.62,2H22.38a.48.48,0,0,1,.36.16.48.48,0,0,1,.11.38L22.07,8H19V7.5a.5.5,0,0,0-1,0V8H15V7.5a.5.5,0,0,0-1,0V8H11V7.5a.5.5,0,0,0-1,0V8H7V7.5a.5.5,0,0,0-1,0V8H2.93L2.15,2.54A.48.48,0,0,1,2.26,2.16ZM21,23,4,23.05V22H21Zm1.8-2.15a.47.47,0,0,1-.35.15H2.55a.47.47,0,0,1-.35-.15.48.48,0,0,1-.12-.36L3,9H6v.5a.5.5,0,0,0,1,0V9h3v.5a.5.5,0,0,0,1,0V9h3v.5a.5.5,0,0,0,1,0V9h3v.5a.5.5,0,0,0,1,0V9h3l.88,11.49A.48.48,0,0,1,22.8,20.85Z"/>
										<path class="cls-1" d="M10.43,11.84H9.77a.3.3,0,0,0-.13.06L7.41,13.63a.24.24,0,0,0-.09.15.24.24,0,0,0,0,.18l.27.34a.18.18,0,0,0,.15.09A.22.22,0,0,0,8,14.34L9.65,13v5.73a.21.21,0,0,0,.07.17.24.24,0,0,0,.17.07h.54a.26.26,0,0,0,.17-.07.24.24,0,0,0,.06-.17V12.07a.21.21,0,0,0-.23-.23Z"/>
										<path class="cls-1" d="M17.12,13.44a2.62,2.62,0,0,0-.45-.88,2,2,0,0,0-.8-.6,2.81,2.81,0,0,0-1.19-.22A2.83,2.83,0,0,0,13.5,12a2,2,0,0,0-.79.6,2.47,2.47,0,0,0-.46.88,4.13,4.13,0,0,0-.15,1.07c0,.19,0,.39,0,.6v.62c0,.21,0,.4,0,.59a4.52,4.52,0,0,0,.15,1.06,2.58,2.58,0,0,0,.45.89,2.1,2.1,0,0,0,.79.61,3.36,3.36,0,0,0,2.39,0,2,2,0,0,0,.79-.61,2.77,2.77,0,0,0,.45-.89,4.05,4.05,0,0,0,.16-1.06c0-.19,0-.38,0-.59v-.62c0-.21,0-.41,0-.6A4.13,4.13,0,0,0,17.12,13.44Zm-.84,2.25c0,.19,0,.38,0,.58a2.43,2.43,0,0,1-.4,1.43,1.38,1.38,0,0,1-1.18.52,1.38,1.38,0,0,1-1.16-.52,2.43,2.43,0,0,1-.41-1.43c0-.2,0-.39,0-.58v-.56c0-.19,0-.38,0-.56a2.55,2.55,0,0,1,.4-1.43,1.35,1.35,0,0,1,1.17-.54,1.34,1.34,0,0,1,1.18.54,2.47,2.47,0,0,1,.4,1.43c0,.18,0,.37,0,.56Z"/>
									</g>
									</svg>
								<span>Thời khoá biểu</span>
							</a>
						</li>
						<li>
							<a href="/training/viewcourseindustry">
								<svg xmlns="http://www.w3.org/2000/svg" class="shortcut-icon" viewBox="0 0 24 24" fill="none">
									<path d="M10 22C7.17157 22 5.75736 22 4.87868 21.1213C4 20.2426 4 18.8284 4 16V8C4 5.17157 4 3.75736 4.87868 2.87868C5.75736 2 7.17157 2 10 2H14C16.8284 2 18.2426 2 19.1213 2.87868C20 3.75736 20 5.17157 20 8M14 22C16.8284 22 18.2426 22 19.1213 21.1213C20 20.2426 20 18.8284 20 16V12" stroke="#0F0F0F"/>
									<path d="M19.8978 16H7.89778C6.96781 16 6.50282 16 6.12132 16.1022C5.08604 16.3796 4.2774 17.1883 4 18.2235" stroke="#0F0F0F"/>
									<path d="M7 16V9M7 2.5V5" stroke="#0F0F0F" />
									<path d="M13 16V19.5309C13 19.8065 13 19.9443 12.9051 20C12.8103 20.0557 12.6806 19.9941 12.4211 19.8708L11.1789 19.2808C11.0911 19.2391 11.0472 19.2182 11 19.2182C10.9528 19.2182 10.9089 19.2391 10.8211 19.2808L9.57889 19.8708C9.31943 19.9941 9.18971 20.0557 9.09485 20C9 19.9443 9 19.8065 9 19.5309V16.45" stroke="#0F0F0F"/>
								</svg>
								<span>Khung chương trình</span>
							</a>
						</li>
						<li>
							<a href="/training/programmodulessemester">
								<svg xmlns="http://www.w3.org/2000/svg" class="shortcut-icon" viewBox="0 0 24 24" fill="none">
									<path d="M19.8978 16H7.89778C6.96781 16 6.50282 16 6.12132 16.1022C5.08604 16.3796 4.2774 17.1883 4 18.2235" stroke="#0F0F0F"/>
									<path d="M8 7H16" stroke="#0F0F0F" />
									<path d="M8 10.5H13" stroke="#000000ff" />
									<path d="M13 16V19.5309C13 19.8065 13 19.9443 12.9051 20C12.8103 20.0557 12.6806 19.9941 12.4211 19.8708L11.1789 19.2808C11.0911 19.2391 11.0472 19.2182 11 19.2182C10.9528 19.2182 10.9089 19.2391 10.8211 19.2808L9.57889 19.8708C9.31943 19.9941 9.18971 20.0557 9.09485 20C9 19.9443 9 19.8065 9 19.5309V16.45" stroke="#0F0F0F"/>
									<path d="M10 22C7.17157 22 5.75736 22 4.87868 21.1213C4 20.2426 4 18.8284 4 16V8C4 5.17157 4 3.75736 4.87868 2.87868C5.75736 2 7.17157 2 10 2H14C16.8284 2 18.2426 2 19.1213 2.87868C20 3.75736 20 5.17157 20 8M14 22C16.8284 22 18.2426 22 19.1213 21.1213C20 20.2426 20 18.8284 20 16V12" stroke="#0F0F0F"/>
								</svg>
								<span>Khung theo kỳ</span>
							</a>
						</li>
						<li>
							<a href="/register/dangkyhocphan">
								<svg xmlns="http://www.w3.org/2000/svg" class="shortcut-icon" viewBox="0 0 25 25">
									<defs>
										<style>.cls-1{fill:#ff7900;}</style>
									</defs>
									<g id="schedule">
										<path class="cls-1" d="M22.5,3H21V2a1,1,0,0,0-1-1H19a1,1,0,0,0-1,1V3H14V2a1,1,0,0,0-1-1H12a1,1,0,0,0-1,1V3H7V2A1,1,0,0,0,6,1H5A1,1,0,0,0,4,2V3H2.5A1.5,1.5,0,0,0,1,4.5v18A1.5,1.5,0,0,0,2.5,24h16A5.51,5.51,0,0,0,24,18.5s0-.08,0-.13,0,0,0,0V4.5A1.5,1.5,0,0,0,22.5,3ZM19,2l1,0,0,3L19,5ZM12,2l1,0V3.44s0,0,0,.06,0,0,0,.07L13,5,12,5ZM5,2,6,2,6,5,5,5ZM2.5,4H4V5A1,1,0,0,0,5,6H6A1,1,0,0,0,7,5V4h4V5a1,1,0,0,0,1,1H13a1,1,0,0,0,1-1V4h4V5a1,1,0,0,0,1,1H20a1,1,0,0,0,1-1V4h1.5a.5.5,0,0,1,.5.5V8H2V4.5A.5.5,0,0,1,2.5,4Zm16,19A4.5,4.5,0,1,1,23,18.5,4.51,4.51,0,0,1,18.5,23Zm0-10a5.49,5.49,0,0,0-3.15,10H2.5a.5.5,0,0,1-.5-.5V9H23v6.35A5.49,5.49,0,0,0,18.5,13Z"/>
										<path class="cls-1" d="M20.72,19.05,19,18.19V16.5a.5.5,0,0,0-1,0v2a.51.51,0,0,0,.28.45l2,1a.54.54,0,0,0,.22.05.5.5,0,0,0,.22-.95Z"/>
									</g>
								</svg>
								<span>ĐK HP dự kiến</span>
							</a>
						</li>
						<li>
							<a href="/register/">
								<svg xmlns="http://www.w3.org/2000/svg" class="shortcut-icon" viewBox="0 0 25 25">
									<defs>
										<style>.cls-1{fill:#ff7900;}</style>
									</defs>
									<g data-name="calendar plus" id="calendar_plus">
										<path class="cls-1" d="M22.5,3H21V2a1,1,0,0,0-1-1H19a1,1,0,0,0-1,1V3H14V2a1,1,0,0,0-1-1H12a1,1,0,0,0-1,1V3H7V2A1,1,0,0,0,6,1H5A1,1,0,0,0,4,2V3H2.5A1.5,1.5,0,0,0,1,4.5v18A1.5,1.5,0,0,0,2.5,24h16A5.51,5.51,0,0,0,24,18.5s0-.08,0-.13,0,0,0,0V4.5A1.5,1.5,0,0,0,22.5,3ZM19,2l1,0,0,3L19,5ZM12,2l1,0V3.44s0,0,0,.06,0,0,0,.07L13,5,12,5ZM5,2,6,2,6,5,5,5ZM2.5,4H4V5A1,1,0,0,0,5,6H6A1,1,0,0,0,7,5V4h4V5a1,1,0,0,0,1,1H13a1,1,0,0,0,1-1V4h4V5a1,1,0,0,0,1,1H20a1,1,0,0,0,1-1V4h1.5a.5.5,0,0,1,.5.5V8H2V4.5A.5.5,0,0,1,2.5,4Zm16,19A4.5,4.5,0,1,1,23,18.5,4.51,4.51,0,0,1,18.5,23Zm0-10a5.49,5.49,0,0,0-3.15,10H2.5a.5.5,0,0,1-.5-.5V9H23v6.35A5.49,5.49,0,0,0,18.5,13Z"/>
										<path class="cls-1" d="M20.5,18H19V16.5a.5.5,0,0,0-1,0V18H16.5a.5.5,0,0,0,0,1H18v1.5a.5.5,0,0,0,1,0V19h1.5a.5.5,0,0,0,0-1Z"/>
									</g>
								</svg>
								<span>Đăng ký học phần</span>
							</a>
						</li>
						<li>
							<a href="/student/result/studyresults">
								<svg xmlns="http://www.w3.org/2000/svg" class="shortcut-icon" viewBox="0 0 24 24" fill="none">
									<path d="M19.7781 1.39348C20.1686 1.00295 20.8018 1.00295 21.1923 1.39348L22.6066 2.80769C22.9971 3.19822 22.9971 3.83138 22.6066 4.22191C22.216 4.61243 21.5829 4.61243 21.1923 4.22191L19.7781 2.80769C19.3876 2.41717 19.3876 1.784 19.7781 1.39348Z" fill="#0F0F0F"/>
									<path d="M16.2425 2.10051C16.633 1.70999 17.2662 1.70999 17.6567 2.10051L21.8993 6.34315C22.2899 6.73368 22.2899 7.36684 21.8993 7.75736C21.5088 8.14789 20.8756 8.14789 20.4851 7.75736L16.2425 3.51472C15.852 3.1242 15.852 2.49103 16.2425 2.10051Z" fill="#0F0F0F"/>
									<path d="M16.9497 8.46463L8.46451 16.9498L10.5858 19.0711C10.9763 19.4616 10.9763 20.0948 10.5858 20.4853C10.1952 20.8758 9.56207 20.8758 9.17155 20.4853L3.5147 14.8284C3.12417 14.4379 3.12417 13.8048 3.51469 13.4142C3.90522 13.0237 4.53838 13.0237 4.92891 13.4142L7.05029 15.5356L15.5355 7.05041L13.4141 4.92903C13.0236 4.53851 13.0236 3.90534 13.4141 3.51482C13.8046 3.12429 14.4378 3.12429 14.8283 3.51482L20.4852 9.17167C20.8757 9.56219 20.8757 10.1954 20.4852 10.5859C20.0947 10.9764 19.4615 10.9764 19.071 10.5859L16.9497 8.46463Z" fill="#0F0F0F"/>
									<path d="M3.5146 16.2428C3.12408 15.8523 2.49091 15.8523 2.10039 16.2428C1.70986 16.6334 1.70986 17.2665 2.10039 17.6571L6.34303 21.8997C6.73355 22.2902 7.36672 22.2902 7.75724 21.8997C8.14777 21.5092 8.14777 20.876 7.75724 20.4855L3.5146 16.2428Z" fill="#0F0F0F"/>
									<path d="M2.80757 19.7782C2.41705 19.3877 1.78388 19.3877 1.39336 19.7782C1.00283 20.1688 1.00283 20.8019 1.39336 21.1925L2.80757 22.6067C3.1981 22.9972 3.83126 22.9972 4.22178 22.6067C4.61231 22.2161 4.61231 21.583 4.22178 21.1925L2.80757 19.7782Z" fill="#0F0F0F"/>
								</svg>
								<span>Kết quả học tập</span>
							</a>
						</li>
						<li>
							<a href="/student/result/examresult">
								<svg xmlns="http://www.w3.org/2000/svg" class="shortcut-icon" viewBox="0 0 24 24" fill="none">
									<defs>
										<style>.cls-1{fill:#ff7900;}</style>
									</defs>
									<path class="cls-1" fill-rule="evenodd" clip-rule="evenodd" d="M5 4C5 2.34315 6.34315 1 8 1H15.9999C17.6568 1 19 2.34314 19 4H20C21.6569 4 23 5.34315 23 7V7.64593C23 8.87265 22.2531 9.97577 21.1142 10.4314L18.031 11.6646C17.5965 12.464 16.958 13.2715 16.0234 13.8946C15.211 14.4361 14.2124 14.8132 13 14.9467V17H15C16.6569 17 18 18.3431 18 20V21C18 22.1046 17.1046 23 16 23H8C6.89543 23 6 22.1046 6 21V20C6 18.3431 7.34315 17 9 17H11V14.9467C9.78757 14.8133 8.7889 14.4361 7.97651 13.8945C7.04188 13.2715 6.40335 12.464 5.9689 11.6646L2.88583 10.4314C1.74685 9.97577 1 8.87265 1 7.64593V7C1 5.34315 2.34315 4 4 4H5ZM5 6H4C3.44772 6 3 6.44772 3 7V7.64593C3 8.05484 3.24895 8.42255 3.62861 8.57441L5.11907 9.1706C5.05194 8.78628 5.00063 8.39214 5 8.00104L5 6ZM19 8V6H20C20.5523 6 21 6.44772 21 7V7.64593C21 8.05484 20.751 8.42255 20.3714 8.57441L18.8809 9.17062C18.9469 8.78361 19 8.39286 19 8ZM8 3C7.44772 3 7 3.44772 7 4V7.99707L7 7.99832C7 7.99996 7 8.00078 7 7.99832C7.00508 8.25761 7.03756 8.51764 7.08014 8.77311C7.16297 9.27012 7.32677 9.91751 7.6444 10.5528C7.96008 11.1842 8.4179 11.7851 9.08591 12.2305C9.74766 12.6716 10.6749 13 12 13C13.325 13 14.2522 12.6716 14.914 12.2304C15.582 11.7851 16.0398 11.1842 16.3555 10.5528C16.6732 9.9175 16.837 9.27011 16.9198 8.7731C16.9624 8.51735 16.993 8.25848 17 7.99909V4C17 3.44772 16.5522 3 15.9999 3H8ZM9 19C8.44772 19 8 19.4477 8 20V21H16V20C16 19.4477 15.5523 19 15 19H9Z"/>
								</svg>
								<span>Kết quả thi</span>
							</a>
						</li>
						<li>
							<a href="/student/result/viewmodules">
								<svg xmlns="http://www.w3.org/2000/svg" class="shortcut-icon" viewBox="0 0 25 25" fill="none">
									<path d="M21 10L12 5L3 10L6 11.6667M21 10L18 11.6667M21 10V10C21.6129 10.3064 22 10.9328 22 11.618V16.9998M6 11.6667L12 15L18 11.6667M6 11.6667V17.6667L12 21L18 17.6667L18 11.6667" stroke="#0F0F0F" stroke-width="1.1"/>
								</svg>
								<span>GPA</span>
							</a>
						</li>
					</ul>
				</div>
				
				
				<div id="exam-plan-panel">
					<div class="panel-heading">
						<h3 class="panel-title">
							<svg xmlns="http://www.w3.org/2000/svg" id="exam-plan-icon" class="shortcut-icon" viewBox="0 0 25 25">
								<defs>
									<style>.cls-1{fill:#000000;}</style>
								</defs>
								<g data-name="calendar date" id="calendar_date">
									<path class="cls-1" d="M22.5,3H21V2a1,1,0,0,0-1-1H19a1,1,0,0,0-1,1V3H14V2a1,1,0,0,0-1-1H12a1,1,0,0,0-1,1V3H7V2A1,1,0,0,0,6,1H5A1,1,0,0,0,4,2V3H2.5A1.5,1.5,0,0,0,1,4.5v18A1.5,1.5,0,0,0,2.5,24h20A1.5,1.5,0,0,0,24,22.5V4.5A1.5,1.5,0,0,0,22.5,3ZM19,2l1,0,0,3L19,5ZM12,2l1,0V3.44s0,0,0,.06,0,0,0,.07L13,5,12,5ZM5,2,6,2,6,5,5,5ZM2.5,4H4V5A1,1,0,0,0,5,6H6A1,1,0,0,0,7,5V4h4V5a1,1,0,0,0,1,1H13a1,1,0,0,0,1-1V4h4V5a1,1,0,0,0,1,1H20a1,1,0,0,0,1-1V4h1.5a.5.5,0,0,1,.5.5V8H2V4.5A.5.5,0,0,1,2.5,4Zm20,19H2.5a.5.5,0,0,1-.5-.5V9H23V22.5A.5.5,0,0,1,22.5,23Z"/>
									<path class="cls-1" d="M20.5,15h-6a.5.5,0,0,0-.5.5v5a.5.5,0,0,0,.5.5h6a.5.5,0,0,0,.5-.5v-5A.5.5,0,0,0,20.5,15ZM20,20H15V16h5Z"/>
									<path class="cls-1" d="M6.5,11h-2a.5.5,0,0,0-.5.5v2a.5.5,0,0,0,.5.5h2a.5.5,0,0,0,.5-.5v-2A.5.5,0,0,0,6.5,11ZM6,13H5V12H6Z"/>
									<path class="cls-1" d="M10.5,11h-2a.5.5,0,0,0-.5.5v2a.5.5,0,0,0,.5.5h2a.5.5,0,0,0,.5-.5v-2A.5.5,0,0,0,10.5,11ZM10,13H9V12h1Z"/>
									<path class="cls-1" d="M6.5,16h-2a.5.5,0,0,0-.5.5v2a.5.5,0,0,0,.5.5h2a.5.5,0,0,0,.5-.5v-2A.5.5,0,0,0,6.5,16ZM6,18H5V17H6Z"/>
									<path class="cls-1" d="M10.5,16h-2a.5.5,0,0,0-.5.5v2a.5.5,0,0,0,.5.5h2a.5.5,0,0,0,.5-.5v-2A.5.5,0,0,0,10.5,16ZM10,18H9V17h1Z"/>
									<path class="cls-1" d="M14.5,14h2a.5.5,0,0,0,.5-.5v-2a.5.5,0,0,0-.5-.5h-2a.5.5,0,0,0-.5.5v2A.5.5,0,0,0,14.5,14Zm.5-2h1v1H15Z"/>
									<path class="cls-1" d="M20.5,11h-2a.5.5,0,0,0-.5.5v2a.5.5,0,0,0,.5.5h2a.5.5,0,0,0,.5-.5v-2A.5.5,0,0,0,20.5,11ZM20,13H19V12h1Z"/>
								</g>
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
							<svg xmlns="http://www.w3.org/2000/svg" id="exam-schedule-icon" class="shortcut-icon" viewBox="0 0 25 25">
								<defs>
									<style>.cls-1{fill:#000000;}</style>
								</defs>
								<g data-name="calendar number" id="calendar_number">
									<path class="cls-1" d="M22.5,3H21V2a1,1,0,0,0-1-1H19a1,1,0,0,0-1,1V3H14V2a1,1,0,0,0-1-1H12a1,1,0,0,0-1,1V3H7V2A1,1,0,0,0,6,1H5A1,1,0,0,0,4,2V3H2.5A1.5,1.5,0,0,0,1,4.5v18A1.5,1.5,0,0,0,2.5,24h20A1.5,1.5,0,0,0,24,22.5V4.5A1.5,1.5,0,0,0,22.5,3ZM19,2l1,0,0,3L19,5ZM12,2l1,0V3.44s0,0,0,.06,0,0,0,.07L13,5,12,5ZM5,2,6,2,6,5,5,5ZM2.5,4H4V5A1,1,0,0,0,5,6H6A1,1,0,0,0,7,5V4h4V5a1,1,0,0,0,1,1H13a1,1,0,0,0,1-1V4h4V5a1,1,0,0,0,1,1H20a1,1,0,0,0,1-1V4h1.5a.5.5,0,0,1,.5.5V8H2V4.5A.5.5,0,0,1,2.5,4Zm20,19H2.5a.5.5,0,0,1-.5-.5V9H23V22.5A.5.5,0,0,1,22.5,23Z"/>
									<path class="cls-1" d="M10.62,15.89a3.55,3.55,0,0,0-1.28-.27H9.16l2.14-2.38.09-.12a.29.29,0,0,0,0-.14v-.39a.26.26,0,0,0-.07-.2.25.25,0,0,0-.19-.07H6.73a.24.24,0,0,0-.18.07.26.26,0,0,0-.07.2V13a.25.25,0,0,0,.07.19.28.28,0,0,0,.18.06H10L7.85,15.6l-.08.13a.33.33,0,0,0,0,.17v.3a.27.27,0,0,0,.07.19.29.29,0,0,0,.19.07H9a2,2,0,0,1,1.2.31,1.17,1.17,0,0,1,.43,1,1.26,1.26,0,0,1-.48,1.07A1.93,1.93,0,0,1,9,19.24a3.53,3.53,0,0,1-.72-.08,1.53,1.53,0,0,1-.64-.31,1.15,1.15,0,0,1-.38-.62A.31.31,0,0,0,7.08,18,.27.27,0,0,0,6.9,18H6.36a.24.24,0,0,0-.17.06.22.22,0,0,0-.07.16,1.65,1.65,0,0,0,.2.7,1.91,1.91,0,0,0,.54.64,2.56,2.56,0,0,0,.87.46A3.79,3.79,0,0,0,9,20.18a3.55,3.55,0,0,0,1.46-.28,2.42,2.42,0,0,0,1-.8,2.12,2.12,0,0,0,.37-1.27,2.15,2.15,0,0,0-.31-1.21A1.85,1.85,0,0,0,10.62,15.89Z"/>
									<path class="cls-1" d="M18.47,14.05a2.73,2.73,0,0,0-.49-1,2.26,2.26,0,0,0-.86-.65,3.1,3.1,0,0,0-1.29-.24,3,3,0,0,0-1.28.24,2.26,2.26,0,0,0-.86.65,2.93,2.93,0,0,0-.5,1A4.76,4.76,0,0,0,13,15.2c0,.21,0,.43,0,.66s0,.45,0,.67,0,.44,0,.64a5.31,5.31,0,0,0,.17,1.15,2.69,2.69,0,0,0,.49,1,2.09,2.09,0,0,0,.86.65,3.1,3.1,0,0,0,1.29.24,3.11,3.11,0,0,0,1.3-.24,2.06,2.06,0,0,0,.85-.65,2.86,2.86,0,0,0,.49-1,4,4,0,0,0,.17-1.15c0-.2,0-.41,0-.64s0-.44,0-.67,0-.45,0-.66A4,4,0,0,0,18.47,14.05Zm-.91,2.43c0,.21,0,.42,0,.63a2.59,2.59,0,0,1-.43,1.55,1.49,1.49,0,0,1-1.28.57,1.48,1.48,0,0,1-1.27-.57,2.59,2.59,0,0,1-.44-1.55c0-.21,0-.42,0-.63v-.6c0-.21,0-.41,0-.61a2.68,2.68,0,0,1,.44-1.55,1.44,1.44,0,0,1,1.27-.58,1.47,1.47,0,0,1,1.28.58,2.68,2.68,0,0,1,.43,1.55c0,.2,0,.4,0,.61Z"/>
								</g>
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
					grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
					gap: 10px;
					padding: 16px;
				}

				.shortcut-list li {
					display: flex;
				}

				.shortcut-list a {
					font-size: 1.5rem;
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
					color: #3a68ffff;
					background-color: #f1f5f9;
					transform: translateY(-2px);
				}

				.shortcut-list a:hover .icon {
					stroke: #0056b3;
				}

				.shortcut-list span {
					font-weight: 400;
					line-height: 1.4;
				}

				.shortcut-icon {
					width: 40px;
					height: 40px;
					margin-bottom: 5px;
					transition: transform 0.2s;
				}

				.shortcut-icon:hover {
					transform: translateY(-3px);
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
						grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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

        const autoCheckExamPlan = GM_getValue("autoCheckExamPlan");
        console.log("Auto check exam plan, exam schedule: ", autoCheckExamPlan);
        if (autoCheckExamPlan == undefined)
            GM_setValue("autoCheckExamPlan", confirm("Bạn có muốn tự động kiểm tra lịch thi?"));
        if (GM_getValue("autoCheckExamPlan") === true) {
            showExamPlanInHomePage();
            showExamScheduleInHomePage();
        }

        document.querySelector("#exam-schedule-icon").addEventListener("click", () => {
            showExamScheduleInHomePage();
        });

        document.querySelector("#exam-plan-icon").addEventListener("click", () => {
            showExamPlanInHomePage();
        });
    }

    // Hiển thị kế hoạch thi
    async function showExamPlanInHomePage() {
        const examPlanDOM = await fetchDOM("https://sv.haui.edu.vn/student/schedulefees/examplant");
        let listCourseCode = getCourseCode(examPlanDOM);
        // Lấy 13 học phần gần nhất
        listCourseCode = listCourseCode.slice(0, 12);
        const examScheduleContainer = document.querySelector("#exam-plan-body");
        let i = 0;
        for (const courseCode of listCourseCode) {
            let examPlan = await getExamPlan(courseCode);
            // console.log(courseCode, " : " , examPlan);
            // Nếu không có lịch
            if (examPlan == null) continue;
            // Hiển thị kế hoạch thi

            const examDate = examPlan.children[3].textContent.trim();
            const examHour = examPlan.children[4].textContent.trim();
            const examTime = `${examHour} ${examDate}`;
            // Kiểm tra thời gian thi
            const diffTime = getTimeDifference(examTime);

            if ((diffTime.direction === -1 && diffTime.days <= 20) || diffTime.direction === 1) {
                i++;
                const indexItem = examPlan.children[0];

                indexItem.textContent = `${i}`;

                // Tô màu sắp thi
                if (diffTime.direction === 1 && diffTime.days <= 7)
                    examPlan.style.backgroundColor = "#f89c87";
                else if (diffTime.direction === 1)
                    examPlan.style.backgroundColor = "#f8e287";

                // Hiển thị khoảng cách ngày
                examPlan.children[2].innerHTML += `<br>(${diffTime.toString()})`;

                examScheduleContainer.appendChild(examPlan);
            }
            await delay(10);
        }

        if (i === 0) notyf.error("Không có kế hoạch thi");
        else notyf.success("Đã lấy thành công kế hoạch thi");
    }

    // Hiển thị lịch thi
    async function showExamScheduleInHomePage() {
        const examScheduleDOM = await fetchDOM(
            "https://sv.haui.edu.vn/student/schedulefees/transactionmodules"
        );
        const examScheduleContainer = document.querySelector("#exam-schedule-body");

        const examSchedule = examScheduleDOM.querySelectorAll("tr.kTableAltRow, tr.kTableRow");
        let i = 0;
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

                // Tô màu sắp thi
                if (diffTime.direction === 1 && diffTime.days <= 7)
                    examScheduleElement.style.backgroundColor = "#f89c87";
                else if (diffTime.direction === 1)
                    examScheduleElement.style.backgroundColor = "#f8e287";

                // Hiển thị khoảng cách ngày
                examScheduleElement.children[2].innerHTML += `<br>(${diffTime.toString()})`;

                examScheduleContainer.appendChild(examScheduleElement);
            }
        }

        if (i === 0) notyf.error("Không có lịch thi");
        else notyf.success("Đã lấy thành công lịch thi");
    }

    // Xắp xếp lịch thi
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

    // Tô màu lịch thi
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

    // Lấy mã học phần từ trang kế hoạch thi
    function getCourseCode(scope = document) {
        const listCourseCodeElement = scope.querySelectorAll(
            "div:nth-child(3) > div > div > table > tbody > tr > td:nth-child(2) > a"
        );
        let listHPCode = [];
        for (const element of listCourseCodeElement) {
            const hpCode = element.textContent.trim();
            if (hpCode) {
                listHPCode.push(hpCode);
            }
        }
        listHPCode.reverse();
        return listHPCode;
    }

    // Lấy kế hoạch thi của học phần
    async function getExamPlan(courseCode) {
        const url = `https://sv.haui.edu.vn/student/schedulefees/examplant?code=${courseCode}`;
        try {
            const dom = await fetchDOM(url);
            return dom.querySelector("#ctl02_ctl00_viewResult > div > div > table > tbody > tr");
        } catch (err) {
            console.error(`❌ Lỗi khi lấy lịch thi cho ${getHPCode}: `, err);
            notyf.error(`Lỗi khi lấy lịch thi cho ${getHPCode}: `, err);
        }
    }

    // Hiển thị toàn bộ kế hoạch thi các học phần
    async function showExamPlan() {
        let listCourseCode = getCourseCode(document);
        // Lấy 13 học phần gần nhất
        listCourseCode = listCourseCode.slice(0, 12);
        const examScheduleContainer = document.querySelector(
            "#ctl02_ctl00_viewResult > div > div > table > tbody"
        );
        let i = 0;
        for (const courseCode of listCourseCode) {
            let examPlan = await getExamPlan(courseCode);
            // console.log(courseCode, " : " , examPlan);
            // Nếu không có lịch
            if (examPlan == null) continue;
            // Hiển thị kế hoạch thi

            const examDate = examPlan.children[3].textContent.trim();
            const examHour = examPlan.children[4].textContent.trim();
            const examTime = `${examHour} ${examDate}`;
            // Kiểm tra thời gian thi
            const diffTime = getTimeDifference(examTime);

            if ((diffTime.direction === -1 && diffTime.days <= 20) || diffTime.direction === 1) {
                i++;
                const indexItem = examPlan.children[0];

                indexItem.textContent = `${i}`;

                if (diffTime.direction === 1) {
                    // Nếu chưa đến ngày thi thì tô màu vàng
                    examPlan.style.backgroundColor = "rgb(248,226,135)";
                    // Hiển thị khoảng cách ngày
                    examPlan.children[3].innerHTML += `<br>(${diffTime.toString()})`;
                } else {
                    // Hiển thị khoảng cách ngày
                    examPlan.children[3].innerHTML += `<br>(${diffTime.toString()})`;
                }

                examScheduleContainer.appendChild(examPlan);
            }
            await delay(10);
        }
    }

    // Kiểm tra học phần không tính tín chỉ theo mặc định
    function checkDefaultNonCreditCourse(courseCode) {
        courseCode = courseCode.trim().toUpperCase();

        const nonCreditCourse = [
            "PE60", // Giáo dục thể chất
            "DC600", // Giáo dục quốc phòng
            "IC6005", // Công nghệ thông tin cơ bản
            "IC6006", // Công nghệ thông tin nâng cao khối KTXH
            "IC6007", // Công nghệ thông tin nâng cao khối Kỹ thuật
            "/FL60(91|92|93|94)/", // TA cơ khí cơ bản
            "FL61",
            "FL62",
            // "FL63" // Ngôn ngữ chuyên ngành
            "/FL65(?!82|83)\\d{2}/", // Ngôn ngữ cơ bản từ K20, loại trừ FL682, FL683 tiếng Đức
            "/FL\\d+OT/", // Ôn tập ngôn ngữ
        ];

        let nCodes = GM_getValue("nonCreditCourse", []);

        if (nCodes.length == 0) {
            GM_setValue("nonCreditCourse", Array.from(new Set([...nonCreditCourse, ...nCodes])));
            nCodes = GM_getValue("nonCreditCourse");
            console.log("Set nonCreditCourse", nCodes);
        }

        nCodes = nCodes.map((code) => {
            if (typeof code === "string" && code.startsWith("/") && code.endsWith("/")) {
                const pattern = code.slice(1, -1);
                return new RegExp(pattern);
            }
            return code;
        });

        for (const nCode of nCodes) {
            if (typeof nCode === "string") {
                if (courseCode.startsWith(nCode)) {
                    return true;
                }
            } else if (nCode instanceof RegExp) {
                if (nCode.test(courseCode)) {
                    return true;
                }
            }
        }
        return false;
    }

    // Kiểm tra học phần không tính tín chỉ
    function checkNonCreditCourse(courseCredit) {
        const isNonCreditCourse = courseCredit.getAttribute("nonCreditCourse") === "true";
        return isNonCreditCourse;
    }

    // Tô màu tín chỉ
    function highlightCreditsCourse() {
        const kgrid = document.querySelector("div.kGrid");
        const hocPhan = kgrid.querySelectorAll("tr.kTableAltRow, tr.kTableRow");

        for (const row of hocPhan) {
            const courseCode = row.children[1].textContent.trim();
            const courseCredit = row.children[5];
            const scoreCell = row.children[13];

            courseCredit.setAttribute("title", "👆");

            courseCredit.addEventListener("click", () => {
                const isNonCreditCourse = courseCredit.getAttribute("nonCreditCourse") === "false";
                courseCredit.setAttribute("nonCreditCourse", isNonCreditCourse ? "true" : "false");

                console.log("isNonCreditCourse", isNonCreditCourse);

                if (isNonCreditCourse) {
                    const originalScore = scoreCell.getAttribute("originalScore");
                    scoreCell.textContent = originalScore ? originalScore : scoreCell.textContent;

                    scoreCell.focus();
                    scoreCell.blur();

                    courseCredit.style.backgroundColor = "";
                    courseCredit.style.color = "";
                    scoreCell.setAttribute("contenteditable", "false");
                } else {
                    courseCredit.style.backgroundColor =
                        creditsBoxColor[courseCredit.textContent.trim()];
                    courseCredit.style.color = "#FFFFFF";
                    scoreCell.setAttribute("contenteditable", "true");

                    scoreCell.focus();
                    scoreCell.blur();
                }
            });

            if (checkDefaultNonCreditCourse(courseCode)) {
                courseCredit.setAttribute("nonCreditCourse", "true");
                continue;
            }

            courseCredit.setAttribute("nonCreditCourse", "false");
            courseCredit.style.backgroundColor = creditsBoxColor[courseCredit.textContent.trim()];
            courseCredit.style.color = "#FFFFFF";
        }
    }

    // Tô màu điểm thi
    function highlightExamScores() {
        const kgrid = document.querySelector("div.kGrid");
        const hocPhan = kgrid.querySelectorAll("tr.kTableAltRow, tr.kTableRow");

        for (const row of hocPhan) {
            // Bỏ qua nonCreditCourse
            const courseCredit = row.children[5];
            const score4Text = row.children[12].textContent.trim();
            const scoreLetter = row.children[13];

            if (checkNonCreditCourse(courseCredit) || score4Text == "" || score4Text == "**") {
                scoreLetter.style.backgroundColor = "";
                scoreLetter.style.color = "";
                continue;
            }
            // console.log(diemSo);
            // Tô màu điểm
            scoreLetter.style.backgroundColor = scoresBoxColor[Number(score4Text)];
            scoreLetter.style.color = "#FFFFFF";
        }
    }

    // Tô màu điểm TX
    function highlightStudyScores() {
        let tx1Index = 4;
        if (window.location.pathname.includes("student/result/viewstudyresult")) {
            tx1Index = 3;
        }
        const kgrid = document.querySelector("div.kGrid");
        const hocPhan = kgrid.querySelectorAll("tr.kTableAltRow, tr.kTableRow");

        const regex = /FL\d{4}OT\.\d/;

        for (const row of hocPhan) {
            if (regex.test(row.children[2].textContent.trim())) continue;
            // Tô những học phần chưa có điểm
            if (row.children[tx1Index].textContent.trim() == "")
                row.children[tx1Index].style.backgroundColor = "rgb(248,226,135)";
        }
    }

    // Chuyển đổi giữa trang kết quả học tập và kết quả thi
    function toggleStudyAndExam() {
        const title = document.querySelector("div.panel-heading");

        const toggleLinkContainer = document.createElement("p");
        toggleLinkContainer.id = "toggle-link-container";
        const toggleLink = document.createElement("a");
        toggleLink.style.color = "gray";
        toggleLink.style.fontSize = "14px";
        toggleLinkContainer.appendChild(toggleLink);

        if (window.location.pathname === "/student/result/studyresults") {
            toggleLink.href = "https://sv.haui.edu.vn/student/result/examresult";
            toggleLink.textContent = "➡️🎯Kết quả thi";
        } else if (window.location.pathname === "/student/result/examresult") {
            toggleLink.href = "https://sv.haui.edu.vn/student/result/studyresults";
            toggleLink.textContent = "➡️🎯Kết quả học tập";
        } else {
            if (window.location.pathname.includes("exam")) {
                toggleLink.href = window.location.href.replace("exam", "study");
                toggleLink.textContent = "➡️🎯Kết quả học tập";
            } else {
                toggleLink.href = window.location.href.replace("study", "exam");
                toggleLink.textContent = "➡️🎯Kết quả thi";
            }
        }

        title.appendChild(toggleLinkContainer);
    }

    // Chuyển đổi giữa trang chi tiết học phần theo CDIO và theo ngành
    function toggleCourseInfo() {
        const title = document.querySelector("div.panel-heading");

        const toggleLinkContainer = document.createElement("p");
        toggleLinkContainer.id = "toggle-link-container";
        const toggleLink = document.createElement("a");
        toggleLink.style.color = "gray";
        toggleLink.style.fontSize = "14px";
        toggleLinkContainer.appendChild(toggleLink);

        if (window.location.pathname === "/training/viewmodulescdiosv/xem-chi-tiet-hoc-phan.htm") {
            toggleLink.href = window.location.href.replace(
                "viewmodulescdiosv",
                "viewcourseindustry2"
            );
            toggleLink.textContent = "➡️ Chi tiết học phần theo ngành";
        } else if (
            window.location.pathname === "/training/viewcourseindustry2/xem-chi-tiet-hoc-phan.htm"
        ) {
            toggleLink.href = window.location.href.replace(
                "viewcourseindustry2",
                "viewmodulescdiosv"
            );
            toggleLink.textContent = "➡️ Chi tiết học phần theo CDIO";
        }

        title.appendChild(toggleLinkContainer);
    }

    // Thêm link đến trang chi tiết học phần
    function gotoCourseInfoStudy() {
        const courses = document.querySelectorAll("div.kGrid .table tr");

        let courseCode2ID = GM_getValue("~~~courseCode2ID", undefined);
        if (courseCode2ID == undefined) return;

        for (const course of courses) {
            const className = course.children[2];

            if (!/\w{2}\d{4}/.test(className.textContent)) continue;

            const courseCode = className.textContent.trim().match(/\w{2}\d{4}/)[0];

            className.innerHTML = `<a class="di-den-chi-tiet-hp" href="/training/viewmodulescdiosv/xem-chi-tiet-hoc-phan.htm?id=${courseCode2ID[courseCode]}&ver=1">${className.textContent}</a>`;
        }
    }

    function gotoCourseInfoExam() {
        const courses = document.querySelectorAll("div.kGrid .table tr");

        let courseCode2ID = GM_getValue("~~~courseCode2ID", {});

        for (const course of courses) {
            const courseID = course.children[2]?.textContent.trim() || "";
            const courseCodeElement = course.children[1];
            const courseCode = courseCodeElement?.textContent.trim() || "";

            if (!/HP\d{4}/.test(courseID)) continue;

            courseCode2ID[courseCode] = courseID;

            courseCodeElement.innerHTML = `<a class="di-den-chi-tiet-hp" href="/training/viewmodulescdiosv/xem-chi-tiet-hoc-phan.htm?id=${courseID}&ver=1">${courseCode}</a>`;
        }

        if (Object.keys(courseCode2ID).length < courses.length)
            GM_setValue("~~~courseCode2ID", courseCode2ID);
    }

    function gotoCourseInfoGPA() {
        const courses = document.querySelectorAll(".table.table-condensed tr");

        let courseCode2ID = {};

        for (const course of courses) {
            const courseID = course.children[1]?.textContent.trim() || "";
            const courseCodeCell = course.children[2];
            const courseCode = courseCodeCell?.textContent.trim() || "";

            if (!/HP\d{4}/.test(courseID)) continue;

            courseCode2ID[courseCode] = courseID;

            courseCodeCell.innerHTML = `<a class="di-den-chi-tiet-hp" href="/training/viewmodulescdiosv/xem-chi-tiet-hoc-phan.htm?id=${courseID}&ver=1">${courseCode}</a>`;
        }
        GM_setValue("~~~courseCode2ID", courseCode2ID);
    }

    // Hiển thị hệ số điểm trong chi tiết học phần
    function showScoreWeight() {
        const title = document.querySelector("div.panel-heading");
        const courseCode = title.textContent.match(/([A-Z]{2})\d{4}/)[0];
        const scoresType = document.querySelectorAll(
            "td.k-table-viewdetail > table > tbody:nth-child(2) > tr > td.tdTh1"
        );
        const scoreWeight = document.querySelectorAll(
            "td.k-table-viewdetail > table > tbody:nth-child(2) > tr > td.tdTh2"
        );
        const elementContainer = document.createElement("p");
        elementContainer.id = "he-so-diem";
        elementContainer.style.fontSize = "14px";
        // Lấy hệ số điểm
        let saveScoreWeight = {};
        saveScoreWeight = GM_getValue("~scoreWeight", {});
        // reset hp hiện tại
        saveScoreWeight[courseCode] = "";
        let elementHtml = "";
        for (let i = 0; i < scoresType.length; i++) {
            const type = scoresType[i].textContent.trim();
            const heSo = scoreWeight[i].textContent.trim();
            elementHtml += `${type}: ${heSo}<br>`;
            saveScoreWeight[courseCode] += heSo + " | ";
            // console.log(`${type}: ${heSo}`);
        }
        elementContainer.innerHTML = elementHtml;
        title.appendChild(elementContainer);
        if (isnonCreditCourse) return;
        // Xử lý lại chuỗi
        saveScoreWeight[courseCode] = saveScoreWeight[courseCode].slice(0, -3);
        saveScoreWeight[courseCode].replace(/\s+/g, "");
        console.log("score Weight: ", saveScoreWeight[courseCode]);
        // Lưu lại hệ số điểm
        GM_setValue("~scoreWeight", saveScoreWeight);
    }

    // Tính điểm TX dựa trên hệ số điểm
    function calculateStudyScores() {
        let tx1Index = 4;
        let gk1Index = 14;
        if (window.location.pathname == "/student/result/viewstudyresult") {
            tx1Index = 3;
            gk1Index = 9;
        }

        const scoreWeight = GM_getValue("~scoreWeight", {});
        const kgrid = document.querySelector("div.kGrid");
        const courses = kgrid.querySelectorAll("tr.kTableAltRow, tr.kTableRow");
        for (const course of courses) {
            const courseCode = course.children[2].textContent.match(/([A-Z]{2})\d{4}/)[0];
            // console.log("maHP: ", maHP);
            if (scoreWeight[courseCode] != "" && scoreWeight[courseCode] != undefined) {
                // Hiển thị hệ số điểm vào cột cuối cùng
                course.querySelector("td:last-child").textContent = scoreWeight[courseCode];
                // Nếu có điểm giữ kỳ thì bỏ qua
                if (course.children[gk1Index].textContent.trim() != "") continue;
                // Nếu có điểm tx thì tính
                if (course.children[tx1Index].textContent.trim() != "") {
                    let courseScoreWeight = scoreWeight[courseCode].split(" | ");
                    let tongDiem = 0;
                    for (let i = 0; i < courseScoreWeight.length; i++) {
                        tongDiem +=
                            (Number(course.children[tx1Index + i].textContent.trim()) *
                                Number(courseScoreWeight[i])) /
                            100;
                        // console.log(row.children[tx1Index + i].textContent.trim());
                    }
                    course.querySelector("td:last-child").innerHTML += `</br>🎯 ${tongDiem.toFixed(
                        2
                    )}`;
                    course.querySelector("td:last-child").style.backgroundColor =
                        "rgb(255, 249, 227)";
                }
            }
        }
    }

    // Lấy tổng số tín chỉ
    function getYourTotalCredits() {
        let totalCredits = document.querySelector(
            "#ctl02_dvList > tbody > tr:nth-child(7) > td.k-table-viewdetail"
        ).textContent;
        totalCredits = totalCredits.match(/\d+/)[0];
        const totalCreditsNumber = Number(totalCredits);

        let yourInfo = GM_getValue("yourInfo", {});
        yourInfo.totalCredits = totalCreditsNumber;
        GM_setValue("yourInfo", yourInfo);
        console.log("yourInfo: ", yourInfo);
    }

    // Lấy Thông tin, tiến trình học
    function getYourLearningProgress() {
        let yourInfo = GM_getValue("yourInfo", {});
        const infoTable = document.querySelector("#frmMain div.panel-body > table");
        yourInfo.name = infoTable
            .querySelector("tbody > tr:nth-child(1) > td:nth-child(2) > strong")
            .textContent.replace(/\s+/g, " ");
        yourInfo.msv = infoTable
            .querySelector("tbody > tr:nth-child(2) > td:nth-child(2) > strong")
            .textContent.trim();
        yourInfo.classCode = infoTable
            .querySelector("tbody > tr:nth-child(3) > td:nth-child(2) > strong")
            .textContent.trim();

        const kgrid = document.querySelector("div.kGrid");
        const currentCredits = kgrid.querySelector("tbody > tr:last-child > td:first-child");
        const currentCreditsNumber = Number(
            currentCredits.textContent.trim().match(/(\d+)(?:\.\d+)?/g)[0]
        );
        yourInfo.currentCredits = currentCreditsNumber;

        const currentGPA = kgrid.querySelector("tbody > tr:nth-last-child(2) > td:nth-child(2)");
        const currentGPAValue = Number(currentGPA.textContent.trim().match(/(\d+)(?:\.\d+)?/g)[0]);
        yourInfo.currentGPA = currentGPAValue;

        console.log(yourInfo);
        GM_setValue("yourInfo", yourInfo);

        let courseCodeMap = new Map();
        const courses = kgrid.querySelectorAll("tr.kTableAltRow, tr.kTableRow");
        for (const course of courses) {
            const code = course.children[1].textContent.trim();
            const scorse4 = Number(course.children[12].textContent.trim()) || "";

            if (courseCodeMap.has(code)) {
                const old = courseCodeMap.get(code);
                if (scorse4 > old.scorse4) {
                    courseCodeMap.delete(code);
                    courseCodeMap.set(code, scorse4);
                }
            } else {
                courseCodeMap.set(code, scorse4);
            }
        }

        const yourStudyProcess = Object.fromEntries(
            Array.from(courseCodeMap.entries()).map(([code, scorse4]) => [code, scorse4])
        );
        GM_setValue("~~yourStudyProcess", yourStudyProcess);
        console.log(yourStudyProcess, courseCodeMap);
    }

    // Tính toàn bộ
    function calculateStudyStats() {
        const kgrid = document.querySelector("div.kGrid");
        const courses = kgrid.querySelectorAll("tr.kTableAltRow, tr.kTableRow");

        let courseCodeMap = new Map();

        for (const course of courses) {
            const code = course.children[1].textContent.trim();
            const courseCredit = course.children[5];
            const credit = Number(courseCredit.textContent.trim());
            const scorse4 = Number(course.children[12].textContent.trim());

            if (checkNonCreditCourse(courseCredit)) continue;
            if (Number.isNaN(credit)) continue;
            if (Number.isNaN(scorse4)) continue;
            if (scorse4 == "") continue;
            if (scorse4 == "0") continue;

            if (courseCodeMap.has(code)) {
                const old = courseCodeMap.get(code);
                if (scorse4 > old.scorse4) {
                    courseCodeMap.delete(code);
                    courseCodeMap.set(code, { scorse4: scorse4, credit: credit });
                }
            } else {
                courseCodeMap.set(code, { scorse4: scorse4, credit: credit });
            }
        }

        let sumCredits = 0;
        let sumScore = 0;
        for (const { scorse4, credit } of courseCodeMap.values()) {
            sumScore += scorse4 * credit;
            sumCredits += credit;
        }
        const GPA = sumScore / sumCredits;
        // console.log(courseCodeMap);
        return { calculateGPA: GPA, calculateCredits: sumCredits };
    }

    // Chỉ tính học phần đã sửa, tính cả học phần F
    function calculateStudyStatsEdited() {
        const kgrid = document.querySelector("div.kGrid");
        const courses = kgrid.querySelectorAll("tr.kTableAltRow, tr.kTableRow");

        let courseCodeMap = new Map();

        for (const course of courses) {
            const score4Cell = course.children[12];

            if (
                !score4Cell.classList.contains("is-calculated") &&
                !score4Cell.classList.contains("is-edited")
            )
                continue;
            const code = course.children[1].textContent.trim();
            const courseCredit = course.children[5];
            const credit = Number(courseCredit.textContent.trim());
            const scorse4 = Number(course.children[12].textContent.trim());

            if (checkNonCreditCourse(courseCredit)) continue;
            if (Number.isNaN(credit)) continue;
            if (Number.isNaN(scorse4)) continue;
            if (scorse4 == "") continue;

            if (courseCodeMap.has(code)) {
                const old = courseCodeMap.get(code);
                if (scorse4 > old.scorse4) {
                    courseCodeMap.delete(code);
                    courseCodeMap.set(code, { scorse4: scorse4, credit: credit });
                }
            } else {
                courseCodeMap.set(code, { scorse4: scorse4, credit: credit });
            }
        }

        let sumCredits = 0;
        let sumScore = 0;
        for (const { scorse4, credit } of courseCodeMap.values()) {
            sumScore += scorse4 * credit;
            sumCredits += credit;
        }
        const GPA = sumScore / sumCredits;
        // console.log(courseCodeMap);
        return { editedGPA: GPA, editedCredits: sumCredits };
    }

    // Cho phép chỉnh sửa điểm
    function editScoreBtn() {
        const toggleBtn = document.createElement("span");
        toggleBtn.id = "toggle-edit-score-btn";
        toggleBtn.textContent = "✏️";
        toggleBtn.title = "Bật/Tắt chỉnh sửa điểm";
        const defaultEditScore = GM_getValue("defaultEditScore");
        if (defaultEditScore == undefined)
            GM_setValue(
                "defaultEditScore",
                confirm("Bạn có muốn mặc định bật chế độ chỉnh sửa điểm không?")
            );

        GM_addStyle(`
			#toggle-edit-score-btn {
				cursor: pointer;
				font-size: 24px;
				transition: transform 0.2s;
				display: inline-block;
				margin-left: 8px;
			}
			#toggle-edit-score-btn:hover {
				transform: scale(1.2);
			}
		`);

        if (defaultEditScore == true) setTimeout(() => toggleBtn.click(), 1000);

        toggleBtn.addEventListener("click", (e) => {
            e.stopPropagation();

            if (toggleBtn.textContent === "✏️") {
                toggleBtn.textContent = "📝";
                onEditScore(true);
                notyf.success("Đã bật chỉnh sửa điểm");
            } else {
                toggleBtn.textContent = "✏️";
                onEditScore(false);
                notyf.error("Tắt chỉnh sửa điểm");
            }
        });
        const kGrid = document.querySelector("div.kGrid");
        const container = kGrid.querySelector("table > thead > tr:nth-child(1) > td:nth-child(10)");
        container.appendChild(toggleBtn);
    }

    //
    function normalizeScore(score) {
        score = score
            .trim()
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/Đ/g, "D");
        score = score.replace(/.+(?=[ABCDF].*)/, "");
        if (/\d\.*\d*/.test(score)) {
            score = Math.ceil(score.match(/\d\.*\d*/)[0] * 2) / 2;
            if (score > 0 && score <= 4.0) {
                score = {
                    4.0: "A",
                    3.5: "B+",
                    3.0: "B",
                    2.5: "C+",
                    2.0: "C",
                    1.5: "D+",
                    1.0: "D",
                    0.0: "F",
                }[score];
            }
        } else if (/^[ABCDF].*/.test(score)) {
            score = score.replace(/^A.*$/g, "A");
            score = score.replace(/^B.+$/g, "B+");
            score = score.replace(/^C.+$/g, "C+");
            score = score.replace(/^D.+$/g, "D+");
            score = score.replace(/^F.*$/g, "F");
        }
        // console.log("▶️ score: ", score);

        return score;
    }

    // Xử lý chỉnh sửa điểm
    function onEditScore(isEnable) {
        console.log("onEditScore", isEnable);
        const kgrid = document.querySelector("div.kGrid");
        const courses = kgrid.querySelectorAll("tr.kTableAltRow, tr.kTableRow");

        GM_addStyle(`
			.is-edited { background-color: #fcefc3ff !important; }
			.is-calculated { background-color: #d4eddaff !important; }
		`);

        if (isEnable) {
            for (const course of courses) {
                const courseCredit = course.children[5];
                const scoreCell = course.children[13];
                const score4Cell = course.children[12];

                scoreCell.setAttribute("originalScore", scoreCell.textContent.trim());
                const originalScore = scoreCell.textContent.trim();

                if (checkNonCreditCourse(courseCredit)) {
                    scoreCell.setAttribute("contenteditable", "false");
                } else {
                    scoreCell.setAttribute("contenteditable", "true");
                }
                scoreCell.title = `📌: ${originalScore}\n✨: A, B+, B, C+, C, D+, D, F, 0, 1, 1.5, 2, 2.5, 3, 3.5, 4`;
                score4Cell.title = "📌: " + originalScore;

                scoreCell.addEventListener("keydown", (e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        scoreCell.blur();
                    }
                });

                scoreCell.addEventListener("focus", () => {
                    scoreCell.textContent = "";
                });

                scoreCell.addEventListener("blur", (e) => {
                    let score = normalizeScore(scoreCell.textContent);
                    console.log(score);

                    if (!["A", "B+", "B", "C+", "C", "D+", "D", "F"].includes(score)) {
                        notyf.error(
                            "Điểm không hợp lệ! <br>Vui lòng nhập lại (A, B+, B, C+, C, D+, D, F | 0, 1, 1.5, 2, 2.5, 3, 3.5, 4)"
                        );
                        score = originalScore;
                    }

                    score4Cell.textContent = {
                        A: "4",
                        "B+": "3.5",
                        B: "3",
                        "C+": "2.5",
                        C: "2",
                        "D+": "1.5",
                        D: "1",
                        F: "0",
                    }[score];

                    scoreCell.textContent = score;

                    if (score !== originalScore) {
                        score4Cell.classList.add("is-edited");
                        score4Cell.classList.remove("is-calculated");
                    } else score4Cell.classList.remove("is-edited");

                    onScoreCellUpdated(scoreCell);
                });

                score4Cell.addEventListener("click", (e) => {
                    if (
                        !score4Cell.classList.contains("is-calculated") &&
                        !score4Cell.classList.contains("is-edited") &&
                        scoreCell.textContent.trim() != ""
                    ) {
                        score4Cell.classList.add("is-calculated");
                    } else {
                        score4Cell.classList.remove("is-calculated");
                    }

                    onScoreCellUpdated(scoreCell);
                });
            }
        } else {
            for (const course of courses) {
                course.children[13].setAttribute("contenteditable", "false");
            }
        }
    }

    // Hiển thị thêm thông tin trong trang kết quả thi
    function showMoreInfoInExamResult() {
        let yourInfo = GM_getValue("yourInfo");
        let isSameTotalCredits = true;
        if (window.location.pathname.includes("/student/result/viewexamresult")) {
            const classCode = document
                .querySelector(
                    "div.kGrid > div > div > div > table > tbody > tr:nth-child(3) > td:nth-child(2) > strong"
                )
                .textContent.trim();
            const major = classCode.match(/\d{4}\D+/)[0];
            isSameTotalCredits = yourInfo.classCode.includes(major);
            console.log("isSameTotalCredits: ", isSameTotalCredits, yourInfo.classCode, major);
        }
        // Selector
        const kgrid = document.querySelector("div.kGrid");
        const tables = kgrid.querySelectorAll("table");
        const lastTable = tables[tables.length - 1];

        // GPA
        const currentGPAContainer = lastTable.querySelector(
            "tbody > tr:nth-last-child(2) > td:nth-child(2)"
        );
        currentGPAContainer.setAttribute("colspan", "5");
        const editedGPA = document.createElement("td");
        editedGPA.setAttribute("colspan", "3");
        editedGPA.innerHTML = `<span class="study-info">🎯: <span id="current-gpa"></span></span>`;
        currentGPAContainer.insertAdjacentElement("afterend", editedGPA);

        // Học lực
        const currentStuydyContainer = lastTable.querySelector(
            "tbody > tr:last-child > td:nth-child(2)"
        );
        currentStuydyContainer.setAttribute("colspan", "5");
        const editedStudy = document.createElement("td");
        editedStudy.setAttribute("colspan", "3");
        editedStudy.innerHTML = `<span class="study-info">🎯: <span id="edited-study"></span></span>`;
        currentStuydyContainer.insertAdjacentElement("afterend", editedStudy);

        // Tín chỉ
        const currentCreditsContainer = lastTable.querySelector(
            "tbody > tr:last-child > td:first-child"
        );
        const currentCredits = currentCreditsContainer.textContent.trim().match(/\d+/)[0];
        console.log("currentCredits: ", currentCredits);
        currentCreditsContainer.innerHTML = `</span><span class="study-info">Tín chỉ đã tích luỹ: <span id="current-credits">${currentCredits}</span> / <span id="total-credits">???</span></span>`;
        setTimeout(() => {
            if (document.getElementById("current-credits").textContent.trim() != currentCredits)
                notyf.error(
                    "Một số môn có thể chưa được tính vào GPA, nhấp vào số tín chỉ của môn chưa tính GPA để tính lại."
                );
        }, 500);
        const info = GM_getValue("yourInfo") || {};
        const totalCredits = info.totalCredits;
        if (isSameTotalCredits && totalCredits > 0) {
            document.getElementById("total-credits").textContent = totalCredits;
        } else {
            const totalCreditsSpan = document.getElementById("total-credits");
            totalCreditsSpan.setAttribute("contenteditable", "true");
            GM_addStyle(`
				#total-credits {
					border-bottom: 2px dashed gray;
				}
				#total-credits:focus {
					outline: none;
					background-color: #fff5d1ff;
				}
			`);
            totalCreditsSpan.title =
                "Nhấp để chỉnh sửa tổng tín chỉ\nHoặc vào khung chương trình đào tạo để tự động lấy";
            // Event khi sửa totalCreditsSpan
            totalCreditsSpan.addEventListener("blur", (e) => {
                e.target.textContent = e.target.textContent.replace(/[^\d]/g, "");
                if (e.target.textContent == "") e.target.textContent = "142";
                onScoreCellUpdated();
            });
        }

        // Mục tiêu GPA
        const requiredScoreContainer = lastTable.querySelector("tbody > tr:last-child");
        const requiredScore = document.createElement("tr");
        requiredScore.style.backgroundColor = "#ffffff";

        requiredScore.innerHTML = `<td colspan="4">
			<span id="requiredScore" class="study-info">
				✏️: <span id="edited-gpa">0</span> / <span id="edited-credits">0</span></br>
				🎯: <span id="current-gpa1">0</span> / <span id="calculate-credits">0</span></br>
				Số tín tích luỹ còn lại: <span id="remaining-credits">0</span></br>
			</span>
		</td><td colspan="14">
			<span id="requiredScore" class="study-info">
				3.6🎯: <span id="target-3.6">0</span></br>
				3.2🎯: <span id="target-3.2">0</span></br>
				2.5🎯: <span id="target-2.5">0</span></br>
			</span>
		</td>`;
        requiredScoreContainer.insertAdjacentElement("afterend", requiredScore);

        GM_addStyle(`
			.study-info {
				color: Red;
				font-weight: bold;
				float: left;
				font-size: 12px;
				padding-left: 5px;
			}
			#requiredScore {
				background-color: #ffffff;
				font-size: 14px;
			}
		`);
        onScoreCellUpdated();
    }

    // Xử lý khi ô điểm được chỉnh sửa
    function onScoreCellUpdated() {
        highlightExamScores();

        const { calculateGPA, calculateCredits } = calculateStudyStats();
        const { editedGPA, editedCredits } = calculateStudyStatsEdited();
        const totalCredits = Number(document.getElementById("total-credits").textContent.trim());

        document.getElementById("current-gpa").textContent = calculateGPA.toFixed(3);

        if (calculateGPA >= 3.6) document.getElementById("edited-study").textContent = "Xuất sắc";
        else if (calculateGPA >= 3.2) document.getElementById("edited-study").textContent = "Giỏi";
        else if (calculateGPA >= 2.5) document.getElementById("edited-study").textContent = "Khá";
        else if (calculateGPA >= 2.0)
            document.getElementById("edited-study").textContent = "Trung bình";
        else if (calculateGPA < 2.0) document.getElementById("edited-study").textContent = "Yếu";

        const remainingCredits = totalCredits - calculateCredits;
        const scoresToGPA25 =
            (2.5 * totalCredits - calculateGPA * calculateCredits) / remainingCredits;
        const scoresToGPA32 =
            (3.2 * totalCredits - calculateGPA * calculateCredits) / remainingCredits;
        const scoresToGPA36 =
            (3.6 * totalCredits - calculateGPA * calculateCredits) / remainingCredits;

        document.getElementById("edited-gpa").textContent = isNaN(editedGPA)
            ? "0"
            : editedGPA.toFixed(3);
        document.getElementById("edited-credits").textContent = editedCredits;
        document.getElementById("current-gpa1").textContent = calculateGPA.toFixed(3);
        document.getElementById("calculate-credits").textContent = calculateCredits;
        document.getElementById("remaining-credits").textContent = remainingCredits;
        document.getElementById("target-2.5").textContent = scoresToGPA25.toFixed(3);
        document.getElementById("target-3.2").textContent = scoresToGPA32.toFixed(3);
        document.getElementById("target-3.6").textContent = scoresToGPA36.toFixed(3);
    }

    // Đánh dấu môn học
    function markedCourse(courseCode, courseName, markedCell) {
        let markedCourse = GM_getValue("markedCourse", {});

        let flag = courseCode in markedCourse;
        if (flag) {
            markedCell.style.backgroundColor = "#fcefc3ff";
        }

        markedCell.addEventListener("click", () => {
            markedCourse = GM_getValue("markedCourse", {});
            flag = !flag;

            markedCell.style.backgroundColor = flag ? "#fcefc3ff" : "";

            if (flag) {
                markedCourse[courseCode] = courseName;
            } else {
                delete markedCourse[courseCode];
            }

            GM_setValue("markedCourse", markedCourse);

            notyf.success(`Đã${flag ? "" : " huỷ"} đánh dấu môn ${courseCode}<br>${courseName}`);
        });
    }

    // Tô màu, đánh dấu môn học
    function customizeGPA() {
        let yourStudyProcess = GM_getValue("~~yourStudyProcess");

        const courses = document.querySelectorAll(".table.table-condensed tr");

        for (const course of courses) {
            const courseCodeCell = course.children[2];
            const courseCode = courseCodeCell?.textContent.trim() || "";
            if (!/\w{2}\d{4}/.test(courseCode)) continue;
            if (checkDefaultNonCreditCourse(courseCode)) continue;

            // Tìm index td.tinchi
            const creditCell = course.querySelector(".tinchi");
            if (!creditCell) continue;
            const tds = Array.from(course.querySelectorAll("td"));
            const index = tds.indexOf(creditCell);

            // Tô màu điểm
            let score4Cell = course.children[index + 6];
            if (score4Cell.textContent.trim() != "") {
                score4Cell.style.backgroundColor = scoresBoxColor[Number(score4Cell.textContent)];
                score4Cell.style.color = "#FFFFFF";
            }
            // Tô màu tín đang học
            if (courseCode in yourStudyProcess)
                if (yourStudyProcess[courseCode] === "") {
                    creditCell.style.backgroundColor =
                        creditsBoxColor[creditCell.textContent.trim()];
                    creditCell.style.color = "#FFFFFF";
                }

            const courseNameCell = course.children[3];
            markedCourse(courseCode, courseNameCell.textContent.trim(), courseNameCell);
        }
    }

    // Tô màu, đánh dấu môn học
    function customizeProgramFramework() {
        const yourStudyProcess = GM_getValue("~~yourStudyProcess", {});

        const courses = document.querySelectorAll("table.table > tbody > tr");

        const markerIndex = window.location.pathname == "/training/programmodulessemester" ? 2 : 0;

        for (const course of courses) {
            const courseCodeCell = course.children[1];
            if (!courseCodeCell) continue;
            const courseCode = courseCodeCell.textContent.trim();
            if (!/\w{2}\d{4}/.test(courseCode) || checkDefaultNonCreditCourse(courseCode)) continue;

            if (courseCode in yourStudyProcess)
                if (!yourStudyProcess[courseCode] == "") {
                    courseCodeCell.style.backgroundColor =
                        scoresBoxColor[yourStudyProcess[courseCode]];
                    courseCodeCell.style.color = "#FFFFFF";
                } else {
                    const creditCell = course.children[3];
                    creditCell.style.backgroundColor =
                        creditsBoxColor[creditCell.textContent.trim()];
                    creditCell.style.color = "#FFFFFF";
                }

            const markerCell = course.children[markerIndex];
            const courseName = course.children[2].textContent.trim();
            markedCourse(courseCode, courseName, markerCell);
        }

        GM_addStyle(`
			.kTableRowBackground {
				background-color: #f5f5f5 !important;
			}
			.kTableRowBackground:nth-of-type(odd) {
				background-color: inherit !important;
			}
			.kTableRowBackground td:nth-child(12) {
				background-color: yellow !important;
			}
			.kTableRowBackground:nth-of-type(odd) td:nth-child(12) {
				background-color: yellow !important;
			}
		`);
    }

    // Hiển thị môn đã đánh dấu
    function showmarkedCourse() {
        let markedCourseList = GM_getValue("markedCourse", {});

        // Tô vàng những học phần nằm trong dự định
        const planningCourses = document.querySelectorAll("#tableorder > tbody > tr");
        for (const planningCourse of planningCourses) {
            const courseCodeCell = planningCourse.children[2];
            if (!courseCodeCell) continue;
            const courseCode = courseCodeCell.textContent.replace("[Hủy đăng ký]", "").trim();
            if (/\w{2}\d{4}/.test(courseCode))
                if (courseCode in markedCourseList) {
                    courseCodeCell.style.backgroundColor = "#fcefc3ff";
                    delete markedCourseList[courseCode];
                }
        }
        console.log(markedCourseList);

        // Hiển thị học phần còn lại
        document.querySelector("#note")?.querySelector("p")?.remove();
        const markedCourseContainer = document.createElement("p");
        markedCourseContainer.className = "markedCourse";
        markedCourseContainer.style.fontSize = "18px";
        note.appendChild(markedCourseContainer);

        markedCourseContainer.textContent = "🎯: ";

        for (const [code, name] of Object.entries(markedCourseList)) {
            const span = document.createElement("span");
            span.textContent = code;
            span.title = name;
            markedCourseContainer.appendChild(span);
            markedCourseContainer.append(" ");
        }

        setTimeout(showmarkedCourse, 5000);
    }

    //===============================================================

    function run() {
        notyf = new Notyf({
            duration: 3500,
            dismissible: true,
        });

        runOnUrl(changeTitle, "");
        runOnUrl(changeHomePagePath, "");
        runOnUrl(displayGPA, "");

        runOnUrl(fastSurvey, /\/survey\//);

        runOnUrl(captchaHelperRegister, "/register");

        runOnUrl(customizeHomePage, "/home");

        runOnUrl(sortExamSchedule, "/student/schedulefees/transactionmodules");
        runOnUrl(highlightExamSchedule, "/student/schedulefees/transactionmodules");

        runOnUrl(showExamPlan, "/student/schedulefees/examplant");

        runOnUrl(
            highlightCreditsCourse,
            "/student/result/examresult",
            "/student/result/viewexamresult"
        );
        runOnUrl(
            highlightExamScores,
            "/student/result/examresult",
            "/student/result/viewexamresult"
        );
        runOnUrl(
            highlightStudyScores,
            "/student/result/studyresults",
            "/student/result/viewstudyresult"
        );

        runOnUrl(
            toggleStudyAndExam,
            "/student/result/examresult",
            "/student/result/viewexamresult",
            "/student/result/viewexamresultclass",
            "/student/result/studyresults",
            "/student/result/viewstudyresult",
            "/student/result/viewstudyresultclass"
        );

        runOnUrl(
            toggleCourseInfo,
            "/training/viewmodulescdiosv/xem-chi-tiet-hoc-phan.htm",
            "/training/viewcourseindustry2/xem-chi-tiet-hoc-phan.htm"
        );

        runOnUrl(
            gotoCourseInfoStudy,
            "/student/result/studyresults",
            "/student/result/viewstudyresult"
        );
        runOnUrl(
            gotoCourseInfoExam,
            "/student/result/examresult",
            "/student/result/viewexamresult"
        );
        runOnUrl(gotoCourseInfoGPA, "/student/result/viewmodules");

        runOnUrl(showScoreWeight, "/training/viewmodulescdiosv/xem-chi-tiet-hoc-phan.htm");
        runOnUrl(
            calculateStudyScores,
            "/student/result/studyresults",
            "/student/result/viewstudyresult"
        );

        // runOnUrl(createCSVCalendar, "/timestable/calendarcl");
        // runOnUrl(exportCalender, "/timestable/calendarcl");

        runOnUrl(getYourTotalCredits, "/training/viewcourseindustry");
        runOnUrl(getYourLearningProgress, "/student/result/examresult");

        runOnUrl(editScoreBtn, "/student/result/examresult", "/student/result/viewexamresult");
        runOnUrl(
            showMoreInfoInExamResult,
            "/student/result/examresult",
            "/student/result/viewexamresult"
        );

        runOnUrl(customizeGPA, "/student/result/viewmodules");
        runOnUrl(showmarkedCourse, "/register/dangkyhocphan");

        runOnUrl(
            customizeProgramFramework,
            "/training/viewcourseindustry",
            "/training/programmodulessemester"
        );
    }

    waitForSelector("#frmMain", 5000, 100)
        .then((el) => {
            run();
        })
        .catch((err) => {
            console.warn(err);
        });

    runOnUrl(() => {
        waitForSelector("input#ctl00_txtimgcode").then(captchaHelperLogin);
    }, "/sso");
    runOnUrl(() => (window.location.href = "https://sv.haui.edu.vn/home"), "/");
    // ================================================================
    console.log("✅ svHaUI_Helper.user.js loaded: ", window.location);
})();
