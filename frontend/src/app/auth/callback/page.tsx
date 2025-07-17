'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = searchParams?.get('token');
    const error = searchParams?.get('error');

    if (error) {
      // Handle OAuth errors
      let errorMessage = 'Authentication failed';
      switch (error) {
        case 'oauth_error':
          errorMessage = 'GitHub OAuth error occurred';
          break;
        case 'oauth_failed':
          errorMessage = 'GitHub authentication failed';
          break;
        case 'token_error':
          errorMessage = 'Failed to generate authentication token';
          break;
      }
      
      router.push(`/login?error=${encodeURIComponent(errorMessage)}`);
      return;
    }

    if (token) {
      // Store token and redirect to dashboard
      localStorage.setItem('token', token);
      
      // Fetch user data
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          loginWithToken(data.data.user, token);
          router.push('/projects');
        } else {
          router.push('/login?error=Failed to fetch user data');
        }
      })
      .catch(() => {
        router.push('/login?error=Failed to authenticate');
      });
    } else {
      router.push('/login?error=No authentication token received');
    }
  }, [searchParams, router, loginWithToken]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Completing Authentication</h2>
        <p className="text-muted">Please wait while we log you in...</p>
      </div>
    </div>
  );
}
