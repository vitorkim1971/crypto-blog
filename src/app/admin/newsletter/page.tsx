import AdminGuard from '@/components/admin/AdminGuard';
import NewsletterSender from '@/components/admin/NewsletterSender';

export default function NewsletterPage() {
    return (
        <AdminGuard>
            <NewsletterSender />
        </AdminGuard>
    );
}
