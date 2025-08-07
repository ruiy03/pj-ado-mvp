import LoginForm from '@/components/LoginForm';
import {Suspense} from 'react';
import {auth} from '../../../auth';
import {redirect} from 'next/navigation';

export default async function LoginPage() {
  const session = await auth();

  // If user is already logged in, redirect to dashboard
  if (session?.user) {
    redirect('/dashboard');
  }
  return (
    <main className="flex items-center justify-center md:h-screen bg-gray-100">
      <div className="relative mx-auto flex w-full max-w-md flex-col space-y-4 p-6 md:-mt-32">
        <Suspense>
          <LoginForm/>
        </Suspense>
      </div>
    </main>
  );
}
