// themes
var rootStyles = getComputedStyle(document.documentElement);
const backgroundCol =  rootStyles.getPropertyValue('--background');
const gridCol = rootStyles.getPropertyValue('--gridColour');
const gridBGCol = rootStyles.getPropertyValue('--gridBackground');
const gridPlayedCol = rootStyles.getPropertyValue('--gridPlayed');
const XCol = rootStyles.getPropertyValue('--XColour');
const OCol = rootStyles.getPropertyValue('--OColour');


// add all html elements
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


// initialise variables for game
let currentPlayer = 'X';
let gameWinner;
let nextLargeGrid = 'none';


// set up game
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
    // updateColours()
    handleEventListeners('add');
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
        [0,1,2],[3,4,5],[6,7,8],[0,3,4],
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
    // if a small grid is full and there is no winner, declare it a draw in the thing
    if (countInstances(row, '') === 0 && largeGameArray[largeGridPlayed] === '') {
        largeGameArray[largeGridPlayed] = '-';
        largeGridTextEl[largeGridPlayed].innerHTML = '-';
        largeGridTextEl[largeGridPlayed].style.display = 'flex';
        largeGridTextEl[largeGridPlayed].style.color = 'black';
    }
 
    // check large grid
    for (combo of winningCombos) {
        let a = combo[0]; let b = combo[1]; let c = combo[2];
        
        if (largeGameArray[a] !== '') {
            if (largeGameArray[a] === largeGameArray[b] && largeGameArray[a] === largeGameArray[c]) {
                console.log(largeGameArray)
            }
        }
    }

    // if all large grids played and no winner, check points
    if (countInstances(largeGameArray, '') === 0) {
        let XPoints = countInstances(largeGameArray, 'X');
        let OPoints = countInstances(largeGameArray, 'O');

        if (XPoints < OPoints) {
            console.log('Draw: O wins on poins')
        }
        else if (XPoints > OPoints) {
            console.log('Draw: X wins on points')
        }
        else if (XPoints === OPoints) {
            console.log('Draw')
        }
    }
}

function countInstances(array, target) {
    const filteredArray = array.filter((element) => element === target);
    return filteredArray.length;
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
        return XCol
    }
    else if (currentPlayer === 'O') {
        return OCol
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
    
}