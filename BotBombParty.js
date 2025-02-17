// ==UserScript==
// @name        BombParty Bot
// @namespace   BombParty
// @version     2.2
// @description A human-like bot for BombParty that types words naturally, with realistic pauses, errors, and corrections.
// @match       https://*.jklm.fun/games/bombparty/
// @grant       GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    console.log("BombParty Bot script loaded!");

    let wordList = [];
    let isBotActive = false;
    const typingSpeed = 70;
    const errorChance = 0.1;
    let isTyping = false;

    function loadWordList() {
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://raw.githubusercontent.com/naizoxtv/BombParty-Bot/refs/heads/main/french_words.txt',
            onload: function (response) {
                if (response.status === 200) {
                    wordList = response.responseText.split('\n').map(word => word.trim().toLowerCase());
                    console.log("Word list loaded successfully!");
                } else {
                    console.error("Error loading the word list.");
                }
            },
            onerror: function (error) {
                console.error("Network error:", error);
            }
        });
    }

    function getSyllable() {
        const syllableElement = document.querySelector('.syllable');
        return syllableElement ? syllableElement.innerText.trim().toLowerCase() : null;
    }

    function isMyTurn() {
        return document.querySelector('.selfTurn') !== null;
    }

    function findMatchingWord(syllable) {
        if (wordList.length === 0) return null;
        const matchingWords = wordList.filter(word => word.includes(syllable));
        return matchingWords.length > 0 ? matchingWords[Math.floor(Math.random() * matchingWords.length)] : null;
    }

    async function typeWord(word) {
        if (isTyping) return;
        isTyping = true;

        const inputField = document.querySelector('input[type="text"]');
        if (!inputField) {
            console.log("Text input field not found.");
            isTyping = false;
            return;
        }

        for (let i = 0; i < word.length; i++) {
            if (Math.random() < errorChance && i > 0) {
                const wrongLetter = String.fromCharCode(97 + Math.floor(Math.random() * 26));
                inputField.value += wrongLetter;
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
                await sleep(typingSpeed);
                inputField.value = inputField.value.slice(0, -1);
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
                await sleep(typingSpeed);
            }

            inputField.value += word[i];
            inputField.dispatchEvent(new Event('input', { bubbles: true }));
            await sleep(typingSpeed);
        }

        await sleep(200);

        if (isMyTurn()) {
            validateWord(inputField);
            console.log("Word typed and validated:", word);
        } else {
            console.log("Not my turn, not validating.");
        }

        isTyping = false;
    }

    function validateWord(inputField) {
        inputField.dispatchEvent(new Event('input', { bubbles: true }));

        ['keydown', 'keypress', 'keyup'].forEach(eventType => {
            const event = new KeyboardEvent(eventType, {
                key: 'Enter',
                keyCode: 13,
                code: 'Enter',
                which: 13,
                bubbles: true,
                cancelable: true
            });
            inputField.dispatchEvent(event);
        });

        console.log("Simulated Enter key press!");

        const form = inputField.closest('form');
        if (form) {
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            console.log("Forced form submission!");
        } else {
            console.log("Form not found.");
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function botLogic() {
        if (!isBotActive || isTyping) return;

        const syllable = getSyllable();
        if (syllable && isMyTurn()) {
            const word = findMatchingWord(syllable);
            if (word) {
                await typeWord(word);
            } else {
                console.log("No word found for:", syllable);
            }
        }
    }

    function toggleBot() {
        isBotActive = !isBotActive;
        console.log(isBotActive ? "🤖 Bot ACTIVATED!" : "🛑 Bot DEACTIVATED!");
    }

    function startBot() {
        console.log("Starting the bot...");
        setInterval(botLogic, 1000);
    }

    document.addEventListener('keydown', function (event) {
        if (event.code === 'ShiftRight') {
            toggleBot();
        }
    });

    loadWordList();
    window.addEventListener('load', startBot);
})();
