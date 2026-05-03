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

/* ─── Load testimonials from database ─── */
async function loadTestimonials() {
  try {
    const res  = await fetch('/api/testimonials');
    const data = await res.json();
    if (!data.success || !data.data || data.data.length === 0) return;

    const track = document.getElementById('testimonialTrack');
    if (!track) return;

    const cards = data.data.map(t => `
      <div class="t-card">
        <div class="t-stars"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
        <p class="t-quote">"${t.quote}"</p>
        <div class="t-author">
          <div class="t-avatar" style="background:${t.color}">${t.initials}</div>
          <div>
            <div class="t-name">${t.name}</div>
            <div class="t-role">${t.role}${t.company ? ', ' + t.company : ''}</div>
          </div>
        </div>
      </div>
    `).join('');

    // Duplicate for infinite scroll
    track.innerHTML = cards + cards;

  } catch (err) {
    console.log('Using default testimonials');
  }
}

/* ─── Load projects from database ─── */
async function loadProjects() {
  try {
    const res  = await fetch('/api/projects');
    const data = await res.json();
    if (!data.success || !data.data || data.data.length === 0) return;

    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;

    const iconMap = {
      web:       `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3"/></svg>`,
      software:  `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h16.5m0 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5"/></svg>`,
      brand:     `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"/></svg>`,
      marketing: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z"/></svg>`
    };

    const cards = data.data.map((p, i) => {
      const size = i === 0 ? 'proj-card--lg' : i % 3 === 1 ? 'proj-card--md' : 'proj-card--sm';
      const thumb = p.imageData
        ? `<img src="${p.imageData}" alt="${p.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />`
        : `<div class="proj-bg ${p.theme}"></div>
           <div class="proj-icon-center">
             ${iconMap[p.category] || iconMap.web}
             <span class="proj-icon-label">${p.name}</span>
           </div>`;
      return `
        <div class="proj-card ${size}" data-category="${p.category}">
          <div class="proj-thumb">
            ${thumb}
            <div class="proj-hover-overlay"><span class="proj-cta">View Case Study</span></div>
          </div>
          <div class="proj-meta">
            <div class="proj-cat">${p.categoryLabel || p.category}</div>
            <div class="proj-name">${p.name}</div>
            <div class="proj-desc">${p.description}</div>
          </div>
        </div>`;
    }).join('');

    grid.innerHTML = cards;

  } catch (err) {
    console.log('Using default projects');
  }
}

// Run on page load
loadTestimonials();
loadProjects();

