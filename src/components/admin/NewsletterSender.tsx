'use client';

import { useState, useEffect } from 'react';

export default function NewsletterSender() {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [subscriberCount, setSubscriberCount] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchSubscriberCount();
    }, []);

    const fetchSubscriberCount = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/newsletter/count');
            const data = await res.json();
            setSubscriberCount(data.count || 0);
        } catch (error) {
            console.error('Failed to fetch subscriber count:', error);
            setSubscriberCount(0);
        }
        setLoading(false);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm(`총 ${subscriberCount}명의 구독자에게 발송하시겠습니까?`)) return;

        setSending(true);
        try {
            const res = await fetch('/api/admin/newsletter/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, content }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            alert(`성공적으로 발송되었습니다! (성공: ${data.sent}명)`);
            setSubject('');
            setContent('');
        } catch (error) {
            alert(`발송 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">뉴스레터 발송</h1>
            <p className="text-gray-600 mb-8">
                현재 활성 구독자: <span className="font-bold text-blue-600">{loading ? '...' : subscriberCount}명</span>
            </p>

            <form onSubmit={handleSend} className="space-y-6 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        이메일 제목
                    </label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="뉴스레터 제목을 입력하세요"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        내용 (HTML 지원)
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-[400px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                        placeholder="<p>안녕하세요...</p>"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        * HTML 태그를 사용할 수 있습니다. 하단에 '구독 취소' 링크는 자동으로 포함됩니다.
                    </p>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={sending || subscriberCount === 0}
                        className={`
              px-6 py-3 rounded-lg font-bold text-white transition-all
              ${sending || subscriberCount === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                            }
            `}
                    >
                        {sending ? '발송 중...' : '뉴스레터 발송하기'}
                    </button>
                </div>
            </form>
        </div>
    );
}
