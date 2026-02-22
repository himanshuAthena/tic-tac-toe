// ============================
// 🎵 SOUND SETUP
// ============================

const clickSound = new Audio("click.mp3");
const winSound = new Audio("win.mp3");
const drawSound = new Audio("draw.mp3");
const bgMusic = new Audio("music.mp3");

clickSound.volume = 0.4;
winSound.volume = 0.6;
drawSound.volume = 0.6;
bgMusic.volume = 0.2;
bgMusic.loop = true;

let musicStarted = false;

// Start music on first user interaction (browser safe)
document.body.addEventListener("click", () => {
    if (!musicStarted) {
        bgMusic.play().catch(() => { });
        musicStarted = true;
    }
}, { once: true });

// Music Toggle
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

// ============================
// 🎮 GAME STATE
// ============================

let gameMode = "offline"; // offline | online
let currentRoom = null;
let playerSymbol = "X";
let turn = "X";
let gameState = ["", "", "", "", "", "", "", "", ""];
let isgameover = false;

const boxes = document.querySelectorAll(".box");
const info = document.querySelector(".info");

// ============================
// 🎯 MODE SWITCHING
// ============================

document.getElementById("offlineModeBtn").onclick = () => {
    gameMode = "offline";
    document.getElementById("roomSection").style.display = "none";
    resetGame();
};

document.getElementById("onlineModeBtn").onclick = () => {
    gameMode = "online";
    document.getElementById("roomSection").style.display = "block";
    resetGame();
};

// ============================
// 🌐 ONLINE MODE
// ============================

document.getElementById("createRoomBtn").onclick = () => {

    const roomCode = Math.random().toString(36).substring(2, 8);
    currentRoom = roomCode;
    playerSymbol = "X";

    set(ref(db, "rooms/" + roomCode), {
        board: gameState,
        turn: "X",
        winner: ""
    });

    document.getElementById("roomInfo").innerText =
        "Room Code: " + roomCode;

    document.getElementById("copyCodeBtn").style.display = "inline-block";

    listenToRoom(roomCode);
};

document.getElementById("joinRoomBtn").onclick = () => {

    const roomCode = document.getElementById("roomInput").value.trim();
    if (!roomCode) return alert("Enter Room Code");

    currentRoom = roomCode;
    playerSymbol = "O";

    document.getElementById("roomInfo").innerText =
        "Joined Room: " + roomCode;

    listenToRoom(roomCode);
};

document.getElementById("copyCodeBtn").onclick = () => {
    navigator.clipboard.writeText(currentRoom);
    alert("Room code copied 💕");
};

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

            if (gameMode === "online") {

                if (turn === playerSymbol) {
                    info.innerHTML = "🟢 Your Turn (" + playerSymbol + ")";
                } else {
                    info.innerHTML = "⏳ Waiting for Opponent...";
                }

            } else {
                info.innerText = "Turn: " + turn;
            }
        }
    });
}

// ============================
// 🎮 BOX CLICK
// ============================

boxes.forEach((box, index) => {

    box.onclick = () => {

        if (gameState[index] !== "" || isgameover) return;

        if (gameMode === "offline") {
            handleOfflineMove(index);
            return;
        }

        // Online mode
        if (!currentRoom) {
            alert("Create or Join a Room First 💕");
            return;
        }

        if (turn !== playerSymbol) return;

        makeMove(index);
    };
});

// ============================
// 📴 OFFLINE MOVE
// ============================

function handleOfflineMove(index) {
    makeMove(index);
}

// ============================
// 🔄 COMMON MOVE LOGIC
// ============================

function makeMove(index) {

    gameState[index] = turn;
    clickSound.play();
    updateBoard();

    const result = checkWin();

    if (result === "win") {
        isgameover = true;

        if (gameMode === "online") {
            update(ref(db, "rooms/" + currentRoom), {
                board: gameState,
                turn: turn,
                winner: turn
            });
        } else {
            showWinner(turn);
        }

        return;
    }

    if (result === "draw") {
        isgameover = true;

        if (gameMode === "online") {
            update(ref(db, "rooms/" + currentRoom), {
                board: gameState,
                winner: "draw"
            });
        } else {
            showWinner("draw");
        }

        return;
    }

    turn = turn === "X" ? "O" : "X";

    if (gameMode === "online") {
        update(ref(db, "rooms/" + currentRoom), {
            board: gameState,
            turn: turn
        });
    }

    if (gameMode === "online") {
        if (turn === playerSymbol) {
            info.innerHTML = "🟢 Your Turn (" + playerSymbol + ")";
        } else {
            info.innerHTML = "⏳ Waiting for Opponent...";
        }
    } else {
        info.innerText = "Turn: " + turn;
    }
}

// ============================
// 🏆 WIN / DRAW CHECK
// ============================

function checkWin() {

    const wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let [a, b, c] of wins) {
        if (
            gameState[a] &&
            gameState[a] === gameState[b] &&
            gameState[a] === gameState[c]
        ) {
            return "win";
        }
    }

    if (!gameState.includes("")) {
        return "draw";
    }

    return null;
}

// ============================
// 🎨 UPDATE UI
// ============================

function updateBoard() {

    boxes.forEach((box, index) => {

        const text = box.querySelector(".boxtext");
        text.innerText = gameState[index];

        if (gameState[index] === "X") {
            text.style.color = "#ff4d6d";
        } else if (gameState[index] === "O") {
            text.style.color = "#3a86ff";
        } else {
            text.style.color = "#333";
        }
    });
}

// ============================
// 🎉 SHOW WINNER
// ============================

function showWinner(result) {

    if (result === "draw") {
        drawSound.play();
        document.getElementById("winnerName").innerText =
            "It's a Draw 😅";
    } else {
        winSound.play();
        document.getElementById("winnerName").innerText =
            result + " Wins 🎉";
    }

    document.getElementById("winDropdown")
        .classList.add("active");
}

// ============================
// 🔄 RESET
// ============================

document.getElementById("reset").onclick = resetGame;
document.getElementById("playAgainBtn").onclick = resetGame;

function resetGame() {

    gameState = ["", "", "", "", "", "", "", "", ""];
    turn = "X";
    isgameover = false;

    updateBoard();
    info.innerText = "Turn: X";

    document.getElementById("winDropdown")
        .classList.remove("active");

    if (gameMode === "online" && currentRoom) {
        update(ref(db, "rooms/" + currentRoom), {
            board: gameState,
            turn: "X",
            winner: ""
        });
    }
}