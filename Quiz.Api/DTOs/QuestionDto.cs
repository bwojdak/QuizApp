using System.ComponentModel.DataAnnotations;

namespace Quiz.Api.DTOs;

public record AnswerDto(int Id, string Content, bool IsCorrect);

public record QuestionDto(int Id, string Content, int TimeLimitSeconds, int OrderInQuiz, List<AnswerDto> Answers);

public record AnswerCreateDto([Required] [MaxLength(200)] string Content, bool IsCorrect);

public record PlayerAnswerDto(int Id,string Content);
public record PlayerQuestionDto(int Id,string Content,int TimeLimitSeconds, List<PlayerAnswerDto> Answers);
public record AnswerResultDto(int Points, bool IsCorrect);

public record QuestionCreateDto(
    [Required] [MaxLength(300)] string Content,
    [Range(5, 120)] int TimeLimitSeconds,
    List<AnswerCreateDto> Answers) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Answers is null)
        {
            yield return new ValidationResult(
                "Answers are required.",
                new[] { nameof(Answers) });
            yield break;
        }

        if (Answers.Count < 2 || Answers.Count > 4)
        {
            yield return new ValidationResult("The number of responses must be between 2 and 4.",
                new[] { nameof(Answers) });
            yield break;
        }

        if (Answers.Count(a => a.IsCorrect) != 1)
        {
            yield return new ValidationResult(
                "Exactly one answer must be marked as correct.",
                new[] { nameof(Answers) });
            yield break;
        }
    }
}