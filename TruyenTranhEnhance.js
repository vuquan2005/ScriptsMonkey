// ==UserScript==
// @name         TruyenTranhEnhance
// @namespace    https://github.com/vuquan2005
// @version      0.3.2
// @description  Enhance your Manga reading experience
// @author       QuanVu
// @include      /^https:\/\/goctruyentranhvui\d+\.com\/.*$/
// @updateURL    https://raw.githubusercontent.com/vuquan2005/ScriptsMonkey/refs/heads/main/TruyenTranhEnhance.js
// @downloadURL  https://raw.githubusercontent.com/vuquan2005/ScriptsMonkey/refs/heads/main/TruyenTranhEnhance.js
// @grant        none
// ==/UserScript==

(function () {
    "use strict";
    var truyen = document.querySelector("div.image-section");
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
        truyen.style.transform = isZoomed ? "scale(1.5)" : "scale(1)";
    });
    //End
})();
