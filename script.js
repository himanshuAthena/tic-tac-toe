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

// Start music only after first interaction (browser safe)
document.body.addEventListener("click", () => {
    if (!musicPlaying) {
        bgMusic.play();
        musicPlaying = true;
    }
}, { once: true });

// ======================
// GAME STATE
// ======================

let turn = "X";
let isgameover = false;

// ======================
// CHANGE TURN
// ======================

const changeTurn = () => turn === "X" ? "O" : "X";

// ======================
// CHECK WIN
// ======================

const checkWin = () => {

    let boxtexts = document.getElementsByClassName('boxtext');
    let boxes = document.getElementsByClassName('box');

    let wins = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6],
    ];

    for (let pattern of wins) {

        let [a, b, c] = pattern;

        if (
            boxtexts[a].innerText !== "" &&
            boxtexts[a].innerText === boxtexts[b].innerText &&
            boxtexts[a].innerText === boxtexts[c].innerText
        ) {

            isgameover = true;

            let winner = boxtexts[a].innerText;

            // Update small info text
            document.querySelector('.info').innerText =
                winner + " Wins 🎉";

            // Play sound
            winSound.play();

            // Highlight winning boxes
            boxes[a].classList.add("winner");
            boxes[b].classList.add("winner");
            boxes[c].classList.add("winner");

            // Confetti
            if (typeof confetti === "function") {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }

            // Show dropdown panel
            document.getElementById("winnerName").innerText =
                winner + " Wins 🎉";

            document.getElementById("winDropdown")
                .classList.add("active");

            return;
        }
    }

    // ======================
    // CHECK DRAW
    // ======================

    let filled = 0;
    for (let box of boxtexts) {
        if (box.innerText !== "") filled++;
    }

    if (filled === 9 && !isgameover) {
        isgameover = true;

        drawSound.play();

        document.querySelector('.info').innerText =
            "It's a Draw 😅";

        document.getElementById("winnerName").innerText =
            "It's a Draw 😅";

        document.getElementById("winDropdown")
            .classList.add("active");
    }
};

// ======================
// BOX CLICK LOGIC
// ======================

let boxes = document.getElementsByClassName("box");

Array.from(boxes).forEach(element => {

    let boxtext = element.querySelector('.boxtext');

    element.addEventListener('click', () => {

        if (boxtext.innerText === '' && !isgameover) {

            boxtext.innerText = turn;
            clickSound.play();

            checkWin();

            if (!isgameover) {
                turn = changeTurn();
                document.querySelector(".info").innerText =
                    "Turn for " + turn;
            }
        }
    });
});

// ======================
// RESET BUTTON
// ======================

document.getElementById("reset")
.addEventListener('click', resetGame);

document.getElementById("playAgainBtn")
.addEventListener("click", resetGame);

function resetGame() {

    let boxtexts = document.querySelectorAll('.boxtext');
    let boxes = document.querySelectorAll('.box');

    boxtexts.forEach(e => e.innerText = "");
    boxes.forEach(b => b.classList.remove("winner"));

    turn = "X";
    isgameover = false;

    document.querySelector(".info").innerText =
        "Turn for " + turn;

    document.getElementById("winDropdown")
        .classList.remove("active");

    document.getElementById("winGifImg").src = "excited.gif";
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