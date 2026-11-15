import {connection} from "../signalr.ts";
import {useEffect, useState} from "react";
import type {QuizSummary} from "../types.ts";

type CreateGameFormProps = {
    onGameCreated: (pin: string) => void;
}

function CreateGameForm({onGameCreated}: CreateGameFormProps) {
    const [startGameError, setStartGameError] = useState<string | null>(null);
    const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
    const [isListOpen, setIsListOpen] = useState<boolean>(false);
    const selectedQuiz = quizzes.find(q => q.id === selectedQuizId);
    useEffect(() => {
        async function load() {
            try {
                const response = await fetch('/api/quizzes');
                if (!response.ok) throw new Error("Failed to load");
                const data: QuizSummary[] = await response.json();
                setQuizzes(data);
            } catch {
                setError('Failed to load quizzes');
            }
        }

        load();
    },[]);

    async function handleStartGame(quizId: number) {
        setStartGameError(null);
        try {
            const pin = await connection.invoke<string>("CreateGame", quizId);
            onGameCreated(pin)
        } catch (err) {
            console.error(err);
            setStartGameError('Failed to create game');
        }
    }
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (selectedQuizId === null) return;
        handleStartGame(selectedQuizId)
    }

    return (
        <div className="card">
            <h1 className="cardTitle">Create game</h1>
            {error && <p>{error}</p>}{startGameError && <p>{startGameError}</p>}
            <form onSubmit={handleSubmit}>
                <button type="button" className="quizSelectTrigger" onClick={() => setIsListOpen(open => !open)}>
                    <span>{selectedQuiz ? selectedQuiz.title : "Select quiz"}</span>
                    <span>{isListOpen ? "▲" : "▼"}</span>
                </button>
                {isListOpen && <ul className="quizzes">
                    {quizzes.map(q => (
                        <li key={q.id}
                            className={q.id === selectedQuizId ? "quizItem selected" : "quizItem"}>
                            <div className="quizInfo" onClick={() => {
                                setSelectedQuizId(q.id);
                                setIsListOpen(false);
                            }}>
                                <span className="quizTitle">{q.title}</span>
                                <span className="quizCount">{q.questionsCount} questions</span>
                            </div>
                        </li>
                    ))}
                </ul>}
                <button type="submit" disabled={selectedQuizId === null}>Start game</button>
            </form>
        </div>
    )
}

export default CreateGameForm;
