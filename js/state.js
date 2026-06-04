// ══════════════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════════════
let product = null;
let strategyVersions = []; // array of strategy snapshots
let strategy = null;       // current active strategy
let stratHyps = [];        // strategic hypotheses
let currentAnalysis = null;
let roadmap = { now:[], next:[], later:[], reject:[] };
let history = [];
let dragId = null;
let pasScore = 0;
window._hypSuggestions = [];
