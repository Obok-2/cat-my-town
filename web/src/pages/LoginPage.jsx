import { useState } from 'react';
import { login } from '../auth.js';
import brandMark from '../assets/brand-mark.png';
import '../styles/login.css';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = login({ email, password, remember });
    if (result.ok) {
      onLogin();
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div className="login">
      <aside className="login__intro">
        <div className="brand login__brand">
          <img className="brand__mark" src={brandMark} alt="" />
          <span>
            우리동네고양이 <small>ADMIN</small>
          </span>
        </div>

        <div className="login__pitch">
          <img className="login__art" src={brandMark} alt="우리동네고양이 고양이 마크" />
          <h1 className="login__headline">
            기록이 쌓이는 만큼
            <br />
            동네가 보입니다
          </h1>
          <p className="login__desc">
            사용자 개인 기록은 열람하지 않으며, 대시보드에는 익명 집계 지표만 표시됩니다.
          </p>
        </div>

        <div className="login__version">v1.4.0 · internal use only</div>
      </aside>

      <main className="login__form-wrap">
        <form className="login__form" onSubmit={handleSubmit} noValidate>
          <div className="login__form-head">
            <h2>로그인</h2>
            <p>발급받은 운영자 계정으로 접속하세요</p>
          </div>

          <label className="field">
            <span className="field__label">이메일</span>
            <input
              className="field__input"
              type="email"
              autoComplete="username"
              placeholder="admin@nabicat.kr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">비밀번호</span>
            <span className="field__input field__input--password">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? '숨기기' : '보기'}
              </button>
            </span>
          </label>

          <div className="login__options">
            <label className="login__remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              이 브라우저 기억하기
            </label>
            <button
              type="button"
              className="login__link"
              onClick={() => setMessage('비밀번호 재설정은 아직 준비 중입니다. 운영팀에 문의하세요.')}
            >
              비밀번호 재설정
            </button>
          </div>

          {message && (
            <p className="login__message" role="alert">
              {message}
            </p>
          )}

          <button type="submit" className="btn-primary">
            로그인
          </button>

          <p className="login__note">
            계정 발급은 내부 운영팀에 요청하세요. 이 화면에는 회원가입이 없습니다.
          </p>
          <a className="login__link" href="/">앱 소개 사이트로 돌아가기</a>
        </form>
      </main>
    </div>
  );
}
