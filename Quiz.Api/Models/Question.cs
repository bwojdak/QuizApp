

namespace Quiz.Api.Models;

public class Question
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public int TimeLimitSeconds { get; set; } = 15;
    public int OrderInQuiz { get; set; }
    public List<Answer> Answers { get; set; }= new List<Answer>();
    public int QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;
}