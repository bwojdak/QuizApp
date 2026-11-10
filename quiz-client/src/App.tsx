import QuizList from "./components/QuizList";
import AddQuizForm from "./components/AddQuizForm.tsx";
import {useState} from "react";

function App() {
    const [refreshKey, setRefreshKey] = useState<number>(0);
    return <div>
        <AddQuizForm onCreated={() => setRefreshKey(k => k + 1)}/>
        <QuizList refreshKey={refreshKey}/>
    </div>;
}

export default App;