const root = document.documentElement;

let themes = ['light', 'dark'];
let themesIndex = localStorage.getItem('themesIndex');
if (!themesIndex) {
    themesIndex = 0;
}

// header container
themesBtnEl = document.querySelector('#themes-btn');
themesBtnEl.addEventListener('click', themesIndexCounter);

linkBtnEl = document.querySelector('#link-btn');
linkBtnEl.addEventListener('click', linkBtnFunction);

homeBtnEl = document.querySelector('#title');
homeBtnEl.addEventListener('click', homeBtnFunction);


function themesIndexCounter() {
    themesIndex ++;
    if (themesIndex === themes.length) {
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
    root.style.setProperty('--O-main', `var(--O-${theme})`);
    root.style.setProperty('--winning-main', `var(--winning-${theme})`);

}


function homeBtnFunction() {
    console.log('home')
}

function linkBtnFunction() {
    urlToOpen = 'https://google.com';
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
let currentPlayer = 'X';
let gameWinner;
let gameWinningSquares;
let nextLargeGrid = 'none';
let largeGridPlayed;

toggleThemes()
updateColours()
handleEventListeners('add');


// define functions
function boxClicked(e) {
    // remove event listeners and update immediate move
    const id = e.target.id;
    let largeGridPlayed = parseInt(id[0]);
    let smallGridPlayed = parseInt(id[1]);

    e.target.innerHTML = currentPlayer;
    e.target.style.color = currentPlayerColour();
    fullGameArray[largeGridPlayed][smallGridPlayed] = currentPlayer;
    handleEventListeners('remove');


    // check game
    checkGame(largeGridPlayed)
    nextLargeGrid = nextLargeGridFunction(smallGridPlayed)
    currentPlayer = changeCurrentPlayer();

    // set up for next turn
    if (!gameWinner) {
        handleEventListeners('add');
    }
    updateColours()
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
    row = fullGameArray[largeGridPlayed];
    for (combo of winningCombos) {
        let a = combo[0]; let b = combo[1]; let c = combo[2];
        
        if (row[a] !== '') {
            if (row[a] === row[b] && row[a] === row[c]) {
                largeGameArray[largeGridPlayed] = row[a];
                largeGridTextEl[largeGridPlayed].innerHTML = row[a];
                largeGridTextEl[largeGridPlayed].style.display = 'flex';
                largeGridTextEl[largeGridPlayed].style.color = currentPlayerColour();
            }
        }
    }
    // if a small grid is full and there is no winner, declare it a draw
    if (findInstances(row, '').length === 0 && largeGameArray[largeGridPlayed] === '') {
        largeGameArray[largeGridPlayed] = '-';
        largeGridTextEl[largeGridPlayed].innerHTML = '-';
        largeGridTextEl[largeGridPlayed].style.display = 'flex';
        largeGridTextEl[largeGridPlayed].style.color =  'var(--grid-main)';
    }
 
    // check large grid
    for (combo of winningCombos) {
        let a = combo[0]; let b = combo[1]; let c = combo[2];
        
        if (largeGameArray[a] !== '') {
            if (largeGameArray[a] === largeGameArray[b] && largeGameArray[a] === largeGameArray[c]) {
                gameWinner = largeGameArray[a]
                gameWinningSquares = [a,b,c];
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
            return
        }
        else if (XPoints > OPoints) {
            console.log('Draw: X wins on points')
            gameWinner = 'X'
            gameWinningSquares = findInstances(largeGameArray, 'O')
            return
        }
        else if (XPoints === OPoints) {
            console.log('Draw')
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

function currentPlayerColour() {
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