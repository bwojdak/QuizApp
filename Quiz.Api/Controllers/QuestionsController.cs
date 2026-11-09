using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quiz.Api.Data;
using Quiz.Api.DTOs;
using Quiz.Api.Models;


namespace Quiz.Api.Controllers;

[ApiController]
[Route("api/quizzes")]
public class QuestionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public QuestionsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("{quizId:int}/questions")]
    public async Task<IActionResult> CreateQuestion([FromRoute] int quizId,
        [FromBody] QuestionCreateDto questionCreateDto)
    {
        var quizExists = await _context.Quizzes.AnyAsync(q => q.Id == quizId);
        if (!quizExists) return NotFound();

        int maxOrder = await _context.Questions
            .Where(q => q.QuizId == quizId)
            .MaxAsync(q => (int?)q.OrderInQuiz) ?? 0;

        int orderInQuiz = maxOrder + 1;

        var question = new Question
        {
            QuizId = quizId,
            Content = questionCreateDto.Content,
            OrderInQuiz = orderInQuiz,
            TimeLimitSeconds = questionCreateDto.TimeLimitSeconds,
            Answers = questionCreateDto.Answers.Select(a => new Answer
            {
                Content = a.Content,
                IsCorrect = a.IsCorrect
            }).ToList()
        };
        _context.Questions.Add(question);
        await _context.SaveChangesAsync();

        var result = new QuestionDto
        (
            question.Id,
            question.Content,
            question.TimeLimitSeconds,
            question.OrderInQuiz,
            question.Answers.Select(a => new AnswerDto(a.Id, a.Content, a.IsCorrect)).ToList()
        );
        return CreatedAtAction(nameof(GetQuestion), new { quizId, questionId = question.Id }, result);
    }

    [HttpGet("{quizId:int}/questions/{questionId:int}")]
    public async Task<IActionResult> GetQuestion([FromRoute] int quizId, [FromRoute] int questionId)
    {
        var result = await _context.Questions
            .Where(q => q.QuizId == quizId && q.Id == questionId)
            .Select(q => new QuestionDto
            (
                q.Id,
                q.Content,
                q.TimeLimitSeconds,
                q.OrderInQuiz,
                q.Answers
                    .OrderBy(a => a.Id)
                    .Select(a => new
                        AnswerDto(
                            a.Id,
                            a.Content,
                            a.IsCorrect
                        ))
                    .ToList()
            ))
            .FirstOrDefaultAsync();

        if (result is null)
            return NotFound();

        return Ok(result);
    }
}