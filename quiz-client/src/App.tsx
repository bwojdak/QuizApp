import QuizList from "./components/QuizList";
import AddQuizForm from "./components/AddQuizForm.tsx";
import {useEffect, useState} from "react";
import QuizDetailsView from "./components/QuizDetailsView.tsx";
import {connection} from "./signalr.ts";
import JoinGameForm from "./components/JoinGameForm.tsx";
import type {PlayerSession} from "./types.ts";
import HostLobby from "./components/HostLobby.tsx";
import PlayerLobby from "./components/PlayerLobby.tsx";

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
                const saved = sessionStorage.getItem("playerSession");
                if(saved!==null){
                    const data = JSON.parse(saved);
                    try{
                        const players = await connection.invoke<string[]>("RejoinGame",data.pin,data.token);
                        setPlayerSession({...data,players})
                    }catch (err){
                        console.error(err);
                        sessionStorage.removeItem("playerSession");
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }

        connect();
    }, [])
    function handleJoinGame(pin: string,nickname: string,players: string[],token: string) {
        setPlayerSession({pin, nickname, players,token})
        const data = {pin, nickname, token};
        sessionStorage.setItem("playerSession", JSON.stringify(data))
    }
    function handleLeave() {
        setPlayerSession(null)
        sessionStorage.removeItem("playerSession")
    }
    if (playerSession !== null) {
        return <PlayerLobby pin={playerSession.pin} nickname={playerSession.nickname}
                            initialPlayers={playerSession.players} onLeave={handleLeave}/>;
    }
    if (gamePin !== null) {
        return <HostLobby pin={gamePin}/>
    }
    if (selectedQuizId === null) {
        return <div>
            <JoinGameForm
                onJoinGame={handleJoinGame}></JoinGameForm>
            <AddQuizForm onCreated={() => setRefreshKey(k => k + 1)}/>
            <QuizList refreshKey={refreshKey} onSelect={id => setSelectedQuizId(id)}
                      onGameCreated={gamePin => setGamePin(gamePin)}/>
        </div>;
    }
    return (<QuizDetailsView quizId={selectedQuizId} onBack={() => setSelectedQuizId(null)}/>)
}

export default App;