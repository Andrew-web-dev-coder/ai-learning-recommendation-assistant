export type KnowledgeLevel = 'not-started' | 'struggling' | 'understood'

export type TopicId =
  | 'variables'
  | 'functions'
  | 'arrays'
  | 'objects'
  | 'dom'

export interface LearningTopic {
  id: TopicId
  title: string
  description: string
  materialUrl: string
}

export type LearningProgress = Record<TopicId, KnowledgeLevel>

export const topics: LearningTopic[] = [
  {
    id: 'variables',
    title: 'Variables and Data Types',
    description: 'Learn how JavaScript stores and processes data.',
    materialUrl: 'https://javascript.info/variables',
  },
  {
    id: 'functions',
    title: 'Functions',
    description: 'Understand reusable functions and parameters.',
    materialUrl: 'https://javascript.info/function-basics',
  },
  {
    id: 'arrays',
    title: 'Arrays',
    description: 'Learn how to work with ordered collections.',
    materialUrl: 'https://javascript.info/array',
  },
  {
    id: 'objects',
    title: 'Objects',
    description: 'Understand properties and structured data.',
    materialUrl: 'https://javascript.info/object',
  },
  {
    id: 'dom',
    title: 'DOM Manipulation',
    description: 'Learn how JavaScript interacts with HTML elements.',
    materialUrl: 'https://javascript.info/document',
  },
]

export const initialProgress: LearningProgress = {
  variables: 'understood',
  functions: 'struggling',
  arrays: 'understood',
  objects: 'not-started',
  dom: 'not-started',
}

export function recommendNextStep(
  goal: TopicId,
  progress: LearningProgress,
) {
  const order: TopicId[] = [
    'variables',
    'functions',
    'arrays',
    'objects',
    'dom',
  ]

  const goalIndex = order.indexOf(goal)

  const nextTopicId = order
    .slice(0, goalIndex + 1)
    .find((id) => progress[id] !== 'understood')

  if (!nextTopicId) {
    return {
      topic: topics.find((topic) => topic.id === goal)!,
      reason:
        'You have completed the prerequisites for this learning goal. Review the material and practice your skills.',
    }
  }

  const topic = topics.find((item) => item.id === nextTopicId)!

  return {
    topic,
    reason:
      progress[nextTopicId] === 'struggling'
        ? `You reported difficulties with ${topic.title}. Strengthening this topic will help you progress toward your goal.`
        : `Before reaching your goal, we recommend studying ${topic.title} as the next step in your learning path.`,
  }
}