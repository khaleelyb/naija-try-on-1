import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, Github } from 'lucide-react';
import { motion } from 'motion/react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    let redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    if (redirectUrl.endsWith('/')) {
      redirectUrl = redirectUrl.slice(0, -1);
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${redirectUrl}/wardrobe`
      }
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-8 rounded-3xl border border-stone-100 shadow-xl space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-display text-nigeria-green">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-stone-500">
            {isSignUp ? 'Join Naija TryOn today' : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-700 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 focus:border-nigeria-green focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-stone-700 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="email"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 focus:border-nigeria-green focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-stone-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="password"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 focus:border-nigeria-green focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-nigeria-green text-white py-3 rounded-xl font-bold hover:bg-emerald-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-stone-200"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-stone-500">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center space-x-2 border-2 border-stone-200 py-3 rounded-xl font-bold hover:bg-stone-50 transition-colors"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          <span>Google</span>
        </button>

        <p className="text-center text-sm text-stone-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-nigeria-green font-bold hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
