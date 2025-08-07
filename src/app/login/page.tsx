import LoginForm from '@/components/LoginForm';
import { Suspense } from 'react';
import { auth } from '../../../auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await auth();
  
  // If user is already logged in, redirect to dashboard
  if (session?.user) {
    redirect('/dashboard');
  }
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
            <h2 className="text-2xl font-bold">LMG 広告管理</h2>
          </div>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
