using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quiz.Api.Data;
using Quiz.Api.DTOs;

namespace Quiz.Api.Controllers;

[ApiController]
[Route("api/quizzes")]
public class QuizzesController : ControllerBase
{
    private readonly AppDbContext _context;

    public QuizzesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetQuizzes()
    {
        var result = await _context.Quizzes
            .Select(q => new QuizSummaryDto(
                q.Id,
                q.Title,
                q.CreatedDate,
                q.Questions.Count)
            )
            .ToListAsync();
        return Ok(result);
    }

    [HttpGet("{quizId}")]
    public async Task<IActionResult> GetQuiz([FromRoute] int quizId)
    {
        var result = await _context.Quizzes
            .Where(q => q.Id == quizId)
            .Select(q => new QuizSummaryDto(
                q.Id,
                q.Title,
                q.CreatedDate,
                q.Questions.Count
            ))
            .FirstOrDefaultAsync();
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateQuiz([FromBody] QuizCreateDto quizCreateDto)
    {
        var newQuiz = new Models.Quiz
        {
            Title = quizCreateDto.Title,
            Description = quizCreateDto.Description,
        };
        _context.Quizzes.Add(newQuiz);
        await _context.SaveChangesAsync();
        var result = new QuizSummaryDto(
            newQuiz.Id,
            newQuiz.Title,
            newQuiz.CreatedDate,
            newQuiz.Questions.Count
        );
        return CreatedAtAction(nameof(GetQuiz), new { quizId = newQuiz.Id }, result);
    }

    [HttpPut("{quizId}")]
    public async Task<IActionResult> UpdateQuiz([FromRoute] int quizId, [FromBody] QuizUpdateDto quizUpdateDto)
    {
        var quizToEdit = await _context.Quizzes.FirstOrDefaultAsync(q => q.Id == quizId);
        if (quizToEdit == null) return NotFound();
        quizToEdit.Title = quizUpdateDto.Title;
        quizToEdit.Description = quizUpdateDto.Description;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{quizId}")]
    public async Task<IActionResult> DeleteQuiz([FromRoute] int quizId)
    {
        var quizToDelete = await _context.Quizzes.FirstOrDefaultAsync(q => q.Id == quizId);
        if (quizToDelete == null) return NotFound();
        _context.Quizzes.Remove(quizToDelete);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}