
import { describe, expect, it } from 'vitest'
import {
  initialProgress,
  recommendNextStep,
  topics,
  type LearningProgress,
  type TopicId,
} from './learning'

describe('Learning catalog', () => {
  it('contains five learning topics', () => {
    expect(topics).toHaveLength(5)
  })

  it('has unique topic identifiers', () => {
    const ids = topics.map((topic) => topic.id)
    expect(new Set(ids).size).toBe(topics.length)
  })

  it('contains titles for every topic', () => {
    topics.forEach((topic) => {
      expect(topic.title.trim().length).toBeGreaterThan(0)
    })
  })
})

const understood: LearningProgress = {
  variables: 'understood',
  functions: 'understood',
  arrays: 'understood',
  objects: 'understood',
  dom: 'understood',
}

type Scenario = {
  name: string
  goal: TopicId
  progress: LearningProgress
  expected: TopicId
}

const scenarios: Scenario[] = [
  {
    name: '01 - DOM goal with weak functions',
    goal: 'dom',
    progress: initialProgress,
    expected: 'functions',
  },
  {
    name: '02 - DOM goal with no prior knowledge',
    goal: 'dom',
    progress: {
      variables: 'not-started',
      functions: 'not-started',
      arrays: 'not-started',
      objects: 'not-started',
      dom: 'not-started',
    },
    expected: 'variables',
  },
  {
    name: '03 - DOM goal with missing objects',
    goal: 'dom',
    progress: {
      ...understood,
      objects: 'not-started',
      dom: 'not-started',
    },
    expected: 'objects',
  },
  {
    name: '04 - DOM goal with missing DOM',
    goal: 'dom',
    progress: {
      ...understood,
      dom: 'not-started',
    },
    expected: 'dom',
  },
  {
    name: '05 - Functions goal with weak variables',
    goal: 'functions',
    progress: {
      ...understood,
      variables: 'struggling',
      functions: 'not-started',
    },
    expected: 'variables',
  },
  {
    name: '06 - Functions goal with completed prerequisites',
    goal: 'functions',
    progress: {
      ...understood,
      functions: 'not-started',
    },
    expected: 'functions',
  },
  {
    name: '07 - Arrays goal with weak functions',
    goal: 'arrays',
    progress: {
      ...understood,
      functions: 'struggling',
      arrays: 'not-started',
    },
    expected: 'functions',
  },
  {
    name: '08 - Objects goal with missing arrays',
    goal: 'objects',
    progress: {
      ...understood,
      arrays: 'not-started',
      objects: 'not-started',
    },
    expected: 'arrays',
  },
  {
    name: '09 - Variables goal with no knowledge',
    goal: 'variables',
    progress: {
      ...understood,
      variables: 'not-started',
    },
    expected: 'variables',
  },
  {
    name: '10 - Completed DOM learning path',
    goal: 'dom',
    progress: understood,
    expected: 'dom',
  },
]

describe('Personalized recommendation evaluation', () => {
  it.each(scenarios)(
    '$name',
    ({ goal, progress, expected }) => {
      const result = recommendNextStep(goal, progress)

      expect(result.topic.id).toBe(expected)
      expect(result.reason.trim().length).toBeGreaterThan(0)
      expect(topics.some((topic) => topic.id === result.topic.id))
        .toBe(true)
    },
  )
})
