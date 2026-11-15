
import type {PlayerScore} from "../types.ts";
type RankingProps = {
    playerScores: PlayerScore[]
}

function Ranking({playerScores}: RankingProps) {
    return (
        <div>
            <ul className='ranking'>
                {playerScores.map((s, index) => (
                    <li key={s.nickname}>
                        <span>{index + 1}. {s.nickname} {index === 0 && '\u{1F947}'}{index === 1 && '\u{1F948}'}{index === 2 && '\u{1F949}'}</span>
                        <span>{s.points} points</span>

                    </li>
                ))}
            </ul>
        </div>
    )
}
export default Ranking;