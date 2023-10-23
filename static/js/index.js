const socket = io();

// html elements and add event listeners
const themesBtnEl = document.querySelector('#themes-btn');
const linkBtnEl = document.querySelector('#link-btn');
const localBtnEl = document.querySelector('#local-btn');
const onlineBtnEl = document.querySelector('#online-btn');
const joinBtnEl = document.querySelector('#join-btn');
const rulesBtnEl = document.querySelector('#rules-btn');

themesBtnEl.addEventListener('click', themesIndexCounter)
linkBtnEl.addEventListener('click', linkBtnFunction);
localBtnEl.addEventListener('click', localBtnFunction);
onlineBtnEl.addEventListener('click', onlineBtnFunction);
joinBtnEl.addEventListener('click', joinBtnFunction);
rulesBtnEl.addEventListener('click', rulesBtnFunction);


// button functions
function themesBtnFunction() {
    console.log('themes');
}

function linkBtnFunction() {
    urlToOpen = 'https://byshalin.com';
    window.open(urlToOpen, '_blank')
}   

function localBtnFunction() {
    console.log('local');
    clearPage('/local')
}

function onlineBtnFunction() {
    console.log('online');

    socket.emit('online_request');
}

function joinBtnFunction() {
    console.log('join');
    let gameid = window.prompt(' please enter game code');

    socket.emit('join_request', { 'gameid': gameid } );
}

function rulesBtnFunction() {
    console.log('rules');
}

// define socket response events
socket.on('online_response', function(data) {
    let gameid = data.gameid
    clearPage(`${gameid}`)
});

socket.on('join_error', function(data) {
    window.alert(data.message);
});

socket.on('join_response', function(data) {
    let gameid = data.gameid;
    clearPage(`${gameid}`)
});

function clearPage(link) {
    let topLevelElements = Array.from(document.body.children);
    let tagNameToRemove = ['SCRIPT'];
    for (let tagName of tagNameToRemove) {
        topLevelElements = topLevelElements.filter(function(object) {
            return object.tagName !== tagName;
        })
    }
    
    
    let topLevelElementsDisplay = [];
    for (let object of topLevelElements) {
        let display = object.style.display;
        topLevelElementsDisplay.push(display);
        object.classList.remove('fade-in');
        object.classList.add('fade-out');
    }

    setTimeout(function() {
        window.location.href = link
        for (let object of topLevelElements) {
            object.style.display = 'none'
        };
    }, 350)

    setTimeout(function() {
        for (let object of topLevelElements) {
            let index = topLevelElements.indexOf(object);
            object.classList.remove('fade-out');
            object.style.display = topLevelElementsDisplay[index];
        };
    }, 2000)
}

// themes
const root = document.documentElement;

let themes = ['light', 'dark'];
let themesIndex = localStorage.getItem('themesIndex');
if (!themesIndex) {
    themesIndex = 0;
}

function themesIndexCounter() {
    themesIndex ++;
    if (themesIndex >= themes.length) {
        themesIndex = 0;
    }
    localStorage.setItem('themesIndex', themesIndex);
    toggleThemes()
}

function toggleThemes() {
    let theme = themes[themesIndex];

    root.style.setProperty('--BG-main', `var(--BG-${theme})`);
    root.style.setProperty('--grid-main', `var(--grid-${theme})`);
    root.style.setProperty('--gridBG-main', `var(--gridBG-${theme})`);
    root.style.setProperty('--X-main', `var(--X-${theme})`);
    root.style.setProperty('--X2-main', `var(--X2-${theme})`);
    root.style.setProperty('--O1-main', `var(--O-${theme})`);
    root.style.setProperty('--O-main', `var(--O2-${theme})`);
    root.style.setProperty('--winning-main', `var(--winning-${theme})`);

}