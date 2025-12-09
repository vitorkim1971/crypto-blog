import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { subject, content } = await request.json();

        if (!subject || !content) {
            return NextResponse.json(
                { error: '제목과 내용을 입력해주세요' },
                { status: 400 }
            );
        }

        const supabaseAdmin = createAdminClient();

        // Fetch active subscribers
        const { data: subscribers, error: dbError } = await supabaseAdmin
            .from('newsletter_subscribers')
            .select('email, name')
            .eq('is_active', true);

        if (dbError) throw dbError;

        if (!subscribers || subscribers.length === 0) {
            return NextResponse.json(
                { error: '발송할 구독자가 없습니다' },
                { status: 400 }
            );
        }

        // Send emails in batches (limit of 100 per batch for Resend, doing 50 for safety)
        const BATCH_SIZE = 50;
        const results = [];

        for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
            const batch = subscribers.slice(i, i + BATCH_SIZE);

            const emailBatch = batch.map((sub) => ({
                from: process.env.RESEND_FROM_EMAIL!,
                to: sub.email,
                subject: subject,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            ${content}
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #888;">
              <p>Victor's Alpha 뉴스레터를 구독해 주셔서 감사합니다.</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color: #888;">구독 취소하기</a></p>
            </div>
          </div>
        `,
            }));

            // In a real scenario, we would use resend.batch.send if available or Promise.all
            // However, resend SDK might vary. Assuming batch sending is supported or looping.
            // Based on docs, simple loop is safer if batch API isn't strictly typed in installed version.
            // But let's try to do Promise.all for this batch to speed it up.

            const batchPromises = emailBatch.map(email => resend.emails.send(email));
            const batchResults = await Promise.allSettled(batchPromises);
            results.push(...batchResults);
        }

        const successCount = results.filter(r => r.status === 'fulfilled').length;

        return NextResponse.json({
            message: '발송 완료',
            total: subscribers.length,
            sent: successCount
        });

    } catch (error) {
        console.error('Newsletter send error:', error);
        return NextResponse.json(
            { error: '발송 중 오류가 발생했습니다' },
            { status: 500 }
        );
    }
}
