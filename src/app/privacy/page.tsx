import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata-helpers';
import Link from 'next/link';

export const metadata: Metadata = createPageMetadata({
  title: '개인정보처리방침',
  description: "Victor's Alpha의 개인정보처리방침을 확인하세요. 회원님의 개인정보를 안전하게 보호하고 관리합니다.",
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-16 px-4 transition-colors">
      <div className="container mx-auto max-w-3xl">
        <header className="text-center mb-16">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 dark:text-gray-50 mb-4">
            개인정보처리방침
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            최종 수정일: 2024년 11월 15일
          </p>
        </header>

        <div className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-li:text-gray-600 dark:prose-li:text-gray-300">
          <section className="mb-12">
            <h2 className="text-lg md:text-xl mb-4">
              1. 개인정보의 수집 및 이용 목적
            </h2>
            <p>
              Victor's Alpha("회사")은 다음의 목적을 위하여 개인정보를 처리합니다.
              처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지
              않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에
              따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>회원 가입 및 관리</li>
              <li>프리미엄 구독 서비스 제공</li>
              <li>뉴스레터 발송</li>
              <li>고객 문의 및 민원 처리</li>
              <li>서비스 개선 및 분석</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-xl md:text-2xl mb-4">
              2. 수집하는 개인정보의 항목
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  필수 수집 항목
                </h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>이메일 주소</li>
                  <li>비밀번호 (암호화 저장)</li>
                  <li>이름 (선택)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  자동 수집 항목
                </h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>IP 주소</li>
                  <li>쿠키 및 세션 정보</li>
                  <li>서비스 이용 기록</li>
                  <li>접속 로그</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  결제 정보 (프리미엄 구독 시)
                </h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>결제 카드 정보 (Stripe을 통해 암호화 처리)</li>
                  <li>청구지 주소</li>
                  <li>결제 내역</li>
                </ul>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                  * 신용카드 정보는 회사가 직접 저장하지 않으며, Stripe가
                  안전하게 관리합니다.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl md:text-2xl mb-4">
              3. 개인정보의 보유 및 이용 기간
            </h2>
            <p>
              회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터
              개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서
              개인정보를 처리·보유합니다.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>회원 정보:</strong> 회원 탈퇴 시까지
              </li>
              <li>
                <strong>뉴스레터 구독:</strong> 구독 취소 시까지
              </li>
              <li>
                <strong>결제 정보:</strong> 관계 법령에 따라 5년간 보관
              </li>
              <li>
                <strong>서비스 이용 기록:</strong> 3개월
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-xl md:text-2xl mb-4">
              4. 개인정보의 제3자 제공
            </h2>
            <p>
              회사는 원칙적으로 정보주체의 개인정보를 제1조(개인정보의 처리
              목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의
              특별한 규정 등 개인정보 보호법 제17조에 해당하는 경우에만
              개인정보를 제3자에게 제공합니다.
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 my-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                제3자 제공 현황
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Stripe (결제 처리)</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    제공 항목: 이메일, 결제 정보
                    <br />
                    제공 목적: 프리미엄 구독 결제 처리
                    <br />
                    보유 기간: Stripe 개인정보처리방침에 따름
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Resend (이메일 발송)</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    제공 항목: 이메일, 이름
                    <br />
                    제공 목적: 뉴스레터 및 서비스 이메일 발송
                    <br />
                    보유 기간: Resend 개인정보처리방침에 따름
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl md:text-2xl mb-4">
              5. 개인정보의 파기
            </h2>
            <p>
              회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가
              불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
            </p>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                파기 절차 및 방법
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>파기 절차:</strong> 보유기간이 경과하거나 처리목적이
                  달성된 개인정보는 내부 방침 및 관련 법령에 따라 파기합니다.
                </li>
                <li>
                  <strong>파기 방법:</strong> 전자적 파일 형태는 복구 불가능한
                  방법으로 영구 삭제하며, 종이 문서는 분쇄기로 분쇄하거나
                  소각합니다.
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl md:text-2xl mb-4">
              6. 정보주체의 권리·의무 및 행사방법
            </h2>
            <p>
              정보주체는 언제든지 다음 각 호의 개인정보 보호 관련 권리를
              행사할 수 있습니다.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>개인정보 열람 요구</li>
              <li>개인정보 정정·삭제 요구</li>
              <li>개인정보 처리정지 요구</li>
              <li>회원 탈퇴 (처리 정지)</li>
            </ul>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              📢 권리 행사는 프로필 페이지에서 직접 가능하며, 서면, 전화, 이메일
              등을 통해서도 가능합니다.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl md:text-2xl mb-4">
              7. 개인정보 보호책임자
            </h2>
            <p className="mb-4">
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보
              처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와
              같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <p className="text-gray-900 dark:text-gray-100">
                <strong>개인정보 보호책임자</strong>
                <br />
                이메일: privacy@victorsalpha.com
                <br />
                연락처: contact@victorsalpha.com
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl md:text-2xl mb-4">
              8. 개인정보처리방침 변경
            </h2>
            <p>
              이 개인정보처리방침은 2024년 11월 15일부터 적용되며, 법령 및
              방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의
              시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-xl md:text-2xl mb-4">
              9. 쿠키 사용
            </h2>
            <p className="mb-4">
              회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 쿠키를
              사용합니다.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>쿠키란:</strong> 웹사이트를 운영하는데 이용되는 서버가
                이용자의 브라우저에 보내는 소량의 정보
              </li>
              <li>
                <strong>사용 목적:</strong> 로그인 상태 유지, 서비스 이용 통계
                분석
              </li>
              <li>
                <strong>쿠키 거부:</strong> 브라우저 설정을 통해 쿠키 저장을
                거부할 수 있으나, 일부 서비스 이용에 제한이 있을 수 있습니다.
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            문의사항이 있으신 경우{' '}
            <Link
              href="/contact"
              className="text-amber-600 dark:text-amber-400 hover:underline font-medium"
            >
              문의하기
            </Link>
            를 이용해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
