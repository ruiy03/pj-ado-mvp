import {auth} from '@/auth';
import {redirect} from 'next/navigation';

interface ProtectedPageProps {
  children: React.ReactNode;
}

export default async function ProtectedPage({children}: ProtectedPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return <>{children}</>;
}
