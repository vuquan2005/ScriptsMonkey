// ==UserScript==
// @name         TruyenTranhEnhance
// @namespace    https://github.com/vuquan2005
// @version      0.0.1
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
    //End
})();