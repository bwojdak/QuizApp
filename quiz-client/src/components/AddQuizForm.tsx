import {useState} from 'react';
import type {QuizCreate} from "../types";
type AddQuizFormProps = {
    onCreated: () => void;
}

function AddQuizForm({onCreated}: AddQuizFormProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            setError(null);
            const dto: QuizCreate = {title, description: description || null};
            const response = await fetch('/api/quizzes', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(dto),
            });
            if (!response.ok) throw new Error("Failed to add Quiz");
            setTitle("");
            setDescription("");
            onCreated();
        } catch {
            setError("Failed to add quiz");
        }
    }

    return (<form onSubmit={handleSubmit}>
        <h2>New quiz</h2>
        <input
            value={title}
            placeholder="Title"
            onChange={e => setTitle(e.target.value)}
        />
        <textarea
            value={description}
            placeholder="Description"
            onChange={e => setDescription(e.target.value)}
        />
        <div>
            <button type='submit'>Add</button>
            {error && <p>{error}</p>}
        </div>
    </form>)

}

export default AddQuizForm;