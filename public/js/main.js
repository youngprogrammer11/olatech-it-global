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

function startCounters() {
  document.querySelectorAll('[data-count]').forEach(el => countObs.observe(el));
}

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

const style = document.createElement('style');
style.textContent = `
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  #portfolioGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  #portfolioGrid .proj-card { grid-column: span 1; cursor: pointer; }
  #portfolioGrid .proj-card:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.6); border-color: rgba(255,255,255,0.16) !important; }
  #portfolioGrid .proj-card .proj-thumb { position: relative; aspect-ratio: 16/10; overflow: hidden; }
  @media (max-width: 1100px) {
    #portfolioGrid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 768px) {
    #portfolioGrid { grid-template-columns: 1fr !important; }
    #portfolioGrid .proj-card { grid-column: span 1 !important; }
  }
`;
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

    // Need at least 3 cards for seamless infinite scroll, otherwise just show them static
    if (data.data.length >= 3) {
      track.innerHTML = cards + cards;
    } else {
      track.innerHTML = cards;
      track.style.animation = 'none';
      track.style.flexWrap = 'wrap';
      track.style.width = 'auto';
      track.style.padding = '0 32px';
    }

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
      const thumb = p.imageData
        ? `<img src="${p.imageData}" alt="${p.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />`
        : `<div class="proj-bg ${p.theme}"></div>
           <div class="proj-icon-center">
             ${iconMap[p.category] || iconMap.web}
             <span class="proj-icon-label">${p.name}</span>
           </div>`;
      return `
        <div class="proj-card" data-category="${p.category}" style="border-radius:20px;overflow:hidden;background:var(--surface-1);border:1px solid var(--border-1);transition:transform 0.4s,box-shadow 0.4s,border-color 0.3s">
          <div class="proj-thumb" style="position:relative;aspect-ratio:16/10;overflow:hidden">
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
loadPricing();
loadAboutPhoto();
loadHeroStats();

/* ─── Load hero stats from database ─── */
async function loadHeroStats() {
  const statMap = [
    { key: 'statProjects',     fallback: '150', selectors: ['[data-count="150"]'] },
    { key: 'statSatisfaction', fallback: '98',  selectors: ['[data-count="98"]']  },
    { key: 'statCountries',    fallback: '12',  selectors: ['[data-count="12"]']  },
    { key: 'statYears',        fallback: '8',   selectors: ['[data-count="8"]']   },
  ];

  for (const s of statMap) {
    try {
      const res  = await fetch(`/api/settings/${s.key}`);
      const data = await res.json();
      if (data.success && data.data && data.data.value) {
        // Update all elements that had the old fallback value
        document.querySelectorAll('[data-count]').forEach(el => {
          if (el.dataset.count === s.fallback) {
            el.dataset.count = data.data.value;
          }
        });
      }
    } catch (err) {}
  }

  // Now start the counters after all values are updated
  startCounters();
}

/* ─── Load about photo from database ─── */
async function loadAboutPhoto() {
  try {
    const res  = await fetch('/api/settings/aboutPhoto');
    const data = await res.json();
    if (data.success && data.data && data.data.value) {
      const imgEl      = document.getElementById('aboutPhoto');
      const placeholder = document.getElementById('aboutPlaceholder');
      if (imgEl && placeholder) {
        imgEl.src          = data.data.value;
        imgEl.style.display = 'block';
        placeholder.style.display = 'none';
      }
    }
  } catch (err) {
    console.log('No about photo set');
  }
}

/* ─── Load pricing from database ─── */
async function loadPricing() {
  try {
    const res  = await fetch('/api/pricing');
    const data = await res.json();
    if (!data.success || !data.data || data.data.length === 0) {
      document.getElementById('pricingGrid').innerHTML =
        `<div style="text-align:center;padding:60px;color:var(--text-tertiary);grid-column:span 3;font-size:0.9rem">No pricing added yet. Add prices from your admin panel.</div>`;
      return;
    }

    const cols = data.data.length === 1 ? 1 : data.data.length === 2 ? 2 : 3;
    document.getElementById('pricingGrid').style.gridTemplateColumns = `repeat(${Math.min(cols, 3)}, 1fr)`;

    document.getElementById('pricingGrid').innerHTML = data.data.map(p => `
      <div style="
        background: ${p.highlighted ? 'linear-gradient(145deg, rgba(37,99,235,0.15), rgba(56,189,248,0.08))' : 'var(--surface-1)'};
        border: 1px solid ${p.highlighted ? 'rgba(37,99,235,0.4)' : 'var(--border-1)'};
        border-radius: 20px;
        padding: 36px 32px;
        position: relative;
        transition: transform 0.3s, box-shadow 0.3s;
      " onmouseenter="this.style.transform='translateY(-4px)';this.style.boxShadow='0 20px 60px rgba(0,0,0,0.4)'"
         onmouseleave="this.style.transform='';this.style.boxShadow=''">
        ${p.highlighted ? `<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--cobalt);color:#fff;font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:5px 16px;border-radius:100px">Most Popular</div>` : ''}
        <div style="font-size:0.8rem;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px">${p.service}</div>
        <div style="font-size:2.4rem;font-weight:800;letter-spacing:-0.03em;color:var(--text-primary);line-height:1;margin-bottom:4px">${p.price}</div>
        <div style="font-size:0.8rem;color:var(--text-tertiary);margin-bottom:20px">per ${p.period || 'project'}</div>
        ${p.description ? `<p style="font-size:0.875rem;color:var(--text-secondary);line-height:1.7;margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid var(--border-1)">${p.description}</p>` : ''}
        ${p.features && p.features.length ? `
          <ul style="list-style:none;display:flex;flex-direction:column;gap:12px;margin-bottom:32px">
            ${p.features.map(f => `
              <li style="display:flex;align-items:flex-start;gap:10px;font-size:0.855rem;color:var(--text-secondary)">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px;color:#22c55e;flex-shrink:0;margin-top:2px"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                ${f}
              </li>`).join('')}
          </ul>` : ''}
        <a href="#contact" style="display:block;text-align:center;padding:13px;border-radius:10px;font-size:0.875rem;font-weight:700;text-decoration:none;transition:all 0.25s;background:${p.highlighted ? 'var(--cobalt)' : 'var(--surface-2)'};color:${p.highlighted ? '#fff' : 'var(--text-secondary)'};border:1px solid ${p.highlighted ? 'var(--cobalt)' : 'var(--border-2)'}">
          Get Started
        </a>
      </div>
    `).join('');
  } catch (err) {
    console.log('Pricing load error:', err);
  }
}

