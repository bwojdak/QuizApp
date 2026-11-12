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

    public async Task<string> CreateGame(int quizId)
    {
        var hostId = Context.ConnectionId;
        var game = _gameStore.Create(quizId, hostId);
        await Groups.AddToGroupAsync(hostId, game.Pin);
        return game.Pin;
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
}