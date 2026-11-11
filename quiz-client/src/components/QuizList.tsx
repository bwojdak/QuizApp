import {useState, useEffect} from 'react';
import type {QuizSummary} from "../types";

type QuizListProps = {
    refreshKey: number;
    onSelect: (id: number) => void;
}

function QuizList({refreshKey,onSelect}: QuizListProps) {
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
    }, [refreshKey]);
    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (quizzes.length === 0) return <div>No quizzes to show...</div>
    return (
        <div>
            <h1>My quizzes</h1>
            <ul>
                {quizzes.map(q => <li key={q.id} onClick={() => onSelect(q.id)}>{q.title} {q.questionsCount} questions</li>)}
            </ul>
        </div>
    )
}
export default QuizList;
