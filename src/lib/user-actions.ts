'use server';

import bcrypt from 'bcrypt';
import {revalidatePath} from 'next/cache';
import {z} from 'zod';
import {User} from './definitions';
import {withAuthorization, getCurrentUser} from './authorization';
import {sql} from '@/lib/db';

// バリデーションスキーマ
const CreateUserSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
  role: z.enum(['admin', 'editor'], {message: '役割は管理者または編集者を選択してください'}),
});

const UpdateUserSchema = z.object({
  id: z.number(),
  name: z.string().min(1, '名前は必須です').optional(),
  email: z.string().email('有効なメールアドレスを入力してください').optional(),
  role: z.enum(['admin', 'editor'], {message: '役割は管理者または編集者を選択してください'}).optional(),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください').optional(),
});

// ユーザー一覧取得
export async function getUsers(): Promise<User[]> {
  return withAuthorization('admin', async () => {
    const users = await sql`
      SELECT id, name, email, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `;
    return users as User[];
  });
}

// ユーザー詳細取得
export async function getUserById(userId: number): Promise<User | null> {
  return withAuthorization('admin', async () => {
    const users = await sql`
        SELECT id, name, email, role, created_at, updated_at
        FROM users
        WHERE id = ${userId}
    `;
    return users.length > 0 ? users[0] as User : null;
  });
}

// ユーザー作成
export async function createUser(
  prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; message: string; errors?: string[]; user?: User }> {
  try {
    return await withAuthorization('admin', async () => {
      const validatedFields = CreateUserSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role'),
      });

      if (!validatedFields.success) {
        const errors = validatedFields.error.issues.map(issue => issue.message);
        return {
          success: false,
          message: errors.join('、'),
          errors,
        };
      }

      const {name, email, password, role} = validatedFields.data;

      // 管理者の作成を制限
      if (role === 'admin') {
        return {
          success: false,
          message: '管理者アカウントは作成できません',
        };
      }

      // メールアドレス重複チェック
      const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`;
      if (existingUser.length > 0) {
        return {
          success: false,
          message: 'このメールアドレスは既に使用されています',
        };
      }

      // パスワードハッシュ化
      const hashedPassword = await bcrypt.hash(password, 10);

      // ユーザー作成
      const newUser = await sql`
        INSERT INTO users (name, email, password, role)
        VALUES (${name}, ${email}, ${hashedPassword}, ${role})
        RETURNING id, name, email, role, created_at
      `;

      revalidatePath('/accounts');

      return {
        success: true,
        message: 'ユーザーが作成されました',
        user: newUser[0] as User,
      };
    });
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '予期しないエラーが発生しました',
    };
  }
}

// ユーザー更新
export async function updateUser(
  prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; message: string; errors?: string[]; user?: User }> {
  try {
    return await withAuthorization('admin', async () => {
      const validatedFields = UpdateUserSchema.safeParse({
        id: parseInt(formData.get('id') as string),
        name: formData.get('name') || undefined,
        email: formData.get('email') || undefined,
        role: formData.get('role') || undefined,
        password: formData.get('password') || undefined,
      });

      if (!validatedFields.success) {
        const errors = validatedFields.error.issues.map(issue => issue.message);
        return {
          success: false,
          message: errors.join('、'),
          errors,
        };
      }

      const {id, name, email, role, password} = validatedFields.data;

      // 管理者への役割変更を制限
      if (role === 'admin') {
        return {
          success: false,
          message: '管理者権限への変更はできません',
        };
      }

      // 現在のユーザー情報を取得
      const currentUser = await sql`SELECT * FROM users WHERE id = ${id}`;
      if (currentUser.length === 0) {
        return {
          success: false,
          message: 'ユーザーが見つかりませんでした',
        };
      }

      // 更新するフィールドを準備
      const updatedName = name || currentUser[0].name;
      const updatedEmail = email || currentUser[0].email;
      const updatedRole = role || currentUser[0].role;
      const updatedPassword = password ? await bcrypt.hash(password, 10) : currentUser[0].password;

      // ユーザー更新
      const updatedUser = await sql`
        UPDATE users 
        SET name = ${updatedName}, 
            email = ${updatedEmail}, 
            role = ${updatedRole}, 
            password = ${updatedPassword},
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, name, email, role, created_at, updated_at
      `;

      revalidatePath('/accounts');

      return {
        success: true,
        message: 'ユーザーが更新されました',
        user: updatedUser[0] as User,
      };
    });
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '予期しないエラーが発生しました',
    };
  }
}

// ユーザー削除
export async function deleteUser(userId: number): Promise<{ success: boolean; message: string }> {
  try {
    return await withAuthorization('admin', async () => {
      // 現在ログイン中のユーザー情報を取得
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        return {
          success: false,
          message: 'ログインしていません',
        };
      }

      // 削除対象のユーザー情報を取得
      const userToDelete = await sql`SELECT id, role FROM users WHERE id = ${userId}`;
      if (userToDelete.length === 0) {
        return {
          success: false,
          message: 'ユーザーが見つかりませんでした',
        };
      }

      // 管理者が自分自身を削除しようとした場合のチェック
      if (currentUser.role === 'admin' && parseInt(currentUser.id) === userId) {
        return {
          success: false,
          message: '管理者は自分自身のアカウントを削除できません',
        };
      }

      await sql`DELETE FROM users WHERE id = ${userId}`;

      revalidatePath('/accounts');

      return {
        success: true,
        message: 'ユーザーが削除されました',
      };
    });
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '予期しないエラーが発生しました',
    };
  }
}
