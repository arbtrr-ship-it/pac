// ══════════════════════════════════════════════════════════
// RESET
// ══════════════════════════════════════════════════════════
function resetAll() {
  product=null; strategy=null; strategyVersions=[]; stratHyps=[]; currentAnalysis=null;
  roadmap={now:[],next:[],later:[],reject:[]}; history=[];
  pasScore=0;
  document.getElementById('pasVal').textContent='—';
  document.getElementById('pasBar').style.width='0%';
  document.getElementById('hypText').value='';
  document.getElementById('analysisResult').classList.add('hidden');
  document.getElementById('stratVersions').classList.add('hidden');
  document.getElementById('snapshotBlock').classList.add('hidden');
  document.getElementById('stratStep1').classList.remove('hidden');
  document.getElementById('stratStep2').classList.add('hidden');
  document.getElementById('stratStep3').classList.add('hidden');
  setStep(1);
  renderRoadmap(); renderHistory(); renderStratHyps();
  showTab('strategy');
}

// Init
renderRoadmap();
renderStratHyps();
