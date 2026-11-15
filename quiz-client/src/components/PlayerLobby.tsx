import {useEffect, useState} from "react";
import {connection} from "../signalr.ts";
import LobbyChat from "./LobbyChat.tsx";
import type {AnswerResult, PlayerQuestion, PlayerScore} from "../types.ts";
import Ranking from "./Ranking.tsx";
import {PLAYER_SESSION_KEY} from "../storageKeys.ts";

type PlayerLobbyProps = {
    pin: string; nickname: string; initialPlayers: string[];
    onLeave: () => void;
}

function PlayerLobby({pin, nickname, initialPlayers, onLeave}: PlayerLobbyProps) {
    const [players, setPlayers] = useState<string[]>(initialPlayers);
    const [question, setQuestion] = useState<PlayerQuestion | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
    const [scoreList, setScoreList] = useState<PlayerScore[] | null>(null);
    const [isKicked, setIsKicked] = useState<boolean>(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [currentRanking, setCurrentRanking] = useState<PlayerScore[] | null>(null);
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
            setCurrentRanking(null);
            setQuestion(q);
            setAnswerResult(null);
        }

        function handleGameEnded(ranking: PlayerScore[]) {
            setScoreList(ranking)
            sessionStorage.removeItem(PLAYER_SESSION_KEY);
        }

        function handleCountdown(seconds: number) {
            setCountdown(seconds);
        }

        function handleCurrentRanking(ranking: PlayerScore[]) {
            setCurrentRanking(ranking)
        }

        connection.on("CurrentRanking", handleCurrentRanking)
        connection.on("PlayerKicked", handlePlayerKicked);
        connection.on("GameEnded", handleGameEnded)
        connection.on("QuestionStarted", handleQuestionStarted);
        connection.on("PlayerJoined", handlePlayerJoined);
        connection.on("Countdown", handleCountdown);
        return () => {
            connection.off("CurrentRanking", handleCurrentRanking)
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
        return (
            <div>
                <h2>You have been kicked from the game</h2>
                <button onClick={() => onLeave()}>← Back</button>
            </div>
        )
    }
    if (scoreList !== null) {
        return (
            <div className="card">
                <h1 className="cardTitle">🏆 Final ranking</h1>
                <Ranking playerScores={scoreList}></Ranking>
                <button onClick={() => onLeave()}>← Back to quiz list</button>
            </div>
        )
    }
    if (currentRanking !== null) {
        return (
            <div className="card">
                <h1 className="cardTitle">Current ranking:</h1>
                <Ranking playerScores={currentRanking}></Ranking>
            </div>
        )
    }
    if (question !== null) {
        return (
            <div className="card">
                <h1 className="cardTitle">{question.content}</h1>
                <ul className="answers">
                    {question.answers.map(a => <li key={a.id}>
                        <button onClick={() => handleSubmitAnswer(a.id)}>{a.content}</button>
                    </li>)}
                </ul>
                {answerResult != null && (
                    <p className={answerResult.isCorrect ? "correct" : "wrong"}>
                        {answerResult.isCorrect ? "Good answer!" : "Bad answer!"} {answerResult.points} points
                    </p>
                )}
                {error && <p>{error}</p>}
            </div>
        )
    }
    if (countdown !== null) {
        return (
            <div className="card">
                <h2 className="cardTitle">Game starts in</h2>
                <p className="countdown">{countdown}</p>
            </div>
        )
    }
    return (
        <>
            <div className="card">
                <p className="hint">Game PIN</p>
                <h1 className="pin">{pin}</h1>
                <p className="hint">Waiting for the host to start the game…</p>
            </div>
            <div className="card">
                <h2 className="cardTitle">Players ({players.length})</h2>
                <ul className="playerList">
                    <li>Host</li>
                    {players.map(player => (<li key={player}>{player} {player === nickname && '(You)'}</li>))}
                </ul>
            </div>
            <LobbyChat pin={pin}/>
        </>
    )
}

export default PlayerLobby;