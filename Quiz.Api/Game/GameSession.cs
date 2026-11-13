using System.Collections.Concurrent;

namespace Quiz.Api.Game;

public class GameSession
{
    public string Pin { get; set; } = "";
    public int QuizId { get; set; }
    public string HostConnectionId { get; set; } = "";
    public bool IsStarted { get; set; } = false;
    public int? CurrentQuestionId { get; set; }
    public DateTime QuestionStartedAt { get; set; } = DateTime.UtcNow;
    public ConcurrentDictionary<string, int> Scores { get; set; } = new();
    public ConcurrentDictionary<string, int> Answers { get; set; } = new();
    
    public ConcurrentDictionary<string, string> Players { get; set; } = new(); 
    
}