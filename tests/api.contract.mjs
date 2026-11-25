import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import validatorModule from 'openapi-response-validator';
import { startContractEnvironment } from './contract-environment.mjs';

const { default: OpenAPIResponseValidator } = validatorModule;
const spec = JSON.parse(await readFile(new URL('../docs/api/openapi.json', import.meta.url), 'utf8'));
const attemptPath = '/api/attempts';
const decisionPath = '/api/recommendations/{recommendationId}/decision';
const topicsPath = '/api/courses/{courseId}/topics';
const exercisesPath = '/api/courses/{courseId}/exercises';
const attemptExamples = spec.paths[attemptPath].post.requestBody.content['application/json'].examples;
const decisionExamples = spec.paths[decisionPath].patch.requestBody.content['application/json'].examples;
const maximumBigint = '9223372036854775807';
const validators = new Map();

function validateResponse(operation, status, media, data) {
  const key = `${operation.operationId}:${status}:${media}`;
  if (!validators.has(key)) {
    const content = operation.responses[status]?.content?.[media];
    assert(content?.schema, `Missing response schema for ${key}`);
    validators.set(key, new OpenAPIResponseValidator({
      responses: { [status]: { content: { [media]: content } } },
      components: spec.components,
    }));
  }
  const error = validators.get(key).validateResponse(status, structuredClone(data));
  assert.equal(error, undefined, `${key}: ${JSON.stringify(error)}`);
}

test('Published response examples match their OpenAPI response schemas', () => {
  for (const methods of Object.values(spec.paths)) {
    for (const operation of Object.values(methods)) {
      for (const [status, response] of Object.entries(operation.responses)) {
        for (const [media, content] of Object.entries(response.content ?? {})) {
          if ('example' in content) validateResponse(operation, Number(status), media, content.example);
          for (const example of Object.values(content.examples ?? {})) {
            validateResponse(operation, Number(status), media, example.value);
          }
        }
      }
    }
  }
});

test('Live Express responses and PostgreSQL persistence', async t => {
  const { db, origin, database } = await startContractEnvironment(t);
  async function send(method, path, {
    id, body, raw, media = 'application/json', contentType = 'application/json',
  } = {}) {
    const route = id === undefined ? path : path.replace(/\{\w+\}/, id);
    const response = await fetch(origin + route, {
      method,
      headers: body !== undefined || raw !== undefined ? { 'Content-Type': contentType } : {},
      body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
      signal: AbortSignal.timeout(5000),
    });
    const text = await response.text();
    assert.equal(response.headers.get('content-type')?.split(';')[0], media);
    const result = media === 'application/json' ? JSON.parse(text) : text;
    validateResponse(spec.paths[path][method.toLowerCase()], response.status, media, result);
    return { status: response.status, result };
  }

  async function request(method, path, status, options) {
    const response = await send(method, path, options);
    assert.equal(response.status, status, `${method} ${path}: ${JSON.stringify(response.result).slice(0, 400)}`);
    return response.result;
  }

  async function expectError(method, path, status, message, options) {
    assert.deepEqual(await request(method, path, status, options), { status: 'error', message });
  }

  async function rowCounts() {
    const { rows: [row] } = await db.query(
      'SELECT (SELECT count(*) FROM attempts) AS attempts, (SELECT count(*) FROM recommendations) AS recommendations',
    );
    return row;
  }

  const { rows: [learner] } = await db.query(
    'SELECT learner_id FROM learners WHERE learner_code = $1', ['DEMO_LEARNER_001'],
  );
  const learnerId = Number(learner.learner_id);
  const courses = new Map();
  const exercises = new Map();
  const pythonBody = { ...attemptExamples.pythonMisconception.value, learner_id: learnerId };
  const recommendations = new Map();

  await t.test('Health and all three seeded catalogs return JSON with BIGINT string IDs', async () => {
    assert.deepEqual(await request('GET', '/api/health', 200), {
      status: 'ok', database, message: 'Backend connected to PostgreSQL',
    });
    const { courses: listed } = await request('GET', '/api/courses', 200);
    assert.deepEqual(listed.map(course => course.course_code), ['PYTHON', 'LITHUANIAN']);
    for (const course of listed) {
      courses.set(course.course_code, course.course_id);
      const { topics, course_id: topicCourse } = await request('GET', topicsPath, 200, { id: course.course_id });
      const { exercises: items, course_id: exerciseCourse } = await request('GET', exercisesPath, 200, { id: course.course_id });
      assert.equal(topicCourse, course.course_id);
      assert.equal(exerciseCourse, course.course_id);
      assert.deepEqual(topics.map(topic => topic.position), [1, 2]);
      assert.equal(items.length, 1);
      assert.equal(items[0].topic_id, topics[0].topic_id);
      assert.equal(items[0].is_active, true);
      exercises.set(course.course_code, items[0].exercise_id);
    }
  });

  for (const [courseCode, prefix, topic, decision] of [
    ['PYTHON', 'python', 'Type Conversion', 'accepted'],
    ['LITHUANIAN', 'lithuanian', 'Accusative Case', 'rejected'],
  ]) {
    for (const correct of [true, false]) {
      await t.test(`${courseCode} ${correct ? 'correct answer persists alone' : 'misconception persists with recommendation'}`, async () => {
        const example = attemptExamples[prefix + (correct ? 'Correct' : 'Misconception')].value;
        assert.equal(String(example.exercise_id), exercises.get(courseCode));
        const body = { ...example, learner_id: learnerId };
        const result = await request('POST', attemptPath, 201, { body });
        assert.equal(result.assessment_status, correct ? 'correct' : 'incorrect');
        assert.equal(result.is_correct, correct);
        const { rows } = await db.query(
          `SELECT a.attempt_id, a.learner_id, a.exercise_id, a.submitted_answer, a.is_correct,
                  a.error_category_id, ar.expected_answer, r.recommendation_id, r.learner_decision,
                  r.explanation, rr.recommendation_rule_id, target.topic_id, target.title
           FROM attempts a JOIN exercise_answer_rules ar USING (answer_rule_id)
           LEFT JOIN recommendations r ON r.attempt_id = a.attempt_id
           LEFT JOIN recommendation_rules rr USING (recommendation_rule_id)
           LEFT JOIN topics target ON target.topic_id = rr.recommended_topic_id
           WHERE a.attempt_id = $1`, [result.attempt_id],
        );
        assert.equal(rows.length, 1);
        const [saved] = rows;
        assert.equal(saved.learner_id, String(learnerId));
        assert.equal(saved.exercise_id, String(body.exercise_id));
        assert.equal(saved.submitted_answer, body.submitted_answer);
        assert.equal(saved.is_correct, correct);
        assert.equal(result.error_category_id, saved.error_category_id);
        if (correct) {
          assert.equal(result.recommendation, null);
          assert.equal(saved.recommendation_id, null);
          assert.equal(result.message, 'Answer assessed as correct');
        } else {
          assert.equal(saved.title, topic);
          assert.equal(saved.explanation, saved.expected_answer);
          assert.equal(saved.learner_decision, 'pending');
          assert.deepEqual(result.recommendation, {
            recommendation_id: saved.recommendation_id,
            recommendation_rule_id: saved.recommendation_rule_id,
            topic_id: saved.topic_id,
            topic_title: topic,
            explanation: saved.explanation,
            learner_decision: 'pending',
          });
          recommendations.set(decision, result);
        }
      });
    }

    await t.test(`${courseCode} decision ${decision} persists and a repeat conflicts`, async () => {
      const attempt = recommendations.get(decision);
      const id = attempt.recommendation.recommendation_id;
      const body = decisionExamples[decision].value;
      const result = await request('PATCH', decisionPath, 200, { id, body });
      assert.equal(result.message, 'Learner decision saved successfully');
      assert.deepEqual(result.recommendation, {
        recommendation_id: id, attempt_id: attempt.attempt_id, learner_decision: decision,
      });
      await expectError('PATCH', decisionPath, 409, 'Recommendation has already been decided', { id, body });
      const { rows: [saved] } = await db.query(
        'SELECT learner_decision FROM recommendations WHERE recommendation_id = $1', [id],
      );
      assert.equal(saved.learner_decision, decision);
    });
  }

  await t.test('Catalog and decision paths reject invalid IDs and return 404 for valid missing IDs', async () => {
    for (const path of [topicsPath, exercisesPath, decisionPath]) {
      const isDecision = path === decisionPath;
      const method = isDecision ? 'PATCH' : 'GET';
      const body = isDecision ? { decision: 'accepted' } : undefined;
      for (const id of ['0', '01', '1.5', '9223372036854775808']) {
        await expectError(method, path, 400, isDecision ? 'Invalid recommendation ID' : 'Invalid course ID', { id, body });
      }
      await expectError(method, path, 404, isDecision ? 'Recommendation not found' : 'Course not found',
        { id: maximumBigint, body });
    }
    await expectError('PATCH', decisionPath, 400, 'Decision must be accepted or rejected', {
      id: recommendations.get('accepted').recommendation.recommendation_id, body: { decision: 'pending' },
    });
  });

  await t.test('Invalid attempt IDs and blank or oversized answers return 400 without writing', async () => {
    const before = await rowCounts();
    for (const override of [
      { learner_id: String(learnerId) }, { exercise_id: Number.MAX_SAFE_INTEGER + 1 },
      { learner_id: 0 }, { exercise_id: 1.5 }, { submitted_answer: '' },
      { submitted_answer: ' \t\n' }, { submitted_answer: 'a'.repeat(5001) },
      { submitted_answer: '😀'.repeat(2501) },
    ]) {
      await expectError('POST', attemptPath, 400, 'Invalid learner_id, exercise_id or submitted_answer',
        { body: { ...pythonBody, ...override } });
    }
    assert.deepEqual(await rowCounts(), before);
  });

  await t.test('Missing learner and missing or inactive exercise return 404 without writing', async () => {
    const before = await rowCounts();
    const { rows: [inactive] } = await db.query(
      `INSERT INTO exercises (topic_id, prompt, exercise_type, is_active)
       SELECT topic_id, 'Inactive test fixture', 'text', false FROM exercises WHERE exercise_id = $1
       RETURNING exercise_id`, [pythonBody.exercise_id],
    );
    await expectError('POST', attemptPath, 404, 'Learner not found',
      { body: { ...pythonBody, learner_id: Number.MAX_SAFE_INTEGER } });
    for (const exercise_id of [Number.MAX_SAFE_INTEGER, Number(inactive.exercise_id)]) {
      await expectError('POST', attemptPath, 404, 'Active exercise not found', { body: { ...pythonBody, exercise_id } });
    }
    const { exercises: listed } = await request('GET', exercisesPath, 200, { id: courses.get('PYTHON') });
    assert(!listed.some(exercise => exercise.exercise_id === inactive.exercise_id));
    assert.deepEqual(await rowCounts(), before);
  });

  await t.test('Uncertainty returns a distinct 422 and persists neither row', async () => {
    const before = await rowCounts();
    for (const submitted_answer of ['Something unrelated', '😀'.repeat(2500)]) {
      assert.deepEqual(await request('POST', attemptPath, 422, { body: { ...pythonBody, submitted_answer } }), {
        status: 'uncertain', assessment_status: 'uncertain', recommendation: null,
        message: 'The submitted answer cannot be classified with sufficient confidence',
      });
    }
    assert.deepEqual(await rowCounts(), before);
  });

  await t.test('Missing assessment rule, category and active recommendation rule return 422 without writes', async t => {
    const before = await rowCounts();
    await t.test('Missing assessment rule', async () => {
      const { rows: [exercise] } = await db.query(
        `INSERT INTO exercises (topic_id, prompt, exercise_type)
         SELECT topic_id, 'No answer rule fixture', 'text' FROM exercises WHERE exercise_id = $1
         RETURNING exercise_id`, [pythonBody.exercise_id],
      );
      await expectError('POST', attemptPath, 422, 'No assessment rule for this exercise',
        { body: { ...pythonBody, exercise_id: Number(exercise.exercise_id) } });
      assert.deepEqual(await rowCounts(), before);
    });
    await t.test('Missing error category', async () => {
      const { rows: [rule] } = await db.query(
        'SELECT answer_rule_id, error_category_id FROM exercise_answer_rules WHERE exercise_id = $1',
        [pythonBody.exercise_id],
      );
      await db.query('UPDATE exercise_answer_rules SET error_category_id = NULL WHERE answer_rule_id = $1',
        [rule.answer_rule_id]);
      try {
        await expectError('POST', attemptPath, 422, 'No error category configured for this rule', { body: pythonBody });
        assert.deepEqual(await rowCounts(), before);
      } finally {
        await db.query('UPDATE exercise_answer_rules SET error_category_id = $1 WHERE answer_rule_id = $2',
          [rule.error_category_id, rule.answer_rule_id]);
      }
    });
    await t.test('Missing active recommendation rule rolls back the inserted attempt', async () => {
      const { rows } = await db.query(
        'UPDATE recommendation_rules SET is_active = false WHERE is_active RETURNING recommendation_rule_id',
      );
      try {
        await expectError('POST', attemptPath, 422, 'No active recommendation rule found', { body: pythonBody });
        assert.deepEqual(await rowCounts(), before);
      } finally {
        await db.query('UPDATE recommendation_rules SET is_active = true WHERE recommendation_rule_id = ANY($1::bigint[])',
          [rows.map(row => row.recommendation_rule_id)]);
      }
    });
  });

  await t.test('Database exception on recommendation insert returns 500 and rolls back both writes', async () => {
    const before = await rowCounts();
    await db.query('ALTER TABLE recommendations ADD CONSTRAINT contract_reject_insert CHECK (false) NOT VALID');
    try {
      await expectError('POST', attemptPath, 500, 'Failed to process attempt', { body: pythonBody });
      assert.deepEqual(await rowCounts(), before);
    } finally {
      await db.query('ALTER TABLE recommendations DROP CONSTRAINT contract_reject_insert');
    }
  });

  await t.test('Competing decisions yield exactly one success and cannot overwrite the winner', async () => {
    const created = await request('POST', attemptPath, 201, { body: pythonBody });
    const id = created.recommendation.recommendation_id;
    assert.notEqual(created.attempt_id, recommendations.get('accepted').attempt_id);
    // Either concurrent HTTP call may win. Validate both observed responses.
    const results = await Promise.all(['accepted', 'rejected'].map(async decision => ({
      decision, ...await send('PATCH', decisionPath, { id, body: { decision } }),
    })));
    assert.deepEqual(results.map(item => item.status).sort(), [200, 409]);
    const winner = results.find(item => item.status === 200);
    assert.equal(winner.result.recommendation.learner_decision, winner.decision);
    assert.equal(results.find(item => item.status === 409).result.message, 'Recommendation has already been decided');
    const { rows: [saved] } = await db.query(
      'SELECT learner_decision FROM recommendations WHERE recommendation_id = $1', [id],
    );
    assert.equal(saved.learner_decision, winner.decision);
  });

  await t.test('Default Express errors return HTML for parsing, payload size, charset and route decoding', async () => {
    const media = 'text/html';
    assert.match(await request('POST', attemptPath, 400, { raw: '{', media }), /Bad Request/);
    assert.match(await request('POST', attemptPath, 413, {
      body: { ...pythonBody, submitted_answer: 'a'.repeat(110000) }, media,
    }), /Payload Too Large/);
    assert.match(await request('POST', attemptPath, 415, {
      body: pythonBody, media, contentType: 'application/json; charset=iso-8859-1',
    }), /Unsupported Media Type/);
    const id = recommendations.get('accepted').recommendation.recommendation_id;
    await request('PATCH', decisionPath, 400, { id, raw: '{', media });
    await request('PATCH', decisionPath, 413, { id, body: { decision: 'a'.repeat(110000) }, media });
    await request('PATCH', decisionPath, 415, {
      id, body: { decision: 'accepted' }, media, contentType: 'application/json; charset=iso-8859-1',
    });
    for (const path of [topicsPath, exercisesPath]) {
      await request('GET', path, 400, { id: '%', media });
    }
    await request('PATCH', decisionPath, 400, { id: '%', body: { decision: 'accepted' }, media });
  });
});
