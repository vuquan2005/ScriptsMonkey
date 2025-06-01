// ==UserScript==
// @name           	Block save as (ctrl + s)
// @name:vi        	Chặn lưu trang (ctrl + s)
// @description    	Block save as (ctrl + s) in web pages
// @description:vi 	Chặn lưu trang bằng phím tắt ctrl + s
// @author         	QuanVu
// @namespace      	https://github.com/vuquan2005/ScriptsMonkey
// @version        	0.0.2
// @match          	*://*/*
// @grant          	none
// @updateURL	   	https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/Block_save_as_Web.user.js
// @downloadURL    	https://github.com/vuquan2005/ScriptsMonkey/raw/main/Scripts/Block_save_as_Web.user.js
// ==/UserScript==

(function () {
    "use strict";

    document.addEventListener("keydown", function (event) {
        if (event.ctrlKey && event.key === "s") {
            event.preventDefault();
            console.log("Save as blocked.");
			console.log("Use CapsLock or disable this user scripts.");
        }
    });
})();
