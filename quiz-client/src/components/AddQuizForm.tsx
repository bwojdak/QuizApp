import {useState} from 'react';
import type {QuizCreate} from "../types";
type AddQuizFormProps = {
    onCancel: () => void;
    onCreated: () => void;
}

function AddQuizForm({onCancel,onCreated} : AddQuizFormProps) {
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
            onCreated();
            setTitle("");
            setDescription("");
        } catch {
            setError("Failed to add quiz");
        }
    }

    return (<form className="card" onSubmit={handleSubmit}>
        <h1 className="cardTitle">New quiz</h1>
        {error && <p>{error}</p>}
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
            <button type='submit'>Add</button><button type='button' onClick={onCancel}>Cancel</button>
        </div>
    </form>)

}

export default AddQuizForm;