using System.ComponentModel.DataAnnotations;

namespace Quiz.Api.DTOs;

public record QuizSummaryDto(int Id, string Title, DateTime CreatedDate, int QuestionsCount);

public record QuizCreateDto([Required] [MaxLength(100)] string Title, [MaxLength(500)] string? Description);

public record QuizUpdateDto([Required] [MaxLength(100)] string Title, [MaxLength(500)] string? Description);