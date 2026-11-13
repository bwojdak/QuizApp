import {useEffect, useState} from "react";
import {connection} from "../signalr.ts";
import LobbyChat from "./LobbyChat.tsx";

type PlayerLobbyProps = {
    pin: string; nickname: string; initialPlayers: string[];
}

function PlayerLobby({pin, nickname, initialPlayers}: PlayerLobbyProps) {
    const [players, setPlayers] = useState<string[]>(initialPlayers);
    const [isStarted, setIsStarted] = useState<boolean>(false);
    useEffect(() => {
        function handlePlayerJoined(player: string) {
            setPlayers(prevPlayers => [...prevPlayers, player]);
        }
        function handleGameStart() {
            setIsStarted(true);
        }
        connection.on("GameStarted", handleGameStart);
        connection.on("PlayerJoined", handlePlayerJoined);

        return () => {
            connection.off("PlayerJoined", handlePlayerJoined);
            connection.off("GameStarted", handleGameStart);
        }
    }, []);
    if (isStarted) {
        return (
            <h1>Game Started</h1>
        )
    }
    return (
        <div>
            <h1>Joined the game {pin} as {nickname}</h1>
            <h2>Players:</h2>
            <ul>
                <li>Host</li>
                {players.map(player => (<li key={player}>{player} {player === nickname && '(You)'}</li>))}
            </ul>
            <LobbyChat pin={pin}/>
        </div>
    )
}

export default PlayerLobby;