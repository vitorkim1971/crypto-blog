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

    if (!process.env.RESEND_API_KEY) {
      console.error('Missing RESEND_API_KEY');
      return NextResponse.json({ error: '서버 설정 오류: 이메일 키 누락' }, { status: 500 });
    }

    // Check Service Role Key existence (implicit check via createAdminClient usage, but good to debug)
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json({ error: '서버 설정 오류: DB 권한 키 누락' }, { status: 500 });
    }

    const supabaseAdmin = createAdminClient();

    // Check if already subscribed
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('DB Fetch Error:', fetchError);
      return NextResponse.json({ error: `DB 조회 오류: ${fetchError.message}` }, { status: 500 });
    }

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

    if (dbError) {
      console.error('DB Insert Error:', dbError);
      return NextResponse.json({ error: `DB 저장 오류: ${dbError.message}` }, { status: 500 });
    }

    // Send welcome email
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: email,
        subject: "Victor's Alpha 뉴스레터 구독을 환영합니다!",
        html: `
          <h1>환영합니다! ${name || '구독자'}님</h1>
          <p>Victor's Alpha 뉴스레터 구독을 환영합니다.</p>
          <p>최신 암호화폐 투자 인사이트를 정기적으로 받아보실 수 있습니다.</p>
        `,
      });
    } catch (emailError) {
      console.error('Resend Error:', emailError);
      // Don't fail the request if just email fails, but maybe warn?
      // actually better to fail or let them know, but subscription succeeded.
      // returning success but logging error.
    }

    return NextResponse.json({ message: '구독이 완료되었습니다!' });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { error: `구독 처리 중 오류가 발생했습니다: ${errorMessage}` },
      { status: 500 }
    );
  }
}
