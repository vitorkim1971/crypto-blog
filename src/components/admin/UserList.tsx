'use client';

import { useState, useEffect } from 'react';
import { searchUsers, toggleUserPremium } from '@/lib/admin/actions';
import { type AdminUser } from '@/types';
import Image from 'next/image';

export default function UserList() {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [toggling, setToggling] = useState<string | null>(null);

    // Initial fetch
    useEffect(() => {
        const fetchInitial = async () => {
            setLoading(true);
            try {
                const results = await searchUsers('');
                setUsers(results);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitial();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const results = await searchUsers(query);
            setUsers(results);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (userId: string, currentStatus: boolean) => {
        if (!confirm(currentStatus ? '프리미엄 권한을 해제하시겠습니까?' : '이 사용자에게 프리미엄 권한을 부여하시겠습니까?')) return;

        setToggling(userId);
        try {
            await toggleUserPremium(userId, !currentStatus);
            // Refresh list
            const results = await searchUsers(query);
            setUsers(results);
        } catch (err) {
            alert('변경 실패');
        } finally {
            setToggling(null);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">회원 관리</h2>

            <form onSubmit={handleSearch} className="flex gap-2 mb-8">
                <input
                    type="text"
                    placeholder="이메일 검색..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? '검색 중...' : '검색'}
                </button>
            </form>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 uppercase font-medium">
                        <tr>
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        {user.avatar_url ? (
                                            <Image
                                                src={user.avatar_url}
                                                alt={user.name || 'User'}
                                                width={32}
                                                height={32}
                                                className="rounded-full"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                                        )}
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {user.name || 'No Name'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs">{user.email}</td>
                                <td className="px-4 py-3">
                                    {user.isPremium ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-sm">
                                            Premium
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                            Standard
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => handleToggle(user.id, user.isPremium)}
                                        disabled={toggling === user.id}
                                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${user.isPremium
                                            ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                                            : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                                            }`}
                                    >
                                        {toggling === user.id ? '처리 중...' : user.isPremium ? '해제' : '프리미엄 부여'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && !loading && (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                                    검색 결과가 없습니다
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
