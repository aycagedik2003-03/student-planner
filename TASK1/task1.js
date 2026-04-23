const questionElement = document.getElementById("question");
const answerButtons = document.querySelectorAll(".answer-btn");
const scoreElement = document.getElementById("score");
let currentQuestionIndex = 0;
let score = 0;

const questions = [
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

function showQuestion() {
    const q = questions[currentQuestionIndex];
    questionElement.textContent = q.question;

    answerButtons.forEach((btn, index) => {
        btn.textContent = q.answers[index];
        btn.style.backgroundColor = "#ff69b4";
        btn.disabled = false;
        btn.style.display = "block";
    });
}

answerButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
        const correctIndex = questions[currentQuestionIndex].correct;

       if (index === correctIndex) {
    btn.style.backgroundColor = "green";
    score++;
    scoreElement.textContent = `Score: ${score}`;
}
        else {
            btn.style.backgroundColor = "red";
            answerButtons[correctIndex].style.backgroundColor = "green";
        }

        answerButtons.forEach(b => b.disabled = true);

        setTimeout(() => {
            currentQuestionIndex++;

            if (currentQuestionIndex < questions.length) {
                showQuestion();
            } else {
                showResult();
            }
        }, 1000);
    });
});

function showResult() {
    questionElement.textContent = `Your score: ${score} / ${questions.length} `;

    answerButtons.forEach(btn => {
        btn.style.display = "none";
    });
}

showQuestion();