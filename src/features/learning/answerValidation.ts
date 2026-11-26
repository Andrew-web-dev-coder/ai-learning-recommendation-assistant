export const maxAnswerLength = 5000

export function answerValidationMessage(answer: string): string | undefined {
  if (!answer.trim()) return 'Enter an answer before submitting.'
  if (answer.length > maxAnswerLength) return 'Shorten your answer to 5,000 characters or fewer.'
}
