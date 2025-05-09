// ==UserScript==
// @name         GocTruyenTranhEnhance
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      2.11.1
// @description  Tối ưu trải nghiệm đọc truyện tranh trực tuyến
// @author       QuanVu
// @include      /https:\/\/goctruyentranhvui\d+\.com\/truyen\/.*/
// @updateURL    https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/TruyenTranhEnhance.user.js
// @downloadURL  https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/TruyenTranhEnhance.user.js
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    "use strict";
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => scope.querySelectorAll(selector);
    // ==================================
    const positionOfOverlay = $("div.image-section");
    const selectorImagesTruyen = "img.image.finished";
    const chapterNavigationTab = $("div.top-move-pannel");
    const settingsTab = $("div.setting");
    const switchServer = $("div.switch-server");
    const positionOfOpacityBtn = $("div > div:nth-child(2) > div > div", chapterNavigationTab);
    // ==================================
    // Scroll function
    function Enhance_Scroll(
        element,
        clickHandler = () => {},
        longPressHandler = () => {},
        holdHandler = () => {},
        dblClickHandler = () => {},
        triClickHandler = () => {}
    ) {
        let clickCount = 0;
        let clickTimer = null;
        let dblClickTimer = null;
        let holdTimer = null;
        let pointDownTimer = null;
        let pointUpTimer = null;
        let isHold = false;
        let startX = 0;
        let startY = 0;
        let moved = false;
        const delay = 250;
        const longPressDelay = 400;
        const holdDelay = 1500;
        const moveThreshold = 10; // pixel - nếu di chuyển quá 10px thì coi như vuốt

        element.onpointerdown = function (event) {
            isHold = false;
            moved = false;
            startX = event.clientX;
            startY = event.clientY;
            pointDownTimer = new Date().getTime();
            holdTimer = setTimeout(() => {
                if (!moved) {
                    //holdHandler();
                    console.log(element.className, "Hold");
                    isHold = true;
                    clickCount = 0;
                }
            }, holdDelay);
            console.log("pointerdown");
            event.stopPropagation();
        };
        element.onpointermove = function (event) {
            const dx = event.clientX - startX;
            const dy = event.clientY - startY;
            if (Math.abs(dx) > moveThreshold || Math.abs(dy) > moveThreshold) {
                moved = true;
                clearTimeout(holdTimer);
            }
        };
        element.onpointerup = function (event) {
            console.log("pointerup");
            clearTimeout(holdTimer);
            if (isHold || moved) {
                return;
            }
            clickCount++;
            pointUpTimer = new Date().getTime();
            if (pointUpTimer - pointDownTimer > longPressDelay) {
                longPressHandler();
                console.log(" Long press");
                clickCount = 0;
            }
            if (clickCount === 1) {
                clickTimer = setTimeout(() => {
                    clickHandler();
                    console.log(element.className, " Click");
                    clickCount = 0;
                }, delay);
            } else if (clickCount === 2) {
                clearTimeout(clickTimer);
                dblClickTimer = setTimeout(() => {
                    dblClickHandler();
                    console.log(element.className, " Double Click");
                    clickCount = 0;
                }, delay);
            } else if (clickCount === 3) {
                clearTimeout(dblClickTimer);
                triClickHandler();
                console.log(element.className, " Triple Click");
                clickCount = 0;
            }
            event.stopPropagation();
        };
    }

    // ==================================
    // Overlay
    function Overlay() {
        const overlay = document.createElement("div");
        overlay.id = "overlay-grid";
        // Create the left div
        const left = document.createElement("div");
        left.className = "grid-left";
        overlay.appendChild(left);
        // Create the center div
        const center = document.createElement("div");
        center.className = "grid-center";
        const center0 = document.createElement("div");
        center0.className = "center-cell";
        center.appendChild(center0);
        overlay.appendChild(center);
        const right = document.createElement("div");
        right.className = "grid-right";
        overlay.appendChild(right);
        // Add overlay to DOOM
        positionOfOverlay.appendChild(overlay);
        GM_addStyle(`
            img.image.finished {
                z-index: 5 !important;
            }
            #overlay-grid {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                z-index: 10;
            }
            .center-cell {
                content: " ";
                /*background-color: rgba(0, 0, 0, 0.5); /* For test */
                position: fixed;
                width: 30vw;
                height: 40vh;
                z-index: 100;
                pointer-events: auto;
            }
        `);
        // Set the width of the center cell to match the width of the center div
        center0.style.width = center.getBoundingClientRect().width.toFixed() + "px";
        let showChapterNavigationTab;
        //let showSettingsTab;
        // Event
        function chapterNavigationTabVisible() {
            showChapterNavigationTab = chapterNavigationTab.style.display == "block" ? true : false;
            //showSettingsTab = settingsTab.style.display == "block" ? true : false;
            if (showChapterNavigationTab && window.scrollY > 145) {
                showChapterNavigationTab = false;
                console.log("showChapterNavigationTab", showChapterNavigationTab);
                // Hide the chapter navigation tab
                chapterNavigationTab.style.display = "none";
                chapterNavigationTab.classList.remove("fixed-toggle");
                // Hide the settings tab, switch server
                settingsTab.style.display = "none";
                switchServer.style.display = "none";
            } else if (!showChapterNavigationTab && window.scrollY > 145) {
                showChapterNavigationTab = true;
                console.log("showChapterNavigationTab", showChapterNavigationTab);
                // Show the chapter navigation tab
                chapterNavigationTab.style.display = "block";
                chapterNavigationTab.classList.add("fixed-toggle");
                // Show the settings tab, switch server
                settingsTab.style.display = "flex";
                switchServer.style.display = "block";
            }
        }
        function handleClick_scrollDown() {
            const scrollY = window.innerHeight * 0.6;
            window.scrollBy({
                top: scrollY,
                behavior: "smooth",
            });
        }
        function handleClick_scrollUp() {
            const scrollY = window.innerHeight * -0.55;
            window.scrollBy({
                top: scrollY,
                behavior: "smooth",
            });
        }
        function handleHold_NextChapter() {
            $("button.nav-next.nav-btn").click();
            console.log(" Prev chapter");
        }
        function handleHold_PrevChapter() {
            $("button.nav-prev.nav-btn").click();
            console.log(" Prev chapter");
        }
        let zoomTruyen = 1;
        function handleDblClick() {
            let imagesTruyen = $$(selectorImagesTruyen);
            if (zoomTruyen == 1) {
                zoomTruyen = 1.5;
                imagesTruyen.forEach((image) => {
                    image.style.width = 150 + "%";
                    //image.style.left = "-25%";
                    console.log("Zoom 1.5", image.style.width);
                });
            } else {
                zoomTruyen = 1;
                imagesTruyen.forEach((image) => {
                    image.style.width = 100 + "%";
                    image.style.left = "0%";
                    console.log("Zoom 1.0", image.style.width);
                });
            }
        }
        function handleTriClick() {
            let imagesTruyen = $$(selectorImagesTruyen);
            if (zoomTruyen == 1) {
                zoomTruyen = 0.5;
                imagesTruyen.forEach((image) => {
                    image.style.width = 50 + "%";
                    image.style.left = "25%";
                    console.log("Zoom 0.5", image.style.width);
                });
            } else {
                zoomTruyen = 1;
                imagesTruyen.forEach((image) => {
                    image.style.width = 100 + "%";
                    image.style.left = "0%";
                    console.log("Zoom 1.0", image.style.width);
                });
            }
        }
        Enhance_Scroll(
            left,
            handleClick_scrollDown,
            () => {},
            handleHold_PrevChapter,
            handleDblClick,
            handleTriClick
        );
        Enhance_Scroll(
            right,
            handleClick_scrollDown,
            () => {},
            handleHold_NextChapter,
            handleDblClick,
            handleTriClick
        );
        Enhance_Scroll(
            center,
            handleClick_scrollUp,
            () => {},
            () => {},
            handleDblClick,
            handleTriClick
        );
        Enhance_Scroll(
            center0,
            chapterNavigationTabVisible,
            toggleFullScreen,
            () => {},
            handleDblClick,
            handleTriClick
        );
    }
    // ==================================
    // Overlay update
    function UpdateOverlayWhileScroll() {
        // Selector elements
        const overlayCenter0 = $("div.center-cell");
        const chapterNavigationTab = $("div.top-move-pannel");
        const chapterNavigationTabBottom = $("div.view-bottom-panel");
        // Hide the chapter navigation tab when scroll down
        if (window.scrollY > 145) {
            chapterNavigationTab.style.display = "none";
            settingsTab.style.display = "none";
            switchServer.style.display = "none";
        } else {
            chapterNavigationTab.style.display = "block";
            chapterNavigationTab.classList.remove("fixed-toggle");
            settingsTab.style.display = "flex";
            switchServer.style.display = "block";
        }
        // Hide the overlay when scroll to chapter navigation tab bottom
        const rectBottom = chapterNavigationTabBottom.getBoundingClientRect();
        if (window.innerHeight - rectBottom.top.toFixed() >= 0) {
            overlayCenter0.style.display = "none";
        } else {
            overlayCenter0.style.display = "block";
        }
    }
    // ==================================
    // Full screen
    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        const clock = $("div#clock");
        document.addEventListener("fullscreenchange", function () {
            if (document.fullscreenElement) {
                clock.style.display = "block";
            } else {
                clock.style.display = "none";
            }
        });
    }
    // ==================================
    // Add a clock in full screen mode
    function addClock() {
        GM_addStyle(`
            #clock {
                display: none;
                position: fixed;
                top: 0px;
                left: 5px;
                font-size: 13px;
                background-color: rgba(0, 0, 0, 0.2);
                color: rgba(255, 255, 255, 0.6);
                padding: 0px 5px;
                border-radius: 8px;
                z-index: 1000;
            }
        `);
        const clock = document.createElement("div");
        clock.id = "clock";
        document.body.appendChild(clock);
        function updateClock() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            clock.textContent = `${hours}:${minutes}`;
        }
        updateClock();
        setInterval(updateClock, 10000);
    }
    // ==================================
    // Change Opacity
    function Change_Opacity() {
        let opacity = Number(Number(GM_getValue("opacity", 1)).toFixed(1));
        console.log("Opacity = ", opacity);
        GM_addStyle(`
            img.image.finished {
                opacity: ${opacity};
            }
            .opacity-btn {
                position: absolute;
                right: 15px;
                border-radius: 10px;
                z-index: 1000;
            }
            .opacity-btn1, .opacity-btn2 {
                color:#ffffffee;
                width: 20px;
                background-color:rgba(0, 0, 0, 0.1);
                margin: 5px;
                font-size: 24px;
                border: none;
                cursor: pointer;
                }
        `);
        const navGroupBtn = positionOfOpacityBtn;
        let divOpacityButton = `
            <div class="opacity-btn">
                <button class="opacity-btn1">+</button>
                <button class="opacity-btn2">-</button>
            </div>
        `;
        navGroupBtn.insertAdjacentHTML("beforeend", divOpacityButton);
        let btnIncreaseOpacity = $("button.opacity-btn1");
        btnIncreaseOpacity.addEventListener("click", function () {
            if (opacity >= 1) return;
            opacity = opacity + 0.1;
            opacity = Number(opacity.toFixed(1));
            GM_setValue("opacity", opacity);
            console.log(opacity);
            GM_addStyle(`
                img.image.finished { opacity: ${opacity};}
                });
            `);
        });
        let btnDecreaseOpacity = $("button.opacity-btn2");
        btnDecreaseOpacity.addEventListener("click", function () {
            if (opacity <= 0) return;
            opacity = opacity - 0.1;
            opacity = Number(opacity.toFixed(1));
            GM_setValue("opacity", opacity);
            console.log(opacity);
            GM_addStyle(`
                img.image.finished { opacity: ${opacity};}
                });
            `);
        });
    }
    // ==================================
    Overlay();
    UpdateOverlay();
    addClock();
    Change_Opacity();
    document.addEventListener("scroll", function () {
        UpdateOverlay();
    });
    // End Script
})();
