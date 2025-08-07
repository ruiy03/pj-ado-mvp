'use client';

import {useActionState} from 'react';
import {Button} from './Button';
import {authenticate} from '@/lib/actions';

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex-1 rounded-xl bg-white px-10 pb-10 pt-12 border border-gray-200 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ログイン
          </h1>
          <p className="text-gray-600 mt-2">アカウントにアクセスしてください</p>
        </div>
        <div className="space-y-6">
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="email"
            >
              メールアドレス
            </label>
            <div className="relative">
              <input
                className="block w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors placeholder:text-gray-400"
                id="email"
                type="email"
                name="email"
                placeholder="example@company.com"
                required
              />
              <svg
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
              </svg>
            </div>
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="password"
            >
              パスワード
            </label>
            <div className="relative">
              <input
                className="block w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors placeholder:text-gray-400"
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                required
                minLength={8}
              />
              <svg
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
          </div>
        </div>
        <Button className="mt-8 w-full py-4 text-base font-medium justify-center" aria-disabled={isPending}>
          {isPending ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                   viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              ログイン中...
            </div>
          ) : (
            "ログイン"
          )}
        </Button>
        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {errorMessage && (
            <>
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"/>
              </svg>
              <p className="text-sm text-red-500">{errorMessage}</p>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
