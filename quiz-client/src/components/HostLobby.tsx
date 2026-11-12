import {useState,useEffect} from "react";
import {connection} from "../signalr.ts";

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
                {players.map(nickname=>(<li key={nickname}>{nickname}</li>))}
            </ul>
        </div>
    )
}
export default HostLobby;