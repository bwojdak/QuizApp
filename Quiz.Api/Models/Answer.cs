

namespace Quiz.Api.Models;

public class Answer
{
    public int Id { get; set; }
    public bool IsCorrect { get; set; }
    public string Content { get; set; } = string.Empty;
    public int QuestionId { get; set; }
    public Question Question { get; set; } = null!;
}