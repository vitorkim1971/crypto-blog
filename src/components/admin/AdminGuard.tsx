import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';

export default async function AdminGuard({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    // TODO: Add strict email checking here for production
    // For now, we allow any logged-in user to access this hidden route as requested for the prototype.
    // const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    // if (session.user?.email !== ADMIN_EMAIL) { ... }

    return <>{children}</>;
}
