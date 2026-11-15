
export type AssessmentStatus =
  | 'correct'
  | 'incorrect'
  | 'uncertain';

export interface AssessmentResult {
  status: AssessmentStatus;
  reason: string;
  method: 'deterministic';
}

function normalize(text: string): string {
  return text
    .normalize('NFC')
    .toLocaleLowerCase('en')
    .replace(/[.,!?;:()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function result(
  status: AssessmentStatus,
  reason: string
): AssessmentResult {
  return {
    status,
    reason,
    method: 'deterministic',
  };
}

function matchesAny(
  answer: string,
  variants: string[]
): boolean {
  return variants.some(
    (variant) => normalize(variant) === answer
  );
}

export function assessAnswer(
  exerciseId: number,
  submittedAnswer: string
): AssessmentResult {
  const answer = normalize(submittedAnswer);

  if (!answer) {
    return result('uncertain', 'Empty answer');
  }

  // ==========================================
  // Exercise 1: Python type mismatch
  // ==========================================

  if (exerciseId === 1) {
    const correctAnswers = [
      'i need to convert the string into an integer',
      'the string must be converted to an integer',
      'a string cannot be directly compared with an integer using >= in python 3',
      'python cannot compare a string and an integer directly',
      'the error happens because a string is compared with an integer',
    ];

    const incorrectAnswers = [
      'python compares strings and integers automatically',
      'python automatically compares strings and integers',
      'python automatically converts strings to integers',
      'there is no error',
    ];

    if (matchesAny(answer, correctAnswers)) {
      return result(
        'correct',
        'Matches an approved correct-answer variant'
      );
    }

    if (matchesAny(answer, incorrectAnswers)) {
      return result(
        'incorrect',
        'Matches an approved Python misconception'
      );
    }
  }

  // ==========================================
  // Exercise 2: Lithuanian accusative case
  // ==========================================

  if (exerciseId === 2) {
    const correctAnswers = [
      'mokykla should be mokyklą',
      'the correct form is mokyklą',
      'į requires the accusative case',
      'the noun should be in the accusative case',
      'aš einu į mokyklą',
      'the correct form is mokyklą because į requires the accusative case for direction',
    ];

    const incorrectAnswers = [
      'mokykla is correct',
      'there is no grammatical error',
      'į requires the nominative case',
    ];

    if (matchesAny(answer, correctAnswers)) {
      return result(
        'correct',
        'Matches an approved Lithuanian grammar answer'
      );
    }

    if (matchesAny(answer, incorrectAnswers)) {
      return result(
        'incorrect',
        'Matches an approved Lithuanian grammar misconception'
      );
    }
  }

  // Unknown answers must not be guessed.
  return result(
    'uncertain',
    'Answer does not match an approved assessment pattern'
  );
}
