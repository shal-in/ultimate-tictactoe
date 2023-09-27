const socket = io();

// html elements and add event listeners
const themesBtnEl = document.querySelector('#themes-btn');
const linkBtnEl = document.querySelector('#link-btn');
const localBtnEl = document.querySelector('#local-btn');
const onlineBtnEl = document.querySelector('#online-btn');
const joinBtnEl = document.querySelector('#join-btn');
const rulesBtnEl = document.querySelector('#rules-btn');

themesBtnEl.addEventListener('click', themesBtnFunction);
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
    console.log('link');
}

function localBtnFunction() {
    console.log('local');
    window.location.href = '/u-ttt/local'
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
    window.location.href = `u-ttt/${gameid}`
});

socket.on('join_error', function(data) {
    window.alert(data.message);
});

socket.on('join_response', function(data) {
    let gameid = data.gameid;
    window.location.href = `u-ttt/${gameid}`;
});