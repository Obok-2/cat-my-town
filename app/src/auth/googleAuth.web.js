const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_SCRIPT_ID = 'google-identity-services';

const loadGoogleIdentityServices = async () => {
  if (globalThis.google?.accounts?.id) return;

  await new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener('load', resolve, { once: true });
      existingScript.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.addEventListener('load', resolve, { once: true });
    script.addEventListener('error', reject, { once: true });
    document.head.appendChild(script);
  });
};

export const signInWithGoogle = async () => {
  if (!GOOGLE_WEB_CLIENT_ID) throw new Error('Google Client ID가 설정되지 않았습니다.');

  await loadGoogleIdentityServices();

  return new Promise((resolve, reject) => {
    // One Tap은 표시가 생략될 수 있으므로 사용자가 직접 누르는 공식 버튼을 제공한다.
    const dialog = document.createElement('dialog');
    dialog.setAttribute('aria-label', 'Google 로그인');
    Object.assign(dialog.style, {
      border: 'none', borderRadius: '20px', padding: '28px',
      maxWidth: 'calc(100vw - 32px)', boxSizing: 'border-box',
      backgroundColor: '#fff', color: '#222', fontFamily: 'sans-serif',
    });
    const title = document.createElement('h2');
    title.textContent = 'Google 계정으로 로그인';
    title.style.fontSize = '18px';
    title.style.margin = '0 0 20px';
    const buttonContainer = document.createElement('div');
    const hint = document.createElement('p');
    hint.textContent = '아래 버튼을 누르고 계정을 선택해주세요. 창이 열리지 않으면 브라우저의 팝업 차단을 확인해주세요.';
    Object.assign(hint.style, { fontSize: '13px', lineHeight: '1.6', maxWidth: '280px' });
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.textContent = '취소';
    Object.assign(cancelButton.style, { marginTop: '20px', padding: '8px 16px', cursor: 'pointer' });
    dialog.append(title, hint, buttonContainer, cancelButton);

    let settled = false;
    function finish(credential, error) {
      if (settled) return;
      settled = true;
      dialog.close();
      dialog.remove();
      if (error) reject(error);
      else resolve(credential);
    }
    cancelButton.addEventListener('click', () => finish(null));
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      finish(null);
    });
    try {
      globalThis.google.accounts.id.initialize({
        client_id: GOOGLE_WEB_CLIENT_ID,
        ux_mode: 'popup',
        callback: (response) => {
          if (response?.credential) finish(response.credential);
          else finish(null, new Error('Google 로그인 정보를 가져오지 못했습니다.'));
        },
      });
      document.body.appendChild(dialog);
      dialog.showModal();
      globalThis.google.accounts.id.renderButton(buttonContainer, {
        type: 'standard', theme: 'outline', size: 'large',
        text: 'signin_with', shape: 'pill', locale: 'ko',
      });
    } catch (error) {
      finish(null, error);
    }
  });
};

export const signOutFromGoogle = async () => {
  if (!globalThis.google?.accounts?.id) return;
  globalThis.google.accounts.id.disableAutoSelect();
};
