// ==UserScript==
// @name         GocTruyenTranhEnhance
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      0.4.2
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
    // Scroll
    const Enhance_Scroll = function () {
        let clickCount = 0;
        let clickTimer = null;
        let longPressTimer = null;
        let isLongPress = false;
        const delay = 200;
        const longPressDelay = 400;
        let truyen = $("div.image-section");
        let tabNavigator = $("div.top-move-pannel");
        // Event mosuse down
        truyen.onmousedown = function () {
            isLongPress = false;
            longPressTimer = setTimeout(() => {
                // Long press
                tabNavigator.classList.toggle("fixed-toggle");
                isLongPress = true;
                clickCount = 0;
            }, longPressDelay);
        };
        // Event mouse up
        truyen.onmouseup = function () {
            clearTimeout(longPressTimer);
            if (isLongPress) {
                return;
            }
            clickCount++;
            if (clickCount === 1) {
                clickTimer = setTimeout(() => {
                    // Single click
                    const scrollY = window.innerHeight * 0.55;
                    window.scrollBy({
                        top: scrollY,
                        behavior: "smooth",
                    });
                    clickCount = 0;
                }, delay);
            } else if (clickCount === 2) {
                clearTimeout(clickTimer);
                // Double click
                clickCount = 0;
            } else if (clickCount === 3) {
                // Triple click
                clickCount = 0;
            }
        };
    };
    // ==================================
    // Change Opacity
    const Chhange_Opacity = function () {
        let opacity = GM_getValue("opacity", 1);
        console.log(opacity);
        GM_addStyle(`
            img.image.finished { opacity: ${opacity};}
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
        //
        //let images = $$("img.image.finished");
        let btnIncreaseOpacity = $("button.opacity-btn1");
        btnIncreaseOpacity.addEventListener("click", function () {
            if (opacity >= 1) {
                opacity = 1;
                console.log(opacity);
                return;
            }
            opacity += 0.1;
            GM_setValue("opacity", opacity);
            console.log(opacity);
            GM_addStyle(`
                img.image.finished { opacity: ${opacity};}
                });
            `);
        });
        let btnDecreaseOpacity = $("button.opacity-btn2");
        btnDecreaseOpacity.addEventListener("click", function () {
            if (opacity <= 0) {
                opacity = 0;
                console.log(opacity);
                return;
            }
            opacity -= 0.1;
            GM_setValue("opacity", opacity);
            console.log(opacity);
            GM_addStyle(`
                img.image.finished { opacity: ${opacity};}
                });
            `);
        });
    };
    // ==================================
    Enhance_Scroll();
    Chhange_Opacity();
    // End Script
})();
