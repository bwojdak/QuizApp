import QuizList from "./components/QuizList";
import AddQuizForm from "./components/AddQuizForm.tsx";
import {useEffect, useState} from "react";
import QuizDetailsView from "./components/QuizDetailsView.tsx";
import {connection} from "./signalr.ts";

function App() {
    const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [pin, setPin] = useState<string | null>(null);
    useEffect(() => {
        async function connect() {
            try {
                if (connection.state !== "Disconnected") return;
                await connection.start();
                console.log("SignalR connected");
            } catch (err) {
                console.error(err);
            }
        }
        connect();
    }, [])
    if(pin !== null) {
        return <div><h1>PIN: {pin}</h1></div>
    }
    if (selectedQuizId === null) {
        return <div>
            <AddQuizForm onCreated={() => setRefreshKey(k => k + 1)}/>
            <QuizList refreshKey={refreshKey} onSelect={id => setSelectedQuizId(id)} onGameCreated={gamePin =>setPin(gamePin)}/>
        </div>;
    }
    return (<QuizDetailsView quizId={selectedQuizId} onBack={() => setSelectedQuizId(null)}/>)
}

export default App;