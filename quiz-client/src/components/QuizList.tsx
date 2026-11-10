import {useState, useEffect} from 'react';
import type {QuizSummary} from "../types";

function QuizList() {
    const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        async function load() {
            try {
                const response = await fetch('/api/quizzes');
                if (!response.ok) throw new Error("Failed to load");
                const data: QuizSummary[] = await response.json();
                setQuizzes(data);
            } catch {
                setError('Failed to load quizzes');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);
    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (quizzes.length === 0) return <div>No quizzes to show...</div>
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
