import {useState, useEffect} from "react";
import type {ChatMessage} from "../types.ts";
import {connection} from "../signalr.ts";

type LobbyChatProps = {
    pin: string;
}

function LobbyChat({pin}: LobbyChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [text, setText] = useState<string>("")
    const [error, setError] = useState<string | null>(null)
    useEffect(() => {
        function handleMessage(sender: string, message: string) {
            const newMessage: ChatMessage = {sender, text: message};
            setMessages(prevMessages => [...prevMessages, newMessage]);
        }

        connection.on("ChatMessage", handleMessage);
        return () => {
            connection.off("ChatMessage", handleMessage);
        }
    }, []);
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        try{
            await connection.invoke("SendMessage",pin,text);
            setText("")
        }catch (err){
            console.error(err);
            setError("Failed to send message");
        }
    }
    return (
        <div>
            <ul>
                {messages.map((m, i) => <li key={i}>{m.sender}: {m.text}</li>)}
            </ul>
            <form onSubmit={handleSubmit}>
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <button type="submit">Send</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    )
}

export default LobbyChat;