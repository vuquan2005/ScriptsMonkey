// ==UserScript==
// @name         TruyenTranhEnhance
// @namespace    https://github.com/vuquan2005
// @version      0.1.0
// @description  Enhance your Manga reading experience
// @author       QuanVu
// @include      /^https:\/\/goctruyentranhvui\d+\.com\/.*$/
// @updateURL
// @downloadURL
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var truyen = document.querySelector("div.image-section");
    //Scroll
    truyen.addEventListener("click", function() {
      const scrollY = window.innerHeight * 0.75;
      window.scrollBy({
        top: scrollY,
        behavior: "smooth"
      });
    });
    //Zoom
    let isZoomed = false;
    truyen.addEventListener("dblclick", function() {
      isZoomed = !isZoomed;
      truyen.style.transform = isZoomed ? "scale(1.5)" : "scale(1)";
    });
    //End
})();