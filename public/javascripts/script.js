let secretCode = "";
let attempts = 0;

let timer = 0;
let timerInterval = null;

let lockDigits = [0, 0, 0];
let currentGuess = "000";

let allHints = [];
let visibleHints = 3;

/* ---------------------------
   Start Game After Page Loads
--------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    setupLockWheels();

    document
        .getElementById("checkBtn")
        .addEventListener("click", checkGuess);

    document
        .getElementById("newGameBtn")
        .addEventListener("click", generateNewGame);

    generateNewGame();
});

/* ---------------------------
   Setup Scrolling Lock Wheels
--------------------------- */

function setupLockWheels() {
    const wheels = document.querySelectorAll(".wheel");

    wheels.forEach(wheel => {
        const index = Number(wheel.dataset.index);

        const upButton = wheel.querySelector(".up");
        const downButton = wheel.querySelector(".down");

        upButton.addEventListener("click", () => {
            increaseDigit(index);
        });

        downButton.addEventListener("click", () => {
            decreaseDigit(index);
        });

        wheel.addEventListener("wheel", event => {
            event.preventDefault();

            if (event.deltaY < 0) {
                increaseDigit(index);
            } else {
                decreaseDigit(index);
            }
        });
    });

    updateLockDisplay();
}

/* ---------------------------
   Increase One Wheel Digit
--------------------------- */

function increaseDigit(index) {
    lockDigits[index]++;

    if (lockDigits[index] > 9) {
        lockDigits[index] = 0;
    }

    updateLockDisplay();
    animateDigit(index);
}

/* ---------------------------
   Decrease One Wheel Digit
--------------------------- */

function decreaseDigit(index) {
    lockDigits[index]--;

    if (lockDigits[index] < 0) {
        lockDigits[index] = 9;
    }

    updateLockDisplay();
    animateDigit(index);
}

/* ---------------------------
   Update Wheel Display
--------------------------- */

function updateLockDisplay() {
    document.getElementById("digit0").textContent = lockDigits[0];
    document.getElementById("digit1").textContent = lockDigits[1];
    document.getElementById("digit2").textContent = lockDigits[2];

    currentGuess = lockDigits.join("");
}

/* ---------------------------
   Small Spin Animation
--------------------------- */

function animateDigit(index) {
    const digitElement = document.getElementById(`digit${index}`);

    digitElement.classList.remove("spin");

    void digitElement.offsetWidth;

    digitElement.classList.add("spin");
}

/* ---------------------------
   Generate Random Secret Code
--------------------------- */

function generateCode() {
    let digits = [];

    while (digits.length < 3) {
        const digit = Math.floor(Math.random() * 10);

        if (!digits.includes(digit)) {
            digits.push(digit);
        }
    }

    return digits.join("");
}

/* ---------------------------
   Generate Hints
--------------------------- */

function generateHints(code) {
    const d1 = Number(code[0]);
    const d2 = Number(code[1]);
    const d3 = Number(code[2]);

    const digits = [d1, d2, d3];

    return [
        `The first digit is ${d1 % 2 === 0 ? "even" : "odd"}.`,

        `The second digit is ${d2 % 2 === 0 ? "even" : "odd"}.`,

        `The third digit is ${d3 % 2 === 0 ? "even" : "odd"}.`,

        `The digits add up to ${d1 + d2 + d3}.`,

        `The largest digit is ${Math.max(...digits)}.`,

        `The smallest digit is ${Math.min(...digits)}.`,

        `There are ${
            digits.filter(digit => digit > 5).length
        } digit(s) greater than 5.`,

        `There are ${
            digits.filter(digit => digit < 5).length
        } digit(s) less than 5.`,

        `There are ${
            digits.filter(digit => digit % 2 === 0).length
        } even digit(s).`,

        `There are ${
            digits.filter(digit => digit % 2 !== 0).length
        } odd digit(s).`,

        `The first and second digits add up to ${d1 + d2}.`,

        `The second and third digits add up to ${d2 + d3}.`,

        `The first and third digits add up to ${d1 + d3}.`,

        `The difference between the largest and smallest digit is ${
            Math.max(...digits) - Math.min(...digits)
        }.`,

        d1 > d3
            ? "The first digit is larger than the last digit."
            : "The last digit is larger than the first digit."
    ];
}

/* ---------------------------
   Show Progressive Hints
--------------------------- */

function showHints() {
    let html = "";

    for (let i = 0; i < allHints.length; i++) {
        if (i < visibleHints) {
            html += `
                <div class="hint">
                    🔍 ${allHints[i]}
                </div>
            `;
        } else {
            html += `
                <div class="hint locked">
                    🔒 Hint ${i + 1} locked
                </div>
            `;
        }
    }

    document.getElementById("hints").innerHTML = html;
}

/* ---------------------------
   Start New Game
--------------------------- */

function generateNewGame() {
    secretCode = generateCode();

    attempts = 0;
    timer = 0;

    lockDigits = [0, 0, 0];
    currentGuess = "000";

    allHints = generateHints(secretCode);
    visibleHints = 3;

    updateLockDisplay();
    showHints();

    document.getElementById("result").innerHTML = "";

    document.getElementById("attempts").textContent =
        "Attempts: 0";

    const safeDoor = document.querySelector(".safe-door");

    if (safeDoor) {
        safeDoor.classList.remove("opened");
    }

    startTimer();

    console.log("Secret Code:", secretCode);
}

/* ---------------------------
   Check Player Guess
--------------------------- */

function checkGuess() {
    const guess = currentGuess;

    attempts++;

    document.getElementById("attempts").textContent =
        `Attempts: ${attempts}`;

    if (guess === secretCode) {
        stopTimer();

        const safeDoor = document.querySelector(".safe-door");

        if (safeDoor) {
            safeDoor.classList.add("opened");
        }

        document.getElementById("result").innerHTML =
            `
            🎉 Congratulations!<br><br>
            You unlocked the vault in
            ${attempts} attempt(s)!<br><br>
            ⏱️ Time: ${timer} seconds
            `;

        return;
    }

    let correctPosition = 0;
    let correctDigit = 0;

    for (let i = 0; i < 3; i++) {
        if (guess[i] === secretCode[i]) {
            correctPosition++;
        } else if (secretCode.includes(guess[i])) {
            correctDigit++;
        }
    }

    document.getElementById("result").innerHTML =
        `
        ❌ Not correct.<br>
        ✅ ${correctPosition} digit(s) in the correct position.<br>
        🔄 ${correctDigit} correct digit(s) in the wrong position.
        `;

    revealNextHint();
}

/* ---------------------------
   Reveal One New Hint
--------------------------- */

function revealNextHint() {
    if (visibleHints < allHints.length) {
        visibleHints++;
        showHints();

        document.getElementById("result").innerHTML +=
            `<br><br>💡 New hint unlocked!`;
    }
}

/* ---------------------------
   Timer
--------------------------- */

function startTimer() {
    clearInterval(timerInterval);

    timer = 0;

    document.getElementById("timer").textContent =
        `⏱️ Time: ${timer}s`;

    timerInterval = setInterval(() => {
        timer++;

        document.getElementById("timer").textContent =
            `⏱️ Time: ${timer}s`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}