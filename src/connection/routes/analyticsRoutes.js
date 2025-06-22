const express = require("express");
const router = express.Router();
const pool = require("../database");
const { authenticateToken } = require("../authMiddleware");

// Endpoint: Get total posts for specific documentation
router.get("/summary", async (req, res) => {
  const { resourceName, resourceVersion } = req.query;

  try {
    // 1. Get documentation ID
    const docRes = await pool.query(
      `SELECT id FROM documentation WHERE resource_name = $1 AND resource_version = $2`,
      [resourceName, resourceVersion]
    );

    if (docRes.rows.length === 0) {
      return res.status(404).json({ message: "Documentation not found" });
    }

    const docId = docRes.rows[0].id;

    // 2. Get total posts for this documentation
    const totalPostRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM post WHERE post_resource = $1`,
      [docId]
    );

    const totalPosts = totalPostRes.rows[0].total;

    // 3. Get bug/fix counts
    const bugFixRes = await pool.query(
      `
      SELECT 
        t.resource_tag_name AS name,
        COUNT(p.post_id)::int AS count
      FROM post p
      JOIN tag t ON p.post_tag = t.tag_id
      WHERE p.post_resource = $1
        AND t.resource_tag_name IN ('bugs', 'fixes')
      GROUP BY t.resource_tag_name
      `,
      [docId]
    );

    res.json({
      totalPosts,
      bugFixData: bugFixRes.rows
    });
  } catch (err) {
    console.error("Error in /summary:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/analytics/popular-tags
router.get('/popular-tags', async (req, res) => {
  const { resourceName, resourceVersion } = req.query;

  try {
    const docResult = await pool.query(
      `SELECT id FROM documentation WHERE resource_name = $1 AND resource_version = $2`,
      [resourceName, resourceVersion]
    );

    if (docResult.rows.length === 0) {
      return res.status(404).json({ message: "Documentation not found" });
    }

    const docId = docResult.rows[0].id;

    const tagsResult = await pool.query(
      `SELECT t.resource_tag_name, COUNT(p.post_id) AS usage_count
       FROM tag t
       JOIN post p ON p.post_tag = t.tag_id
       WHERE t.documentation_id = $1
       GROUP BY t.resource_tag_name
       ORDER BY usage_count DESC
       LIMIT 5`,
      [docId]
    );

    res.json(tagsResult.rows);
  } catch (error) {
    console.error("Error fetching popular tags:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/follower-count', async (req, res) => {
  const { resourceName, resourceVersion } = req.query;

  try {
    const result = await pool.query(
      `SELECT COUNT(rf.follow_id) AS follower_count
       FROM resource_following rf
       JOIN documentation d ON rf.resource_id = d.id
       WHERE d.resource_name = $1 AND d.resource_version = $2`,
      [resourceName, resourceVersion]
    );

    res.json({ followerCount: parseInt(result.rows[0].follower_count, 10) });
  } catch (err) {
    console.error("Failed to fetch follower count:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/posts-per-month", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.resource_name,
        TO_CHAR(p.post_created_at, 'YYYY-MM') AS month,
        COUNT(*) AS post_count
      FROM post p
      JOIN documentation d ON p.post_resource = d.id
      GROUP BY d.resource_name, month
      ORDER BY month ASC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching posts per month:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



module.exports = router;
