using System.ComponentModel.DataAnnotations;

namespace Quiz.Api.Models;

public class Quiz
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public List<Question> Questions { get; set; }= new List<Question>();
}