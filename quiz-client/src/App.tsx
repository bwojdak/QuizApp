import QuizList from "./components/QuizList";
import AddQuizForm from "./components/AddQuizForm.tsx";
import {useState} from "react";
import QuizDetailsView from "./components/QuizDetailsView.tsx";

function App() {
    const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
    const [refreshKey, setRefreshKey] = useState<number>(0);
    if(selectedQuizId === null) {
        return <div>
            <AddQuizForm onCreated={() => setRefreshKey(k => k + 1)}/>
            <QuizList refreshKey={refreshKey} onSelect={id => setSelectedQuizId(id)}/>
        </div>;
    }
    return (<QuizDetailsView quizId={selectedQuizId} onBack={()=>setSelectedQuizId(null)}/>)
}

export default App;