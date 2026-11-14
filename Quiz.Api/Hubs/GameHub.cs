using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Quiz.Api.Data;
using Quiz.Api.DTOs;
using Quiz.Api.Game;
using Quiz.Api.Models;

namespace Quiz.Api.Hubs;

public class GameHub : Hub
{
    private readonly GameStore _gameStore;
    private readonly AppDbContext _context;
    private readonly GameRunner _gameRunner;

    public GameHub(GameStore gameStore, AppDbContext context, GameRunner gameRunner)
    {
        _context = context;
        _gameStore = gameStore;
        _gameRunner = gameRunner;
    }

    public async Task<string> CreateGame(int quizId)
    {
        var hostId = Context.ConnectionId;
        var game = _gameStore.Create(quizId, hostId);
        await Groups.AddToGroupAsync(hostId, game.Pin);
        return game.Pin;
    }

    public async Task<List<string>> JoinGame(string pin, string nickname)
    {
        GameSession? game = _gameStore.Get(pin);
        if (game is null) throw new HubException("Game not found");
        if (game.IsStarted) throw new HubException("Game is already started");
        if (string.IsNullOrWhiteSpace(nickname)) throw new HubException("Nickname cannot be empty");
        if (game.Players.Values.Contains(nickname)) throw new HubException("Your nickname is taken");
        if (!game.Players.TryAdd(Context.ConnectionId, nickname))
            throw new HubException("You already joined this game");
        await Groups.AddToGroupAsync(Context.ConnectionId, pin);
        await Clients.OthersInGroup(pin).SendAsync("PlayerJoined", nickname);
        return game.Players.Values.ToList();
    }

    public async Task StartGame(string pin)
    {
        GameSession? game = _gameStore.Get(pin);
        if (game is null) throw new HubException("Game not found");
        if (game.HostConnectionId != Context.ConnectionId) throw new HubException("You are not Host");
        if (game.IsStarted) throw new HubException("Game is already started");
        var hasQuestion = await _context.Questions
            .Where(q => q.QuizId == game.QuizId)
            .AnyAsync();
        if (!hasQuestion) throw new HubException("Quiz has no questions");
        game.IsStarted = true;
        await Clients.Group(pin).SendAsync("GameStarted");
        _ = _gameRunner.RunGame(pin);
    }

    public async Task<AnswerResultDto> SubmitAnswer(string pin, int answerId)
    {
        GameSession? game = _gameStore.Get(pin);
        if (game is null) throw new HubException("Game not found");
        if (!game.Players.TryGetValue(Context.ConnectionId, out var nickname))
            throw new HubException("You are not in this game");
        if (game.Answers.TryGetValue(nickname, out int answeredQuestionId))
        {
            if (answeredQuestionId == game.CurrentQuestionId)
                throw new HubException("You already answered the question");
        }

        var elapsed = (DateTime.UtcNow - game.QuestionStartedAt).TotalSeconds;
        var answer = await _context.Answers
            .Include(a => a.Question).FirstOrDefaultAsync(a => a.Id == answerId);
        if (answer is null || answer.QuestionId != game.CurrentQuestionId) throw new HubException("Invalid answer");
        if (elapsed > answer.Question.TimeLimitSeconds) throw new HubException("Time limit exceeded");
        game.Answers[nickname] = answer.QuestionId;
        int points = answer.IsCorrect
            ? (int)Math.Round(100 + 100 * (1 - elapsed / answer.Question.TimeLimitSeconds))
            : 0;
        game.Scores.AddOrUpdate(nickname, points, (key, oldValue) => oldValue + points);
        return new AnswerResultDto(points, answer.IsCorrect);
    }

    public Task SendMessage(string pin, string message)
    {
        GameSession? game = _gameStore.Get(pin);
        if (game is null) throw new HubException("Game not found");
        if (string.IsNullOrWhiteSpace(message)) throw new HubException("Message cannot be empty");
        string sender;
        if (Context.ConnectionId == game.HostConnectionId) sender = "Host";
        else if (game.Players.TryGetValue(Context.ConnectionId, out var nickname))
        {
            sender = nickname;
        }
        else throw new HubException("You are not in this game");

        return Clients.Group(pin).SendAsync("ChatMessage", sender, message);
    }

    public async Task KickPlayer(string pin, string nickname)
    {
        GameSession? game = _gameStore.Get(pin);
        if (game is null) throw new HubException("Game not found");

        if (Context.ConnectionId != game.HostConnectionId)
            throw new HubException("You are not permitted to do this");

        if (game.IsStarted) throw new HubException("Game already started");

        var player = game.Players.FirstOrDefault(p => p.Value == nickname);
        if (player.Key is null) throw new HubException("Player not found");

        game.Players.TryRemove(player);
        
        await Clients.Group(pin).SendAsync("PlayerKicked", nickname);
        
        await Groups.RemoveFromGroupAsync(player.Key, pin);
    }
}