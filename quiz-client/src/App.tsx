import QuizList from "./components/QuizList";
import AddQuizForm from "./components/AddQuizForm.tsx";
import {useEffect, useState} from "react";
import QuizDetailsView from "./components/QuizDetailsView.tsx";
import {connection} from "./signalr.ts";
import JoinGameForm from "./components/JoinGameForm.tsx";
import type {PlayerSession} from "./types.ts";

function App() {
    const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [gamePin, setGamePin] = useState<string | null>(null);
    const [playerSession, setPlayerSession] = useState<PlayerSession | null>(null);
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
    if(playerSession !== null){
        return <h1>Joined the game {playerSession.pin} as {playerSession.nickname}</h1>
    }
    if(gamePin !== null) {
        return <h1>PIN: {gamePin}</h1>}
    if (selectedQuizId === null) {
        return <div>
            <JoinGameForm onJoinGame={(pin,nickname)=> setPlayerSession({pin,nickname})}></JoinGameForm>
            <AddQuizForm onCreated={() => setRefreshKey(k => k + 1)}/>
            <QuizList refreshKey={refreshKey} onSelect={id => setSelectedQuizId(id)} onGameCreated={gamePin =>setGamePin(gamePin)}/>
        </div>;
    }
    return (<QuizDetailsView quizId={selectedQuizId} onBack={() => setSelectedQuizId(null)}/>)
}

export default App;