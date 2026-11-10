import {useState, useEffect} from 'react';
import type {QuizSummary} from "../types";

function QuizList() {
    const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
    useEffect(() => {
        async function load() {
            const response = await fetch('/api/quizzes');
            const data: QuizSummary[] = await response.json();
            setQuizzes(data);
        }

        load();
    }, []);
    return (
        <div>
            <h1>Moje quizy</h1>
            <ul>
                {quizzes.map(q => <li key={q.id}>{q.title} {q.questionsCount} pytań</li>)}
            </ul>
        </div>
    )
}

export default QuizList;
