
import { describe, expect, it } from 'vitest';
import { assessAnswer } from './assessment';

describe('Python assessment', () => {
  it('accepts an approved correct explanation', () => {
    const result = assessAnswer(
      1,
      'I need to convert the string into an integer.'
    );

    expect(result.status).toBe('correct');
  });

  it('detects an approved misconception', () => {
    const result = assessAnswer(
      1,
      'Python compares strings and integers automatically.'
    );

    expect(result.status).toBe('incorrect');
  });

  it('does not guess when the answer is unclear', () => {
    const result = assessAnswer(
      1,
      'Python has a problem with this variable.'
    );

    expect(result.status).toBe('uncertain');
  });
});

describe('Lithuanian assessment', () => {
  it('accepts the corrected sentence', () => {
    const result = assessAnswer(
      2,
      'Aš einu į mokyklą.'
    );

    expect(result.status).toBe('correct');
  });

  it('detects an incorrect case explanation', () => {
    const result = assessAnswer(
      2,
      'Į requires the nominative case.'
    );

    expect(result.status).toBe('incorrect');
  });

  it('does not classify unknown answers as errors', () => {
    const result = assessAnswer(
      2,
      'Something is wrong with the sentence.'
    );

    expect(result.status).toBe('uncertain');
  });
});
