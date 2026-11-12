using System.Collections.Concurrent;
namespace Quiz.Api.Game;

public class GameStore
{
    private readonly ConcurrentDictionary<string, GameSession> _games = new();

    public GameSession Create(int quizId, string hostConnectionId)
    {
        string pin;
        GameSession game;
        do
        {
            pin = Random.Shared.Next(100000, 1000000).ToString();
            game = new GameSession
            {
                Pin = pin,
                HostConnectionId = hostConnectionId,
                QuizId = quizId
            };
        } while (!_games.TryAdd(pin, game));
        return game;
    }

    public GameSession? Get(string pin)
    {
        return _games.TryGetValue(pin, out var game) ? game : null;
    }
}