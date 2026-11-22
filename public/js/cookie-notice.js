/* ─── Cookie notice banner ───
   Shows once until the visitor accepts. The choice is kept in
   localStorage so the banner does not keep reappearing. */
(function () {
  var KEY = 'olatech_cookie_notice';
  try {
    if (window.localStorage.getItem(KEY) === 'accepted') return;
  } catch (e) {
    return;
  }

  var css = [
    '.cookie-notice{position:fixed;left:50%;transform:translateX(-50%);bottom:16px;width:min(580px,calc(100% - 32px));z-index:9999;',
    'background:var(--surface-1,#101828);border:1px solid var(--border-1,rgba(255,255,255,0.14));border-radius:14px;',
    'box-shadow:0 18px 50px rgba(0,0,0,0.5);padding:16px 18px;display:flex;align-items:center;gap:14px}',
    '.cookie-notice p{margin:0;font-size:0.85rem;line-height:1.55;color:var(--text-secondary,#a7b0c0)}',
    '.cookie-notice a{color:var(--cobalt-soft,#7aa5ff);text-decoration:underline}',
    '.cookie-notice-btn{flex-shrink:0;background:var(--cobalt,#2563eb);color:#fff;border:none;border-radius:9px;',
    'padding:10px 20px;font-size:0.85rem;font-weight:600;cursor:pointer}',
    '.cookie-notice-btn:hover{opacity:0.9}',
    '@media (max-width:560px){.cookie-notice{flex-direction:column;align-items:stretch}.cookie-notice-btn{width:100%}}'
  ].join('');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var bar = document.createElement('div');
  bar.className = 'cookie-notice';
  bar.setAttribute('role', 'dialog');
  bar.setAttribute('aria-label', 'Cookie notice');
  bar.innerHTML = '<p>We use cookies to understand how visitors use our site and to keep it working properly. Read our <a href="/cookies">Cookie Policy</a>.</p>' +
    '<button type="button" class="cookie-notice-btn">Accept</button>';

  bar.querySelector('.cookie-notice-btn').addEventListener('click', function () {
    try { window.localStorage.setItem(KEY, 'accepted'); } catch (e) {}
    if (bar.parentNode) bar.parentNode.removeChild(bar);
  });

  function show() { document.body.appendChild(bar); }
  if (document.body) show();
  else document.addEventListener('DOMContentLoaded', show);
})();
