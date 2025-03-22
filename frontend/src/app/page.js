"use client";

import { useState } from "react";

export default function Home() {
  const topics = [
    "Artificial Intelligence",
    "Machine Learning",
    "Data Science",
    "Cybersecurity",
    "Blockchain",
    "Cloud Computing",
    "Web Development",
    "Mobile Development",
    "Networking",
    "Operating Systems",
    "Software Engineering",
    "Databases",
    "Python",
    "JavaScript",
    "Java",
    "C++",
    "C#",
    "Go",
    "Rust",
    "Swift",
    "Kotlin",
    "Ruby",
    "PHP",
    "TypeScript",
    "SQL",
    "Other",
  ];

  const [topic, setTopic] = useState(topics[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [questionType, setQuestionType] = useState("Fill in the blanks");
  const [difficulty, setDifficulty] = useState("easy");
  const [numQuestions, setNumQuestions] = useState(2);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);

  const fetchQuestions = async () => {
    setLoading(true);
    setSubmitted(false);
    setScore(0);

    const selectedTopic =
      topic === "Other" ? customTopic.trim() || "General Knowledge" : topic;

    const requestBody = {
      topic: selectedTopic,
      question_type: questionType,
      difficulty,
      num_questions: Number(numQuestions),
    };

    try {
      const response = await fetch("http://localhost:8000/get_questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      setQuestions(data.response);
      setAnswers({});
    } catch (error) {
      console.error("Error fetching questions:", error);
    }

    setLoading(false);
  };

  const handleChange = (index, value) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, index) => {
      if (answers[index]?.toLowerCase() === q.correct_answer.toLowerCase()) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setSubmitted(true);
  };

  const resetQuiz = () => {
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-5">
      <h1 className="text-3xl font-bold mb-5 bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
        pracTiceQ
      </h1>

      {!questions.length && (
        <>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            🚀 Prepare for Online Assessments & Tests with AI-Generated
            Questions
          </h2>
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <p className="text-gray-600">
                ✅Personalized Question Generation.
              </p>
              <p className="text-gray-600">✅Adaptive Difficulty Levels.</p>
              <p className="text-gray-600">
                ✅Saves Time on Question Curation.
              </p>
              <p className="text-gray-600">✅Covers Diverse Tech Topics.</p>
            </div>

            <div className="md:w-1/2">
              <h2 className="text-lg font-semibold mb-4">
                Select Quiz Options
              </h2>

              <label className="block mb-2">Topic:</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="border p-3 rounded w-full mb-3"
              >
                {topics.map((t, index) => (
                  <option key={index} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {topic === "Other" && (
                <input
                  type="text"
                  placeholder="Enter custom topic"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="border p-3 rounded w-full mb-3"
                />
              )}

              <label className="block mb-2">Question Type:</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="border p-3 rounded w-full mb-3"
              >
                <option value="Fill in the blanks">Fill in the Blanks</option>
                <option value="Multiple Choice">Multiple Choice</option>
              </select>

              <label className="block mb-2">Difficulty:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="border p-3 rounded w-full mb-3"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <label className="block mb-2">Number of Questions:</label>
              <input
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                className="border p-3 rounded w-full mb-4"
              />

              <button
                className="bg-purple-500 text-white px-4 py-3 rounded w-full"
                onClick={fetchQuestions}
                disabled={loading}
              >
                {loading ? "Loading..." : "Start Quiz"}
              </button>
            </div>
          </div>
        </>
      )}

      {questions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl mt-5">
          {questions.map((q, index) => (
            <div key={index} className="mb-4">
              <p className="text-lg font-medium mb-2">{q.question}</p>
              {!submitted ? (
                q.type === "MCQ" ? (
                  <div>
                    {q.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="block">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          onChange={(e) => handleChange(index, e.target.value)}
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    className="border p-3 rounded w-full"
                    onChange={(e) => handleChange(index, e.target.value)}
                  />
                )
              ) : (
                <p
                  className={`p-3 rounded ${
                    answers[index]?.toLowerCase() ===
                    q.correct_answer.toLowerCase()
                      ? "bg-green-200"
                      : "bg-red-200"
                  }`}
                >
                  Your answer: {answers[index] || "No answer"}
                  <br />
                  Correct answer: {q.correct_answer}
                </p>
              )}
            </div>
          ))}

          {!submitted ? (
            <button
              className="bg-blue-500 text-white px-4 py-3 rounded mt-4 w-full"
              onClick={handleSubmit}
            >
              Submit Answers
            </button>
          ) : (
            <div className="mt-5 text-center">
              <h2 className="text-xl font-bold">
                Score: {score} / {questions.length}
              </h2>
              <button
                className="bg-gray-600 text-white px-4 py-3 rounded mt-4 w-full"
                onClick={resetQuiz}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
