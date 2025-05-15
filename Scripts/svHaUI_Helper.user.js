// ==UserScript==
// @name         sv.HaUI
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      2.4
// @description  Công cụ hỗ trợ cho sinh viên HaUI
// @author       QuanVu
// @downloadURL  https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/svHaUI_Helper.user.js
// @updateURL    https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/svHaUI_Helper.user.js
// @match        https://sv.haui.edu.vn/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";
    // =====================================================================================
    // Change header
    function changeHeader() {
        if (!document.querySelector("div.panel-heading")) return;
        let newTitle = document.querySelector("div.panel-heading").textContent;
        console.log("Last title: ", newTitle);
        newTitle = newTitle.replace("\n", "");
        newTitle = newTitle.replace("\t", "");
        newTitle = newTitle.replace("TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP HÀ NỘI", "");
        newTitle = newTitle.replace("Đại học công nghiệp Hà Nội", "");
        newTitle = newTitle.replace("CHI TIẾT HỌC PHẦN CDIO: ", "");
        document.title = newTitle;
    }
    // add Học kết hợp to sidebar
    function addStudyTab() {
        const beLeftSidebar = document.querySelector("div.be-left-sidebar");
        if (beLeftSidebar) {
            let studyTabNext = `
                <div class="be-content">
                    <div class="main-content container-fluid">
                        <form name="frmMain" id="frmMain" data-toggle="validator" role="form">
                            <div class="panel panel-default panel-border-color panel-border-color-primary">
                                <style>
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
                                </style>
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
                                            <i class="fa flaticon-a10 icon"></i>
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
        }
    }
    // ======================================================================================
    changeHeader();
    if (window.location.href == "https://sv.haui.edu.vn/") {
        addStudyTab();
    }
    setInterval(() => {
        changeHeader();
    }, 10000);
})();
