using Microsoft.EntityFrameworkCore;
using Quiz.Api.Models;

namespace Quiz.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Models.Quiz> Quizzes { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<Answer> Answers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Models.Quiz>(entity =>
        {
            //columns
            entity.Property(q => q.Title).IsRequired().HasMaxLength(100);
            entity.Property(q => q.Description).HasMaxLength(500);
            //relation quiz has many questions, question has one quiz
            entity.HasMany(q => q.Questions) //Quiz has many questions
                .WithOne(qu => qu.Quiz) //Questions has one quiz
                .HasForeignKey(qu => qu.QuizId) //Question has foreign key => QuizId
                .OnDelete(DeleteBehavior.Cascade); //Delete quiz = delete his questions
        });

        modelBuilder.Entity<Question>(entity =>
        {
            //columns
            entity.Property(q => q.Content).IsRequired().HasMaxLength(300);
            //relation questions has many answers, answer has one question
            entity.HasMany(q => q.Answers)
                .WithOne(a => a.Question)
                .HasForeignKey(a => a.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Answer>(entity =>
        {
            entity.Property(a => a.Content)
                .IsRequired()
                .HasMaxLength(100); 
        });
    }
}