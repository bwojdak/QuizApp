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
    const [selectedQuizId, setSelectedQuizId] = useState<string>("");
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
        handleStartGame(Number(selectedQuizId))
    }

    return (
        <div className="card">
            <h1 className="cardTitle">Create game</h1>
            {error && <p>{error}</p>}{startGameError && <p>{startGameError}</p>}
            <form onSubmit={handleSubmit}>
                <select
                    value={selectedQuizId}
                    onChange={(e) => setSelectedQuizId(e.target.value)}>
                    <option value="" disabled>
                        Select quiz
                    </option>
                    {quizzes.map((q) => (
                        <option key={q.id} value={q.id}>
                            {q.title} ({q.questionsCount} questions)
                        </option>
                    ))}
                </select>
                <button type="submit" disabled={!selectedQuizId}>Start game</button>
            </form>
        </div>
    )
}

export default CreateGameForm;