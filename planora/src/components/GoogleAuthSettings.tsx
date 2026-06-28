import React, { useEffect, useState } from 'react';
import { initAuth, googleSignIn, logout, getAccessToken } from '../lib/auth';
import { User } from 'firebase/auth';
import { Cloud, Check, Loader2 } from 'lucide-react';

export function GoogleAuthSettings() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (u, t) => {
        setUser(u);
        setToken(t);
        setInitialized(true);
      },
      () => {
        setUser(null);
        setToken(null);
        setInitialized(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
  };

  if (!initialized) {
    return (
      <div className="bg-brand-card rounded-[20px] p-5 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary" size={20} />
      </div>
    );
  }

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 text-white font-semibold mb-3">
        <Cloud size={18} className="text-brand-primary" /> Google Integrations
      </div>
      <div className="bg-brand-card rounded-[20px] border border-black/5 overflow-hidden shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold text-brand-text-primary">Google Account</div>
            <div className="text-xs text-brand-text-secondary font-medium mt-0.5">
              {user ? user.email : 'Sign in to sync Calendar & Contacts'}
            </div>
          </div>
          {user && (
            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
              <Check size={12} className="text-green-600" />
            </div>
          )}
        </div>

        {user ? (
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-gray-100 text-black text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Disconnect Account
          </button>
        ) : (
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full gsi-material-button rounded-xl border border-gray-300 py-2 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
          >
            {isLoggingIn ? (
              <Loader2 className="animate-spin text-black" size={16} />
            ) : (
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            )}
            <span className="font-semibold text-sm text-gray-700">Sign in with Google</span>
          </button>
        )}
      </div>
    </section>
  );
}
