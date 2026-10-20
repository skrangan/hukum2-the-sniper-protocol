import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const googleClient = new OAuth2Client();
const JWT_SECRET = process.env.JWT_SECRET || 'tiger_muthuvel_pandian_hukum_secret_key_2026_mass';

// Google OAuth Sign-In Endpoint
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Missing credential parameter' });
    }

    // Verify Google ID Token (with fallback for demo/testing mode)
    let payload;
    try {
      if (typeof credential === 'string' && credential.startsWith('demo_google:')) {
        const parts = credential.split(':');
        payload = {
          sub: parts[1] || 'demo_sub_123',
          email: parts[2] || 'superstar.rajini@gmail.com',
          name: parts[3] || 'Muthuvel Pandian (Google)',
          picture: 'https://api.dicebear.com/7.x/bottts/svg?seed=tiger_google'
        };
      } else {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.VITE_GOOGLE_CLIENT_ID || undefined
        });
        payload = ticket.getPayload();
      }
    } catch (err: any) {
      console.warn('Google token verification failed:', err.message);
      return res.status(401).json({ error: 'Failed to verify Google token: ' + (err.message || 'Unknown error') });
    }

    if (!payload || !payload.sub || !payload.email) {
      return res.status(400).json({ error: 'Incomplete Google profile payload' });
    }

    const userId = `g_${payload.sub}`;
    const email = payload.email;
    const displayName = payload.name || 'Tiger Recruit';
    const avatarUrl = payload.picture || '';

    // Upsert Profile into PostgreSQL
    await query(`
      INSERT INTO public.profiles (id, email, display_name, avatar_url, last_login_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = EXCLUDED.display_name,
        avatar_url = EXCLUDED.avatar_url,
        last_login_at = NOW();
    `, [userId, email, displayName, avatarUrl]);

    // Ensure player_unlocks record exists
    await query(`
      INSERT INTO public.player_unlocks (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING;
    `, [userId]);

    // Issue JWT Token
    const sessionToken = jwt.sign(
      { id: userId, email, displayName, avatarUrl },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Fetch complete profile
    const profileRes = await query('SELECT * FROM public.profiles WHERE id = $1', [userId]);

    return res.json({
      token: sessionToken,
      profile: profileRes.rows[0]
    });
  } catch (err: any) {
    console.error('Error in /api/auth/google:', err);
    return res.status(500).json({ error: 'Internal server error during Google sign-in' });
  }
});

// Instant Guest Sign-In Endpoint (For quick play & testing)
router.post('/guest', async (req, res) => {
  try {
    const requestedId = req.body.guestId;
    const guestId = requestedId || `guest_${Math.random().toString(36).substring(2, 10)}`;
    const email = `${guestId}@hukum2.local`;
    const displayName = `Recruit ${guestId.substring(6, 10).toUpperCase()}`;
    const avatarUrl = 'https://api.dicebear.com/7.x/bottts/svg?seed=' + guestId;

    await query(`
      INSERT INTO public.profiles (id, email, display_name, avatar_url, last_login_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (id) DO UPDATE SET
        last_login_at = NOW();
    `, [guestId, email, displayName, avatarUrl]);

    await query(`
      INSERT INTO public.player_unlocks (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING;
    `, [guestId]);

    const sessionToken = jwt.sign(
      { id: guestId, email, displayName, avatarUrl },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const profileRes = await query('SELECT * FROM public.profiles WHERE id = $1', [guestId]);

    return res.json({
      token: sessionToken,
      profile: profileRes.rows[0]
    });
  } catch (err: any) {
    console.error('Error in /api/auth/guest:', err);
    return res.status(500).json({ error: 'Failed to create guest session' });
  }
});

// Get Current Profile & Progress
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const profileRes = await query('SELECT * FROM public.profiles WHERE id = $1', [userId]);
    if (profileRes.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const progressRes = await query(
      'SELECT * FROM public.level_progress WHERE user_id = $1 ORDER BY level_number ASC',
      [userId]
    );

    const unlocksRes = await query(
      'SELECT * FROM public.player_unlocks WHERE user_id = $1',
      [userId]
    );

    return res.json({
      profile: profileRes.rows[0],
      progress: progressRes.rows,
      unlocks: unlocksRes.rows[0] || null
    });
  } catch (err) {
    console.error('Error in /api/auth/me:', err);
    return res.status(500).json({ error: 'Failed to retrieve profile data' });
  }
});

export default router;
