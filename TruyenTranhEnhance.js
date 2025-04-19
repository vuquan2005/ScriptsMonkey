// ==UserScript==
// @name         TruyenTranhEnhance
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      0.4.1
// @description  Enhance your Manga reading experience
// @author       QuanVu
// @include      /https:\/\/goctruyentranhvui\d+\.com\/truyen\/.*/
// @updateURL    https://raw.githubusercontent.com/vuquan2005/ScriptsMonkey/refs/heads/main/TruyenTranhEnhance.js
// @downloadURL  https://raw.githubusercontent.com/vuquan2005/ScriptsMonkey/refs/heads/main/TruyenTranhEnhance.js
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    "use strict";
    let truyen = document.querySelector("div.image-section");
    //Scroll
    truyen.addEventListener("click", function () {
        const scrollY = window.innerHeight * 0.75;
        window.scrollBy({
            top: scrollY,
            behavior: "smooth",
        });
    });
    //Zoom
    let isZoomed = false;
    truyen.addEventListener("dblclick", function () {
        isZoomed = !isZoomed;
        document.querySelector("body").style.transform = isZoomed ? "scale(1.5)" : "scale(1)";
    });
    // Change opacity
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
    let body = document.querySelector("div.setting");
    let opacityButton = `
        <div class="opacity-btn">
            <button class="opacity-btn1">+</button>
            <button class="opacity-btn2">-</button>
        </div>
    `;
    body.insertAdjacentHTML("beforebegin", opacityButton);
    //
    let images = document.querySelectorAll('img.image.finished');
    let opacityButton1 = document.querySelector("button.opacity-btn1")
    opacityButton1.addEventListener("click", function () {
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
    let opacityButton2 = document.querySelector("button.opacity-btn2")
    opacityButton2.addEventListener("click", function () {
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
    //End
})();
