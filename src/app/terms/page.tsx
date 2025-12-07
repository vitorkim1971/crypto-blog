

import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata-helpers';
import Link from 'next/link';

export const metadata: Metadata = createPageMetadata({
  title: '이용약관',
  description: "Victor's Alpha의 이용약관을 확인하세요. 서비스 이용에 관한 권리와 의무를 안내합니다.",
  path: '/terms',
});

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-16 px-4 transition-colors">
      <div className="container mx-auto max-w-3xl">
        <header className="text-center mb-16">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 dark:text-gray-50 mb-4">
            이용약관
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            최종 수정일: 2024년 11월 15일
          </p>
        </header>

        <div className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-li:text-gray-600 dark:prose-li:text-gray-300">
          <section className="mb-12">
            <h2 className="text-lg md:text-xl mb-4">제1조 (목적)</h2>
            <p>
              본 약관은 Victor's Alpha(이하 "회사")가 제공하는 암호화폐 투자
              블로그 플랫폼 및 관련 서비스(이하 "서비스")의 이용과 관련하여
              회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을
              규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-lg md:text-xl mb-4">제2조 (정의)</h2>
            <p className="mb-4">본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
            <ul className="list-decimal pl-6 space-y-2">
              <li>
                "서비스"란 회사가 제공하는 암호화폐 투자 관련 블로그 콘텐츠,
                프리미엄 구독, 뉴스레터 등 모든 서비스를 의미합니다.
              </li>
              <li>
                "회원"이란 본 약관에 동의하고 회사와 서비스 이용계약을 체결한
                자를 말합니다.
              </li>
              <li>
                "프리미엄 회원"이란 유료 구독을 통해 프리미엄 콘텐츠에 접근할
                수 있는 회원을 말합니다.
              </li>
              <li>
                "콘텐츠"란 회사가 서비스를 통해 제공하는 모든 정보, 글, 이미지
                등을 의미합니다.
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-xl md:text-2xl mb-4">제3조 (약관의 효력 및 변경)</h2>
            <ul className="list-decimal pl-6 space-y-3">
              <li>
                본 약관은 서비스를 이용하고자 하는 모든 회원에 대하여 그
                효력을 발생합니다.
              </li>
              <li>
                회사는 필요한 경우 관련 법령을 위배하지 않는 범위 내에서 본
                약관을 변경할 수 있습니다.
              </li>
              <li>
                약관이 변경되는 경우 회사는 변경사항을 시행일로부터 최소 7일
                전에 공지사항을 통해 공지합니다.
              </li>
              <li>
                회원이 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고
                탈퇴할 수 있습니다.
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-xl md:text-2xl mb-4">제4조 (회원가입)</h2>
            <ul className="list-decimal pl-6 space-y-3">
              <li>
                회원가입은 이용자가 본 약관의 내용에 동의한 후 회원가입
                신청을 하고, 회사가 이를 승낙함으로써 체결됩니다.
              </li>
              <li>
                회원가입 시 정확하고 최신의 정보를 제공해야 하며, 허위 정보
                제공 시 서비스 이용이 제한될 수 있습니다.
              </li>
              <li>
                만 14세 미만의 아동은 회원가입을 할 수 없습니다.
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-xl md:text-2xl mb-4">제5조 (프리미엄 구독)</h2>
            <ul className="list-decimal pl-6 space-y-3">
              <li>
                프리미엄 구독은 월간 또는 연간 단위로 제공되며, 구독 시 명시된
                요금을 지불해야 합니다.
              </li>
              <li>
                프리미엄 구독은 결제일로부터 구독 기간 동안 자동으로 갱신되며,
                회원은 언제든지 구독을 취소할 수 있습니다.
              </li>
              <li>
                구독 취소 시 현재 구독 기간 종료 시까지는 프리미엄 서비스를
                이용할 수 있습니다.
              </li>
              <li>
                환불은 결제 후 7일 이내에 서비스를 전혀 이용하지 않은 경우에만
                가능합니다.
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-xl md:text-2xl mb-4">제6조 (회원의 의무)</h2>
            <p className="mb-4">회원은 다음 행위를 하여서는 안 됩니다.</p>
            <ul className="list-decimal pl-6 space-y-2">
              <li>회원가입 신청 또는 변경 시 허위 내용 등록</li>
              <li>타인의 정보 도용</li>
              <li>회사가 게시한 정보의 무단 변경</li>
              <li>회사가 금지한 정보(컴퓨터 프로그램 등)의 송신 또는 게시</li>
              <li>
                회사 및 기타 제3자의 저작권 등 지적재산권에 대한 침해
              </li>
              <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
              <li>
                외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에
                반하는 정보를 서비스에 공개 또는 게시하는 행위
              </li>
              <li>서비스를 영리 목적으로 이용하는 행위</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-xl md:text-2xl mb-4">제7조 (회사의 의무)</h2>
            <ul className="list-decimal pl-6 space-y-3">
              <li>
                회사는 법령과 본 약관이 금지하거나 공서양속에 반하는 행위를
                하지 않으며, 계속적이고 안정적으로 서비스를 제공하기 위하여
                최선을 다하여 노력합니다.
              </li>
              <li>
                회사는 회원이 안전하게 서비스를 이용할 수 있도록 개인정보
                보호를 위한 보안시스템을 갖추어야 합니다.
              </li>
              <li>
                회사는 서비스 이용과 관련하여 회원으로부터 제기된 의견이나
                불만이 정당하다고 인정될 경우 이를 처리하여야 합니다.
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-xl md:text-2xl mb-4">제8조 (서비스의 제공 및 변경)</h2>
            <ul className="list-decimal pl-6 space-y-3">
              <li>
                회사는 다음과 같은 업무를 수행합니다:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>암호화폐 투자 관련 콘텐츠 제공</li>
                  <li>프리미엄 콘텐츠 제공</li>
                  <li>뉴스레터 발송</li>
                  <li>기타 회사가 정하는 업무</li>
                </ul>
              </li>
              <li>
                회사는 서비스의 내용을 변경할 수 있으며, 변경 시 그 내용을
                사전에 공지합니다.
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-xl md:text-2xl mb-4">제9조 (서비스의 중단)</h2>
            <ul className="list-decimal pl-6 space-y-3">
              <li>
                회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의
                두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로
                중단할 수 있습니다.
              </li>
              <li>
                제1항에 의한 서비스 중단의 경우 회사는 사전에 공지합니다.
                다만, 회사가 통제할 수 없는 사유로 인한 서비스의 중단으로
                인하여 사전 통지가 불가능한 경우에는 그러하지 아니합니다.
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-xl md:text-2xl mb-4">제10조 (저작권 및 지적재산권)</h2>
            <ul className="list-decimal pl-6 space-y-3">
              <li>
                회사가 작성한 모든 콘텐츠에 대한 저작권 및 기타 지적재산권은
                회사에 귀속됩니다.
              </li>
              <li>
                회원은 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이
                귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포,
                방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게
                이용하게 하여서는 안 됩니다.
              </li>
              <li>
                회사는 약정에 따라 회원에게 귀속된 저작권을 사용하는 경우
                당해 회원에게 통보하여야 합니다.
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-xl md:text-2xl mb-4">제11조 (면책조항)</h2>
            <ul className="list-decimal pl-6 space-y-3">
              <li>
                회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를
                제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
              </li>
              <li>
                회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는
                책임을 지지 않습니다.
              </li>
              <li>
                회사는 회원이 서비스를 이용하여 기대하는 수익을 얻지 못하거나
                상실한 것에 대하여 책임을 지지 않습니다.
              </li>
              <li>
                회사가 제공하는 콘텐츠는 투자 조언이 아니며, 투자 결정에 대한
                최종 책임은 회원 본인에게 있습니다.
              </li>
              <li>
                암호화폐 투자는 높은 리스크를 동반하며, 회사는 투자 손실에
                대해 어떠한 책임도 지지 않습니다.
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-xl md:text-2xl mb-4">제12조 (분쟁해결)</h2>
            <ul className="list-decimal pl-6 space-y-3">
              <li>
                회사는 회원이 제기하는 정당한 의견이나 불만을 반영하고 그
                피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.
              </li>
              <li>
                회사는 회원으로부터 제출되는 불만사항 및 의견을 우선적으로
                그 사항을 처리합니다. 다만, 신속한 처리가 곤란한 경우에는
                회원에게 그 사유와 처리일정을 즉시 통보합니다.
              </li>
              <li>
                서비스 이용으로 발생한 분쟁에 대해 소송이 제기될 경우 회사의
                본사 소재지를 관할하는 법원을 관할법원으로 합니다.
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-xl md:text-2xl mb-4">제13조 (회원 탈퇴 및 자격 상실)</h2>
            <ul className="list-decimal pl-6 space-y-3">
              <li>
                회원은 언제든지 탈퇴를 요청할 수 있으며, 회사는 즉시 회원
                탈퇴를 처리합니다.
              </li>
              <li>
                회원이 다음 각호의 사유에 해당하는 경우, 회사는 회원자격을
                제한 및 정지시킬 수 있습니다:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>가입 신청 시 허위 내용을 등록한 경우</li>
                  <li>다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등 전자상거래 질서를 위협하는 경우</li>
                  <li>서비스를 이용하여 법령 또는 본 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
                </ul>
              </li>
            </ul>
          </section>

          <section className="pt-8 border-t border-gray-100 dark:border-gray-800">
            <h2 className="text-xl md:text-2xl mb-4">부칙</h2>
            <p>
              본 약관은 2024년 11월 15일부터 시행됩니다.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            약관에 대한 문의사항이 있으신 경우{' '}
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
