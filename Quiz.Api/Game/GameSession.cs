namespace Quiz.Api.Game;

public class GameSession
{
    public string Pin { get; set; } = "";
    public int QuizId { get; set; }
    public string HostConnectionId { get; set; } = "";
}