// ══════════════════════════════════════════════════════════
// NAV
// ══════════════════════════════════════════════════════════
const NAV_TABS = ['strategy','hypothesis','roadmap','office'];

function showTab(name) {
  NAV_TABS.forEach(t =>
    document.getElementById('tab-'+t).classList.add('hidden'));
  document.getElementById('tab-'+name).classList.remove('hidden');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.nav-btn')[NAV_TABS.indexOf(name)].classList.add('active');
  if (name === 'office') runAIOffice();
}

function isNavShortcutBlocked() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return el.isContentEditable;
}

function handleNavKeydown(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (isNavShortcutBlocked()) return;
  const idx = parseInt(e.key, 10) - 1;
  if (idx < 0 || idx >= NAV_TABS.length) return;
  e.preventDefault();
  showTab(NAV_TABS[idx]);
}

document.addEventListener('keydown', handleNavKeydown);
