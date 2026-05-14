import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const questions = [
    {
      question: "Which of the following is NOT a programming language?",
      answers: ["Python", "HTML", "Java", "C++"],
      correct: 1,
    },
    {
      question: "Which language runs in the browser?",
      answers: ["Python", "Java", "C++", "JavaScript"],
      correct: 3,
    },
    {
      question: "What does CSS stand for?",
      answers: [
        "Color Style Sheets",
        "Cascading Style Sheets",
        "Computer Style Sheets",
        "Creative Style System",
      ],
      correct: 1,    
    },
    {
      question: "Which HTML tag is used for JavaScript?",
      answers: ["<js>", "<script>", "<javascript>", "<code>"],
      correct: 1,
    },
    {
      question: "Which company created JavaScript?",
      answers: ["Google", "Microsoft", "Netscape", "Apple"],
      correct: 2,
    },

    {
  question: "Which symbol is used for comments in JavaScript?",
  answers: ["//", "<!-- -->", "#", "**"],
  correct: 0,
},
{
  question: "Which HTML tag creates a hyperlink?",
  answers: ["<link>", "<a>", "<href>", "<url>"],
  correct: 1,
},
{
  question: "Which method is used to print in the console?",
  answers: ["console.log()", "print()", "echo()", "write()"],
  correct: 0,
},
{
  question: "Which CSS property changes text color?",
  answers: ["font-color", "text-color", "color", "background"],
  correct: 2,
},
{
  question: "What does HTML stand for?",
  answers: [
    "Hyper Text Markup Language",
    "High Text Machine Language",
    "Hyper Transfer Markup Language",
    "Home Tool Markup Language"
  ],
  correct: 0,
},
{
  question: "Which company developed React?",
  answers: ["Google", "Facebook", "Microsoft", "Apple"],
  correct: 1,
},
{
  question: "Which keyword declares a variable in JavaScript?",
  answers: ["int", "string", "let", "define"],
  correct: 2,
},
{
  question: "Which CSS property adds space inside an element?",
  answers: ["margin", "padding", "spacing", "border"],
  correct: 1,
},
{
  question: "Which hook is used for state in React?",
  answers: ["useEffect", "useState", "useFetch", "useData"],
  correct: 1,
},
{
  question: "Which operator checks equality in JavaScript?",
  answers: ["=", "===", "+=", "!="],
  correct: 1,
},
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (quizFinished || selectedAnswer !== null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          setSelectedAnswer("timeout");
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, selectedAnswer, quizFinished]);

  const handleAnswerClick = (index) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);

    if (index === currentQuestion.correct) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setTimeLeft(10);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(10);
    setSelectedAnswer(null);
    setQuizFinished(false);
  };

  return (
    <div className="quiz-container">
      <h1>Quiz App</h1>

      <p id="score">Score: {score}</p>

      {!quizFinished && (
        <p id="timer">Time: {timeLeft}</p>
      )}

      {quizFinished ? (
        <>
          <h2>
            Final Score: {score} / {questions.length}
          </h2>

          <button id="restart-btn" onClick={restartQuiz}>
            Restart
          </button>
        </>
      ) : (
        // "<>"React Fragment allows multiple elements without creating an extra div
        <>
          <div id="question">
            {currentQuestion.question}
          </div>

          <div id="answers">
            {currentQuestion.answers.map((answer, index) => {
              let bgColor = "#ff69b4";

              if (selectedAnswer !== null) {
                if (index === currentQuestion.correct) {
                  bgColor = "green";
                } else if (index === selectedAnswer) {
                  bgColor = "red";
                }
              }

              return (
                <button
                  key={index}
                  className="answer-btn"
                  style={{ backgroundColor: bgColor }}
                  onClick={() => handleAnswerClick(index)}
                  disabled={selectedAnswer !== null}
                >
                  {answer}
                </button>
              );
            })}
          </div>

          {selectedAnswer !== null && (
            <button id="next-btn" onClick={nextQuestion}>
              Next
            </button>
          )}
        </>
      )}
    </div>
  );
}
// Exports App component ,Makes App component usable in other files
export default App;