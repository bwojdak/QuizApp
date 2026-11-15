using System.Collections.Concurrent;
using Quiz.Api.DTOs;

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
    public ConcurrentDictionary<string, string> Tokens { get; set; } = new(); //token,nick

    public List<PlayerScore> GetRanking()
    {
        return Scores
            .OrderByDescending(s => s.Value)
            .Select(s => new PlayerScore(s.Key, s.Value))
            .ToList();
    }
}