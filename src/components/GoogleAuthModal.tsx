import React, { useState } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import {
  X,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
  Database,
  Award,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, LevelProgress, ApiClient } from '../api/client';
import { soundManager } from '../game/audio/SoundManager';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onLoginSuccess: (profile: UserProfile, progress?: LevelProgress[]) => void;
  onSignOut: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  profile,
  onLoginSuccess,
  onSignOut
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isGoogleUser = Boolean(
    profile && profile.id && (profile.id.startsWith('g_') || (!profile.id.startsWith('guest_') && profile.email && !profile.email.includes('@hukum2.local')))
  );

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const hasConfiguredClientId = Boolean(clientId && clientId.length > 5 && !clientId.includes('placeholder'));

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      setError(null);
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google.');
      }

      const data = await ApiClient.googleLogin(credentialResponse.credential);
      soundManager.playEquipGear();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      setSuccessMessage(`Welcome, ${data.profile.display_name}! Linked with Render PostgreSQL.`);
      onLoginSuccess(data.profile, data.progress);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      // Demo fast-track token for instant testing
      const demoToken = `demo_google:g_rajini_${Date.now().toString(36)}:superstar.rajini@gmail.com:Muthuvel Pandian (Google)`;
      const data = await ApiClient.googleLogin(demoToken);
      soundManager.playEquipGear();
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 }
      });
      setSuccessMessage(`Signed in as ${data.profile.display_name}!`);
      onLoginSuccess(data.profile, data.progress);
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Fast-Track Google Sign-In Error:', err);
      setError(err.message || 'Fast-Track Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutClick = async () => {
    try {
      googleLogout();
      soundManager.playUiClick();
      onSignOut();
      setSuccessMessage('Signed out successfully. Switched to Guest recruit.');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
      data-testid="google-auth-modal"
    >
      <div className="relative w-full max-w-lg bg-gradient-to-b from-stone-900 via-stone-950 to-black border-2 border-amber-500/50 rounded-3xl p-6 shadow-[0_0_60px_rgba(245,158,11,0.25)] flex flex-col text-center">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center space-x-2 text-left">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block leading-tight">
                TIHAR PROTOCOL // CLOUD IDENTITY
              </span>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider font-display leading-tight">
                GOOGLE OAUTH <span className="text-amber-400">LOGIN & DOSSIER</span>
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            data-testid="close-auth-modal"
            className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Character Portrait & Badge */}
        <div className="my-4 flex flex-col items-center">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl bg-stone-950 mb-2">
            <img
              src={isGoogleUser && profile?.avatar_url ? profile.avatar_url : '/assets/portraits/tiger.jpg'}
              alt="Muthuvel Pandian"
              className="w-full h-full object-cover object-top"
            />
            {isGoogleUser && (
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border border-stone-950 flex items-center justify-center shadow">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>

          <h4 className="text-lg font-black text-white uppercase tracking-wide">
            {profile?.display_name || 'Tiger Recruit'}
          </h4>
          <p className="text-xs text-amber-200/80 font-dialogue italic">
            {isGoogleUser
              ? `Connected Google Account: ${profile?.email}`
              : 'Playing in Guest Recruit Mode (Progress is local)'}
          </p>
        </div>

        {/* Notifications & Feedback */}
        {error && (
          <div className="mb-3.5 flex items-center space-x-2 text-xs text-red-400 bg-red-950/60 border border-red-500/40 p-2.5 rounded-xl text-left">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-3.5 flex items-center space-x-2 text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 p-2.5 rounded-xl text-left">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* State A: User is Logged In with Google */}
        {isGoogleUser ? (
          <div className="space-y-4 my-2">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-2.5 bg-stone-900/80 p-3 rounded-2xl border border-stone-800 text-left">
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase flex items-center space-x-1">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span>TOTAL AURA</span>
                </span>
                <div className="text-base font-black text-amber-400 font-mono">
                  {Number(profile?.total_aura_score || 0).toLocaleString()} PTS
                </div>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>CHAPTER UNLOCKED</span>
                </span>
                <div className="text-base font-black text-white font-mono">
                  Chapter {profile?.highest_level_unlocked || 1} / 10
                </div>
              </div>
            </div>

            {/* Cloud Status */}
            <div className="flex items-center justify-between text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 py-2 px-3 rounded-xl">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Cloud Sync: Render PostgreSQL Active</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2.5 pt-1">
              <button
                onClick={() => {
                  soundManager.playUiClick();
                  onClose();
                }}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 active:scale-95 text-stone-950 font-black rounded-xl shadow-lg transition-all"
              >
                Continue Playing
              </button>

              <button
                onClick={handleSignOutClick}
                data-testid="auth-signout-btn"
                className="flex items-center justify-center space-x-1.5 px-4 py-3 bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-300 font-bold rounded-xl border border-stone-700 transition-all text-xs"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* State B: Guest Mode -> Prompt Google Sign-In */
          <div className="space-y-4 my-2">
            <div className="bg-stone-900/80 border border-amber-500/20 rounded-2xl p-3.5 text-left text-xs space-y-2">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold uppercase text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Cloud Progress & Leaderboard Protection</span>
              </div>
              <p className="text-stone-300 text-[11px] leading-relaxed">
                Sign in with your Google Account to automatically sync your high scores, unlocked weapons, and 10-chapter campaign completion to the live Render PostgreSQL database.
              </p>
            </div>

            {/* Official Google Sign-In Button Component */}
            <div className="flex flex-col items-center justify-center space-y-2 py-1">
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    setError('Google Sign-In was cancelled or failed to initialize.');
                  }}
                  theme="filled_black"
                  shape="pill"
                  size="large"
                  text="continue_with"
                  width="320"
                />
              </div>

              {/* Fast-Track Demo Button (Always available for testing / seamless dev) */}
              <button
                onClick={handleDemoGoogleLogin}
                disabled={loading}
                data-testid="fast-track-google-login"
                className="w-full max-w-xs flex items-center justify-center space-x-2 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 active:scale-95 border border-stone-700 text-stone-200 text-xs font-bold rounded-full transition-all shadow"
              >
                {/* Google Multicolor 'G' Icon */}
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{loading ? 'Authenticating...' : 'One-Click Google Sign-In (Demo)'}</span>
              </button>

              {!hasConfiguredClientId && (
                <div className="text-[10px] text-stone-500 font-mono mt-1">
                  Note: Using fast-track authentication (VITE_GOOGLE_CLIENT_ID pending in .env)
                </div>
              )}
            </div>

            {/* Dismiss / Guest Button */}
            <div className="pt-2 border-t border-stone-800">
              <button
                onClick={() => {
                  soundManager.playUiClick();
                  onClose();
                }}
                className="text-xs text-stone-400 hover:text-amber-300 font-medium transition"
              >
                Continue as Guest Recruit for now &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
