import {useState, useEffect} from "react";
import {connection} from "../signalr.ts";
import LobbyChat from "./LobbyChat.tsx";
import type {PlayerQuestion, PlayerScore} from "../types.ts";

type HostLobbyProps = {
    pin: string;
}

function HostLobby({pin}: HostLobbyProps) {
    const [players, setPlayers] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [scoreList, setScoreList] = useState<PlayerScore[] | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [question, setQuestion] = useState<PlayerQuestion | null>(null);
    const [currentRanking, setCurrentRanking] = useState<PlayerScore[] | null>(null);
    useEffect(() => {
        function handlePlayerJoined(nickname: string) {
            setPlayers(prevPlayers => [...prevPlayers, nickname]);
        }
        function handlePlayerKicked(nickname: string) {
            setPlayers(prevPlayers => prevPlayers.filter(player => player !== nickname));
        }
        function handleGameEnded(ranking: PlayerScore[]) {
            setScoreList(ranking);
        }
        function handleQuestionStarted(q: PlayerQuestion) {
            setQuestion(q);
            setCurrentRanking(null);
        }
        function handleCountdown(seconds: number){
            setCountdown(seconds);
        }
        function handleCurrentRanking(crntRanking: PlayerScore[]) {
            setCurrentRanking(crntRanking)
        }
        connection.on("CurrentRanking", handleCurrentRanking)
        connection.on("QuestionStarted", handleQuestionStarted)
        connection.on("Countdown", handleCountdown);
        connection.on("PlayerKicked", handlePlayerKicked);
        connection.on("PlayerJoined", handlePlayerJoined);
        connection.on("GameEnded", handleGameEnded);
        return () => {
            connection.off("CurrentRanking", handleCurrentRanking)
            connection.off("QuestionStarted", handleQuestionStarted)
            connection.off("Countdown", handleCountdown);
            connection.off("GameEnded", handleGameEnded);
            connection.off("PlayerJoined", handlePlayerJoined);
            connection.off("PlayerKicked", handlePlayerKicked);
        }
    }, []);
    
    async function handleStartGame() {
        setError(null);
        try {
            await connection.invoke("StartGame", pin)
        } catch (err) {
            console.error(err);
            setError("Unable to start game");
        }
    }
    async function handleKickPlayer(nickname: string) {
        setError(null);
        try {
            await connection.invoke("KickPlayer", pin,nickname);
        }catch(err) {
                console.error(err);
                setError("Failed to kick player");
        }
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
    if (currentRanking !== null) {
        return (
            <div>
                <ul>
                    {currentRanking.map((s, index) => (
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
                        <label>{a.content}</label>
                    </li>)}
                </ul>
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
            <h1>PIN: {pin}</h1>
            <h2>Players:</h2>
            <ul>
                <li>Host (You)</li>
                {players.map(nickname => (<li key={nickname}>{nickname} <button onClick={()=>handleKickPlayer(nickname)}>Kick</button></li>))}
            </ul>
            <button onClick={handleStartGame}>Start game</button>
            {error && <p>{error}</p>}
            <LobbyChat pin={pin}></LobbyChat>
        </div>
    )
}

export default HostLobby;