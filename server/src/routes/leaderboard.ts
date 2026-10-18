import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

// Global Leaderboard by Total Aura Score
router.get('/', async (_req, res) => {
  try {
    const result = await query(`
      SELECT 
        id,
        display_name,
        avatar_url,
        total_aura_score,
        highest_level_unlocked,
        last_login_at
      FROM public.profiles
      ORDER BY total_aura_score DESC, highest_level_unlocked DESC
      LIMIT 25;
    `);

    return res.json({ leaderboard: result.rows });
  } catch (err) {
    console.error('Error in /api/leaderboard:', err);
    return res.status(500).json({ error: 'Failed to retrieve leaderboard' });
  }
});

// Level-Specific Leaderboard
router.get('/level/:levelNumber', async (req, res) => {
  try {
    const levelNumber = parseInt(req.params.levelNumber, 10);
    if (isNaN(levelNumber) || levelNumber < 1 || levelNumber > 10) {
      return res.status(400).json({ error: 'Invalid level number' });
    }

    const result = await query(`
      SELECT 
        p.id,
        p.display_name,
        p.avatar_url,
        lp.best_aura_score,
        lp.stars_earned,
        lp.fastest_clear_time_ms,
        lp.spectacle_flips_used
      FROM public.level_progress lp
      JOIN public.profiles p ON p.id = lp.user_id
      WHERE lp.level_number = $1 AND lp.status = 'completed'
      ORDER BY lp.best_aura_score DESC, lp.fastest_clear_time_ms ASC
      LIMIT 25;
    `, [levelNumber]);

    return res.json({ levelNumber, leaderboard: result.rows });
  } catch (err) {
    console.error('Error in /api/leaderboard/level:', err);
    return res.status(500).json({ error: 'Failed to retrieve level leaderboard' });
  }
});

export default router;
