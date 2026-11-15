
import type {PlayerScore} from "../types.ts";
type RankingProps = {
    playerScores: PlayerScore[]
}

function Ranking({playerScores}: RankingProps) {
    return (
        <div>
            <ul>
                {playerScores.map((s, index) => (
                    <li key={s.nickname}>
                        {index + 1}. {s.nickname} – {s.points} points
                    </li>
                ))}
            </ul>
        </div>
    )
}
export default Ranking;