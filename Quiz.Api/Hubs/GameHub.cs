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
        var game = _gameStore.Create(quizId, hostId);
        return Task.FromResult(game.Pin);
    }

    public async Task JoinGame(string pin, string nickname)
    {
        GameSession? game = _gameStore.Get(pin);
        if (game is null) throw new HubException("Game not found");
        if (string.IsNullOrWhiteSpace(nickname)) throw new HubException("Nickname cannot be empty");
        if (game.Players.Values.Contains(nickname)) throw new HubException("Your nickname is taken");
        if (!game.Players.TryAdd(Context.ConnectionId, nickname))
            throw new HubException("You already joined this game");
        await Groups.AddToGroupAsync(Context.ConnectionId, pin);
        await Clients.Client(game.HostConnectionId).SendAsync("PlayerJoined", nickname);
    }
}