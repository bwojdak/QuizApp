import {useState,useEffect} from "react";
type TimerProps = {
    seconds: number;
}
function Timer({seconds}:TimerProps){
    const [left, setLeft] = useState<number>(seconds);
    useEffect(()=>{
        const id = setInterval(() => {setLeft(prev=> Math.max((prev -1),0))}, 1000)
        return () => clearInterval(id)
    },[]);
    return <p className="timer">{left}</p>
}
export default Timer;