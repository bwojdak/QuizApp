export type QuizSummary = {
   id: number;
   title: string;
   createdDate: string;
   questionsCount: number;
}
export type QuizCreate = {
   title: string;
   description: string | null;
}
export type QuizDetails = {
   id: number;
   title: string;
   description: string | null;
   createdDate: string;
   questions: Question[];
}
export type Answer = {
   id: number;
   content: string;
   isCorrect: boolean;
}
export type Question = {
   id: number;
   content: string;
   timeLimitSeconds: number;
   orderInQuiz: number;
   answers: Answer[];
}
export type PlayerSession = {
   pin: string;
   nickname: string;
   players: string[];
}
export type ChatMessage = {
   sender: string;
   text: string;
}
export type PlayerAnswer = {
   id: number;
   content: string;
}
export type PlayerQuestion = {
   id: number;
   content: string;
   timeLimitSeconds: number;
   answers: PlayerAnswer[];
}
export type AnswerResult = {
   points: number;
   isCorrect: boolean;
}
export type PlayerScore = {
   nickname: string;
   points: number;
}
