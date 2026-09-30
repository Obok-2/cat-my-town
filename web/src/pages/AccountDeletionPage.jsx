import brandMark from '../assets/brand-mark.png';
import '../styles/privacy.css';

// 구글 플레이 계정 삭제 정책: 앱을 설치·로그인하지 않은 사람도 이 페이지만으로 삭제를 요청할 수 있어야 한다.
// 로그인된 사용자는 앱의 프로필 화면 "회원 탈퇴" 버튼으로 바로 처리할 수 있다(이 페이지는 그 대체 경로).
const CONTACT_EMAIL = 'ob36985@gmail.com';

export default function AccountDeletionPage() {
  return (
    <div className="privacy-page">
      <header>
        <a href="/" className="brand">
          <img className="brand__mark" src={brandMark} alt="" />
          우리동네고양이
        </a>
        <a href="/">앱 소개로 돌아가기</a>
      </header>
      <main>
        <p className="privacy-kicker">우리동네고양이 · 계정 삭제</p>
        <h1>계정 삭제 요청</h1>
        <p className="privacy-intro">
          앱을 설치했거나 로그인 중이라면 프로필 화면의 "회원 탈퇴" 버튼으로 바로 삭제할 수 있습니다. 앱을
          지웠거나 로그인할 수 없는 경우에는 이 페이지로 요청해주세요.
        </p>
        <section>
          <h2>1. 요청 방법</h2>
          <p>
            가입할 때 사용한 <strong>Google 계정 이메일</strong>과 함께 아래 주소로 삭제를 요청해주세요.
          </p>
          <p>
            <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('계정 삭제 요청')}`}>
              {CONTACT_EMAIL}
            </a>
          </p>
          <p>본인 확인 후 처리해드립니다.</p>
        </section>
        <section>
          <h2>2. 삭제하면 어떻게 되나요</h2>
          <ul>
            <li>계정과 연결된 Google 로그인 정보가 삭제되어, 같은 Google 계정으로는 다시 로그인해도 예전 기록에 접근할 수 없습니다.</li>
            <li>그동안 등록한 고양이 사진·기록은 더 이상 특정 개인과 연결되지 않는 상태로 서버에 남을 수 있습니다.</li>
            <li>완전한 기록 삭제를 원하시면 요청 시 함께 말씀해주세요.</li>
          </ul>
        </section>
      </main>
      <footer>© 2026 Obok-2. All rights reserved.</footer>
    </div>
  );
}
