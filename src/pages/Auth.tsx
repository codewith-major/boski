import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthProps {
  initialMode?: 'login' | 'signup';
}

export default function Auth({ initialMode }: AuthProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode is determined by route or prop:
  // /signup or initialMode="signup" => Sign Up (isLogin = false)
  // /signin or initialMode="login" or /auth => Sign In (isLogin = true)
  const isSignUp = initialMode === 'signup' || location.pathname === '/signup';
  const isLogin = !isSignUp;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { signIn, signUp } = useAuth();

  const from = location.state?.from?.pathname;
  const targetDestination = (from && from !== '/signin' && from !== '/signup' && from !== '/auth')
    ? from
    : '/home';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error: signInError } = await signIn(email, password);
        if (signInError) throw signInError;
        // Upon successful explicit login, navigate directly to destination
        navigate(targetDestination, { replace: true });
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        const { data: signUpData, error: signUpError } = await signUp(email, password, name);
        if (signUpError) throw signUpError;

        // Check if session was returned or if email confirmation is required
        if (signUpData?.session) {
          // Direct login (no email confirmation needed)
          navigate('/home', { replace: true });
        } else {
          // Email confirmation is required:
          // user exists, but session is null. Keep user on page with clear guidance!
          setSuccessMessage(
            `Account created! A confirmation link has been sent to ${email}. Please check your inbox (and spam folder) to activate your account.`
          );
        }
      }
    } catch (err: any) {
      // Map standard Supabase errors to user-friendly messages
      let message = err.message || 'An unexpected error occurred. Please try again.';
      if (message.includes('Invalid login credentials')) {
        message = 'Invalid email or password.';
      } else if (message.includes('User already registered')) {
        message = 'An account with this email already exists. Please sign in instead.';
      } else if (message.includes('over_email_send_rate_limit')) {
        message = 'Too many signup attempts. Please wait a few moments before trying again.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#171719] mb-2 font-display">
            {isLogin ? 'Welcome back' : 'Join Boski'}
          </h1>
          <p className="text-gray-500">
            {isLogin
              ? 'Enter your details to access your account'
              : 'Create an account to start buying and selling'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm rounded-xl bg-red-50 text-red-600">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 text-sm rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
            <p className="font-semibold mb-1">Check your email</p>
            <p>{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#171719] focus:ring-1 focus:ring-[#171719] transition-colors"
                placeholder="Alex Johnson"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#171719] focus:ring-1 focus:ring-[#171719] transition-colors"
              placeholder="student@university.edu.ng"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#171719] focus:ring-1 focus:ring-[#171719] transition-colors"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#171719] text-white py-3 rounded-xl font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-6"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setError(null);
                setSuccessMessage(null);
                navigate(isLogin ? '/signup' : '/signin');
              }}
              className="text-[#171719] font-medium hover:underline"
              type="button"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
