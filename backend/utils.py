import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from typing import List
from langchain.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field, field_validator
from fastapi import HTTPException

load_dotenv()


class MCQQuestion(BaseModel):
    question: str = Field(description="The question text")
    options: List[str] = Field(description="List of 4 possible answers")
    correct_answer: str = Field(description="The correct answer from the options")

    @field_validator("question", mode="before")
    def clean_question(cls, v):
        if isinstance(v, dict):
            return v.get("description", str(v))
        return str(v)


class FillInTheBlanksQuestion(BaseModel):
    question: str
    correct_answer: str

    @field_validator("question", mode="before")
    def clean_question(cls, v):
        if isinstance(v, dict):
            return v.get("description", str(v))
        return str(v)


class QuestionGenerator:
    def __init__(self):
        self.llm = ChatGroq(
            api_key=os.getenv("GROQ_API_KEY"),
            model="llama-3.1-8b-instant",
            temperature=0.9,
        )

    def generate_mcq_questions(self, topic: str, difficulty: str) -> MCQQuestion:
        output_parser = PydanticOutputParser(pydantic_object=MCQQuestion)
        prompt = PromptTemplate(
            template=(
                "Generate a {difficulty} multiple-choice question about {topic}.\n\n"
                "Return ONLY a JSON object with these exact fields:\n"
                "- 'question': A clear, specific question\n"
                "- 'options': An array of exactly 4 possible answers\n"
                "- 'correct_answer': One of the options that is the correct answer\n\n"
                "Example format:\n"
                "{{\n"
                '    "question": "What is the capital of France?",\n'
                '    "options": ["London", "Berlin", "Paris", "Madrid"],\n'
                '    "correct_answer": "Paris"\n'
                "}}\n\n"
                "Your response:"
            ),
            input_variables=["topic", "difficulty"],
        )
        try:
            response = self.llm.invoke(
                prompt.format(topic=topic, difficulty=difficulty)
            )
            parsed_response = output_parser.parse(response.content)
            if (
                not parsed_response.question
                or len(parsed_response.options) != 4
                or not parsed_response.correct_answer
            ):
                raise HTTPException(status_code=500, detail=f"Invalid question format")
            if parsed_response.correct_answer not in parsed_response.options:
                raise HTTPException(
                    status_code=500, detail=f"Correct answer not in option"
                )

            return parsed_response
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error with groq api {str(e)}")

    def generate_fill_blank_questions(
        self, topic: str, difficulty: str
    ) -> FillInTheBlanksQuestion:
        output_parser = PydanticOutputParser(pydantic_object=FillInTheBlanksQuestion)
        prompt = PromptTemplate(
            template=(
                "Generate a {difficulty} fill-in-the-blank question about {topic}.\n\n"
                "Return ONLY a JSON object with these exact fields:\n"
                "- 'question': A sentence with '_____' marking where the blank should be\n"
                "- 'correct_answer': The correct word or phrase that belongs in the blank\n\n"
                "Example format:\n"
                "{{\n"
                '    "question": "The capital of France is _____.",\n'
                '    "correct_answer": "Paris"\n'
                "}}\n\n"
                "Your response:"
            ),
            input_variables=["topic", "difficulty"],
        )
        try:
            response = self.llm.invoke(
                prompt.format(topic=topic, difficulty=difficulty)
            )
            response_content = response.content
            parsed_response = output_parser.parse(response_content)
            if not parsed_response.question or not parsed_response.correct_answer:
                raise ValueError("Invalid question format")
            if "_____" not in parsed_response.question:
                parsed_response.question = parsed_response.question.replace(
                    "___", "_____"
                )
            if "_____" not in parsed_response.question:
                raise ValueError("Question missing blank marker '_____'")
            return parsed_response
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error with groq api {str(e)}")
