const questionElement = document.getElementById("question");
const answerButtons = document.querySelectorAll(".answer-btn");
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const restartBtn = document.getElementById("restart-btn");

let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 10;

let questions = [
    {
        question: "Which of the following is NOT a programming language?",
        answers: ["Python", "HTML", "Java", "C++"],
        correct: 1
    },
    {
        question: "Which language runs in the browser?",
        answers: ["Python", "Java", "C++", "JavaScript"],
        correct: 3
    },
    {
        question: "What does CSS stand for?",
        answers: [
            "Color Style Sheets",
            "Cascading Style Sheets",
            "Computer Style Sheets",
            "Creative Style System"
        ],
        correct: 1
    },
    {
        question: "Which HTML tag is used for JavaScript?",
        answers: ["<js>", "<script>", "<javascript>", "<code>"],
        correct: 1
    },
    {
        question: "Which company created JavaScript?",
        answers: ["Google", "Microsoft", "Netscape", "Apple"],
        correct: 2
    }
];

// 🔀 Soruları karıştır
function shuffleQuestions() {
    questions.sort(() => Math.random() - 0.5);
}

// ⏱ Timer başlat
function startTimer() {
    timeLeft = 10;
    timerElement.textContent = `Time: ${timeLeft}`;

    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Time: ${timeLeft}`;

        if (timeLeft === 0) {
            clearInterval(timer);
            autoSelectWrong();
        }
    }, 1000);
}

// ⛔ Süre bitince otomatik geç
function autoSelectWrong() {
    const correctIndex = questions[currentQuestionIndex].correct;
    answerButtons[correctIndex].style.backgroundColor = "green";
    answerButtons.forEach(b => b.disabled = true);

    setTimeout(nextQuestion, 1000);
}

// 📌 Soruyu göster
function showQuestion() {
    clearInterval(timer);

    const q = questions[currentQuestionIndex];
    questionElement.textContent = q.question;

    answerButtons.forEach((btn, index) => {
        btn.textContent = q.answers[index];
        btn.style.backgroundColor = "#ff69b4";
        btn.disabled = false;
        btn.style.display = "block";
    });

    startTimer();
}

// 🧠 Buton click
answerButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
        clearInterval(timer);

        const correctIndex = questions[currentQuestionIndex].correct;

        if (index === correctIndex) {
            btn.style.backgroundColor = "green";
            score++;
            scoreElement.textContent = `Score: ${score}`;
        } else {
            btn.style.backgroundColor = "red";
            answerButtons[correctIndex].style.backgroundColor = "green";
        }

        answerButtons.forEach(b => b.disabled = true);

        setTimeout(nextQuestion, 1000);
    });
});

// ➡ Sonraki soru
function nextQuestion() {
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

// 🏁 Sonuç
function showResult() {
    questionElement.textContent = `Final Score: ${score} / ${questions.length}`;
    timerElement.style.display = "none";

    answerButtons.forEach(btn => {
        btn.style.display = "none";
    });

    restartBtn.style.display = "block";
}

// 🔁 Restart
restartBtn.addEventListener("click", () => {
    currentQuestionIndex = 0;
    score = 0;
    scoreElement.textContent = "Score: 0";
    timerElement.style.display = "block";

    shuffleQuestions();
    showQuestion();

    restartBtn.style.display = "none";
});

// 🚀 Başlat
shuffleQuestions();
showQuestion();