// app/callback/callback-handler.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type'); // 'magic_link' or 'reset_password'
      const email = searchParams.get('email');

      if (!token || !type) {
        setError('Invalid verification link');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, type, email }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        // Store verification token in session storage for password set
        sessionStorage.setItem('verification_token', token);
        sessionStorage.setItem('verification_email', email || '');

        // Redirect based on the type
        if (type === 'magic_link') {
          router.push('/set-password');
        } else if (type === 'reset_password') {
          router.push('/reset-password');
        } else {
          router.push('/login');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Verification failed');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    verifyToken();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ {error}</div>
          <div className="text-gray-600">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-gray-600">Verifying your link...</div>
      </div>
    </div>
  );
}