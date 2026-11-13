import {useState,useEffect} from "react";
import {connection} from "../signalr.ts";
import LobbyChat from "./LobbyChat.tsx";

type HostLobbyProps = {
    pin: string;
}
function HostLobby({pin}: HostLobbyProps) {
    const [players, setPlayers] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isStarted, setIsStarted] = useState<boolean>(false);
    useEffect(() => {
        function handlePlayerJoined(nickname: string)
        {
            setPlayers(prevPlayers=>[...prevPlayers,nickname]);
        }
        connection.on("PlayerJoined", handlePlayerJoined);
        
        return () => {
            connection.off("PlayerJoined", handlePlayerJoined);
        }
    }, []);
    async function handleStartGame() {
        setError(null);
        try {
            await connection.invoke("StartGame", pin)
            setIsStarted(true);
        }
        catch (err){
            console.error(err)
            setError("Unable to start game");
        }
    }
    if (isStarted) {
        return (
            <h1>Game Started</h1>
        )
    }
    return (
        <div>
            <h1>PIN: {pin}</h1>
            <h2>Players:</h2>
            <ul>
                <li>Host (You)</li>
                {players.map(nickname=>(<li key={nickname}>{nickname}</li>))}
            </ul>
            <button onClick={handleStartGame}>Start game</button>
            {error && <p>{error}</p>}
            <LobbyChat pin={pin}></LobbyChat>
        </div>
    )
}
export default HostLobby;