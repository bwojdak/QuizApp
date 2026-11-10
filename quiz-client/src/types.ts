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