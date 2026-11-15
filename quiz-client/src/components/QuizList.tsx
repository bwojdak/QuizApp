import {useState, useEffect} from 'react';
import type {QuizSummary} from "../types";
import AddQuizForm from "./AddQuizForm.tsx";

type QuizListProps = {
    onSelect: (id: number) => void;
}

function QuizList({onSelect}: QuizListProps) {
    const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [addQuiz, setAddQuiz] = useState<boolean>(false);
    const [refreshKey, setRefreshKey] = useState<number>(0);
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
    if (loading) return <div className="card">Loading...</div>;
    if (error) return <div className="card">{error}</div>;
    if (addQuiz)
        return (
            <AddQuizForm onCreated={()=> {setAddQuiz(false);setRefreshKey(k=>k+1);}} onCancel={()=>setAddQuiz(false)}></AddQuizForm>
        )
    return (
        <div className="card">
            <div className="cardHeader">
            <h1 className="cardTitle">My quizzes</h1><button onClick={()=>setAddQuiz(true)} className="addQuizButton">+</button>
            </div>
            {quizzes.length > 0 && <p className="hint">Click a quiz to edit</p>}
            {quizzes.length>0?<ul className="quizzes">
                {quizzes.map(q =>
                    <li key={q.id} className="quizItem">
                        <div className="quizInfo" onClick={() => onSelect(q.id)}>
                            <span className="quizTitle">{q.title}</span>
                            <span className="quizCount">{q.questionsCount} questions</span>
                        </div>
                    </li>)
                }
            </ul> : <p>No quizzes yet.</p>}
        </div>
    )
}

export default QuizList;
