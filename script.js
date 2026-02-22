// ======================
// SOUND SETUP
// ======================

let clickSound = new Audio("click.mp3");
let winSound = new Audio("win.mp3");
let drawSound = new Audio("draw.mp3");
let bgMusic = new Audio("music.mp3");

clickSound.volume = 0.4;
winSound.volume = 0.6;
drawSound.volume = 0.6;
bgMusic.volume = 0.2;
bgMusic.loop = true;

let musicPlaying = false;

document.body.addEventListener("click", () => {
    if (!musicPlaying) {
        bgMusic.play();
        musicPlaying = true;
    }
}, { once: true });

// ======================
// MULTIPLAYER STATE
// ======================

let currentRoom = null;
let playerSymbol = null;
let gameState = ["","","","","","","","",""];
let turn = "X";
let isgameover = false;

const boxes = document.querySelectorAll(".box");
const info = document.querySelector(".info");

// ======================
// CREATE ROOM
// ======================

document.getElementById("createRoomBtn").addEventListener("click", () => {

    const roomCode = Math.random().toString(36).substring(2,8);
    currentRoom = roomCode;
    playerSymbol = "X";

    set(ref(db, "rooms/" + roomCode), {
        board: gameState,
        turn: "X",
        winner: ""
    });

    document.getElementById("roomInfo").innerText =
        "Room Code: " + roomCode + " (Share this 💕)";

    listenToRoom(roomCode);
});

// ======================
// JOIN ROOM
// ======================

document.getElementById("joinRoomBtn").addEventListener("click", () => {

    const roomCode = document.getElementById("roomInput").value.trim();

    if (!roomCode) return alert("Enter Room Code");

    currentRoom = roomCode;
    playerSymbol = "O";

    document.getElementById("roomInfo").innerText =
        "Joined Room: " + roomCode;

    listenToRoom(roomCode);
});

// ======================
// LISTEN TO FIREBASE
// ======================

function listenToRoom(roomCode) {

    onValue(ref(db, "rooms/" + roomCode), (snapshot) => {

        const data = snapshot.val();
        if (!data) return;

        gameState = data.board;
        turn = data.turn;

        updateBoard();

        if (data.winner) {
            isgameover = true;
            showWinner(data.winner);
        } else {
            info.innerText = "Turn: " + turn;
        }

    });
}

// ======================
// UPDATE BOARD UI
// ======================

function updateBoard() {
    boxes.forEach((box, index) => {
        box.querySelector(".boxtext").innerText = gameState[index];
    });
}

// ======================
// HANDLE BOX CLICK
// ======================

boxes.forEach((box, index) => {

    box.addEventListener("click", () => {

        if (!currentRoom) {
            alert("Create or Join a Room First 💕");
            return;
        }

        if (gameState[index] !== "" || isgameover) return;

        if (turn !== playerSymbol) return;

        gameState[index] = playerSymbol;
        clickSound.play();

        const winner = checkWinLocal();

        update(ref(db, "rooms/" + currentRoom), {
            board: gameState,
            turn: playerSymbol === "X" ? "O" : "X",
            winner: winner ? playerSymbol : ""
        });

    });

});

// ======================
// LOCAL WIN CHECK
// ======================

function checkWinLocal() {

    const wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];

    for (let [a,b,c] of wins) {
        if (
            gameState[a] &&
            gameState[a] === gameState[b] &&
            gameState[a] === gameState[c]
        ) {
            return true;
        }
    }

    if (!gameState.includes("")) {
        return "draw";
    }

    return false;
}

// ======================
// SHOW WINNER
// ======================

function showWinner(winner) {

    if (winner === "draw") {
        drawSound.play();
        document.getElementById("winnerName").innerText = "It's a Draw 😅";
    } else {
        winSound.play();
        document.getElementById("winnerName").innerText = winner + " Wins 🎉";
    }

    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
    });

    document.getElementById("winDropdown").classList.add("active");
}

// ======================
// RESET GAME
// ======================

document.getElementById("reset")
.addEventListener("click", resetGame);

document.getElementById("playAgainBtn")
.addEventListener("click", resetGame);

function resetGame() {

    if (!currentRoom) return;

    gameState = ["","","","","","","","",""];
    isgameover = false;
    turn = "X";

    update(ref(db, "rooms/" + currentRoom), {
        board: gameState,
        turn: "X",
        winner: ""
    });

    document.getElementById("winDropdown").classList.remove("active");
}

// ======================
// MUSIC TOGGLE
// ======================

const musicToggle = document.getElementById("musicToggle");

musicToggle.addEventListener("click", () => {

    if (bgMusic.paused) {
        bgMusic.play();
        musicToggle.innerText = "🔊 Music On";
    } else {
        bgMusic.pause();
        musicToggle.innerText = "🔇 Music Off";
    }

});