# AGENTS.md — Development Instructions

## Project Context

This repository contains Learning Path Assistant, a React + TypeScript educational recommendation prototype for EHU AI-Native Practice 2026.

## Development Principles

- Keep the application small and reproducible.
- Prefer simple, understandable TypeScript.
- Preserve the existing React + Vite architecture.
- Do not introduce unnecessary dependencies.
- Do not add authentication, databases, or external APIs without explicit approval.
- Never expose API keys or credentials in frontend code.
- Keep recommendation logic separate from UI components.

## Required Verification

Before submitting code changes, run:

```bash
npm run lint
npm run build
```

Report the results and any known limitations.

## Task Workflow

1. Read the relevant Linear issue and acceptance criteria.
2. Inspect the existing implementation.
3. Make the smallest necessary change.
4. Run the required verification commands.
5. Document changes and limitations.
6. Submit changes through a GitHub pull request.

## AI Usage and Human Oversight

AI coding agents may propose and implement changes, but the student reviews the code, verifies the application, and decides whether to accept the result.

The current recommendation engine is rule-based. Do not describe it as an integrated LLM agent.

## Documentation

Keep `README.md` and the documents in `docs/` consistent with the actual implementation.