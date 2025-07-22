// ==UserScript==
// @name         YouTube Content Filter
// @namespace    https://github.com/vuquan2005/ScriptsMonkey
// @version      0.1.0
// @description  Ẩn video, short, playlist dựa trên từ khóa tiêu đề hoặc tên kênh
// @author       QuanVu
// @match        https://www.youtube.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
    "use strict";

    function waitForSelector(selector, timeout = 10000, delay = 10) {
        return new Promise((resolve, reject) => {
            const existing = document.querySelector(selector);
            if (existing) {
                return setTimeout(() => resolve(existing), delay);
            }

            const timeoutId = setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timeout: Không tìm thấy "${selector}" trong ${timeout}ms.`));
            }, timeout);

            const observer = new MutationObserver(() => {
                const el = document.querySelector(selector);
                if (el) {
                    clearTimeout(timeoutId);
                    observer.disconnect();
                    setTimeout(() => resolve(el), delay);
                }
            });

            observer.observe(document.documentElement, {
                childList: true,
                subtree: true,
            });
        });
    }

    function mergeArrays(Array1, Array2) {
        const merged = new Set([...Array1, ...Array2]);
        return Array.from(merged).filter((x) => x && x.trim() !== "");
    }

    //===================================================
    /* Set data */
    // Chanel
    var blockedChannels = GM_getValue("blockedChannels", [""]);
    var allowedChannels = GM_getValue("allowedChannels", [""]);
    // Keywords
    var blockedKeywords = GM_getValue("blockedKeywords", [""]);
    var whitelistedKeywords = GM_getValue("whitelistedKeywords", [""]);
    // Hashtags
    var blockedHashtags = GM_getValue("blockedHashtags", [""]);
    var whitelistedHashtags = GM_getValue("whitelistedHashtags", [""]);

    /* Update data */
    async function fetchOnlineData() {
        try {
            const response = await fetch(
                "https://raw.githubusercontent.com/vuquan2005/ScriptsMonkey/main/Scripts/YT_blocker_data.json"
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return {
                blockedChannels: data.blockedChannels || [],
                allowedChannels: data.allowedChannels || [],
                blockedKeywords: data.blockedKeywords || [],
                whitelistedKeywords: data.whitelistedKeywords || [],
                blockedHashtags: data.blockedHashtags || [],
                whitelistedHashtags: data.whitelistedHashtags || [],
            };
        } catch (error) {
            console.error("Error fetching online data:", error);
            return {
                blockedChannels: [],
                allowedChannels: [],
                blockedKeywords: [],
                whitelistedKeywords: [],
                blockedHashtags: [],
                whitelistedHashtags: [],
            };
        }
    }
    async function updateLocalData() {
        const onlineData = await fetchOnlineData();
        // Merge
        blockedChannels = mergeArrays(blockedChannels, onlineData.blockedChannels || []);
        allowedChannels = mergeArrays(allowedChannels, onlineData.allowedChannels || []);
        blockedKeywords = mergeArrays(blockedKeywords, onlineData.blockedKeywords || []);
        whitelistedKeywords = mergeArrays(
            whitelistedKeywords,
            onlineData.whitelistedKeywords || []
        );
        blockedHashtags = mergeArrays(blockedHashtags, onlineData.blockedHashtags || []);
        whitelistedHashtags = mergeArrays(
            whitelistedHashtags,
            onlineData.whitelistedHashtags || []
        );

        GM_setValue("blockedChannels", blockedChannels);
        GM_setValue("allowedChannels", allowedChannels);

        GM_setValue("blockedKeywords", blockedKeywords);
        GM_setValue("whitelistedKeywords", whitelistedKeywords);

        GM_setValue("blockedHashtags", blockedHashtags);
        GM_setValue("whitelistedHashtags", whitelistedHashtags);

        console.log("Local data updated from online source");
    }

    /* Check update */
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const lastUpdateTime = GM_getValue("lastUpdateTime", 0);
    const now = Date.now();

    if (now - lastUpdateTime > ONE_DAY) {
        console.log("Updating local data from online source...");
        // updateLocalData();
        GM_setValue("lastUpdateTime", now);
    } else {
        console.log("Local data is up-to-date, no update needed.");
    }

    //===================================================
    /* Check video */
    function checkVideo(title = "", channel = "", hashtags = []) {
        // allowedChannels
        if (allowedChannels.includes(channel)) return false;
        // blockedChannels
        if (
            blockedChannels.some((keyword) => channel.toLowerCase().includes(keyword.toLowerCase()))
        )
            return true;

        // whitelistedKeywords
        if (
            whitelistedKeywords.some((keyword) =>
                title.toLowerCase().includes(keyword.toLowerCase())
            )
        )
            return false;

        // blockedKeywords
        if (blockedKeywords.some((keyword) => title.toLowerCase().includes(keyword.toLowerCase())))
            return true;

        // whitelistedHashtags
        if (hashtags.some((tag) => whitelistedHashtags.includes(tag))) return false;

        // blockedHashtags
        if (hashtags.some((tag) => blockedHashtags.includes(tag))) return true;

        return false;
    }
    //===================================================
    /* Check curent video */
    function checkCurentVideo() {
        let channelText = "";
        let titleText = "";
        let hashtagsText = [];

        const videoTitle = document.querySelector(
            "div#title.ytd-watch-metadata > .ytd-watch-metadata > yt-formatted-string"
        );
        if (videoTitle) {
            titleText = videoTitle.textContent.trim();
        }

        const channelName = document.querySelector(
            "#channel-name.ytd-video-owner-renderer > .ytd-channel-name > .ytd-channel-name > .ytd-channel-name > a"
        );
        if (channelName) {
            channelText = channelName.textContent.trim();
        }

        const hashtags = document.querySelectorAll("yt-formatted-string#info > a");
        if (hashtags.length > 0) {
            const hashtag = Array.from(hashtags).map((a) => a.textContent.trim().replace(/^#/, ""));
            hashtagsText = hashtag;
        }

        console.log("Channel:", channelText);
        console.log("Title:", titleText);
        console.log("Hashtags:", hashtagsText);

        if (checkVideo(titleText, channelText, hashtagsText)) {
            console.log("Video will be block...");
            const player = document.querySelector(".html5-video-player");
            if (player) {
                player.remove();
            }
            setInterval(() => {
                const player = document.querySelector(".html5-video-player");
                if (player) {
                    player.remove();
                }
            }, 2000);
        }
    }

    function checkCurentShort() {
        let channelText = "";
        let titleText = "";
        let hashtagsText = [];

        const shortTitle = document.querySelector(
            ".ytShortsVideoTitleViewModelShortsVideoTitle > span"
        );
        if (shortTitle) {
            titleText = shortTitle.textContent.trim();
        }

        const channelName = document.querySelector(".ytReelChannelBarViewModelChannelName > a");
        if (channelName) {
            channelText = channelName.textContent.trim();
        }

        const hashtags = document.querySelectorAll(
            ".ytShortsVideoTitleViewModelShortsVideoTitle > span > span > a"
        );
        if (hashtags.length > 0) {
            const hashtag = Array.from(hashtags).map((a) => a.textContent.trim().replace(/^#/, ""));
            hashtagsText = hashtag;
        }

        console.log("Channel:", channelText);
        console.log("Title:", titleText);
        console.log("Hashtags:", hashtagsText);

        if (checkVideo(titleText, channelText, hashtagsText)) {
            console.log("Video will be block...");
            const player = document.querySelector(".html5-video-player");
            if (player) {
                player.remove();
            }
        }
        setInterval(() => {
            const player = document.querySelector(".html5-video-player");
            if (player) {
                player.remove();
            }
        }, 2000);
    }

    if (location.pathname === "/watch") {
        waitForSelector("#channel-name.ytd-video-owner-renderer")
            .then(() => {
                checkCurentVideo();
            })
            .catch((error) => {
                console.error("Error checking current video:", error);
            });
    }
    if (location.pathname.startsWith("/shorts")) {
        waitForSelector(".ytReelMetapanelViewModelMetapanelItem")
            .then(() => {
                checkCurentShort();
            })
            .catch((error) => {
                console.error("Error checking current video:", error);
            });
    }
    //===================================================
    /* Check list video */
    function cleanYouTube() {
        const items = document.querySelectorAll(
            "ytd-rich-item-renderer, ytd-video-renderer, yt-lockup-view-model, ytm-shorts-lockup-view-model, ytd-grid-video-renderer, ytd-playlist-panel-video-renderer, ytd-playlist-video-renderer"
        );

        items.forEach((item) => {
            let titleText = "";
            let channelText = "";

            // Video
            const titleElement = item.querySelector("#video-title");
            if (titleElement) titleText = titleElement.textContent.trim();
            const channelElement = item.querySelector(".ytd-channel-name > a");
            if (channelElement) channelText = channelElement.textContent.trim();

            // Short
            const shortTitleElement = item.querySelector(
                ".shortsLockupViewModelHostMetadataTitle > a > span"
            );
            if (shortTitleElement) titleText = shortTitleElement.textContent.trim();

            //
            const titleSuggestVideoElement = item.querySelector("h3[title]");
            // if (titleSuggestVideoElement) titleText = titleSuggestVideoElement.getAttribute('title');

            if (checkVideo(titleText, channelText)) item.style.display = "none";
        });
    }

    const targetTags = [
        "ytd-rich-item-renderer",
        "ytd-video-renderer",
        "yt-lockup-view-model",
        "ytm-shorts-lockup-view-model",
        "ytd-grid-video-renderer",
        "ytd-playlist-panel-video-renderer",
        "ytd-playlist-video-renderer",
    ];

    let scheduledNum = 0;

    const scheduleClean = () => {
        if (scheduledNum >= 2) return;

        scheduledNum++;

        if (scheduledNum > 1) {
            setTimeout(() => {
                cleanYouTube();
                scheduledNum--;
            }, 5000);
            return;
        }

        requestIdleCallback(
            async () => {
                cleanYouTube();

                scheduledNum--;
            },
            { timeout: 1000 }
        );
    };

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1) {
                    if (
                        targetTags.includes(node.tagName.toLowerCase()) ||
                        node.querySelector?.(targetTags.join(","))
                    ) {
                        scheduleClean();
                        return;
                    }
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
})();

/* Google sheet code



*/
