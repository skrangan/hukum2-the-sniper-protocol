import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Save Level Progress & Aura Score
router.post('/save-level', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const {
      levelNumber,
      auraScore,
      starsEarned,
      clearTimeMs,
      spectacleFlipsUsed,
      cameosUsed
    } = req.body;

    if (!levelNumber || levelNumber < 1 || levelNumber > 10) {
      return res.status(400).json({ error: 'Invalid level number (1-10 expected)' });
    }

    // Upsert level_progress
    await query(`
      INSERT INTO public.level_progress (
        user_id, level_number, status, best_aura_score, stars_earned,
        fastest_clear_time_ms, spectacle_flips_used, cameos_used, updated_at
      )
      VALUES ($1, $2, 'completed', $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (user_id, level_number) DO UPDATE SET
        status = 'completed',
        best_aura_score = GREATEST(public.level_progress.best_aura_score, EXCLUDED.best_aura_score),
        stars_earned = GREATEST(public.level_progress.stars_earned, EXCLUDED.stars_earned),
        fastest_clear_time_ms = LEAST(
          COALESCE(public.level_progress.fastest_clear_time_ms, EXCLUDED.fastest_clear_time_ms),
          EXCLUDED.fastest_clear_time_ms
        ),
        spectacle_flips_used = public.level_progress.spectacle_flips_used + EXCLUDED.spectacle_flips_used,
        cameos_used = EXCLUDED.cameos_used,
        updated_at = NOW();
    `, [
      userId,
      levelNumber,
      auraScore || 0,
      Math.min(3, Math.max(0, starsEarned || 1)),
      clearTimeMs || null,
      spectacleFlipsUsed || 0,
      JSON.stringify(cameosUsed || [])
    ]);

    // Recalculate total aura score, update last played level, and unlock next level
    const nextLevel = Math.min(10, levelNumber + 1);

    await query(`
      UPDATE public.profiles
      SET 
        highest_level_unlocked = GREATEST(highest_level_unlocked, $1),
        last_played_level = $1,
        total_aura_score = (
          SELECT COALESCE(SUM(best_aura_score), 0)
          FROM public.level_progress
          WHERE user_id = $2
        ),
        last_login_at = NOW()
      WHERE id = $2;
    `, [nextLevel, userId]);

    // Fetch updated user stats
    const updatedProfile = await query('SELECT * FROM public.profiles WHERE id = $1', [userId]);
    const updatedProgress = await query(
      'SELECT * FROM public.level_progress WHERE user_id = $1 ORDER BY level_number ASC',
      [userId]
    );

    return res.json({
      success: true,
      profile: updatedProfile.rows[0],
      progress: updatedProgress.rows
    });
  } catch (err) {
    console.error('Error in /api/player/save-level:', err);
    return res.status(500).json({ error: 'Failed to save level progress' });
  }
});

// Update Last Played Level so player always restores from their last session
router.post('/active-level', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { levelNumber } = req.body;
    if (!levelNumber || levelNumber < 1 || levelNumber > 10) {
      return res.status(400).json({ error: 'Invalid level number (1-10 expected)' });
    }

    await query(`
      UPDATE public.profiles
      SET last_played_level = $1, last_login_at = NOW()
      WHERE id = $2
    `, [levelNumber, userId]);

    return res.json({ success: true, lastPlayedLevel: levelNumber });
  } catch (err) {
    console.error('Error in /api/player/active-level:', err);
    return res.status(500).json({ error: 'Failed to update active level' });
  }
});

// Unlock Cameo or Cosmetic
router.post('/unlock', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { cameoId, outfitId, achievementId } = req.body;

    if (cameoId) {
      await query(`
        UPDATE public.player_unlocks
        SET unlocked_cameos = (
          SELECT jsonb_agg(DISTINCT elem)
          FROM jsonb_array_elements_text(unlocked_cameos || $1::jsonb) AS elem
        ),
        updated_at = NOW()
        WHERE user_id = $2;
      `, [JSON.stringify([cameoId]), userId]);
    }

    if (outfitId) {
      await query(`
        UPDATE public.player_unlocks
        SET unlocked_outfits = (
          SELECT jsonb_agg(DISTINCT elem)
          FROM jsonb_array_elements_text(unlocked_outfits || $1::jsonb) AS elem
        ),
        updated_at = NOW()
        WHERE user_id = $2;
      `, [JSON.stringify([outfitId]), userId]);
    }

    if (achievementId) {
      await query(`
        UPDATE public.player_unlocks
        SET achievements = (
          SELECT jsonb_agg(DISTINCT elem)
          FROM jsonb_array_elements_text(achievements || $1::jsonb) AS elem
        ),
        updated_at = NOW()
        WHERE user_id = $2;
      `, [JSON.stringify([achievementId]), userId]);
    }

    const unlocksRes = await query('SELECT * FROM public.player_unlocks WHERE user_id = $1', [userId]);
    return res.json({ success: true, unlocks: unlocksRes.rows[0] });
  } catch (err) {
    console.error('Error in /api/player/unlock:', err);
    return res.status(500).json({ error: 'Failed to update player unlocks' });
  }
});

export default router;
