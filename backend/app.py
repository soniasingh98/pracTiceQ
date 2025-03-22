from utils import QuestionGenerator
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuestionRequest(BaseModel):
    topic: str
    question_type: str
    difficulty: str
    num_questions: int


@app.post("/get_questions")
def GetQuestions(request: QuestionRequest):
    question_generator = QuestionGenerator()
    questions = []
    try:
        for _ in range(request.num_questions):

            if request.question_type == "Multiple Choice":
                question = question_generator.generate_mcq_questions(
                    request.topic, request.difficulty.lower()
                )
                questions.append(
                    {
                        "type": "MCQ",
                        "question": question.question,
                        "options": question.options,
                        "correct_answer": question.correct_answer,
                    }
                )

            else:
                question = question_generator.generate_fill_blank_questions(
                    request.topic, request.difficulty.lower()
                )
                questions.append(
                    {
                        "type": "Fill in the Blank",
                        "question": question.question,
                        "correct_answer": question.correct_answer,
                    }
                )
        return {"response": questions}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
