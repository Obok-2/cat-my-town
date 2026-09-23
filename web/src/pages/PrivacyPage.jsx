import brandMark from '../assets/brand-mark.png';
import '../styles/privacy.css';

export default function PrivacyPage() {
  return (
    <div className="privacy-page">
      <header><a href="/" className="brand"><img className="brand__mark" src={brandMark} alt="" />우리동네고양이</a><a href="/">앱 소개로 돌아가기</a></header>
      <main>
        <p className="privacy-kicker">우리동네고양이 · 2026. 09. 23.</p>
        <h1>개인정보 처리 안내</h1>
        <p className="privacy-intro">우리동네고양이는 나만의 고양이 기록을 위한 앱입니다. 로그인에 필요한 계정 정보와 사용자가 남기는 기록을 어떻게 처리하는지 안내합니다.</p>
        <section><h2>1. 수집하는 계정 정보</h2><p>우리동네고양이는 Google 로그인 시 계정 정보로 Google 이메일과 Google UID(고유 식별자)만 수집합니다.</p><p>수집한 계정 정보는 로그인 인증, 사용자 식별 및 개인 도감 관리에 사용합니다.</p></section>
        <section><h2>2. 사용자가 남기는 기록</h2><ul><li>고양이 사진, 사용자가 지은 고양이 이름, 메모와 특징 태그</li><li>목격 시각과 도감·목격 기록을 연결하기 위한 식별 정보</li><li>위치 권한을 허용한 경우 목격 위치의 위도·경도</li><li>고양이 비교를 위한 사진의 특징 벡터와 매칭 기록</li></ul><p>사용자가 기록한 고양이 사진과 목격 기록(위치 포함)은 다른 사용자에게 공개되지 않습니다.</p><p>이 정보는 개인 도감, 목격 타임라인, 지도와 고양이 후보 비교를 제공하는 데 사용합니다. 사진과 메모에는 사람의 얼굴이나 연락처 등 불필요한 개인정보를 담지 않도록 주의해주세요.</p></section>
        <section><h2>3. 외부 서비스 이용</h2><p>고양이 비교를 위해 사진을 Voyage AI에 전송합니다.</p></section>
      </main>
      <footer>© 2026 Obok-2. All rights reserved.</footer>
    </div>
  );
}
