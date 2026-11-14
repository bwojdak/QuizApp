using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Quiz.Api.Data;
using Quiz.Api.DTOs;
using Quiz.Api.Hubs;

namespace Quiz.Api.Game;

public class GameRunner
{
    private readonly GameStore _gameStore;
    private readonly IHubContext<GameHub> _hubContext;
    private readonly IServiceScopeFactory _scopeFactory;

    public GameRunner(GameStore gameStore, IHubContext<GameHub> gameHub, IServiceScopeFactory scopeFactory)
    {
        _gameStore = gameStore;
        _hubContext = gameHub;
        _scopeFactory = scopeFactory;
    }

    public async Task RunGame(string pin)
    {
        List<PlayerScore> sortedScoreList = new List<PlayerScore>();
        GameSession? game = _gameStore.Get(pin);
        if (game is null) return;
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var questions = await db.Questions
            .Where(q => q.QuizId == game.QuizId)
            .OrderBy(q => q.OrderInQuiz)
            .Select(q => new PlayerQuestionDto(
                q.Id,
                q.Content,
                q.TimeLimitSeconds,
                q.Answers
                    .OrderBy(a => a.Id)
                    .Select(a => new PlayerAnswerDto(a.Id, a.Content))
                    .ToList()
            )).ToListAsync();
        foreach (var nickname in game.Players.Values)
        {
            game.Scores.TryAdd(nickname, 0);
        }
        
        for (int i = 5; i > 0; i--)
        {
            await _hubContext.Clients.Group(pin).SendAsync("Countdown",i);
            await Task.Delay(TimeSpan.FromSeconds(1));
        }
        foreach (var question in questions)
        {
            game.CurrentQuestionId = question.Id;
            game.QuestionStartedAt = DateTime.UtcNow;
            await _hubContext.Clients.Group(pin).SendAsync("QuestionStarted", question);
            await Task.Delay(TimeSpan.FromSeconds(question.TimeLimitSeconds));
        }

        sortedScoreList = game.Scores
            .OrderByDescending(s => s.Value)
            .Select(s => new PlayerScore(s.Key, s.Value))
            .ToList();
        await _hubContext.Clients.Group(pin).SendAsync("GameEnded", sortedScoreList);
    }
}