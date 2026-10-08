# Evaluation Report — Learning Path Assistant

## 1. Evaluation Objective

Evaluate whether the rule-based recommendation engine selects the expected next learning topic based on a student's learning goal and self-assessed knowledge.

## 2. Evaluation Method

The recommendation engine was evaluated using ten predefined JavaScript learning scenarios.

Each scenario specifies:

- A learning goal
- Knowledge levels for five topics
- An expected next topic

The actual recommendation is compared with the expected topic using automated Vitest assertions.

Three additional tests validate the learning catalog.

## 3. Evaluation Results

| ID | Scenario | Expected Topic | Result |
|---|---|---|---|
| 01 | DOM goal with weak functions | Functions | Pass |
| 02 | DOM goal with no prior knowledge | Variables and Data Types | Pass |
| 03 | DOM goal with missing objects | Objects | Pass |
| 04 | DOM goal with missing DOM | DOM Manipulation | Pass |
| 05 | Functions goal with weak variables | Variables and Data Types | Pass |
| 06 | Functions goal with completed prerequisites | Functions | Pass |
| 07 | Arrays goal with weak functions | Functions | Pass |
| 08 | Objects goal with missing arrays | Arrays | Pass |
| 09 | Variables goal with no knowledge | Variables and Data Types | Pass |
| 10 | Completed DOM learning path | DOM Manipulation | Pass |

## 4. Metrics

**Scenario agreement:** 10 / 10 = 100%

**Learning catalog tests:** 3 / 3 passed

**Total automated tests:** 13 / 13 passed

**ESLint:** Passed

**Production build:** Passed

These results were obtained from local automated checks on October 8, 2026.

## 5. Interpretation

The recommendation engine behaved as expected across all ten predefined scenarios.

The tests also confirmed that each evaluated recommendation belongs to the available topic catalog and contains a non-empty explanation.

The results establish consistency with the predefined rules, not independently measured educational effectiveness.

## 6. Limitations

- The evaluation uses predefined scenarios rather than real student data.
- Expected recommendations are based on the same learning sequence assumed by the algorithm.
- No comparison with a fixed-sequence baseline has been conducted.
- No user study has been performed.
- The system does not currently use an LLM.
- Knowledge levels are self-reported.
- The learning catalog contains only five topics.
- Accept/reject interaction has been checked manually, not through automated UI tests.

## 7. Reproduction

Install dependencies:

```bash
npm install
```

Run automated tests:

```bash
npm run test
```

Run linting:

```bash
npm run lint
```

Build the application:

```bash
npm run build
```

Start the application:

```bash
npm run dev
```

## 8. Conclusion

The prototype passed all thirteen automated checks and successfully reproduced the ten predefined recommendation scenarios.

The evaluation supports the technical correctness of the current rule-based implementation for the tested inputs.

Further work is needed to assess recommendation usefulness with real students and to introduce an actual AI-agent component.