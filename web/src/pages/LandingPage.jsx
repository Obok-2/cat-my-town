import { useState } from 'react';
import brandMark from '../assets/brand-mark.png';
import catArt from '../assets/registration-complete-cat.png';
import levelArt from '../assets/level-up-cat.png';
import '../styles/landing.css';

const steps = [
  { number: '01', title: '반가운 순간을 찍어요', text: '산책길에 고양이를 만났다면, 조금 떨어진 곳에서 조용히 사진 한 장.' },
  { number: '02', title: '우리, 만난 적 있나요?', text: 'AI가 내 도감 속 닮은 고양이를 찾아줘요. 같은 친구인지는 직접 확인해요.' },
  { number: '03', title: '이야기를 한 장 더해요', text: '처음 만났다면 이름을, 다시 만났다면 오늘의 기록을. 나만의 도감이 쌓여요.' },
];
const questions = [
  ['어떤 앱인가요?', '산책하며 만난 고양이의 사진과 이름, 목격 기록을 모으는 개인용 고양이 다이어리예요. 처음 만난 친구와 다시 만난 친구의 이야기를 나만의 도감에 담을 수 있어요.'],
  ['다른 사람에게 내 기록이 보이나요?', '내가 만난 고양이와 쌓아온 이야기는 다른 사용자에게 공개되지 않아요. 고양이 사진과 목격 위치도 나의 개인 도감에 기록돼요.'],
  ['AI가 같은 고양이인지 정확히 알아보나요?', 'AI는 내 사진 기록에서 닮은 고양이를 후보로 제안해요. 무늬나 촬영 각도에 따라 틀릴 수 있어, 같은 고양이인지 마지막 선택은 사용자가 해요.'],
  ['지금 다운로드할 수 있나요?', '지금은 정식 출시를 준비하고 있어요. 다운로드가 가능해지면 이 페이지에서 안내할게요.'],
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function Preview() {
  const [tab, setTab] = useState('collection');
  return (
    <div className="lp-phone" aria-label="앱 기능 소개용 예시">
      <div className="lp-phone-top"><span>9:41</span><span aria-hidden="true">● ● ▰</span></div>
      <div className="lp-phone-heading"><span>나의 작은 동네</span><img src={brandMark} alt="" /></div>
      <div className="lp-preview-tabs" role="group" aria-label="앱 미리보기 선택">
        <button id="collection-tab" type="button" aria-pressed={tab === 'collection'} aria-controls="preview-panel" onClick={() => setTab('collection')}>나의 도감</button>
        <button id="record-tab" type="button" aria-pressed={tab === 'record'} aria-controls="preview-panel" onClick={() => setTab('record')}>목격 기록</button>
      </div>
      <div id="preview-panel" role="region" aria-labelledby={tab === 'collection' ? 'collection-tab' : 'record-tab'}>
        {tab === 'collection' ? <>
          <div className="lp-level"><span>Lv. 2 동네 탐정</span><strong>조금씩 친해지는 중</strong><div><i /></div></div>
          <div className="lp-cat-grid">
            {[['치즈', catArt, '살금살금, 첫 만남'], ['나비', brandMark, '다시 만나 반가워'], ['콩이', levelArt, '골목에서 만난 친구'], ['다음 친구는?', null, '어디서 만나게 될까']].map(([name, src, note]) => (
              <div className={`lp-cat-card${!src ? ' lp-cat-empty' : ''}`} key={name}>
                {src ? <img src={src} alt="" /> : <span aria-hidden="true">?</span>}
                <strong>{name}</strong><small>{note}</small>
              </div>
            ))}
          </div>
        </> : <div className="lp-record">
          <img src={catArt} alt="기록 예시의 고양이 일러스트" />
          <h3>치즈와의 두 번째 만남</h3>
          <p>햇볕 좋은 골목 모퉁이.<br />오늘도 늘 그 자리에서 낮잠을 자고 있었어요.</p>
          <span>치즈무늬 · 골목 산책</span>
          <div className="lp-record-line">첫 만남 <i /> 다시 만난 오늘</div>
        </div>}
      </div>
      <p className="lp-preview-note">서비스 이해를 돕기 위한 예시 화면</p>
      <div className="lp-home-indicator" />
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="lp" id="top">
      <a className="lp-skip" href="#main">본문으로 바로가기</a>
      <header className="lp-header">
        <a className="lp-brand" href="/" aria-label="우리동네고양이 홈"><img src={brandMark} alt="" />우리동네고양이<span>CAT MY TOWN</span></a>
        <nav aria-label="주요 메뉴"><a href="#features">앱 소개</a><a href="#how-it-works">사용 방법</a><a href="#faq">궁금한 점</a></nav>
        <a className="lp-nav-cta" href="#download">출시 안내 <Arrow /></a>
      </header>

      <main id="main">
        <section className="lp-hero lp-container" aria-labelledby="hero-title">
          <div className="lp-hero-copy">
            <p className="lp-eyebrow"><span /> 산책길의 작은 발견을 모아요</p>
            <h1 id="hero-title">평범한 산책이<br /><em>고양이 도감</em>이<br />되는 순간.</h1>
            <p className="lp-lead">어제 그 골목에서 만난 고양이, 오늘도 만났나요?<br />스쳐 지나간 인연을 사진으로 담고<br />나만의 동네 이야기를 만들어가요.</p>
            <div className="lp-actions"><a className="lp-button" href="#download">우리동네고양이 만나보기 <Arrow /></a><a className="lp-text-link" href="#how-it-works">어떻게 기록하나요? <span aria-hidden="true">↓</span></a></div>
            <div className="lp-hero-note"><img src={brandMark} alt="" /><span>한 번의 만남도, 여러 번의 안부도.<br /><strong>오롯이 나만을 위한 고양이 기록장.</strong></span></div>
          </div>
          <div className="lp-hero-art">
            <div className="lp-orbit" aria-hidden="true" />
            <span className="lp-art-caption">오늘도, 반가워!</span>
            <Preview />
            <div className="lp-sticker"><img src={brandMark} alt="" /><span>새로운 친구 발견!<small>우리 동네가 조금 더 특별해졌어요</small></span></div>
            <span className="lp-art-star" aria-hidden="true">✳</span>
          </div>
        </section>

        <div className="lp-ribbon"><span>작은 만남</span><i>✳</i><span>다정한 기록</span><i>✳</i><span>나만의 도감</span><i>✳</i><span>조금 특별한 산책</span></div>

        <section className="lp-container lp-section" id="features" aria-labelledby="features-title">
          <div className="lp-section-heading"><p className="lp-eyebrow">A LITTLE MORE SPECIAL</p><h2 id="features-title">같은 길을 걸어도,<br />새로운 이야기가 생겨요.</h2><p>이름 없던 골목의 친구들이<br />하나둘, 기억하고 싶은 얼굴이 되는 일.</p></div>
          <div className="lp-features">
            <article className="lp-feature lp-feature-large"><div><span className="lp-label">01 / 나만의 도감</span><h3>만날수록 쌓이는<br />우리 동네의 얼굴들.</h3><p>내가 만난 고양이와 쌓아온 이야기는<br />다른 사용자에게 공개되지 않아요.</p></div><img src={catArt} alt="새로운 만남을 기념하는 고양이 일러스트" /><span className="lp-feature-tag">안녕, 오늘부터 너는 치즈야!</span></article>
            <article className="lp-feature lp-feature-match"><span className="lp-label">02 / AI 매칭</span><div className="lp-match-art" aria-hidden="true"><img src={brandMark} alt="" /><span>···</span><img src={brandMark} alt="" /></div><h3>어디서 본 것 같은데?</h3><p>AI가 내 기록에서 닮은 친구를 찾아줘요.<br />같은 고양이인지 마지막 확인은 내가 직접.</p></article>
            <article className="lp-feature lp-feature-record"><span className="lp-label">03 / 목격 타임라인</span><div className="lp-timeline" aria-hidden="true"><span>첫 만남</span><i /><span>두 번째 안부</span><i /><span>오늘</span></div><h3>다시 만나면, 한 장 더.</h3><p>사진과 메모, 만났던 장소까지.<br />따로 흩어져 있던 기억을 하나의 이야기로.</p></article>
          </div>
        </section>

        <section className="lp-how" id="how-it-works" aria-labelledby="how-title"><div className="lp-container"><div className="lp-section-heading"><p className="lp-eyebrow">YOUR FIRST CAT STORY</p><h2 id="how-title">시작은 사진 한 장이면 충분해요.</h2></div><div className="lp-steps">{steps.map((step) => <article key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div><p className="lp-kind-note">고양이의 하루를 방해하지 않도록, 편안한 거리에서 조용히 기록해주세요.</p></div></section>

        <section className="lp-container lp-growth"><div className="lp-growth-art"><img src={levelArt} alt="깃발을 들고 있는 고양이 일러스트" /></div><div><p className="lp-eyebrow">ONE CAT AT A TIME</p><h2>고양이를 알아가는 만큼,<br />나의 산책도 자라나요.</h2><p>첫 만남의 설렘부터 익숙한 골목의 반가움까지.<br />새로운 친구를 기록하며 도감을 채우고,<br />한 단계씩 성장하는 재미를 만나보세요.</p><a className="lp-text-link" href="#download">나의 첫 도감 시작하기 <Arrow /></a></div></section>

        <section className="lp-container lp-faq" id="faq" aria-labelledby="faq-title"><div><p className="lp-eyebrow">BEFORE WE MEET</p><h2 id="faq-title">궁금한 게<br />있으신가요?</h2><img src={brandMark} alt="" /></div><div className="lp-questions">{questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>

        <section className="lp-download" id="download" aria-labelledby="download-title"><div className="lp-container"><span className="lp-coming">COMING SOON · 출시 준비 중</span><h2 id="download-title">다음 산책에서,<br />우리 만나요.</h2><p>조금 더 다정한 산책을 위한 앱.<br />정식 출시 후 이곳에서 다운로드 링크를 안내할게요.</p><div className="lp-store-status"><span>iOS · 준비 중</span><span>Android · 준비 중</span></div><a href="#top">처음으로 돌아가기 ↑</a></div></section>
      </main>
      <footer className="lp-footer lp-container"><a className="lp-brand" href="/"><img src={brandMark} alt="" />우리동네고양이</a><p>© 2026 Obok-2. All rights reserved.</p><a className="lp-privacy-link" href="/privacy">개인정보 처리 안내</a><a href="/admin">관리자</a></footer>
    </div>
  );
}
