using Microsoft.AspNetCore.SignalR;
using Quiz.Api.Game;

namespace Quiz.Api.Hubs;

public class GameHub : Hub
{
    private readonly GameStore _gameStore;
    public GameHub(GameStore gameStore)
    {
        _gameStore = gameStore;
    }

    public Task<string> CreateGame(int quizId)
    {
        var hostId = Context.ConnectionId;
        var game = _gameStore.Create(quizId,hostId);
        return Task.FromResult(game.Pin);
    }
}