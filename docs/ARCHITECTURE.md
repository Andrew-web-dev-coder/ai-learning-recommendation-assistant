# System Architecture — Learning Path Assistant

## 1. Overview

Learning Path Assistant is a React-based educational recommendation prototype that helps students choose their next JavaScript learning topic.

The application currently runs entirely in the browser and uses a deterministic recommendation algorithm.

## 2. Technology Stack

- **Frontend:** React + TypeScript
- **Build tool:** Vite
- **Styling:** CSS
- **Learning data:** Local TypeScript module
- **Recommendation engine:** Rule-based algorithm
- **Version control:** Git and GitHub
- **Task management:** Linear

## 3. Architecture Diagram

```text
              STUDENT
                 |
                 v
       React User Interface
                 |
        +--------+--------+
        |                 |
        v                 v
  Learning Goal      Knowledge Levels
        |                 |
        +--------+--------+
                 |
                 v
       Recommendation Engine
          (learning.ts)
                 |
                 v
       Recommended Next Topic
                 |
        +--------+--------+
        |                 |
        v                 v
     Explanation      Material Link
                 |
                 v
          Accept / Reject
```

## 4. Main Components

### React User Interface

The interface allows students to select a learning goal, assess their knowledge, request a recommendation, and respond to the result.

### Learning Data

The `src/data/learning.ts` module contains the available JavaScript topics, learning material references, and recommendation logic.

### Recommendation Engine

The engine considers the selected learning goal, prerequisite order, and current knowledge levels.

It prioritizes topics requiring additional practice or topics that have not yet been studied.

### Student Decision

The student can accept or reject the recommendation. The current prototype does not persist this decision to a database.

## 5. Data Flow

1. The student selects a learning goal.
2. The student specifies knowledge levels.
3. React passes this information to the recommendation function.
4. The function selects an appropriate topic.
5. React displays the recommendation and explanation.
6. The student accepts or rejects the suggestion.

## 6. AI Agent Boundary

The current implementation is a deterministic recommendation prototype, not an LLM-powered AI agent.

An AI-agent extension could introduce a backend service that sends structured learning context to an LLM and validates its recommendations against the course catalog.

The student would retain final control over whether to follow a recommendation.

## 7. Deployment

The prototype can be reproduced locally using Node.js and npm.

```bash
npm install
npm run dev
```

Production compilation:

```bash
npm run build
```

Code quality check:

```bash
npm run lint
```

## 8. Current Limitations

- No external LLM integration
- No backend or database
- No authentication
- One predefined JavaScript course
- Knowledge levels are self-reported
- Recommendations are based on predefined rules
- No persistent learning history

## 9. Future Development

Potential improvements include an LLM-based recommendation service, persistent learner profiles, additional courses, and automated progress assessment.