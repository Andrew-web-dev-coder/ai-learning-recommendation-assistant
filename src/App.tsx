import { useState } from 'react'
import {
  initialProgress,
  recommendNextStep,
  topics,
  type KnowledgeLevel,
  type LearningProgress,
  type TopicId,
} from './data/learning'
import './App.css'

function App() {
  const [goal, setGoal] = useState<TopicId>('dom')
  const [progress, setProgress] =
    useState<LearningProgress>(initialProgress)

  const [recommendation, setRecommendation] =
    useState<ReturnType<typeof recommendNextStep> | null>(null)

  const [feedback, setFeedback] = useState('')

  function updateProgress(
    topicId: TopicId,
    level: KnowledgeLevel,
  ) {
    setProgress((current) => ({
      ...current,
      [topicId]: level,
    }))
    setRecommendation(null)
    setFeedback('')
  }

  function generateRecommendation() {
    setRecommendation(recommendNextStep(goal, progress))
    setFeedback('')
  }

  return (
    <main className="app">
      <header className="header">
        <span className="eyebrow">EHU AI-NATIVE PRACTICE</span>
        <h1>Learning Path Assistant</h1>
        <p>
          Discover your next learning step based on your goals
          and current knowledge.
        </p>
      </header>

      <section className="panel">
        <h2>1. Choose your learning goal</h2>

        <select
          value={goal}
          onChange={(event) => {
            setGoal(event.target.value as TopicId)
            setRecommendation(null)
            setFeedback('')
          }}
        >
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.title}
            </option>
          ))}
        </select>
      </section>

      <section className="panel">
        <h2>2. Assess your current knowledge</h2>
        <p className="hint">
          Select your current level for each topic.
        </p>

        <div className="topic-list">
          {topics.map((topic) => (
            <div className="topic-row" key={topic.id}>
              <div>
                <strong>{topic.title}</strong>
                <p>{topic.description}</p>
              </div>

              <select
                value={progress[topic.id]}
                onChange={(event) =>
                  updateProgress(
                    topic.id,
                    event.target.value as KnowledgeLevel,
                  )
                }
              >
                <option value="not-started">Not started</option>
                <option value="struggling">Need practice</option>
                <option value="understood">Understood</option>
              </select>
            </div>
          ))}
        </div>

        <button
          className="primary-button"
          onClick={generateRecommendation}
        >
          Get my recommendation
        </button>
      </section>

      {recommendation && (
        <section className="panel recommendation">
          <span className="eyebrow">YOUR NEXT STEP</span>
          <h2>{recommendation.topic.title}</h2>
          <p>{recommendation.reason}</p>

          <a
            href={recommendation.topic.materialUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open learning material ↗
          </a>

          <div className="actions">
            <button
              className="primary-button"
              onClick={() =>
                setFeedback('Recommendation accepted.')
              }
            >
              Accept
            </button>

            <button
              className="secondary-button"
              onClick={() =>
                setFeedback('Recommendation rejected. Update your knowledge levels and try again.')
              }
            >
              Reject
            </button>
          </div>

          {feedback && <p className="feedback">{feedback}</p>}
        </section>
      )}

      <footer>
        Prototype · Personalized learning recommendations · 2026
      </footer>
    </main>
  )
}

export default App