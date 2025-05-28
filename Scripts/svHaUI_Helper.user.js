// ==UserScript==
// @name         sv.HaUI
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      13.0
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
    const todayDateString = `${todayDate}/${todayMonth}/${todayYear}`;
    // =====================================================================================
    // Change header
    function changeHeader() {
        if (!$("span.k-panel-header-text:first-child")) return;
        let newTitle = $("span.k-panel-header-text:first-child").textContent;
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
        if (currentURL != "https://sv.haui.edu.vn/" || !$("span.user-name")) {
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
            // Tô màu tín chỉ
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
    // Highlight studyresults scores
    function highlightStudyresultsScores() {
        if (currentURL != "https://sv.haui.edu.vn/student/result/studyresults") {
            return;
        }
        const hpToNext = ["FL6091OT.1"];
        const hocPhan = $$("tr.kTableAltRow, tr.kTableRow", $("div.kGrid"));
        // console.log("hocPhan: ", hocPhan);
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
    // Tính khoảng cách ngày giữa 2 ngày
    function calculateDateDifference(date1, date2 = todayDateString) {
        console.log(`date1: ${date1}, date2: ${date2}`);
        const date1Array = convertDate(date1);
        const date2Array = convertDate(date2);
        console.log(`date1Array: ${date1Array}, date2Array: ${date2Array}`);
        const d1 = new Date(date1Array[2], date1Array[1] - 1, date1Array[0]);
        const d2 = new Date(date2Array[2], date2Array[1] - 1, date2Array[0]);
        const difference = d1.getTime() - d2.getTime();
        return difference / (1000 * 60 * 60 * 24);
    }
    // Check exam time
    function checkExamTime(examElement, cellIndex, isOneMonthLate = false) {
        // console.log(`today: ${todayDate}/${todayMonth}/${todayYear}`);

        const examTime = examElement.children[cellIndex].textContent.trim();
        const examDateArray = convertDate(examTime);
        const examDate = examDateArray[0];
        const examMonth = examDateArray[1];
        const examYear = examDateArray[2];
        // console.log(`${examElement}: ${examYear}/${examMonth}/${examDate}\nToday: ${todayYear}/${todayMonth}/${todayDate}`);
        // so sánh ngày thi
        if (examYear > todayYear) {
            return true;
        } else if (examYear == todayYear && examMonth > todayMonth) {
            return true;
        } else if (examYear == todayYear && examMonth == todayMonth && examDate >= todayDate) {
            return true;
        } else if (examYear == todayYear && examMonth > todayMonth - 1 && isOneMonthLate) {
            return true;
        } else if (
            examYear == todayYear &&
            examMonth == todayMonth - 1 &&
            isOneMonthLate &&
            examDate >= todayDate
        ) {
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
            }
            if (checkExamTime(examPlan, 3, false)) {
                // Nếu chưa đến ngày thi thì tô màu vàng
                examPlan.style.backgroundColor = "rgb(248,226,135)";
                // Hiển thị khoảng cách ngày
                examPlan.children[3].innerHTML += `<br>(${calculateDateDifference(
                    examPlan.children[3].textContent
                )} ngày sau)`;
            }
            examScheduleResultTable.appendChild(examPlan);
            await delay(200);
        }
        // console.log("listExamPlan: ", listExamPlan);
    }

    // Create exam plan panel in home page
    function createExamPlanPanelInHomePage() {
        if (currentURL != "https://sv.haui.edu.vn/" || !$("span.user-name")) {
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

                if (checkExamTime(examPlan, 3, false)) {
                    // Nếu chưa đến ngày thi thì tô màu vàng
                    examPlan.style.backgroundColor = "rgb(248,226,135)";
                    // Hiển thị khoảng cách ngày
                    examPlan.children[3].innerHTML += `<br>(${calculateDateDifference(
                        examPlan.children[3].textContent
                    )} ngày sau)`;
                }
                if (checkExamTime(examPlan, 3, true)) {
                    // Hiển thị khoảng cách ngày
                    examPlan.children[3].innerHTML += `<br>(${Math.abs(
                        calculateDateDifference(examPlan.children[3].textContent)
                    )} ngày trước)`;
                }
                listExamPlan.push(examPlan);
                addExamPlanToPanel(examPlan);
            }
            await delay(200);
        }
        // console.log("listExamPlan: ", listExamPlan);
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
            if (checkExamTime(examElement, 2, false)) {
                examElement.style.backgroundColor = "rgb(248,226,135)";
                // Hiển thị khoảng cách ngày
                examElement.children[2].innerHTML += `<br>(${calculateDateDifference(
                    examElement.children[2].textContent
                )} ngày sau)`;
            }
        }
    }

    // Create exam schedule panel in home page
    function createExamSchedulePanelInHomePage() {
        if (currentURL != "https://sv.haui.edu.vn/" || !$("span.user-name")) {
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

                if (checkExamTime(examScheduleElement, 2, false)) {
                    // Nếu chưa đến ngày thi thì tô màu vàng
                    examScheduleElement.style.backgroundColor = "rgb(248,226,135)";
                    // Hiển thị khoảng cách ngày
                    examScheduleElement.children[2].innerHTML += `<br>(${calculateDateDifference(
                        examScheduleElement.children[2].textContent
                    )} ngày sau)`;
                }
                if (checkExamTime(examScheduleElement, 2, true)) {
                    // Hiển thị khoảng cách ngày
                    examScheduleElement.children[2].innerHTML += `<br>(${Math.abs(
                        calculateDateDifference(examScheduleElement.children[2].textContent)
                    )} ngày trước)`;
                }
                listExamSchedule.push(examScheduleElement);
                addExamScheduleToPanel(examScheduleElement);
            }
        }
        // console.log("listExamSchedule: ", listExamSchedule);
        return listExamSchedule;
    }
    // Show exam schedule
    function addExamScheduleToPanel(examSchedule) {
        const examScheduleContainer = $("#exam-schedule-body");
        examScheduleContainer.appendChild(examSchedule);
    }
    // ======================================================================================
    // Check total credits
    function checkTotalCredits() {
        if (currentURL != "https://sv.haui.edu.vn/training/viewcourseindustry") {
            return;
        }
        let totalCredits = $(
            "#ctl02_dvList > tbody > tr:nth-child(7) > td.k-table-viewdetail"
        ).textContent.trim();
        totalCredits = totalCredits.replace("(tín chỉ)", "");
        const totalCreditsNumber = Number(totalCredits);

        GM_setValue("totalCredits", totalCreditsNumber);
        console.log("totalCredits: ", totalCreditsNumber);
    }
    // Get date some info in examresult
    function getSomeInfoInExamresult(tableContainer) {
        const currentCredits = $("tbody > tr:last-child > td:first-child", tableContainer);
        const currentCreditsNumber = Number(
            currentCredits.textContent.trim().match(/(\d+)(?:\.\d+)?/g)[0]
        );
        GM_setValue("currentCredits", currentCreditsNumber);
        console.log("currentCredits: ", currentCreditsNumber);

        const currentGPA = $("tbody > tr:nth-last-child(2) > td:nth-child(2)", tableContainer);
        const currentGPAValue = Number(currentGPA.textContent.trim().match(/(\d+)(?:\.\d+)?/g)[0]);
        GM_setValue("currentGPA", currentGPAValue);
        console.log("currentGPA: ", currentGPAValue);
    }
    // Add some info in examresult
    function addSomeInfoInExamresult() {
        if (
            currentURL != "https://sv.haui.edu.vn/student/result/examresult" &&
            !currentURL.includes("https://sv.haui.edu.vn/student/result/viewexamresult?code=")
        ) {
            return;
        }
        let tableContainer;
        if (currentURL == "https://sv.haui.edu.vn/student/result/examresult") {
            tableContainer = $("div.kGrid:last-child > table");
        } else {
            tableContainer = $("div.kGrid> div > table");
        }
        getSomeInfoInExamresult(tableContainer);
        const newElement = document.createElement("span");
        newElement.className = "info-examresult";
        GM_addStyle(`
            .info-examresult {
                color: Red;
                font-weight: bold;
                font-size: 12px;
                padding-left: 5px;
            }
        `);
        newElement.style.paddingLeft = "5px";
        tableContainer.insertAdjacentElement("afterend", newElement);

        const totalCredits = GM_getValue("totalCredits");
        if (totalCredits == null) {
            console.log("Không tìm thấy tổng số tín chỉ");
            return;
        }
        const currentCredits = GM_getValue("currentCredits");
        const currentGPA = GM_getValue("currentGPA");
        const remainingCredits = totalCredits - currentCredits;
        const scoresToGPA25 = (2.5 * totalCredits - currentGPA * currentCredits) / remainingCredits;
        const scoresToGPA32 = (3.2 * totalCredits - currentGPA * currentCredits) / remainingCredits;
        const scoresToGPA36 = (3.6 * totalCredits - currentGPA * currentCredits) / remainingCredits;
        newElement.innerHTML = `
            <p>Số tín còn lại: ${remainingCredits}</p>
            <p style="display: none;">Các môn còn lại cần đạt: ${scoresToGPA25.toFixed(
                2
            )} để GPA 2.5</p>
            <p>Các môn còn lại cần đạt: ${scoresToGPA32.toFixed(2)} để GPA 3.2</p>
            <p>Các môn còn lại cần đạt: ${scoresToGPA36.toFixed(2)} để GPA 3.6</p>
            <input type="checkbox" id="edit-score"> Sửa điểm </input>
        `;

        const currentCreditsSpan = $(
            "tbody > tr:last-child > td:first-child > span",
            tableContainer
        );
        currentCreditsSpan.textContent = currentCreditsSpan.textContent.replace(
            /(\d+)\.0\b/g,
            "$1"
        );
        currentCreditsSpan.textContent += ` / ${totalCredits}`;
    }

    // Check edit score is enable
    function checkEditScoreIsEnable() {
        const editScoreButton = $("#edit-score");
        const hocPhan = $$("tr.kTableAltRow, tr.kTableRow", $("div.kGrid"));

        const letterScore = {
            4: "A",
            3.5: "B+",
            3: "B",
            2.5: "C+",
            2: "C",
            1.5: "D+",
            1: "D",
            0: "F",
        };
        // Lưu lại original-score
        for (const row of hocPhan) {
            if (row.children[12].getAttribute("original-score") == null)
                row.children[12].setAttribute(
                    "original-score",
                    row.children[12].textContent.trim()
                );
        }

        if (!editScoreButton.checked) {
            // Not checked
            for (const row of hocPhan) {
                console.log("row: ", row);
                // Disable edit score
                row.children[12].setAttribute("contenteditable", "false");
                // Return original score
                row.children[12].textContent = row.children[12].getAttribute("original-score");
                row.children[13].textContent =
                    letterScore[row.children[12].getAttribute("original-score")];
                // Remove text content
                row.children[15].textContent = "";
            }
            highlightGradeScores();
            return false;
        } else {
            // Checked
            for (const row of hocPhan) {
                // Enable edit score
                row.children[12].setAttribute("contenteditable", "true");
                // Refresh letter score
                row.children[13].textContent = letterScore[row.children[12].textContent.trim()];
                row.children[15].textContent =
                    letterScore[row.children[12].getAttribute("original-score")];
            }
            highlightGradeScores();
            return true;
        }
    }
    // Recalculate GPA
    function recalculateGPA() {
        const hpNotGPA1 = [
            "FL609", // Tiếng Anh cơ bản FL609x
            "PE60", // Giáo dục thể chất PE60xx
            "DC600", // Giáo dục quốc phòng DC600x
            "IC6005", // Công nghệ thông tin cơ bản
            "IC6007", // Công nghệ thông tin nâng cao
        ];
        const hocPhan = $$("tr.kTableAltRow, tr.kTableRow", $("div.kGrid"));

        let diemTB = 0;
        let tongTinChi = 0;
        for (const row of hocPhan) {
            // Bỏ qua hpNotGPA
            if (hpNotGPA1.some((hp) => row.children[1].textContent.includes(hp))) continue;
            const oDiem = row.children[12];
            // Bỏ qua những học phần không có điểm
            if (oDiem.textContent.trim() == "") continue;
            const diemSo = Number(oDiem.textContent.trim());
            const tinChi = Number(row.children[5].textContent.trim());
            diemTB += diemSo * tinChi;
            tongTinChi += tinChi;
        }
        const GPA = diemTB / tongTinChi;
        return GPA;
    }
    // Show recalculated GPA
    function showRecalculatedGPA() {
        if (
            currentURL != "https://sv.haui.edu.vn/student/result/examresult" &&
            !currentURL.includes("https://sv.haui.edu.vn/student/result/viewexamresult?code=")
        ) {
            return;
        }
        if (!checkEditScoreIsEnable()) {
            return;
        }

        const GPA = recalculateGPA();

        if ($("span#can-replace.info-examresult")) {
            $("span#can-replace.info-examresult").remove();
        }
        const tableContainer = $("div.kGrid:last-child > div:last-child");
        const newElement = document.createElement("span");
        newElement.className = "info-examresult";
        newElement.id = "can-replace";

        const totalCredits = GM_getValue("totalCredits");
        if (totalCredits == null) {
            console.log("Không tìm thấy tổng số tín chỉ");
            return;
        }
        const currentCredits = GM_getValue("currentCredits");
        const remainingCredits = totalCredits - currentCredits;
        const scoresToGPA25 = (2.5 * totalCredits - GPA * currentCredits) / remainingCredits;
        const scoresToGPA32 = (3.2 * totalCredits - GPA * currentCredits) / remainingCredits;
        const scoresToGPA36 = (3.6 * totalCredits - GPA * currentCredits) / remainingCredits;
        newElement.innerHTML = `<hr>
            <p>Tính lại:</p>
            <p>GPA: ${GPA.toFixed(2)}</p>
            <p style="display: none;">Các môn còn lại cần đạt: ${scoresToGPA25.toFixed(
                2
            )} để GPA 2.5</p>
            <p>Các môn còn lại cần đạt: ${scoresToGPA32.toFixed(2)} để GPA 3.2</p>
            <p>Các môn còn lại cần đạt: ${scoresToGPA36.toFixed(2)} để GPA 3.6</p>
        `;
        tableContainer.insertAdjacentElement("beforeend", newElement);
    }
    // ======================================================================================
    // Toggle examresult and studyresults
    function toggleExamresultAndStudyresults() {
        if (
            currentURL != "https://sv.haui.edu.vn/student/result/examresult" &&
            currentURL != "https://sv.haui.edu.vn/student/result/studyresults" &&
            !currentURL.includes("https://sv.haui.edu.vn/student/result/viewexamresultclass?id=") &&
            !currentURL.includes("https://sv.haui.edu.vn/student/result/viewstudyresultclass?id=")
        ) {
            return;
        }
        const queryString = new URL(currentURL).search;
        console.log("queryString: ", queryString);
        const title = $("div.panel-heading");
        const toggleLinkContainer = document.createElement("p");
        const toggleLink = document.createElement("a");
        toggleLink.style.color = "gray";
        toggleLink.style.fontSize = "12px";
        toggleLinkContainer.appendChild(toggleLink);

        if (currentURL.includes("https://sv.haui.edu.vn/student/result/examresult")) {
            toggleLink.textContent = "---Điểm TX---";
            toggleLink.href = "https://sv.haui.edu.vn/student/result/studyresults";
        } else if (currentURL.includes("https://sv.haui.edu.vn/student/result/studyresults")) {
            toggleLink.textContent = "---Điểm thi---";
            toggleLink.href = "https://sv.haui.edu.vn/student/result/examresult";
        } else if (
            currentURL.includes("https://sv.haui.edu.vn/student/result/viewexamresultclass?id=")
        ) {
            toggleLink.textContent = "---Điểm TX lớp---";
            toggleLink.href =
                "https://sv.haui.edu.vn/student/result/viewstudyresultclass?id=" + queryString;
        } else if (
            currentURL.includes("https://sv.haui.edu.vn/student/result/viewstudyresultclass?id=")
        ) {
            toggleLink.textContent = "---Điểm thi lớp---";
            toggleLink.href =
                "https://sv.haui.edu.vn/student/result/viewexamresultclass?id=" + queryString;
        }

        title.appendChild(toggleLinkContainer);
    }
    // ======================================================================================
    const changeHeaderInterval = controlInterval(changeHeader, 5000);
    const showRecalculatedGPAInterval = controlInterval(showRecalculatedGPA, 1000);
    setTimeout(() => {
        // Run
        console.log("sv.HaUI loaded: " + currentURL);
        // Change header
        changeHeaderInterval.start(5000, true);
        // Show recalculated GPA
        showRecalculatedGPAInterval.start(1000, false);

        // Customize Home page
        customizeHomePage();
        // Create exam schedule panel in home page
        createExamSchedulePanelInHomePage();
        // Create exam plan panel in home page
        createExamPlanPanelInHomePage();

        // Highlight grade scores
        highlightGradeScores();
        // Show the total credits
        addSomeInfoInExamresult();

        // Highlight studyresults scores
        highlightStudyresultsScores();

        // Toggle examresult and studyresults
        toggleExamresultAndStudyresults();

        // Sort exam schedule
        sortExamSchedule();
        // Highlight exam schedule
        highlightExamSchedule();

        // Show exam plan
        showExamPlan();

        // Check total credits
        checkTotalCredits();
    }, 500);
})();
