// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
    navLinks.style.display = open ? 'flex' : '';
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navLinks.style.display = '';
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('is-visible'));
}

// Match the hero rule's width to the rendered tagline text below it
const heroRule = document.querySelector('.hero-rule');
const heroTagline = document.querySelector('.hero-tagline');
if (heroRule && heroTagline) {
  const syncRuleWidth = () => {
    heroRule.style.width = heroTagline.offsetWidth + 'px';
  };
  syncRuleWidth();
  window.addEventListener('resize', syncRuleWidth);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncRuleWidth);
  }
}

// Gallery & Signage tickers — continuous one-directional loop (two identical
// tracks; the second picks up exactly where the first ends, so it reads as
// an unbroken circle rather than a start-to-end-and-back oscillation).
// Pauses on hover via CSS. Skipped entirely for prefers-reduced-motion.
const tickerReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const TICKER_PX_PER_SECOND = 65;

const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const setupTicker = (ticker) => {
  const track = ticker.querySelector('.ticker-track');
  const wrap = ticker.parentElement;
  if (!track || !wrap) return;

  // getBoundingClientRect gives a sub-pixel-accurate width; scrollWidth
  // rounds to the nearest integer, which can leave a 1px seam/stutter at
  // the loop point since the animation travels exactly -100% of the track.
  const measure = () => {
    const trackWidth = track.getBoundingClientRect().width;
    if (tickerReduceMotion) {
      ticker.classList.remove('is-animating');
      return;
    }
    ticker.style.setProperty('--ticker-duration', `${trackWidth / TICKER_PX_PER_SECOND}s`);
    ticker.classList.add('is-animating');
  };

  measure();
  window.addEventListener('resize', debounce(measure, 150));
  ticker.querySelectorAll('img').forEach((img) => {
    if (!img.complete) img.addEventListener('load', measure, { once: true });
  });
};

['galleryTicker', 'signageTicker'].forEach((id) => {
  const ticker = document.getElementById(id);
  if (ticker) setupTicker(ticker);
});

// Inquiry form — submits to Formspree once index.html's form action has a
// real form ID; falls back to a demo message if it still says YOUR_FORM_ID.
const form = document.getElementById('inquiryForm');
const status = document.getElementById('formStatus');
if (form) {
  const isConfigured = !form.action.includes('YOUR_FORM_ID');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot: real visitors never fill this hidden field, bots often do
    const honeypot = form.querySelector('#website');
    if (honeypot && honeypot.value) {
      return;
    }

    if (!isConfigured) {
      status.textContent = 'Thanks — this is a demo form. Connect it to Formspree/Resend/your inbox to go live.';
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    status.textContent = 'Sending…';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        status.textContent = "Thanks — we'll follow up within a day.";
        form.reset();
      } else {
        status.textContent = 'Something went wrong — please email us directly at goodmeasurebarco@gmail.com.';
      }
    } catch (err) {
      status.textContent = 'Something went wrong — please email us directly at goodmeasurebarco@gmail.com.';
    } finally {
      submitBtn.disabled = false;
    }
  });
}
