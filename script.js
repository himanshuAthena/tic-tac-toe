let clickSound = new Audio("click.mp3");
let winSound = new Audio("win.mp3");
let drawSound = new Audio("draw.mp3");
let bgMusic = new Audio("music.mp3");

bgMusic.loop = true;
bgMusic.volume = 0.2;
bgMusic.play();

let turn = "X";
let isgameover = false;

const changeTurn = () => turn === "X" ? "O" : "X";

const checkWin = () => {

    let boxtexts = document.getElementsByClassName('boxtext');
    let boxes = document.getElementsByClassName('box');
    let line = document.querySelector(".line");

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

    wins.forEach(e => {
        if (
            boxtexts[e[0]].innerText !== "" &&
            boxtexts[e[0]].innerText === boxtexts[e[1]].innerText &&
            boxtexts[e[1]].innerText === boxtexts[e[2]].innerText
        ) {

            isgameover = true;
            document.querySelector('.info').innerText =
                boxtexts[e[0]].innerText + " Wins 🎉";

            winSound.play();

            boxes[e[0]].classList.add("winner");
            boxes[e[1]].classList.add("winner");
            boxes[e[2]].classList.add("winner");

            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });

            document.querySelector('.imgbox img').style.width = "200px";
        }
    });
};

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

document.getElementById("reset").addEventListener('click', () => {

    let boxtexts = document.querySelectorAll('.boxtext');
    let boxes = document.querySelectorAll('.box');

    boxtexts.forEach(e => e.innerText = "");
    boxes.forEach(b => b.classList.remove("winner"));

    document.querySelector('.imgbox img').style.width = "0";
    document.querySelector(".line").style.width = "0";

    turn = "X";
    isgameover = false;

    document.querySelector(".info").innerText = "Turn for " + turn;
});