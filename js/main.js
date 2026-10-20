const WEDDING_DATE = new Date("2026-11-21T17:00:00+03:00");
const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

function resetInitialScroll() {
  if (qs('#hero')?.classList.contains('invite-open')) return;
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }
}

function lockInitialTop() {
  if (window.location.hash) return;
  resetInitialScroll();
  [50, 150, 400, 900].forEach((delay) => {
    window.setTimeout(resetInitialScroll, delay);
  });
}

function applyArtboardScale() {
  const viewportWidth = window.innerWidth;
  const isMobileLayout = viewportWidth < 640;

  qsa('.pixel-block.mobile-record').forEach((section) => {
    const artboard = qs('.z-artboard', section);
    if (!artboard || !isMobileLayout) return;

    const designWidth = 320;
    const designHeight = Number(
      artboard.getAttribute('data-artboard-height-res-320') ||
      artboard.getAttribute('data-artboard-height')
    );
    const scale = viewportWidth / designWidth;
    let scaledHeight = Math.floor(designHeight * scale);
    if (designHeight === 790 && viewportWidth > 320 && viewportWidth < 400) {
      scaledHeight += 1;
    }
    const carrier = qs('.z-carrier', artboard);
    const filter = qs('.z-filter', artboard);

    section.style.setProperty('height', `${scaledHeight}px`, 'important');
    artboard.style.setProperty('width', `${designWidth}px`, 'important');
    artboard.style.setProperty('height', `${designHeight}px`, 'important');
    artboard.style.setProperty('zoom', String(scale));

    [carrier, filter].forEach((layer) => {
      if (!layer) return;
      layer.style.setProperty('width', `${designWidth}px`, 'important');
      layer.style.setProperty('height', `${designHeight}px`, 'important');
    });
  });
}

function initReveal() {
  const items = qsa(".reveal");
  const groups = new Map();

  items.forEach((item) => {
    item.classList.remove('is-visible');
    item.style.setProperty('--reveal-duration', `${item.dataset.animateDuration || 1.5}s`);
    item.style.setProperty('--reveal-distance', `${item.dataset.animateDistance || 100}px`);
    const section = item.closest('.pixel-block') || item.parentElement;
    const group = groups.get(section) || [];
    group.push(item);
    groups.set(section, group);
  });

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        groups.get(entry.target)?.forEach((item) => item.classList.add('is-visible'));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });

  groups.forEach((group, section) => observer.observe(section));
}

function initOpenButton() {
  const hero = qs('#hero');
  const openers = [
    qs('[data-elem-id="1783401092945000003"]'),
    qs('[data-elem-id="1783401092946000004"]')
  ].filter(Boolean);

  if (!hero || !openers.length) return;

  const openInvitation = () => {
    if (hero.classList.contains('invite-open')) return;
    hero.classList.add('invite-open');
    document.body.classList.remove('locked');
    qs('#background-music')?.play().catch(() => {});
  };

  openers.forEach((opener) => {
    opener.setAttribute('role', 'button');
    opener.setAttribute('tabindex', '0');
    opener.setAttribute('aria-label', 'Открыть приглашение');
    opener.addEventListener('click', openInvitation);
    opener.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openInvitation();
      }
    });
  });
}

function initAudio() {
  const audio = qs('#background-music');
  if (!audio) return;
  audio.volume = 0.4;
  audio.play().catch(() => {});
}

function getPlural(value, one, few, many) {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function initCountdown() {
  const output = qs(".zero-timer .z-atom") || qs(".countdown");
  if (!output) return;

  const render = () => {
    const now = new Date();
    const remaining = Math.max(0, WEDDING_DATE.getTime() - now.getTime());
    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (value) => String(value).padStart(2, "0");

    output.textContent = `${days} : ${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
  };

  render();
  window.setInterval(render, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add('locked');
  applyArtboardScale();
  lockInitialTop();
  initReveal();
  initOpenButton();
  initAudio();
  initCountdown();
});

window.addEventListener("load", () => {
  applyArtboardScale();
  lockInitialTop();
});
window.addEventListener("pageshow", lockInitialTop);
window.addEventListener('resize', applyArtboardScale);
