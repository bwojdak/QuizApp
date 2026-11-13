import {useEffect, useState} from "react";
import {connection} from "../signalr.ts";
import LobbyChat from "./LobbyChat.tsx";
import type {AnswerResult, PlayerQuestion} from "../types.ts";

type PlayerLobbyProps = {
    pin: string; nickname: string; initialPlayers: string[];
}

function PlayerLobby({pin, nickname, initialPlayers}: PlayerLobbyProps) {
    const [players, setPlayers] = useState<string[]>(initialPlayers);
    const [isStarted, setIsStarted] = useState<boolean>(false);
    const [question, setQuestion] = useState<PlayerQuestion | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
    useEffect(() => {
        function handlePlayerJoined(player: string) {
            setPlayers(prevPlayers => [...prevPlayers, player]);
        }

        function handleGameStart() {
            setIsStarted(true);
        }

        function handleQuestionStarted(q: PlayerQuestion) {
            setQuestion(q);
            setAnswerResult(null);
        }

        connection.on("QuestionStarted", handleQuestionStarted);
        connection.on("GameStarted", handleGameStart);
        connection.on("PlayerJoined", handlePlayerJoined);

        return () => {
            connection.off("QuestionStarted", handleQuestionStarted);
            connection.off("PlayerJoined", handlePlayerJoined);
            connection.off("GameStarted", handleGameStart);
        }
    }, []);

    async function handleSubmitAnswer(answerId: number) {
        try {
            setError(null);
            const result = await connection.invoke<AnswerResult>("SubmitAnswer", pin, answerId);
            setAnswerResult(result)
        } catch (err) {
            console.error(err);
            if (err instanceof Error) {
                const parts = err.message.split("HubException: ")
                setError(parts[1] ?? "Error occured");
            } else {
                setError("Error occured");
            }
        }
    }

    if (question !== null) {
        return (
            <div>
                <h1>{question.content}</h1>
                <ul>
                    {question.answers.map(a => <li key={a.id}>
                        <button onClick={() => handleSubmitAnswer(a.id)}>{a.content}</button>
                    </li>)}
                </ul>
                {answerResult != null && (
                    <>
                        {answerResult.isCorrect ? "Dobrze!" : "Źle!"} {answerResult.points} pkt
                    </>
                )}
                {error && <p>{error}</p>}
            </div>
        )
    }
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