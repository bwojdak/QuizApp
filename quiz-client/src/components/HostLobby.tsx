import {useState,useEffect} from "react";
import {connection} from "../signalr.ts";
import LobbyChat from "./LobbyChat.tsx";

type HostLobbyProps = {
    pin: string;
}
function HostLobby({pin}: HostLobbyProps) {
    const [players, setPlayers] = useState<string[]>([]);
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
    return (
        <div>
            <h1>PIN: {pin}</h1>
            <h2>Players:</h2>
            <ul>
                <li>Host (You)</li>
                {players.map(nickname=>(<li key={nickname}>{nickname}</li>))}
            </ul>
            <LobbyChat pin={pin}></LobbyChat>
        </div>
    )
}
export default HostLobby;