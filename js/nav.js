// ══════════════════════════════════════════════════════════
// NAV
// ══════════════════════════════════════════════════════════
function showTab(name) {
  ['strategy','hypothesis','roadmap','office'].forEach(t =>
    document.getElementById('tab-'+t).classList.add('hidden'));
  document.getElementById('tab-'+name).classList.remove('hidden');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const tabs = ['strategy','hypothesis','roadmap','office'];
  document.querySelectorAll('.nav-btn')[tabs.indexOf(name)].classList.add('active');
  if (name === 'office') runAIOffice();
}
