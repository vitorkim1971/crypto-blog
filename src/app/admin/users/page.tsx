import AdminGuard from '@/components/admin/AdminGuard';
import UserList from '@/components/admin/UserList';

export default function AdminUsersPage() {
    return (
        <AdminGuard>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            사용자 멤버십 관리 페이지입니다.
                        </p>
                    </div>

                    <UserList />
                </div>
            </div>
        </AdminGuard>
    );
}
