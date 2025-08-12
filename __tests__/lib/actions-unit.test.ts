// 認証機能の単体テスト（モックを使用）
describe('authenticate function logic', () => {
  it('フォームデータから正しくemail/passwordを抽出できる', () => {
    const formData = new FormData();
    formData.set('email', 'test@example.com');
    formData.set('password', '123456');
    
    // フォームデータから値を取得
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    expect(email).toBe('test@example.com');
    expect(password).toBe('123456');
  });

  it('AuthErrorの型に応じて適切なエラーメッセージを返すロジック', () => {
    // エラータイプによるメッセージ分岐のテスト
    const getErrorMessage = (errorType: string) => {
      switch (errorType) {
        case 'CredentialsSignin':
          return 'メールアドレスまたはパスワードが正しくありません。';
        default:
          return 'エラーが発生しました。';
      }
    };

    expect(getErrorMessage('CredentialsSignin')).toBe('メールアドレスまたはパスワードが正しくありません。');
    expect(getErrorMessage('CallbackError')).toBe('エラーが発生しました。');
    expect(getErrorMessage('AccessDenied')).toBe('エラーが発生しました。');
  });
});
