import {useState, useEffect} from 'react';
import type {QuizDetails} from "../types.ts";
import AddQuestionForm from "./AddQuestionForm";

type QuizDetailsViewProps = {
    quizId: number;
    onBack: () => void;
}

function QuizDetailsView({quizId,onBack}: QuizDetailsViewProps) {
    const [quiz, setQuiz] = useState<QuizDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState<number>(0);
    useEffect(() => {
        async function load() {
            try {
                const response = await fetch(`/api/quizzes/${quizId}`)
                if (!response.ok) throw new Error("Failed to load");
                const data: QuizDetails = await response.json();
                setQuiz(data);
            } catch {
                setError('Failed to load quiz');
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [quizId, refreshKey]);
    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (quiz === null) return <div>No quiz found</div>;
    return (
        <div>
            <button onClick={onBack}>← Back</button>
            <h1>{quiz.title}</h1>
            {quiz.description && <p>{quiz.description}</p>}

            {quiz.questions.length > 0 ? (
                <ul>
                    {quiz.questions.map(q => (
                        <li key={q.id}>
                            {q.content}
                            <ul>
                                {q.answers.map(a => (
                                    <li key={a.id}>
                                        {a.content} {a.isCorrect && ' ✅'}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No questions yet.</p>
            )}
            <AddQuestionForm quizId={quiz.id} onCreated={() => setRefreshKey(k => k + 1)}/>
        </div>
    );
};

export default QuizDetailsView;