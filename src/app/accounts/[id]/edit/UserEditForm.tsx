'use client';

import {useState, useEffect, useActionState} from 'react';
import {useRouter} from 'next/navigation';
import {User} from '@/lib/definitions';
import {updateUser} from '@/lib/user-actions';

interface UserEditFormProps {
  user: User;
}

export default function UserEditForm({user}: UserEditFormProps) {
  const router = useRouter();
  const [updateState, updateFormAction] = useActionState(updateUser, undefined);

  // フォームの値を状態で管理
  const [formValues, setFormValues] = useState({
    name: user.name || '',
    email: user.email || '',
    password: '',
  });

  useEffect(() => {
    if (updateState?.success) {
      router.push('/accounts');
    }
  }, [updateState, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    router.push('/accounts');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <form action={updateFormAction} className="space-y-6">
        <input type="hidden" name="id" value={user.id}/>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            名前
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formValues.name}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formValues.email}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <input type="hidden" name="role" value="editor"/>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            パスワード (変更する場合のみ)
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formValues.password}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* 成功メッセージ */}
        {updateState?.success && updateState?.message && (
          <div className="p-3 rounded bg-green-100 text-green-700">
            {updateState.message}
          </div>
        )}

        {!updateState?.success && (updateState?.errors?.length || updateState?.message) && (
          <div className="p-3 rounded bg-red-100 text-red-700">
            {updateState?.errors?.length ? (
              <ul className="list-disc list-inside space-y-1">
                {updateState.errors.map((error: string, index: number) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            ) : (
              updateState?.message
            )}
          </div>
        )}

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded transition-colors cursor-pointer"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition-colors cursor-pointer"
          >
            更新
          </button>
        </div>
      </form>
    </div>
  );
}
