// set up socket connection to server
const socket = io();
const currentURL = window.location.href;
const gameid = currentURL.split('/').pop();

let playerID; let currentPlayer;

socket.on('connection_response', function(data) {
    let sessionID = data.sessionid;
    console.log(`sessionid: ${sessionID}`);
    console.log(`gameid: ${gameid}`);
    let oldSessionID = localStorage.getItem(gameid);
    localStorage.setItem(gameid, sessionID);

    if (oldSessionID) {
        payLoad = {
            'gameid': gameid,
            'oldSessionID': oldSessionID
        }

        socket.emit('game_reconnect', payLoad)
    }

    else {
        let payLoad = {
            'gameid': gameid
        }
    
        socket.emit('game_connect', payLoad);
    }
})

socket.on('join_error', function(data) {
    window.location.href = '/u-ttt';
    alert(data.message);
    return
})

socket.on('game_connect_response', function(data) {
    let moves = data.moves;
    playerID = data.playerid;

    let lastMove = moves[moves.length - 1];
    if (!lastMove) {
        currentPlayer = 'X';
    }
    else {
        const id = lastMove[1];
        currentPlayer = lastMove[0];
        let largeGridPlayed = parseInt(id[0]);
        let smallGridPlayed = parseInt(id[1]);
    
        e = fullGameEl[largeGridPlayed][smallGridPlayed];
        e.innerHTML = currentPlayer;
        e.style.color = currentPlayerColour(currentPlayer);
        fullGameArray[largeGridPlayed][smallGridPlayed] = currentPlayer;

        currentPlayer = changeCurrentPlayer();

        nextLargeGrid = nextLargeGridFunction(smallGridPlayed)

        turnCount = 1;
        updateTurnLabel()
    }

    if (currentPlayer === playerID) {
        handleEventListeners('add');
        turnLabelText = `you are ${playerID}. it is your turn.`
        if (playerID === 'X') {
            inviteContainerEl.style.display = 'flex';
        }
    }
    else {
        turnLabelText = `you are ${playerID}. it is your opponent's turn.`
    }

    turnLabelEl.textContent = turnLabelText;
    updateColours()
})

socket.on('game_reconnect_response', function(data) {
    sessionID = data.sessionid;
    moves = data.moves;

    if (!playerID) {
        playerID = data.playerid;
    }

    if (moves.length === 0) {
        currentPlayer = 'X'

        if (currentPlayer === playerID) {
            handleEventListeners('add');
            turnLabelText = `you are ${playerID}. it is your turn.`;
            if (playerID === 'X') {
                inviteContainerEl.style.display = 'flex';
            }
        }
        else {
            turnLabelText = `you are ${playerID}. it is your opponent's turn.`;
        }
        turnLabelEl.textContent = turnLabelText;
        updateColours()
        return
    }

    else {
        for (let i=0; i<moves.length; i++) {
            move = moves[i];
            currentPlayer = move[0]; id = move[1]

            largeGridPlayed = parseInt(id[0]);
            smallGridPlayed = parseInt(id[1]);
        
            e = fullGameEl[largeGridPlayed][smallGridPlayed];
            e.innerHTML = currentPlayer;
            e.style.color = currentPlayerColour(currentPlayer);
            fullGameArray[largeGridPlayed][smallGridPlayed] = currentPlayer;
    
            checkGame(largeGridPlayed);
            turnCount++;
        }

        if (gameWinner) {
            updateColours()
            return
        }

        currentPlayer = changeCurrentPlayer();

        if (currentPlayer === playerID) {
            console.log('your turn')
            nextLargeGrid = nextLargeGridFunction(smallGridPlayed);
            handleEventListeners('add');
            turnLabelText = `you are ${playerID}. it is your turn.`;
        }
        else {
            turnLabelText = `you are ${playerID}. it is your opponent's turn.`;
        }

        turnLabelEl.textContent = turnLabelText;
        updateTurnLabel()
        updateColours()
    }
    
})

socket.on('play_response', function(data) {
    if (inviteContainerEl.style.display !== 'none') {
        inviteContainerEl.classList.add('fade-out');
        setTimeout(function() {
            inviteContainerEl.style.display = 'none'
        }, 450)
    }
    lastMove = data.move;

    const id = lastMove[1];
    currentPlayer = lastMove[0];
    let largeGridPlayed = parseInt(id[0]);
    let smallGridPlayed = parseInt(id[1]);

    e = fullGameEl[largeGridPlayed][smallGridPlayed];
    e.innerHTML = currentPlayer;
    e.style.color = currentPlayerColour(currentPlayer);
    fullGameArray[largeGridPlayed][smallGridPlayed] = currentPlayer;

    checkGame(largeGridPlayed)
    nextLargeGrid = nextLargeGridFunction(smallGridPlayed)
    currentPlayer = changeCurrentPlayer();

    handleEventListeners('add');
    updateColours();
    turnCount++;
    updateTurnLabel()

    if (!gameWinner) {
        turnLabelText = 'it is your turn';
        turnLabelEl.textContent = turnLabelText;
    }
})

socket.on('join_response', function() {
    inviteContainerEl.classList.add('fade-out');
    setTimeout(function() {
        inviteContainerEl.style.display = 'none'
    }, 450)
})

// invite
let inviteBtnEl = document.querySelector('#invite-btn');

inviteBtnEl.addEventListener('click', sendInvite)

function sendInvite() {
    inviteText = `come play ultimate tic tac toe with me\non ${currentURL}\n\nmade by shalin.\nbyshalin.com`;
    
    const textArea = document.createElement('textarea');
    textArea.value = inviteText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    let textCopiedLabel = document.querySelector('#text-copied-label');

    textCopiedLabel.classList.add('fade-in');
    textCopiedLabel.style.display = 'inline';
    
    setTimeout(function() {
        textCopiedLabel.classList.add('fade-out');
        textCopiedLabel.classList.remove('fade-in');
        
        setTimeout(function() {
            textCopiedLabel.style.display = 'none';
            textCopiedLabel.classList.remove('fade-out');
        }, 490);
    }, 1600);
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
    root.style.setProperty('--X1-main', `var(--X1-${theme})`);
    root.style.setProperty('--X2-main', `var(--X2-${theme})`);
    root.style.setProperty('--O1-main', `var(--O1-${theme})`);
    root.style.setProperty('--O2-main', `var(--O2-${theme})`);
    root.style.setProperty('--winning-main', `var(--winning-${theme})`);

}

// turn count
let turnCountEl = document.querySelector('#turn-count');
let turnLabelEl = document.querySelector('#turn-label');

let turnCount = 0;
let turnLabelText;

function updateTurnLabel() {
    turnCountEl.textContent = `turn count: ${turnCount}`;
}

let inviteContainerEl = document.querySelector('#invite-container');

// header container
themesBtnEl = document.querySelector('#themes-btn');
themesBtnEl.addEventListener('click', themesIndexCounter)

linkBtnEl = document.querySelector('#link-btn');
linkBtnEl.addEventListener('click', linkBtnFunction);

homeBtnEl = document.querySelector('#title');
homeBtnEl.addEventListener('click', homeBtnFunction);

function homeBtnFunction() {
    console.log('home')
}

function linkBtnFunction() {
    urlToOpen = 'https://byshalin.com';
    window.open(urlToOpen, '_blank')
}

// game html elements
let largeGridEl = Array.from(document.querySelectorAll('.large-grid'));
let fullGameEl = [];
for (let i=0; i<9; i++) {
    let smallGridEl = Array.from(largeGridEl[i].querySelectorAll('.small-grid'));
    fullGameEl.push(smallGridEl);
}
let largeGridTextEl = Array.from(document.querySelectorAll('.large-grid-text'));


// set up arrays for tracking game
let fullGameArray = [
    ['','','','','','','','',''],
    ['','','','','','','','',''],
    ['','','','','','','','',''],
    ['','','','','','','','',''],
    ['','','','','','','','',''],
    ['','','','','','','','',''],
    ['','','','','','','','',''],
    ['','','','','','','','',''],
    ['','','','','','','','','']
]
let largeGameArray = ['','','','','','','','','']
let eventListenerTracker = [
    ['no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener'],
    ['no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener'],
    ['no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener'],
    ['no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener'],
    ['no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener'],
    ['no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener'],
    ['no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener'],
    ['no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener'],
    ['no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener', 'no event listener']
]


// initialise variables for game + set up game
let gameWinner;
let gameWinningSquares;
let nextLargeGrid = 'none';
let largeGridPlayed;

toggleThemes()
// updateColours()


// define functions
function boxClicked(e) {
    // remove event listeners and update immediate move
    const id = e.target.id;
    let largeGridPlayed = parseInt(id[0]);
    let smallGridPlayed = parseInt(id[1]);

    e.target.innerHTML = currentPlayer;
    e.target.style.color = currentPlayerColour(currentPlayer);
    fullGameArray[largeGridPlayed][smallGridPlayed] = currentPlayer;
    handleEventListeners('remove');
    turnCount++;

    payLoad = {
        'gameid': gameid,
        'move': [playerID, id]
    }
    socket.emit('play', payLoad);

    // check game
    checkGame(largeGridPlayed)
    nextLargeGrid = nextLargeGridFunction(smallGridPlayed)
    currentPlayer = changeCurrentPlayer();

    // set up for next turn
    if (gameWinner) {
        return
    }
    turnLabelText = `it is your opponent's turn`;
    turnLabelEl.textContent = turnLabelText;
    updateColours()
    updateTurnLabel()
}

function handleEventListeners(event) {
    if (event === 'add') {
        if (nextLargeGrid === 'none') { // at the start of the game
            for (let row=0; row<9; row++) {
                for (let col=0; col<9; col++) {
                    fullGameEl[row][col].addEventListener('click', boxClicked);
                    eventListenerTracker[row][col] = 'has event listener';
                }
            }
        }

        else {
            if (nextLargeGrid === 'all') { // full grid
                for (let row=0; row<9; row++) {
                    for (let col=0; col<9; col++) {
                        if (fullGameArray[row][col] === '') {
                            fullGameEl[row][col].addEventListener('click', boxClicked);
                            eventListenerTracker[row][col] = 'has event listener';
                        }
                    }
                }
            }

            else {
                    for (let col=0; col<9; col++) { // specific grid
                        if (fullGameArray[nextLargeGrid][col] === '') {
                            fullGameEl[nextLargeGrid][col].addEventListener('click', boxClicked);
                            eventListenerTracker[nextLargeGrid][col] = 'has event listener';
                        }
                    }
            }
        }
    }

    if (event === 'remove') {
        for (let row=0; row<9; row++) {
            for (let col=0; col<9; col++) {
                if (eventListenerTracker[row][col] === 'has event listener') {
                    fullGameEl[row][col].removeEventListener('click', boxClicked)
                    eventListenerTracker[row][col] = 'no event listener'
                }
            }
        }
    }
}

function checkGame(largeGridPlayed) {
    let winningCombos = [
        [0,1,2],[3,4,5],[6,7,8],[0,3,6],
        [1,4,7],[2,5,8],[0,4,8],[2,4,6],
    ]

    // check small grid and update large grid
    if (largeGridPlayed !== 'all') {
        row = fullGameArray[largeGridPlayed];
        for (combo of winningCombos) {
            let a = combo[0]; let b = combo[1]; let c = combo[2];
            
            if (row[a] !== '') {
                if (row[a] === row[b] && row[a] === row[c]) {
                    largeGameArray[largeGridPlayed] = row[a];
                    largeGridTextEl[largeGridPlayed].innerHTML = row[a];
                    largeGridTextEl[largeGridPlayed].style.display = 'flex';
                    largeGridTextEl[largeGridPlayed].style.color = currentPlayerColour(currentPlayer);

                }
            }
        }
        // if a small grid is full and there is no winner, declare it a draw
        if (findInstances(row, '').length === 0 && largeGameArray[largeGridPlayed] === '') {
            largeGameArray[largeGridPlayed] = '-';
            largeGridTextEl[largeGridPlayed].innerHTML = '-';
            largeGridTextEl[largeGridPlayed].style.display = 'flex';
            largeGridTextEl[largeGridPlayed].style.color = 'var(--grid-main)';
        }
    }

    else { // check all grids
        for (let largeGridPlayed=0; largeGridPlayed<9; largeGridPlayed++) {
            row = fullGameArray[largeGridPlayed];
            for (combo  of winningCombos) {
                let a = combo[0]; let b = combo[1]; let c = combo[2];
                
                if (row[a] !== '') {
                    if (row[a] === row[b] && row[a] === row[c]) {
                        largeGameArray[largeGridPlayed] = row[a];
                        largeGridTextEl[largeGridPlayed].innerHTML = row[a];
                        largeGridTextEl[largeGridPlayed].style.display = 'flex';
                        largeGridTextEl[largeGridPlayed].style.color = currentPlayerColour(currentPlayer);
                    }
                }
            }
            // if a small grid is full and there is no winner, declare it a draw
            if (findInstances(row, '').length === 0 && largeGameArray[largeGridPlayed] === '') {
                largeGameArray[largeGridPlayed] = '-';
                largeGridTextEl[largeGridPlayed].innerHTML = '-';
                largeGridTextEl[largeGridPlayed].style.display = 'flex';
                largeGridTextEl[largeGridPlayed].style.color = 'var(--grid-main)';
            }
        }
    }

    // if a small grid is full and there is no winner, declare it a draw
    if (findInstances(row, '').length === 0 && largeGameArray[largeGridPlayed] === '') {
        largeGameArray[largeGridPlayed] = '-';
        largeGridTextEl[largeGridPlayed].innerHTML = '-';
        largeGridTextEl[largeGridPlayed].style.display = 'flex';
        largeGridTextEl[largeGridPlayed].style.color = 'var(--grid-main)';
    }
 
    // check large grid
    for (combo of winningCombos) {
        let a = combo[0]; let b = combo[1]; let c = combo[2];
        
        if (largeGameArray[a] !== '') {
            if (largeGameArray[a] === largeGameArray[b] && largeGameArray[a] === largeGameArray[c]) {
                gameWinner = largeGameArray[a]
                gameWinningSquares = [a,b,c];
                handleEventListeners('remove')

                if (gameWinner === playerID) {
                    turnLabelText = `you win!!`;
                }
                else {
                    turnLabelText = `your opponent wins.`;
                }
                turnLabelEl.textContent = turnLabelText;
                turnCountEl.textContent = ''
                return
            }
        }
    }

    // if all large grids played and no winner, check points
    if (findInstances(largeGameArray, '').length === 0) {
        let XPoints = findInstances(largeGameArray, 'X').length;
        let OPoints = findInstances(largeGameArray, 'O').length;

        if (XPoints < OPoints) {
            console.log('Draw: O wins on poins')
            gameWinner = 'O'
            gameWinningSquares = findInstances(largeGameArray, 'O')
            handleEventListeners('remove')

            if (gameWinner === playerID) {
                turnLabelText = `you win!!`;
            }
            else {
                turnLabelText = `your opponent wins.`;
            }
            turnLabelEl.textContent = turnLabelText;
            turnCountEl.textContent = ''
            return
        }
        else if (XPoints > OPoints) {
            console.log('Draw: X wins on points')
            gameWinner = 'X'
            gameWinningSquares = findInstances(largeGameArray, 'O')
            handleEventListeners('remove')
            if (gameWinner === playerID) {
                turnLabelText = `you win!!`;
            }
            else {
                turnLabelText = `your opponent wins.`;
            }
            turnLabelEl.textContent = turnLabelText;
            turnCountEl.textContent = ''
            return
        }
        else if (XPoints === OPoints) {
            console.log('Draw')
            handleEventListeners('remove')

            turnLabelText = `it is a draw!!`;
            turnLabelEl.textContent = turnLabelText;
            turnCountEl.textContent = ''
            return
        }
    }
}

function findInstances(array, target) {
    let indices = []
    for (let i=0; i<array.length; i++) {
        if (array[i] === target) {
            indices.push(i);
        }
    }
    return indices;
  }

function changeCurrentPlayer() {
    if (currentPlayer === 'X') {
        return 'O'
    }
    else if (currentPlayer === 'O') {
        return 'X'
    }
}

function currentPlayerColour(currentPlayer) {
    if (currentPlayer === 'X') {
        return 'var(--X-main)'
    }
    else if (currentPlayer === 'O') {
        return 'var(--O-main)'
    }
}

function nextLargeGridFunction(smallGridPlayed) {
    if (largeGameArray[smallGridPlayed] === '') {
        return smallGridPlayed
    }
    else {
        return 'all'
    }
}

function updateColours() {
    if (gameWinner) {
        console.log('winner')
        for (let row=0; row<9; row++) {
            for (let col=0; col<9; col++) {
                fullGameEl[row][col].style.backgroundColor = 'var(--BG-main)';
            }
        }

        for (row of gameWinningSquares) {
            for (let col=0; col<9; col++) {
                fullGameEl[row][col].style.backgroundColor = 'var(--winning-main)';
            }
        }
        return
    }

    if (currentPlayer !== playerID) {
        for (row=0; row<9; row++) {
            for (col=0; col<9; col++) {
                fullGameEl[row][col].style.backgroundColor = 'var(--BG-main)'
            } 
        }
        return
    }

    if (nextLargeGrid === 'none') { // start of the game
        for (let row=0; row<9; row++) {
            for (let col=0; col<9; col++) {
                fullGameEl[row][col].style.backgroundColor = 'var(--gridBG-main)';
            }
        }
    }

    else if (nextLargeGrid === 'all') { // grid played
        for (let row=0; row<9; row++) {
            for (let col=0; col<9; col++) {
                if (largeGameArray[row] === '') {
                    if (fullGameArray[row][col] === '') {
                        fullGameEl[row][col].style.backgroundColor = 'var(--gridBG-main)';
                    }
                    else {
                        fullGameEl[row][col].style.backgroundColor = 'var(--BG-main)';
                    }
                }
                else (
                    fullGameEl[row][col].style.backgroundColor = 'var(--BG-main)'   
                )
            }
        }
    }

    else {
        for (let row=0; row<9; row++) {
            for (let col=0; col<9; col++) {
                fullGameEl[row][col].style.backgroundColor = 'var(--BG-main)';
            }
        }
        for (let col=0; col<9; col++) {
            if (fullGameArray[nextLargeGrid][col] === '') {
                fullGameEl[nextLargeGrid][col].style.backgroundColor = 'var(--gridBG-main)'
            }
        }
    }
}