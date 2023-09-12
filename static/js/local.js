let currentPlayer = 'X'
let gameWinner;

// add all html elements into a 9x9 array
let largeGridEl = Array.from(document.querySelectorAll('.large-grid'))
let fullGameEl = []
for (let i=0; i<largeGridEl.length; i++) {
    let smallGridEl = Array.from(largeGridEl[i].querySelectorAll('.small-grid'));
    fullGameEl.push(smallGridEl);
}

// -1=no need for event listener
// 0=add event listener, 
// 1=has event listener (remove), 
// 2=grid played
let eventListenerTracker = [
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
]

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

handleEventListeners('add')
setUpBoardColours()

function boxClicked(e) {
    // remove event listeners and update immediate move
    const id = e.target.id
    let largeGridPlayed = parseInt(id[0])
    let smallGridPlayed = parseInt(id[1])
    e.target.innerHTML = currentPlayer
    fullGameArray[largeGridPlayed][smallGridPlayed] = currentPlayer
    handleEventListeners('remove');
    currentPlayer = changeCurrentPlayer()

    // update consequences to the game
    checkGame()


    // prepare for next move
    let nextLargeGrid = smallGridPlayed;
    if (largeGameArray[nextLargeGrid] !== '') {
        for (let row=0; row<eventListenerTracker.length; row++) {
            for (let col=0; col<eventListenerTracker[row].length; col++) {
                if (eventListenerTracker[row][col] !== 2) {
                    eventListenerTracker[row][col] = 0;
                }
            }
        }
    }
    else {
        for (let col=0; col<eventListenerTracker[nextLargeGrid].length; col++) {
            if (eventListenerTracker[nextLargeGrid][col] === -1) {
                eventListenerTracker[nextLargeGrid][col] = 0
            }
        }
    }   

    // check if game winner
    if (gameWinner) {
        console.log(`game winner: ${gameWinner}`)
        handleEventListeners('remove')
    }
    else {
    handleEventListeners('add') 
    }

    setUpBoardColours()     
}

function handleEventListeners(event) {
    if (event === 'add') {
        for (let row=0; row<eventListenerTracker.length; row++) {
            for (let col=0; col<eventListenerTracker.length; col++) {
                if (eventListenerTracker[row][col] === 0) {
                    fullGameEl[row][col].addEventListener('click', boxClicked)
                    eventListenerTracker[row][col] = 1
                }
            }
        }
    }

    else if (event === 'remove') {
        for (let row=0; row<eventListenerTracker.length; row++) {
            for (let col=0; col<eventListenerTracker.length; col++) {
                if (eventListenerTracker[row][col] === 1) {
                    fullGameEl[row][col].removeEventListener('click', boxClicked)
                    eventListenerTracker[row][col] = -1
                }
                if (fullGameArray[row][col] !== '') {
                    eventListenerTracker[row][col] = 2
                }
            }
        }
    }
}

function checkGame() {
    console.log('check game')
    winningCombos = [[0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]]
    
    for (let row=0; row<largeGameArray.length; row++) {
        if (largeGameArray[row] === '') {
            let smallGridArray = fullGameArray[row]
            console.log(smallGridArray)

            for (let combos of winningCombos) {
                let a = combos[0]; let b = combos[1]; let c = combos[2];
                if (smallGridArray[a] !== '' && smallGridArray[a] == smallGridArray[b] && smallGridArray[a] == smallGridArray[c]) {
                    for (i=0; i<smallGridArray.length; i++) {
                        eventListenerTracker[row][i] = 2;
                        console.log(eventListenerTracker[row]);
                    }
                    // largeGridEl[row].innerHTML = smallGridArray[a]
                    console.log('winner')
                    largeGameArray[row] = smallGridArray[a];
                    console.log(largeGameArray)
                    continue
                }
            }
        }
    }
    for (let combos of winningCombos) {
        let a = combos[0]; let b = combos[1]; let c = combos[2];
        if (largeGameArray[a] !== '' && largeGameArray[a] == largeGameArray[b] && largeGameArray[a] == largeGameArray[c]) {
            gameWinner = largeGameArray[a];
        }   
    }   
}

function setUpBoardColours() {
    for (let row=0; row<eventListenerTracker.length; row++) {
        for (let col=0; col<eventListenerTracker.length; col++) {
            if (eventListenerTracker[row][col] === 1) {
                fullGameEl[row][col].style.backgroundColor = 'olive'
            }
            else if (eventListenerTracker[row][col] === -1) {
                fullGameEl[row][col].style.backgroundColor = 'green'
            }
            else if (eventListenerTracker[row][col] === 2) {
                if (fullGameArray[row][col] === 'X') {
                    fullGameEl[row][col].style.backgroundColor = 'yellow'              
                }
                else if (fullGameArray[row][col] === 'O') {
                    fullGameEl[row][col].style.backgroundColor = 'orange'
                }
                else {
                    fullGameEl[row][col].style.backgroundColor = 'blue'
                }
            }
        }
    }
}

function changeCurrentPlayer() {
    if (currentPlayer === 'X') {
        return 'O'
    }
    else if (currentPlayer === 'O') {
        return 'X'
    }
}