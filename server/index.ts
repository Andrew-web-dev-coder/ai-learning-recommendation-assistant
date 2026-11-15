
import express from 'express';
import cors from 'cors';
import { pool } from './db';
import { assessAnswer } from './assessment';

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

// ==========================================
// Middleware
// ==========================================

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);

app.use(express.json());

// ==========================================
// Helpers
// ==========================================

// Validate PostgreSQL BIGINT positive IDs
function isValidId(value: string): boolean {
  return (
    /^[1-9]\d*$/.test(value) &&
    BigInt(value) <= 9223372036854775807n
  );
}

// Check whether a course exists
async function courseExists(courseId: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT 1
     FROM courses
     WHERE course_id = $1`,
    [courseId]
  );

  return result.rowCount !== null && result.rowCount > 0;
}

// ==========================================
// GET /api/health
// Check backend and database connection
// ==========================================

app.get('/api/health', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT current_database() AS database_name'
    );

    res.json({
      status: 'ok',
      database: result.rows[0].database_name,
      message: 'Backend connected to PostgreSQL',
    });
  } catch (error) {
    console.error('Database connection error:', error);

    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
    });
  }
});

// ==========================================
// GET /api/courses
// Get all available courses
// ==========================================

app.get('/api/courses', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         course_id,
         course_code,
         title
       FROM courses
       ORDER BY title`
    );

    res.json({
      status: 'ok',
      courses: result.rows,
    });
  } catch (error) {
    console.error('Failed to fetch courses:', error);

    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch courses',
    });
  }
});

// ==========================================
// GET /api/courses/:courseId/topics
// Get topics belonging to a course
// ==========================================

app.get('/api/courses/:courseId/topics', async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidId(courseId)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid course ID',
      });
      return;
    }

    if (!(await courseExists(courseId))) {
      res.status(404).json({
        status: 'error',
        message: 'Course not found',
      });
      return;
    }

    const result = await pool.query(
      `SELECT
         topic_id,
         title,
         position
       FROM topics
       WHERE course_id = $1
       ORDER BY position, topic_id`,
      [courseId]
    );

    res.json({
      status: 'ok',
      course_id: courseId,
      topics: result.rows,
    });
  } catch (error) {
    console.error('Failed to fetch topics:', error);

    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch topics',
    });
  }
});

// ==========================================
// GET /api/courses/:courseId/exercises
// Get active exercises belonging to a course
// ==========================================

app.get('/api/courses/:courseId/exercises', async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidId(courseId)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid course ID',
      });
      return;
    }

    if (!(await courseExists(courseId))) {
      res.status(404).json({
        status: 'error',
        message: 'Course not found',
      });
      return;
    }

    const result = await pool.query(
      `SELECT
         e.exercise_id,
         e.topic_id,
         e.prompt,
         e.exercise_type,
         e.is_active
       FROM exercises e
       JOIN topics t
         ON t.topic_id = e.topic_id
       WHERE t.course_id = $1
         AND e.is_active = TRUE
       ORDER BY
         t.position,
         e.exercise_id`,
      [courseId]
    );

    res.json({
      status: 'ok',
      course_id: courseId,
      exercises: result.rows,
    });
  } catch (error) {
    console.error('Failed to fetch exercises:', error);

    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch exercises',
    });
  }
});

// ==========================================
// POST /api/attempts
// Assess learner answer and recommend topic
// ==========================================

app.post('/api/attempts', async (req, res) => {
  const { learner_id, exercise_id, submitted_answer } = req.body ?? {};

  // Validate incoming request
  if (
    !Number.isSafeInteger(learner_id) ||
    learner_id <= 0 ||
    !Number.isSafeInteger(exercise_id) ||
    exercise_id <= 0 ||
    typeof submitted_answer !== 'string' ||
    submitted_answer.trim().length === 0 ||
    submitted_answer.length > 5000
  ) {
    res.status(400).json({
      status: 'error',
      message:
        'Invalid learner_id, exercise_id or submitted_answer',
    });
    return;
  }

  // Connect to PostgreSQL
  const client = await pool.connect().catch((error) => {
    console.error('Database connection error:', error);
    return null;
  });

  if (!client) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
    });
    return;
  }

  try {
    await client.query('BEGIN');

    // ======================================
    // Step 1: Validate learner
    // ======================================

    const learnerResult = await client.query(
      `SELECT learner_id
       FROM learners
       WHERE learner_id = $1`,
      [learner_id]
    );

    if (learnerResult.rowCount === 0) {
      await client.query('ROLLBACK');

      res.status(404).json({
        status: 'error',
        message: 'Learner not found',
      });
      return;
    }

    // ======================================
    // Step 2: Validate active exercise
    // ======================================

    const exerciseResult = await client.query(
      `SELECT exercise_id
       FROM exercises
       WHERE exercise_id = $1
         AND is_active = TRUE`,
      [exercise_id]
    );

    if (exerciseResult.rowCount === 0) {
      await client.query('ROLLBACK');

      res.status(404).json({
        status: 'error',
        message: 'Active exercise not found',
      });
      return;
    }

    // ======================================
    // Step 3: Load approved assessment rule
    // ======================================

    const ruleResult = await client.query(
      `SELECT
         answer_rule_id,
         expected_answer,
         error_category_id
       FROM exercise_answer_rules
       WHERE exercise_id = $1
       ORDER BY
         rule_version DESC,
         answer_rule_id DESC
       LIMIT 1`,
      [exercise_id]
    );

    if (ruleResult.rowCount === 0) {
      await client.query('ROLLBACK');

      res.status(422).json({
        status: 'error',
        message: 'No assessment rule for this exercise',
      });
      return;
    }

    const rule = ruleResult.rows[0];

    // ======================================
    // Step 4: Run Assessment Engine
    // ======================================

    const assessment = assessAnswer(
      exercise_id,
      submitted_answer
    );

    // Unknown answers must not be classified
    // as incorrect without sufficient evidence.
    if (assessment.status === 'uncertain') {
      await client.query('ROLLBACK');

      res.status(422).json({
        status: 'uncertain',
        assessment_status: 'uncertain',
        message:
          'The submitted answer cannot be classified with sufficient confidence',
        recommendation: null,
      });
      return;
    }

    const isCorrect = assessment.status === 'correct';

    const errorCategoryId = isCorrect
      ? null
      : rule.error_category_id;

    // Do not classify an error without
    // an approved error category.
    if (!isCorrect && errorCategoryId == null) {
      await client.query('ROLLBACK');

      res.status(422).json({
        status: 'error',
        message:
          'No error category configured for this rule',
      });
      return;
    }

    // ======================================
    // Step 5: Save learner attempt
    // ======================================

    const attemptResult = await client.query(
      `INSERT INTO attempts (
         learner_id,
         exercise_id,
         answer_rule_id,
         submitted_answer,
         is_correct,
         error_category_id
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING
         attempt_id,
         is_correct,
         error_category_id`,
      [
        learner_id,
        exercise_id,
        rule.answer_rule_id,
        submitted_answer,
        isCorrect,
        errorCategoryId,
      ]
    );

    const attempt = attemptResult.rows[0];

    // ======================================
    // Step 6: Handle correct answer
    // ======================================

    if (isCorrect) {
      await client.query('COMMIT');

      res.status(201).json({
        status: 'ok',
        attempt_id: attempt.attempt_id,
        assessment_status: 'correct',
        is_correct: true,
        error_category_id: null,
        recommendation: null,
        message: 'Answer assessed as correct',
      });
      return;
    }

    // ======================================
    // Step 7: Find approved recommendation
    // ======================================

    const recommendationResult = await client.query(
      `SELECT
         rr.recommendation_rule_id,
         t.topic_id,
         t.title AS recommended_topic
       FROM recommendation_rules rr
       JOIN topics t
         ON t.topic_id = rr.recommended_topic_id
       WHERE rr.error_category_id = $1
         AND rr.is_active = TRUE
       ORDER BY
         rr.priority ASC,
         rr.recommendation_rule_id ASC
       LIMIT 1`,
      [errorCategoryId]
    );

    if (recommendationResult.rowCount === 0) {
      await client.query('ROLLBACK');

      res.status(422).json({
        status: 'error',
        message: 'No active recommendation rule found',
      });
      return;
    }

    const selectedRecommendation =
      recommendationResult.rows[0];

    // ======================================
    // Step 8: Save recommendation
    // ======================================

    const savedRecommendation = await client.query(
      `INSERT INTO recommendations (
         attempt_id,
         recommendation_rule_id,
         explanation,
         learner_decision
       )
       VALUES ($1, $2, $3, $4)
       RETURNING
         recommendation_id,
         learner_decision`,
      [
        attempt.attempt_id,
        selectedRecommendation.recommendation_rule_id,
        rule.expected_answer,
        'pending',
      ]
    );

    // ======================================
    // Step 9: Commit transaction
    // ======================================

    await client.query('COMMIT');

    // ======================================
    // Step 10: Return recommendation
    // ======================================

    res.status(201).json({
      status: 'ok',
      attempt_id: attempt.attempt_id,
      assessment_status: 'incorrect',
      is_correct: false,
      error_category_id: errorCategoryId,
      recommendation: {
        recommendation_id:
          savedRecommendation.rows[0].recommendation_id,
        recommendation_rule_id:
          selectedRecommendation.recommendation_rule_id,
        topic_id: selectedRecommendation.topic_id,
        topic_title:
          selectedRecommendation.recommended_topic,
        explanation: rule.expected_answer,
        learner_decision:
          savedRecommendation.rows[0].learner_decision,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK').catch(console.error);

    console.error('Failed to process attempt:', error);

    res.status(500).json({
      status: 'error',
      message: 'Failed to process attempt',
    });
  } finally {
    client.release();
  }
});

// ==========================================
// Start backend server
// ==========================================


app.patch('/api/recommendations/:recommendationId/decision', async (req, res) => {
  const { recommendationId } = req.params
  const { decision } = req.body ?? {}

  // Validate PostgreSQL BIGINT identifier
  if (!isValidId(recommendationId)) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid recommendation ID',
    })
    return
  }

  // Only two decisions are allowed
  if (decision !== 'accepted' && decision !== 'rejected') {
    res.status(400).json({
      status: 'error',
      message: 'Decision must be accepted or rejected',
    })
    return
  }

  try {
    const result = await pool.query(
      `UPDATE recommendations
       SET learner_decision = $1
       WHERE recommendation_id = $2
         AND learner_decision = 'pending'
       RETURNING
         recommendation_id,
         attempt_id,
         learner_decision`,
      [decision, recommendationId]
    )

    if (result.rowCount === 0) {
      const existing = await pool.query(
        `SELECT learner_decision
         FROM recommendations
         WHERE recommendation_id = $1`,
        [recommendationId]
      )

      if (existing.rowCount === 0) {
        res.status(404).json({
          status: 'error',
          message: 'Recommendation not found',
        })
        return
      }

      res.status(409).json({
        status: 'error',
        message: 'Recommendation has already been decided',
      })
      return
    }

    res.json({
      status: 'ok',
      message: 'Learner decision saved successfully',
      recommendation: result.rows[0],
    })
  } catch (error) {
    console.error('Failed to save learner decision:', error)

    res.status(500).json({
      status: 'error',
      message: 'Failed to save learner decision',
    })
  }
})

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
