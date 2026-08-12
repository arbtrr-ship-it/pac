// ══════════════════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════════════════
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function fmtDate(d) { return d.toLocaleDateString('ru-RU',{day:'2-digit',month:'short'})+' '+d.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}); }

const ZONES      = ['now','next','later','reject'];
const ZONE_LABEL = { now:'Now', next:'Next', later:'Later', reject:'Reject' };
const ZONE_CLASS  = { now:'verdict-now', next:'verdict-next', later:'verdict-later', reject:'verdict-reject' };
const DOT_CLASS   = { now:'dot-now', next:'dot-next', later:'dot-later', reject:'dot-reject' };

const TRUNC_CARD  = 65;
const TRUNC_HIST  = 80;
const TRUNC_MODAL = 90;
