'use client';

import {useState, useEffect, useActionState} from 'react';
import {User} from '@/lib/definitions';
import {createUser, updateUser} from '@/lib/user-actions';

interface UserFormProps {
  user?: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserForm({user, onClose, onSuccess}: UserFormProps) {
  const [createState, createFormAction] = useActionState(createUser, undefined);
  const [updateState, updateFormAction] = useActionState(updateUser, undefined);

  // フォームの値を状態で管理
  const [formValues, setFormValues] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
  });

  const isEdit = !!user;
  const formAction = isEdit ? updateFormAction : createFormAction;
  const state = isEdit ? updateState : createState;

  useEffect(() => {
    if (state?.success) {
      onSuccess();
    }
  }, [state, onSuccess]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {isEdit ? 'ユーザー編集' : '新しいユーザーを追加'}
        </h2>

        <form action={formAction} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={user.id}/>}

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
              パスワード {isEdit && '(変更する場合のみ)'}
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formValues.password}
              onChange={handleInputChange}
              required={!isEdit}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* 成功メッセージ */}
          {state?.success && state?.message && (
            <div className="p-3 rounded bg-green-100 text-green-700">
              {state.message}
            </div>
          )}

          {!state?.success && (state?.errors?.length || state?.message) && (
            <div className="p-3 rounded bg-red-100 text-red-700">
              {state?.errors?.length ? (
                <ul className="list-disc list-inside space-y-1">
                  {state.errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              ) : (
                state?.message
              )}
            </div>
          )}

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded transition-colors cursor-pointer"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition-colors"
            >
              {isEdit ? '更新' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
