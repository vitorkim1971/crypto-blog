import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: '이메일 주소를 입력해주세요' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Check if already subscribed
    const { data: existing } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', email)
      .single();

    if (existing && existing.is_active) {
      return NextResponse.json(
        { error: '이미 구독 중인 이메일입니다' },
        { status: 400 }
      );
    }

    // Add to database
    const { error: dbError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .upsert({
        email,
        name,
        is_active: true,
        subscribed_at: new Date().toISOString(),
      });

    if (dbError) throw dbError;

    // Send welcome email
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: "Victor's Alpha 뉴스레터 구독을 환영합니다!",
      html: `
        <h1>환영합니다! ${name || '구독자'}님</h1>
        <p>Victor's Alpha 뉴스레터 구독을 환영합니다.</p>
        <p>최신 암호화폐 투자 인사이트를 정기적으로 받아보실 수 있습니다.</p>
      `,
    });

    return NextResponse.json({ message: '구독이 완료되었습니다!' });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: '구독 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
