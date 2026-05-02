'use strict';

/* ─── Navbar scroll ─── */
const navbar = document.getElementById('navbar');
const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
window.addEventListener('scroll', onScroll, { passive: true });

/* ─── Active nav link ─── */
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

const trackActive = () => {
  const y = window.scrollY + 120;
  sections.forEach(sec => {
    if (y >= sec.offsetTop && y < sec.offsetTop + sec.offsetHeight) {
      const id = sec.id;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
    }
  });
};
window.addEventListener('scroll', trackActive, { passive: true });

/* ─── Mobile menu ─── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

function closeMobile() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

/* ─── Scroll reveal ─── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in');
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ─── Counter animation ─── */
const easeOutExpo = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

const animateCount = (el) => {
  const target   = parseInt(el.dataset.count, 10);
  const duration = 2000;
  const start    = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(easeOutExpo(p) * target) + (el.dataset.suffix || '');
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target + (el.dataset.suffix || '');
  };
  requestAnimationFrame(tick);
};

const countObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      countObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => countObs.observe(el));

/* ─── Portfolio filter ─── */
const filterBtns   = document.querySelectorAll('.f-btn');
const projectCards = document.querySelectorAll('.proj-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    projectCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.style.transition = 'opacity 0.3s, transform 0.3s';
      if (match) {
        card.style.opacity       = '1';
        card.style.transform     = '';
        card.style.pointerEvents = '';
        card.style.display       = '';
      } else {
        card.style.opacity       = '0';
        card.style.transform     = 'scale(0.95)';
        card.style.pointerEvents = 'none';
        setTimeout(() => {
          if (btn.classList.contains('active') && card.dataset.category !== btn.dataset.filter && btn.dataset.filter !== 'all') {
            card.style.display = 'none';
          }
        }, 300);
      }
    });
  });
});

/* ─── Subtle parallax on hero orbs ─── */
const orb1 = document.querySelector('.orb-1');
const orb2 = document.querySelector('.orb-2');
if (orb1 && orb2) {
  let rafId;
  document.addEventListener('mousemove', (e) => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 24;
      const y = (e.clientY / window.innerHeight - 0.5) * 16;
      orb1.style.transform = `translate(${x}px, ${y}px)`;
      orb2.style.transform = `translate(${-x * 0.5}px, ${-y * 0.5}px)`;
    });
  });
}

/* ─── Smooth scroll ─── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    closeMobile();
    setTimeout(() => {
      window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    }, 50);
  });
});

/* ─── Contact form ─── */
const form      = document.getElementById('contactForm');
const statusEl  = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

const showStatus = (type, msg) => {
  statusEl.textContent = msg;
  statusEl.className   = `form-status ${type}`;
  statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  setTimeout(() => { statusEl.className = 'form-status'; statusEl.textContent = ''; }, 7000);
};

const setLoading = (loading) => {
  submitBtn.disabled = loading;
  submitBtn.innerHTML = loading
    ? `<svg style="animation:spin .8s linear infinite" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="28" stroke-dashoffset="10"/></svg> Sending...`
    : `Send Message <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>`;
};

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const phone   = form.phone.value.trim();
    const service = form.service.value;
    const message = form.message.value.trim();

    if (!name || !email || !message) return showStatus('error', 'Please fill in all required fields.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return showStatus('error', 'Please enter a valid email address.');

    setLoading(true);
    try {
      const res  = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, service, message })
      });
      const data = await res.json();
      if (data.success) {
        showStatus('success', 'Message sent. We will get back to you within 24 hours.');
        form.reset();
      } else {
        showStatus('error', data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      showStatus('error', 'Could not connect. Please email us at info@olatechitglobal.com');
    } finally {
      setLoading(false);
    }
  });
}

/* ─── Year ─── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ─── Spin keyframe ─── */
const style = document.createElement('style');
style.textContent = '@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';
document.head.appendChild(style);

/* ─── Service card tilt (subtle, desktop only) ─── */
if (window.matchMedia('(min-width: 1024px) and (hover: hover)').matches) {
  document.querySelectorAll('.svc-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-4px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
