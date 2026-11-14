import {useEffect, useState} from "react";
import {connection} from "../signalr.ts";
import LobbyChat from "./LobbyChat.tsx";
import type {AnswerResult, PlayerQuestion, PlayerScore} from "../types.ts";

type PlayerLobbyProps = {
    pin: string; nickname: string; initialPlayers: string[];
    onLeave: () => void;
}

function PlayerLobby({pin, nickname, initialPlayers,onLeave}: PlayerLobbyProps) {
    const [players, setPlayers] = useState<string[]>(initialPlayers);
    const [question, setQuestion] = useState<PlayerQuestion | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
    const [scoreList, setScoreList] = useState<PlayerScore[] | null>(null);
    const [isKicked, setIsKicked] = useState<boolean>(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    useEffect(() => {
        function handlePlayerJoined(player: string) {
            setPlayers(prevPlayers => [...prevPlayers, player]);
        }
        function handlePlayerKicked(nicknameToKick: string) {
            setPlayers(prev => prev.filter(player => player !== nicknameToKick));
            if (nicknameToKick === nickname) {
                setIsKicked(true);
            }
        }
        function handleQuestionStarted(q: PlayerQuestion) {
            setQuestion(q);
            setAnswerResult(null);
        }
        function handleGameEnded(ranking: PlayerScore[]) {
            setScoreList(ranking)
        }
        function handleCountdown(seconds: number){
            setCountdown(seconds);
        }
        connection.on("PlayerKicked", handlePlayerKicked);
        connection.on("GameEnded", handleGameEnded)
        connection.on("QuestionStarted", handleQuestionStarted);
        connection.on("PlayerJoined", handlePlayerJoined);
        connection.on("Countdown", handleCountdown);
        return () => {
            connection.off("Countdown", handleCountdown);
            connection.off("PlayerKicked", handlePlayerKicked);
            connection.off("GameEnded", handleGameEnded);
            connection.off("QuestionStarted", handleQuestionStarted);
            connection.off("PlayerJoined", handlePlayerJoined);
        }
    }, [nickname]);

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
    if (isKicked) {
        return(
            <div>
            <h2>You have been kicked from the game</h2>
            <button onClick={()=> onLeave()}>← Back</button>
             </div>
        )
    }
    if (scoreList !== null) {
        return (
            <div>
                <ul>
                    {scoreList.map((s, index) => (
                        <li key={s.nickname}>
                            {index + 1}. {s.nickname} – {s.points} points
                        </li>
                    ))}
                </ul>
            </div>
        )
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
    if(countdown !== null) {
        return (
            <div>
                <h1>Game is starting in {countdown}..</h1>
            </div>
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