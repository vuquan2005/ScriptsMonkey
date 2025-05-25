// ==UserScript==
// @name         sv.HaUI
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      7.0
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
        const frmMain = $("form#frmMain");
        if (frmMain) {
            const studyTabNext = `
            <div class="panel panel-default panel-border-color panel-border-color-primary">
                <div id="short-cut-panel">
                    <div class="panel-heading">
                        <h3 class="panel-title">Một số chức năng chính</h3>
                    </div>
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
            `;
            frmMain.insertAdjacentHTML("beforeend", studyTabNext);
            GM_addStyle(`
                #short-cut-panel {
                    display: block;
                }
                #short-cut-panel > p {
                    font-size: 20px;
                    margin: 10px;
                    padding: 10px;
                    color: #3d3d3d;
                    border-radius: 10px;
                    border: 1px solid #3d3d3d;
                    line-height: 2;
                }
                #short-cut-panel > p > a {
                    color: #3d3d3d;
                }
                #short-cut-panel > p > a:hover {
                    background-color: #d0f0db;
                    color: #000000;
                }
                #short-cut-panel > p > a > i {
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
                row.children[4].style.backgroundColor = "rgb(248,226,135)";
        }
    }
    // ======================================================================================
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
    function checkExamTime(examElement, cellIndex, isOneMonthLate = false) {
        // console.log(`today: ${todayDate}/${todayMonth}/${todayYear}`);

        const examTime = examElement.children[cellIndex].textContent.trim();
        const examDateArray = convertDate(examTime);
        const examDate = examDateArray[0];
        const examMonth = examDateArray[1];
        const examYear = examDateArray[2];
        // so sánh ngày thi
        console.log(`${examElement}: ${examYear}/${examMonth}/${examDate}\nToday: ${todayYear}/${todayMonth}/${todayDate}`);
        if (examYear > todayYear) {
            return true;
        } else if (examYear == todayYear && examMonth > todayMonth) {
            return true;
        } else if (examYear == todayYear && examMonth == todayMonth && examDate >= todayDate) {
            return true;
        } else if (examYear == todayYear && examMonth > (todayMonth - 1) && isOneMonthLate) {
            return true;
        } else if (examYear == todayYear && examMonth == (todayMonth - 1) && isOneMonthLate && examDate >= todayDate) {
            return true;
        } else {
            return false;
        }
    }
    // Fetch DOM
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
    // ======================================================================================
    // Kế hoạch thi
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
    // Get exam plan
    async function getExamPlan(getHPCode) {
        const url = `https://sv.haui.edu.vn/student/schedulefees/examplant?code=${getHPCode}`;
        try {
            const dom = await fetchDOM(url);
            return $("#ctl02_ctl00_viewResult > div > div > table > tbody > tr", dom);
        } catch (err) {
            console.error(`Lỗi khi lấy lịch thi cho ${getHPCode}: `, err);
        }
    }
    // Show list exam plan
    async function showExamPlan() {
        if (currentURL != "https://sv.haui.edu.vn/student/schedulefees/examplant") {
            return;
        }
        let listHPCode = getHpCode(document);
        // Lấy 13 học phần gần nhất
        listHPCode = listHPCode.slice(0, 12);
        const hpNotExam = ["PE60", "OT"];
        const examScheduleResultTable = $("#ctl02_ctl00_viewResult > div > div > table > tbody");
        let i = 0;
        let listExamPlan = [];
        for (const hpCode of listHPCode) {
            if (hpNotExam.some((hp) => hpCode.includes(hp))) continue;
            let examPlan = await getExamPlan(hpCode);
            // Nếu không có lịch
            if (examPlan == null) continue;
            listExamPlan.push(examPlan);
            // Hiển thị kế hoạch thi 13 học phần gần nhất
            if (checkExamTime(examPlan, 3, true)) {
                i++;
                examPlan.children[0].textContent = `${i}`;
                // Nếu chưa đến ngày thi thì tô màu vàng
                if (checkExamTime(examPlan, 3, false))
                    examPlan.style.backgroundColor = "rgb(248,226,135)";
                examScheduleResultTable.appendChild(examPlan);
            }
            await delay(200);
        }
        console.log("listExamPlan: ", listExamPlan);
    }

    // Create exam plan panel in home page
    function createExamPlanPanelInHomePage() {
        if (currentURL != "https://sv.haui.edu.vn/") {
            return;
        }
        const examPlanPanelHtml = `
            <div id="exam-plan-panel">
                <div class="panel-heading">
                    <h3 class="panel-title">
                        <a href="/student/schedulefees/examplant">Kế hoạch thi</a>
                    </h3>
                </div>
                <table class="table table-bordered table-striped">
                    <thead>
                        <tr class="kTableHeader">
                        <td>STT</td>
                        <td>Mã lớp độc lập</td>
                        <td>Tên học phần</td>
                        <td>Ngày thi</td>
                        <td>Ca thi</td>
                        <td>Lần thi</td>
                        <td>Lớp ưu tiên</td>
                        <td>Khoa</td>
                    </tr>
                </thead>
                <tbody id="exam-plan-body">
                    </tbody>
                </table>
            </div>
        `;
        const mainPanel = $(
            "form#frmMain > div.panel.panel-default.panel-border-color.panel-border-color-primary"
        );
        mainPanel.insertAdjacentHTML("beforeend", examPlanPanelHtml);
        getExamPlanInHomePage();
    }
    // Get exam plan in home page
    async function getExamPlanInHomePage() {
        const examPlanDOM = await fetchDOM("https://sv.haui.edu.vn/student/schedulefees/examplant");
        let listHPCode = getHpCode(examPlanDOM);
        listHPCode = listHPCode.slice(0, 12);
        const hpNotExam = ["PE60", "OT"];
        let i = 0;
        let listExamPlan = [];
        for (const hpCode of listHPCode) {
            if (hpNotExam.some((hp) => hpCode.includes(hp))) continue;
            let examPlan = await getExamPlan(hpCode);
            // Nếu không có lịch thì bỏ qua
            if (examPlan == null) continue;
            if (checkExamTime(examPlan, 3, true)) {
                i++;
                examPlan.children[0].textContent = `${i}`;
                // Nếu chưa đến ngày thi thì tô màu vàng
                if (checkExamTime(examPlan, 3, false))
                    examPlan.style.backgroundColor = "rgb(248,226,135)";
                listExamPlan.push(examPlan);
                addExamPlanToPanel(examPlan);
            }
            await delay(200);
        }
        console.log("listExamPlan: ", listExamPlan);
        return listExamPlan;
    }
    // Show exam plan in home page
    function addExamPlanToPanel(examPlan) {
        const examPlanContainer = $("#exam-plan-body");
        examPlanContainer.appendChild(examPlan);
    }

    // ======================================================================================
    // Lịch thi
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
    // Highlight exam schedule
    function highlightExamSchedule() {
        if (currentURL != "https://sv.haui.edu.vn/student/schedulefees/transactionmodules") {
            return;
        }
        const examSchedule = $$("tr.kTableAltRow, tr.kTableRow");
        for (const examElement of examSchedule) {
            console.log(examElement);
            if (checkExamTime(examElement, 2, false)) {
                examElement.style.backgroundColor = "rgb(248,226,135)";
            }
        }
    }

    // Create exam schedule panel in home page
    function createExamSchedulePanelInHomePage() {
        if (currentURL != "https://sv.haui.edu.vn/") {
            return;
        }
        const examSchedulePanelHtml = `
            <div id="exam-schedule-panel">
                <div class="panel-heading">
                    <h3 class="panel-title">
                        <a href="/student/schedulefees/transactionmodules">Lịch thi</a>
                    </h3>
                </div>
                <table class="table table-bordered table-striped">
                    <thead>
                        <td>STT</td>
                        <td>Môn thi</td>
                        <td>Ngày thi</td>
                        <td>Ca thi</td>
                        <td>SBD</td>
                        <td>Lần thi</td>
                        <td>Vị trí thi</td>
                        <td>Phòng thi</td>
                        <td>Tòa nhà</td>
                        <td>Cơ sở</td>
                        <td>Tiền VP PVT</td>
                        <td>Tham gia thi</td>
                        <td>Tình trạng</td>
                    </tr>
                </thead>
                <tbody id="exam-schedule-body">
                    </tbody>
                </table>
            </div>
        `;
        const mainPanel = $(
            "form#frmMain > div.panel.panel-default.panel-border-color.panel-border-color-primary"
        );
        mainPanel.insertAdjacentHTML("beforeend", examSchedulePanelHtml);
        getExamSchedule();
    }
    // Get exam schedule
    async function getExamSchedule() {
        const examScheduleDOM = await fetchDOM(
            "https://sv.haui.edu.vn/student/schedulefees/transactionmodules"
        );
        const examSchedule = $$("tr.kTableAltRow, tr.kTableRow", examScheduleDOM);
        let i = 0;
        let listExamSchedule = [];
        for (const examScheduleElement of examSchedule) {
            if (checkExamTime(examScheduleElement, 2, true)) {
                i++;
                examScheduleElement.children[13].remove();
                examScheduleElement.children[0].textContent = `${i}`;
                // Nếu chưa đến ngày thi thì tô màu vàng
                if (checkExamTime(examScheduleElement, 2, false))
                    examScheduleElement.style.backgroundColor = "rgb(248,226,135)";
                listExamSchedule.push(examScheduleElement);
                addExamScheduleToPanel(examScheduleElement);
            }
        }
        console.log("listExamSchedule: ", listExamSchedule);
        return listExamSchedule;
    }
    // Show exam schedule
    function addExamScheduleToPanel(examSchedule) {
        const examScheduleContainer = $("#exam-schedule-body");
        examScheduleContainer.appendChild(examSchedule);
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
        // Create exam schedule panel in home page
        createExamSchedulePanelInHomePage();
        // Create exam plan panel in home page
        createExamPlanPanelInHomePage();

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
