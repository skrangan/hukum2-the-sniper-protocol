// Frontend API Client for communicating with the Render-backed Express API

const API_BASE = '/api';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  preferred_subtitle_mode: string;
  total_aura_score: string | number;
  highest_level_unlocked: number;
}

export interface LevelProgress {
  id: string;
  user_id: string;
  level_number: number;
  status: string;
  best_aura_score: number;
  stars_earned: number;
  fastest_clear_time_ms: number;
  spectacle_flips_used: number;
}

export interface PlayerUnlocks {
  user_id: string;
  unlocked_cameos: string[];
  unlocked_outfits: string[];
  achievements: string[];
}

export class ApiClient {
  private static token: string | null = localStorage.getItem('hukum2_token');

  public static setToken(token: string) {
    this.token = token;
    localStorage.setItem('hukum2_token', token);
  }

  public static getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('hukum2_token');
    }
    return this.token;
  }

  public static clearToken() {
    this.token = null;
    localStorage.removeItem('hukum2_token');
  }

  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    const t = this.getToken();
    if (t) {
      headers['Authorization'] = `Bearer ${t}`;
    }
    return headers;
  }

  public static async guestLogin(guestId?: string) {
    const res = await fetch(`${API_BASE}/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestId })
    });
    if (!res.ok) throw new Error('Guest login failed');
    const data = await res.json();
    this.setToken(data.token);
    return data;
  }

  public static async googleLogin(credential: string) {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });
    if (!res.ok) throw new Error('Google sign-in failed');
    const data = await res.json();
    this.setToken(data.token);
    return data;
  }

  public static async getProfile(): Promise<{ profile: UserProfile; progress: LevelProgress[]; unlocks: PlayerUnlocks }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  }

  public static async saveLevelProgress(payload: {
    levelNumber: number;
    auraScore: number;
    starsEarned: number;
    clearTimeMs: number;
    spectacleFlipsUsed: number;
    cameosUsed?: string[];
  }) {
    const res = await fetch(`${API_BASE}/player/save-level`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to save progress');
    return res.json();
  }

  public static async getLeaderboard() {
    const res = await fetch(`${API_BASE}/leaderboard`);
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    return res.json();
  }
}
