// ==UserScript==
// @name         GocTruyenTranhEnhance
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      1.0.1
// @description  Enhance your Manga reading experience
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
    // Scroll function
    function Enhance_Scroll(
        element,
        longPressHandler = () => {},
        clickHandler = () => {},
        dblClickHandler = () => {},
        triClickHandler = () => {}
    ) {
        let clickCount = 0;
        let clickTimer = null;
        let longPressTimer = null;
        let isLongPress = false;
        const delay = 200;
        const longPressDelay = 400;
        // Event mosuse down
        element.onmousedown = function () {
            isLongPress = false;
            longPressTimer = setTimeout(() => {
                longPressHandler();
                isLongPress = true;
                clickCount = 0;
            }, longPressDelay);
        };
        // Event mouse up
        element.onmouseup = function () {
            clearTimeout(longPressTimer);
            if (isLongPress) {
                return;
            }
            clickCount++;
            if (clickCount === 1) {
                clickTimer = setTimeout(() => {
                    clickHandler();
                    clickCount = 0;
                }, delay);
            } else if (clickCount === 2) {
                clearTimeout(clickTimer);
                dblClickHandler();
                clickCount = 0;
            } else if (clickCount === 3) {
                triClickHandler();
                clickCount = 0;
            }
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
        center0.dataset.index = 0;
        center.appendChild(center0);
        const center1 = document.createElement("div");
        center1.className = "center-cell";
        center1.dataset.index = 1;
        center.appendChild(center1);
        const center2 = document.createElement("div");
        center2.className = "center-cell";
        center2.dataset.index = 2;
        center.appendChild(center2);
        overlay.appendChild(center);
        // Create the right div
        const right = document.createElement("div");
        right.className = "grid-right";
        overlay.appendChild(right);
        $("div.image-section").appendChild(overlay);
        GM_addStyle(`
            img.image.finished {
                z-index: 5 !important;
            }
            #overlay-grid {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                z-index: 10;
            }
            .grid-center {
                display: grid;
                grid-template-rows: 1fr 1fr 1fr;
            }
        `);
        const chapterNavigationTab = $("div.top-move-pannel");
        let showChapterNavigationTab;
        function handleLongPress() {
            showChapterNavigationTab = chapterNavigationTab.style.display == "block" ? true : false;
            if (showChapterNavigationTab && window.scrollY > 145) {
                showChapterNavigationTab = false;
                console.log("showChapterNavigationTab", showChapterNavigationTab);
                chapterNavigationTab.style.display = "none";
                chapterNavigationTab.classList.remove("fixed-toggle");
                overlay.style.top = `0px`;
                overlay.style.height = `calc(100vh)`;
            } else if (!showChapterNavigationTab && window.scrollY > 145) {
                showChapterNavigationTab = true;
                console.log("showChapterNavigationTab", showChapterNavigationTab);
                chapterNavigationTab.style.display = "block";
                chapterNavigationTab.classList.add("fixed-toggle");
                const rect = chapterNavigationTab.getBoundingClientRect().bottom.toFixed();
                overlay.style.top = `${rect}px`;
                overlay.style.height = `calc(100vh - ${rect}px)`;
            }
        }
        function handleClick_scrollDown() {
            const scrollY = window.innerHeight * 0.55;
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
        // $$();
        // function handleDblClick() {
        // }

        Enhance_Scroll(left, handleLongPress, handleClick_scrollDown);
        Enhance_Scroll(right, handleLongPress, handleClick_scrollDown);
        Enhance_Scroll(center0, handleLongPress, handleClick_scrollUp);
        Enhance_Scroll(center1, handleLongPress, handleLongPress);
        Enhance_Scroll(center2, handleLongPress, handleClick_scrollUp);
    }
    // ==================================
    // Control scroll, overlay, visibility
    function Control_Overlay() {
        const overlay = $("div#overlay-grid");
        const chapterNavigationTab = $("div.top-move-pannel");
        const chapterNavigationTabBottom = $("div.view-bottom-panel");
        setTimeout(() => {
            overlay.style.top = `145px`;
        }, 50);
        document.addEventListener("scroll", function () {
            if (window.scrollY > 145) {
                chapterNavigationTab.style.display = "none";
            } else {
                chapterNavigationTab.style.display = "block";
                chapterNavigationTab.classList.remove("fixed-toggle");
            }
            const rectTop = chapterNavigationTab.getBoundingClientRect();
            const rectBottom = chapterNavigationTabBottom.getBoundingClientRect();

            console.log("rectTop", rectTop.bottom.toFixed());
            console.log("rectBottom", rectBottom.top.toFixed());
            console.log(window.scrollY, "\n");
            if (rectTop.bottom.toFixed() >= 0)
            {
                overlay.style.top = `${rectTop.bottom.toFixed()}px`;
                overlay.style.height = `calc(100vh - ${rectTop.bottom.toFixed()}px)`;
            }
                
        });
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
                position: fixed;
                left: 0px;
                bottom: 0px;
                width: auto;
                height: auto;
                border-radius: 10px;
                display: flex;
                z-index: 1000;
            }
            .opacity-btn1, .opacity-btn2 {
                color:#ffffffee;
                display: flex;
                background-color:rgba(0, 0, 0, 0.1);
                margin: 2px;
                padding: 5px;
                font-size: 15px;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                }
        `);
        let divSetting = $("div.setting");
        let divOpacityButton = `
            <div class="opacity-btn">
                <button class="opacity-btn1">+</button>
                <button class="opacity-btn2">-</button>
            </div>
        `;
        divSetting.insertAdjacentHTML("beforebegin", divOpacityButton);
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
    Control_Overlay();
    Change_Opacity();
    // End Script
})();
