import {useState} from 'react';

type AddQuestionFormProps = {
    quizId: number;
    onCreated: () => void;
}
type AnswerDraft = {
    content: string;
    isCorrect: boolean;
}
const emptyAnswers: AnswerDraft[] = [{content: "", isCorrect: false},
    {content: "", isCorrect: false},
    {content: "", isCorrect: false},
    {content: "", isCorrect: false},]

function AddQuestionForm({quizId, onCreated}: AddQuestionFormProps) {
    const [content, setContent] = useState<string>("");
    const [answers, setAnswers] = useState<AnswerDraft[]>(emptyAnswers);
    const [timeLimit, setTimeLimit] = useState<number>(20);
    const [error, setError] = useState<string | null>(null);

    function updateAnswers(index: number, value: string) {
        setAnswers(answers.map((a, i) => i === index ? {...a, content: value} : a))
    }

    function setCorrect(index: number) {
        setAnswers(answers.map((a, i) => ({...a, isCorrect: i === index})))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            setError(null);
            const response = await fetch(`/api/quizzes/${quizId}/questions`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    content,
                    timeLimitSeconds: timeLimit,
                    answers,
                }),
            });
            if (!response.ok) throw new Error("Failed to add question");
            setContent("");
            setAnswers(emptyAnswers);
            setTimeLimit(20);
            onCreated();
        } catch {
            setError("Failed to add question");
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <input value={content}
                   placeholder="Question"
                   onChange={e => setContent(e.target.value)}/>
            <input
                type="number"
                min={5}
                max={120}
                value={timeLimit}
                onChange={e => setTimeLimit(Number(e.target.value))}
            />
            {answers.map((a, i) => (
                <div key={i}>
                    <input
                        type="radio"
                        name="correct"
                        checked={a.isCorrect}
                        onChange={() => setCorrect(i)}
                    />
                    <input
                        value={a.content}
                        placeholder={`Answer ${i + 1}`}
                        onChange={e => updateAnswers(i, e.target.value)}
                    />
                </div>
            ))}
            <button type="submit">Add question</button>
            {error && <p>{error}</p>}
        </form>
    )
}

export default AddQuestionForm;
