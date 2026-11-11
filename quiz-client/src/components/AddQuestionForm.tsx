import {useState} from 'react';
import type {Question} from "../types.ts";

type AddQuestionFormProps = {
    quizId: number;
    onCreated: () => void;
    question?: Question;
}
type AnswerDraft = {
    content: string;
    isCorrect: boolean;
}
const emptyAnswers: AnswerDraft[] = [{content: "", isCorrect: false},
    {content: "", isCorrect: false},
    {content: "", isCorrect: false},
    {content: "", isCorrect: false},]

function AddQuestionForm({quizId, onCreated, question}: AddQuestionFormProps) {
    const [content, setContent] = useState<string>(question?.content ?? "");
    const [answers, setAnswers] = useState<AnswerDraft[]>(question?.answers
        .map(a => ({content: a.content, isCorrect: a.isCorrect})) ?? emptyAnswers);
    const [timeLimit, setTimeLimit] = useState<number>(question?.timeLimitSeconds ?? 20);
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
            const url = question ? `/api/quizzes/${quizId}/questions/${question.id}` : `/api/quizzes/${quizId}/questions`;
            const method = question ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
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
            <button type="submit">{question ? "Save" : "Add question"}</button>
            {error && <p>{error}</p>}
        </form>
    )
}

export default AddQuestionForm;
