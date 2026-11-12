using System.Collections.Concurrent;

namespace Quiz.Api.Game;

public class GameSession
{
    public string Pin { get; set; } = "";
    public int QuizId { get; set; }
    public string HostConnectionId { get; set; } = "";

    public ConcurrentDictionary<string, string> Players { get; set; } = new ConcurrentDictionary<string, string>(); 
}