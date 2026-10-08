# Project Passport — AI Learning Recommendation Assistant

## 1. General Information

**Project title (EN):** Prototype of an AI Assistant for Personalized Next-Step Learning Recommendations

**Project title (RU):** Прототип AI-ассистента для персонализированных рекомендаций следующего шага обучения

**Practice:** EHU AI-Native Practice 2026

**Laboratory:** Lab 04 — Applied Intelligent Systems

**Project type:** Hybrid (working MVP and evaluation experiment)

**Target audience:** University students learning programming.

## 2. Problem Statement

Students often struggle to decide what to study next after completing learning materials or identifying gaps in their knowledge.

Traditional fixed learning paths do not always consider the student's current knowledge and individual learning goal.

The project investigates whether personalized next-step recommendations can make the learning process more structured and understandable.

## 3. Job to Be Done

When I am learning JavaScript and do not know which topic to study next, I want to receive a recommendation based on my learning goal and current knowledge, so that I can focus on relevant material.

## 4. Project Hypothesis

A recommendation mechanism that considers a student's learning goal, topic prerequisites, and self-assessed knowledge can provide more relevant next-step suggestions than a fixed learning sequence.

This hypothesis will be evaluated using predefined learning scenarios.

## 5. Available Data

The prototype uses a manually curated JavaScript learning catalog containing five topics:

- Variables and Data Types
- Functions
- Arrays
- Objects
- DOM Manipulation

Each topic contains a description and a learning material reference.

Student knowledge is represented by three states:

- Not started
- Need practice
- Understood

No real student records or sensitive personal information are required.

## 6. Vertical Slice

The main user workflow is:

1. The student selects a learning goal.
2. The student assesses their knowledge of available topics.
3. The system analyzes the goal, prerequisite sequence, and knowledge states.
4. The system recommends the next learning topic.
5. The system explains the recommendation and provides a learning material link.
6. The student accepts or rejects the recommendation.

This workflow is implemented in the React + TypeScript prototype.

## 7. System Architecture

**Frontend:** React, TypeScript, Vite.

**Learning data:** Local TypeScript data module.

**Recommendation engine:** Deterministic, rule-based algorithm using learning goals and topic progress.

**User interaction:** Goal selection, knowledge assessment, recommendation generation, acceptance and rejection.

**Development workflow:** GitHub repository, feature branches, pull requests, and Linear issues.

The current MVP does not include a backend service, persistent database, or external LLM API.

## 8. AI and Human Responsibilities

The current prototype demonstrates the personalized recommendation workflow using deterministic rules.

A future AI-agent version could use an LLM to reason about learning progress and explain recommendations more flexibly.

The student remains responsible for accepting or rejecting a recommendation.

**Important limitation:** The current implementation must not be represented as an LLM-powered AI agent.

## 9. Acceptance Criteria

- The application starts locally.
- The student can select a learning goal.
- The student can specify their knowledge level for each topic.
- The system returns a next-step recommendation.
- The recommendation contains a topic and explanation.
- The recommended topic belongs to the available course catalog.
- The student can accept or reject the recommendation.
- ESLint and production build complete successfully.
- The main scenario can be reproduced during the defense.

## 10. Evaluation Plan

The recommendation engine will be tested using ten predefined learning scenarios.

For each scenario, the evaluation will record:

- Selected learning goal
- Current topic knowledge states
- Expected recommendation
- Actual recommendation
- Pass/fail result

Additional checks will verify that recommendations reference available topics and provide explanations.

Evaluation results and known limitations will be documented separately.

## 11. Scope and Limitations

**Included:**

- One JavaScript course
- Five learning topics
- Personalized next-step recommendation workflow
- Explanation and learning material link
- Accept/reject interaction
- Reproducible evaluation

**Excluded:**

- Authentication
- Multiple courses
- Teacher dashboard
- File uploads
- Persistent student profiles
- Full adaptive learning analytics
- Production-ready AI agent

## 12. Expected Outcome

A reproducible educational recommendation prototype, supported by source code, GitHub development evidence, evaluation results, technical documentation, and a defense demonstration.

The prototype serves as an initial foundation for a more advanced educational web platform with an AI agent.