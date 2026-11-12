import {useState} from "react";
import {connection} from "../signalr.ts";
type JoinGameFormProps = {
    onJoinGame: (pin: string, nickname: string) => void;
}

function JoinGameForm({onJoinGame}: JoinGameFormProps) {
    const [pin, setPin] = useState<string>("");
    const [nickname, setNickname] = useState<string>("");
    const [error, setError] = useState<string|null>(null);
    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();
        setError(null);
        try{
            await connection.invoke("JoinGame",pin, nickname);
            setPin("")
            setNickname("")
            onJoinGame(pin,nickname)
        }catch(err){
            console.error(err);
        }
    }

    return (<form onSubmit={handleSubmit}>
        <h2>Join game</h2>
        {error && <p>{error}</p>}
        <input
            value={pin}
            placeholder="Pin"
            onChange={e => setPin(e.target.value)}
        />
        <input
            value={nickname}
            placeholder="Nickname"
            onChange={e => setNickname(e.target.value)}
        />
        <div>
            <button type='submit'>Join</button>
        </div>
    </form>)
}
export default JoinGameForm;