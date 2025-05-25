// ==UserScript==
// @name         sv.HaUI
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      5.1
// @description  Công cụ hỗ trợ cho sinh viên HaUI
// @author       QuanVu
// @downloadURL  https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/svHaUI_Helper.user.js
// @updateURL    https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/svHaUI_Helper.user.js
// @match        https://sv.haui.edu.vn/*
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    "use strict";
    // =====================================================================================
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
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth() + 1;
    const todayYear = today.getFullYear();
    // =====================================================================================
    // Change header
    function changeHeader() {
        if (!$("div.panel-heading")) return;
        let newTitle = $("div.panel-heading").textContent;
        //console.log("Last title: ", newTitle);
        newTitle = newTitle.replace("\n", "");
        newTitle = newTitle.replace("\t", "");
        newTitle = newTitle.replace("TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP HÀ NỘI", "");
        newTitle = newTitle.replace("Đại học công nghiệp Hà Nội", "");
        newTitle = newTitle.replace("CHI TIẾT HỌC PHẦN CDIO: ", "");
        document.title = newTitle;
    }
    // Customize Home page
    function customizeHomePage() {
        if (currentURL != "https://sv.haui.edu.vn/") {
            return;
        }
        const beLeftSidebar = $("div.be-left-sidebar");
        if (beLeftSidebar) {
            const studyTabNext = `
                <div class="be-content">
                    <div class="main-content container-fluid">
                        <form name="frmMain" id="frmMain" data-toggle="validator" role="form">
                            <div class="panel panel-default panel-border-color panel-border-color-primary">
                                <div id="add-them-tab">
                                    <p>Một số chức năng chính</p>
                                    <p>
                                        <a href="/sso/blearning">
                                            <i class="fa flaticon-science1 icon"></i>
                                            <span>Học kết hợp</span>
                                        </a>
                                    </p>
                                    <p>
                                        <a href="/training/viewcourseindustry">
                                            <i class="icon mdi mdi-book"></i>
                                            <span>Khung chương trình</span>
                                        </a>
                                        <br />
                                        <a href="/training/programmodulessemester">
                                            <i class="icon mdi mdi-book"></i>
                                            <span>Khung theo kỳ</span>
                                        </a>
                                    </p>
                                    <p>
                                        <a href="/register/dangkyhocphan">
                                            <i class="icon mdi mdi-calendar-note"></i>
                                            <span>ĐK HP dự kiến</span>
                                        </a>
                                        <br />
                                        <a href="/register/">
                                            <i class="fa flaticon-key105 icon"></i>
                                            <span>Đăng ký học phần</span>
                                        </a>
                                    </p>
                                    <p>
                                        <a href="/student/result/studyresults">
                                            <i class="fa flaticon-a10 icon"></i>
                                            <span>Kết quả học tập</span>
                                        </a>
                                        <br />
                                        <a href="/student/result/examresult">
                                            <i class="fa flaticon-a10 icon"></i>
                                            <span>Kết quả thi</span>
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            beLeftSidebar.insertAdjacentHTML("afterend", studyTabNext);
            GM_addStyle(`
                #add-them-tab {
                    display: block;
                }
                #add-them-tab > p {
                    font-size: 20px;
                    margin: 10px;
                    padding: 10px;
                    color: #3d3d3d;
                    border-radius: 10px;
                    border: 1px solid #3d3d3d;
                    line-height: 2;
                }
                #add-them-tab > p > a {
                    color: #3d3d3d;
                }
                #add-them-tab > p > a:hover {
                    background-color: #d0f0db;
                    color: #000000;
                }
                #add-them-tab > p > a > i {
                    margin-right: 10px;
                    scale: 1.5;
                }
                `);
        }
    }
    // Highlight grade scores
    function highlightGradeScores() {
        if (
            currentURL != "https://sv.haui.edu.vn/student/result/examresult" &&
            !currentURL.includes("https://sv.haui.edu.vn/student/result/viewexamresult?code=")
        ) {
            return;
        }
        const scoresBoxColor = {
            4.0: "rgb(64,212,81)", // A
            3.5: "rgb(49, 163, 255)", // B+
            3.0: "rgb(20, 120, 230)", // B
            2.5: "rgb(255,186,0)", // C+
            2.0: "rgb(255,144,0)", // C
            1.5: "rgb(255, 50, 0)", // D+
            1.0: "rgb(200, 0, 0)", // D
            0.0: "rgb(157, 0, 255)", // F
        };
        const creditsBoxColor = {
            "5.0": "rgb(200, 0, 100)",
            "4.0": "rgb(255, 0, 0)",
            "3.0": "rgb(255, 165, 0)",
            "2.0": "rgb(0, 191, 255)",
            "1.0": "rgb(46, 204, 64)",
        };
        const hpNotGPA = [
            "FL609", // Tiếng Anh cơ bản FL609x
            "PE60", // Giáo dục thể chất PE60xx
            "DC600", // Giáo dục quốc phòng DC600x
            "IC6005", // Công nghệ thông tin cơ bản
            "IC6007", // Công nghệ thông tin nâng cao
        ];
        const hocPhan = $$("tr.kTableAltRow, tr.kTableRow", $("div.kGrid"));

        for (const row of hocPhan) {
            // Bỏ qua hpNotGPA
            if (hpNotGPA.some((hp) => row.children[1].textContent.includes(hp))) continue;
            const oDiem = row.children[12];
            const diemSo = 0.0 + Number(oDiem.textContent.trim());
            // Bỏ qua những học phần không có điểm
            row.children[5].style.backgroundColor =
                creditsBoxColor[row.children[5].textContent.trim()];
            row.children[5].style.color = "#FFFFFF";
            // Bỏ qua những học phần không có điểm
            if (oDiem.textContent.trim() == "") continue;
            // Tô màu điểm
            row.children[13].style.backgroundColor = scoresBoxColor[diemSo];
            row.children[13].style.color = "#FFFFFF";
        }
    }
    // Highlight TX scores
    function highlightTXScores() {
        if (currentURL != "https://sv.haui.edu.vn/student/result/studyresults") {
            return;
        }
        const hpToNext = ["FL6091OT.1"];
        const hocPhan = $$("tr.kTableAltRow, tr.kTableRow", $("div.kGrid"));
        console.log("hocPhan: ", hocPhan);
        for (const row of hocPhan) {
            if (hpToNext.some((hp) => row.children[2].textContent.includes(hp))) continue;
            if (row.children[4].textContent.trim() == "")
                row.children[4].style.backgroundColor = "#F1C40F";
        }
    }
    // Sort exam schedule
    function sortExamSchedule() {
        if (currentURL != "https://sv.haui.edu.vn/student/schedulefees/transactionmodules") {
            return;
        }
        // xắp xếp lịch thi
        const examScheduleContainer = $("div.kGrid > div > table:nth-child(3) > tbody");
        const examSchedule = $$("tr.kTableAltRow, tr.kTableRow");
        // console.log("examSchedule: ", examSchedule);
        for (let i = examSchedule.length - 1; i >= 0; i--) {
            examScheduleContainer.appendChild(examSchedule[i]);
        }
    }
    // Convert date
    function convertDate(ddmmyyyy) {
        // Convert dd/mm/yy to d/m/yyyy
        const dateArray = ddmmyyyy.split("/");
        if (dateArray[0].startsWith("0")) {
            dateArray[0] = dateArray[0].slice(1);
        }
        if (dateArray[1].startsWith("0")) {
            dateArray[1] = dateArray[1].slice(1);
        }
        return dateArray;
    }
    // Check exam time
    function checkExamTime(examElement, cellIndex) {
        // console.log(`today: ${todayDate}/${todayMonth}/${todayYear}`);

        const examTime = examElement.children[cellIndex].textContent.trim();
        const examDateArray = convertDate(examTime);
        const examDate = examDateArray[0];
        const examMonth = examDateArray[1];
        const examYear = examDateArray[2];
        // so sánh ngày thi
        if (examYear > todayYear) {
            return true;
        } else if (examYear == todayYear) {
            if (examMonth > todayMonth) {
                return true;
            } else if (examMonth == todayMonth) {
                if (examDate >= todayDate) {
                    return true;
                }
            }
        }
    }
    // Highlight exam schedule
    function highlightExamSchedule() {
        if (currentURL != "https://sv.haui.edu.vn/student/schedulefees/transactionmodules") {
            return;
        }
        const examSchedule = $$("tr.kTableAltRow, tr.kTableRow");
        for (const examElement of examSchedule) {
            if (checkExamTime(examElement, 2)) {
                examElement.style.backgroundColor = "#F1C40F";
            }
        }
    }
    // Get exam plan
    async function getExamPlan(getHPCode) {
        try {
            const response = await fetch(
                `https://sv.haui.edu.vn/student/schedulefees/examplant?code=${getHPCode}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                        "accept-language": "vi,en-US;q=0.9,en;q=0.8",
                        "upgrade-insecure-requests": "1",
                    },
                }
            );
            const html = await response.text();
            // Parse the HTML response
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const examScheduleResult = $(
                "#ctl02_ctl00_viewResult > div > div > table > tbody > tr",
                doc
            );
            return examScheduleResult;
        } catch (err) {
            console.error(`Lỗi khi lấy lịch thi cho ${getHPCode}: `, err);
        }
    }
    // Get hpCode
    function getHpCode(scope = document) {
        const listHPCodeElement = $$(
            "div:nth-child(3) > div > div > table > tbody > tr > td:nth-child(2) > a",
            scope
        );
        let listHPCode = [];
        for (const element of listHPCodeElement) {
            const hpCode = element.textContent.trim();
            if (hpCode) {
                listHPCode.push(hpCode);
            }
        }
        listHPCode.reverse();
        return listHPCode;
    }
    // Show list exam plan
    async function showExamPlan() {
        if (currentURL != "https://sv.haui.edu.vn/student/schedulefees/examplant") {
            return;
        }
        let listHPCode = getHpCode(document);
        listHPCode = listHPCode.slice(0, 12);
        const hpNotExam = ["PE60", "OT"];
        const examScheduleResultTable = $("#ctl02_ctl00_viewResult > div > div > table > tbody");
        let i = 1;
        for (const hpCode of listHPCode) {
            if (hpNotExam.some((hp) => hpCode.includes(hp))) continue;
            let examPlan = await getExamPlan(hpCode);
            // Nếu không dự kiến thì bỏ qua
            if (examPlan == null) continue;
            // Nếu chưa đến ngày thi thì tô màu vàng
            if (checkExamTime(examPlan, 3)) {
                examPlan.children[0].textContent = `${i}`;
                examPlan.style.backgroundColor = "#F1C40F";
                examScheduleResultTable.appendChild(examPlan);
                i++;
            }
            await delay(200);
        }
    }
    // ======================================================================================
    const changeHeaderInterval = controlInterval(changeHeader, 5000);
    setTimeout(() => {
        // Run
        console.log("sv.HaUI loaded: " + currentURL);
        // Change header
        changeHeaderInterval.start(5000, true);
        // Customize Home page
        customizeHomePage();

        // Highlight grade scores
        highlightGradeScores();

        // Highlight TX scores
        highlightTXScores();

        // Sort exam schedule
        sortExamSchedule();
        // Highlight exam schedule
        highlightExamSchedule();

        // Show exam plan
        showExamPlan();
    }, 500);
})();
