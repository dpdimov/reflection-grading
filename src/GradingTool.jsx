import { useState, useEffect, useRef } from "react";

// ─── CONFIGURATION ───────────────────────────────────────────────────────────

const PILLARS = [
  { id: "metacognitive", label: "Metacognitive Self-Awareness", color: "#2d6a4f", light: "#e8f5e9", max: 30, weight: "30%" },
  { id: "kts", label: "KTS Framework Application", color: "#1b4965", light: "#e3f2fd", max: 25, weight: "25%" },
  { id: "transformation", label: "Cognitive Transformation", color: "#7b2d8e", light: "#f3e5f5", max: 25, weight: "25%" },
  { id: "pathway", label: "Development Pathway", color: "#9e4a1a", light: "#fbe9e7", max: 20, weight: "20%" },
];

const BANDS = [
  { id: "outstanding", label: "Outstanding", range: "85–100%", color: "#1a7a3a" },
  { id: "excellent", label: "Excellent", range: "70–84%", color: "#2d6a4f" },
  { id: "good", label: "Good", range: "60–69%", color: "#1b4965" },
  { id: "satisfactory", label: "Satisfactory", range: "50–59%", color: "#9e7a1a" },
  { id: "unsatisfactory", label: "Unsatisfactory", range: "0–49%", color: "#c1121f" },
];

const INITIAL_CHECKS = [
  { id: "personal", label: "Reads as personal reflection (first-person, genuine voice)" },
  { id: "kts_engage", label: "Engages with KTS framework substantively" },
  { id: "specific_exp", label: "References specific experiences (module experiences or challenge details)" },
  { id: "futures_depth", label: "Addresses futures themes or challenge context with depth" },
  { id: "word_count", label: "Within word count range (~1500 ±10%)" },
  { id: "kts_appendix", label: "Includes KTS assessment appendix" },
];

const PILLAR_CHECKS = {
  metacognitive: [
    { id: "meta_specific", label: "Specific examples from actual experience (not generic)", positive: "Strong use of specific, concrete examples drawn from genuine experience — this grounds the reflection.", negative: "The reflection would benefit from more specific examples from your actual experience rather than generic observations about thinking." },
    { id: "meta_honest", label: "Honest acknowledgment of both growth and resistance", positive: "There is honest acknowledgment of both growth and the resistance encountered along the way.", negative: "Consider acknowledging not just what shifted but also where you experienced resistance or where growth was incomplete." },
    { id: "meta_invisible", label: "Recognition of invisible cognitive habits/defaults", positive: "Good recognition of cognitive habits that normally operate below the surface.", negative: "The reflection stays at the level of visible actions rather than examining the invisible cognitive habits that drive them." },
    { id: "meta_connection", label: "Connection between past experiences and current thinking patterns", positive: "Effective connection between past experiences and how they shaped current thinking patterns.", negative: "The link between prior experiences (career, education) and current cognitive defaults could be drawn more explicitly." },
    { id: "meta_futures", label: "Examines what futures were easy/hard to imagine and why", positive: "Thoughtful examination of which futures came easily and which were harder to imagine — and why.", negative: "Consider which futures you found easy or hard to imagine, and what that reveals about your cognitive defaults." },
    { id: "meta_process", label: "Analyses thinking process, not just description of actions", positive: "The reflection genuinely analyses the thinking process rather than describing actions.", negative: "The writing describes what was done rather than examining the thinking process behind those actions — move from narration to metacognition." },
    { id: "meta_background", label: "Identifies how education/career background shaped cognitive defaults", positive: "Clear identification of how professional and educational background has shaped cognitive defaults.", negative: "How has your career or educational background shaped the cognitive defaults you bring to futures thinking? This context would deepen the reflection." },
  ],
  kts: [
    { id: "kts_dimensions", label: "Accurate understanding of both KTS dimensions demonstrated", positive: "Demonstrates accurate understanding of both KTS dimensions (possibility and uncertainty).", negative: "The KTS framework has two dimensions — possibility (structure ↔ openness) and uncertainty (reason ↔ play) — and both need to be engaged." },
    { id: "kts_lens", label: "Uses KTS as analytical lens, not just self-labelling", positive: "KTS is used as a genuine analytical lens for understanding cognitive patterns — not just a label.", negative: "The KTS framework is mentioned but used primarily as a label rather than an analytical tool for examining specific moments." },
    { id: "kts_demanded", label: "Identifies thinking styles demanded by different situations", positive: "Good identification of which thinking styles different situations demanded.", negative: "Consider what thinking style each situation actually demanded — the gap between demanded and deployed style is where the insight lies." },
    { id: "kts_gaps", label: "Analyses gaps between demanded and deployed styles", positive: "Effective analysis of the gaps between what was demanded and what was actually deployed.", negative: "The reflection would benefit from analysing the gap between the thinking style a situation demanded and the one you actually used." },
    { id: "kts_malleable", label: "Treats thinking style as situational and malleable", positive: "Thinking style is treated as situational and malleable rather than a fixed trait.", negative: "The reflection treats thinking style as relatively fixed — consider how the same person can deploy different styles across different situations." },
    { id: "kts_futures", label: "Connects KTS analysis meaningfully to futures themes", positive: "KTS analysis is meaningfully connected to futures thinking themes.", negative: "The KTS analysis could be more explicitly connected to the futures thinking challenges encountered in the module." },
    { id: "kts_illuminates", label: "KTS illuminates specific difficulties or successes", positive: "The KTS lens illuminates why specific moments were difficult or successful — this is the framework working as intended.", negative: "The KTS framework is applied but doesn't quite illuminate why particular moments were challenging — push the analysis to show what the framework reveals." },
  ],
  transformation: [
    { id: "trans_moves", label: "Specific examples of kinetic moves (style shifts)", positive: "Provides specific, convincing examples of kinetic moves — deliberate shifts between thinking styles.", negative: "The reflection claims cognitive shifts but doesn't provide specific examples of kinetic moves (deliberate style shifts)." },
    { id: "trans_discomfort", label: "Honest description of cognitive discomfort during shifts", positive: "Honest description of the cognitive discomfort experienced during thinking style shifts — this authenticity matters.", negative: "Cognitive transformation involves discomfort — acknowledging this honestly would strengthen the reflection." },
    { id: "trans_emerging", label: "Evidence of new thinking patterns emerging", positive: "There is credible evidence of new thinking patterns beginning to emerge.", negative: "The reflection would benefit from showing what new thinking patterns are actually emerging, not just what was learned about." },
    { id: "trans_enablers", label: "Identifies what enabled or blocked shifts", positive: "Good identification of what enabled or blocked the cognitive shifts.", negative: "Consider what enabled or blocked your cognitive shifts — understanding the mechanisms matters as much as the shifts themselves." },
    { id: "trans_partial", label: "Distinguishes partial from complete shifts honestly", positive: "Honest distinction between partial and complete shifts — this nuanced view is more credible than claiming total transformation.", negative: "The reflection could be more honest about the difference between partial and complete cognitive shifts — claiming full transformation is less credible than acknowledging work in progress." },
    { id: "trans_metacog", label: "Shows understanding of futures mindset as metacognitive capability", positive: "Demonstrates understanding that futures mindset is a metacognitive capability — the ability to notice and shift one's own thinking.", negative: "Futures mindset is a metacognitive capability (the ability to notice and shift one's thinking), not just knowledge about the future — this distinction could be made clearer." },
  ],
  pathway: [
    { id: "path_moves", label: "Specific kinetic moves identified for development", positive: "Identifies specific kinetic moves targeted for further development.", negative: "The development pathway would be stronger with specific kinetic moves identified — which style shifts do you most need to develop?" },
    { id: "path_realistic", label: "Realistic assessment of development challenges", positive: "Realistic assessment of the challenges that development will involve.", negative: "The pathway reads as aspirational without realistic assessment of the difficulties involved in changing cognitive habits." },
    { id: "path_context", label: "Connected to anticipated role/industry/organisational context", positive: "The pathway is grounded in the anticipated professional context — role, industry, organisational setting.", negative: "Consider how your development pathway connects to the specific demands of your role, industry, or organisational context." },
    { id: "path_responsible", label: "Integrates responsible/sustainability-aligned thinking", positive: "Development pathway integrates responsible and sustainability-aligned thinking.", negative: "The pathway could integrate how futures thinking connects to responsible practice and sustainability challenges." },
    { id: "path_concrete", label: "Concrete practices with plausible implementation", positive: "Concrete, implementable practices are identified — this pathway could actually be followed.", negative: "The development practices remain vague — what specifically will you do, how often, and in what contexts?" },
    { id: "path_ongoing", label: "Commitment to ongoing metacognitive practice", positive: "Shows commitment to ongoing metacognitive practice, not just module completion.", negative: "The pathway ends with the module rather than showing commitment to ongoing metacognitive development beyond it." },
  ],
};

const RED_FLAGS = {
  critical: [
    { id: "rf_no_reflection", label: "No genuine self-reflection — describes actions, not thinking", cap: 59 },
    { id: "rf_kts_not_analytical", label: "KTS mentioned but not used analytically", cap: 69 },
    { id: "rf_no_evidence", label: "Claims transformation without specific evidence", cap: 59 },
    { id: "rf_essay_not_reflection", label: "Reads as essay about futures thinking, not personal reflection", cap: 59 },
    { id: "rf_conclusion_mismatch", label: "Conclusion contradicts or doesn't follow from analysis", cap: 69 },
  ],
  moderate: [
    { id: "rf_kts_label", label: "Treats KTS as personality label rather than analytical tool", cap: 84 },
    { id: "rf_generic", label: "Generic examples without specificity from lived experience", cap: 79 },
    { id: "rf_vague_pathway", label: "Development pathway is vague aspirations without concrete plans", cap: 79 },
    { id: "rf_performed", label: "Performed reflection rather than authentic reflection", cap: 74 },
    { id: "rf_no_appendix", label: "Missing KTS appendix", cap: 79 },
  ],
};

const CROSS_PILLAR_CHECKS = [
  { id: "cp_specificity", label: "Specificity over generality throughout" },
  { id: "cp_honesty", label: "Honesty over performance throughout" },
  { id: "cp_analysis", label: "Analysis over description throughout" },
  { id: "cp_integration", label: "Integration across parts (not disconnected sections)" },
  { id: "cp_voice", label: "First-person ownership and authentic voice" },
  { id: "cp_themes", label: "Grounded in module themes" },
  { id: "cp_narrative", label: "Coherent development narrative (start → shifts → pathway)" },
];

const COURSE_OPTIONS = [
  { id: "module_journey", label: "Module Journey (1,500 words)" },
  { id: "challenge_focused", label: "Challenge-Focused (1,500 words)" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getScoreCap(redFlagState) {
  let cap = 100;
  [...RED_FLAGS.critical, ...RED_FLAGS.moderate].forEach((rf) => {
    if (redFlagState[rf.id]) cap = Math.min(cap, rf.cap);
  });
  return cap;
}

function getBand(score) {
  if (score >= 85) return BANDS[0];
  if (score >= 70) return BANDS[1];
  if (score >= 60) return BANDS[2];
  if (score >= 50) return BANDS[3];
  return BANDS[4];
}

function generatePillarFeedback(pillarId, checks) {
  const items = PILLAR_CHECKS[pillarId];
  const positives = [];
  const negatives = [];
  items.forEach((item) => {
    if (checks[item.id]) positives.push(item.positive);
    else negatives.push(item.negative);
  });
  let fb = "";
  if (positives.length > 0) fb += positives.slice(0, 2).join(" ");
  if (negatives.length > 0) {
    if (fb) fb += " However, ";
    else fb += "";
    fb += negatives.slice(0, 2).join(" ");
  }
  return fb || "No specific feedback items selected.";
}

function generateOverallComment(pillarScores, pillarChecks, redFlagState, crossPillarChecks, course) {
  const total = Object.values(pillarScores).reduce((a, b) => a + b, 0);
  const band = getBand(total);
  const cap = getScoreCap(redFlagState);

  // Find strongest and weakest pillars (normalised by max)
  let strongest = null, weakest = null, maxNorm = -1, minNorm = 2;
  PILLARS.forEach((p) => {
    const norm = (pillarScores[p.id] || 0) / p.max;
    if (norm > maxNorm) { maxNorm = norm; strongest = p; }
    if (norm < minNorm) { minNorm = norm; weakest = p; }
  });

  let comment = "";

  if (total >= 85) {
    comment = `This is an exceptional reflection demonstrating genuine metacognitive depth, sophisticated use of the KTS framework, and a compelling development pathway. `;
  } else if (total >= 70) {
    comment = `This is a strong reflection showing real engagement with cognitive self-awareness and meaningful application of the KTS framework. `;
  } else if (total >= 60) {
    comment = `This reflection demonstrates competent self-awareness with evidence of genuine engagement with the module's cognitive challenges. `;
  } else if (total >= 50) {
    comment = `This reflection meets minimum requirements but the analysis stays largely at a descriptive level rather than reaching metacognitive depth. `;
  } else {
    comment = `This submission does not demonstrate sufficient metacognitive engagement — it reads more as description of activities than reflection on thinking processes. `;
  }

  if (strongest && weakest && strongest.id !== weakest.id) {
    comment += `The ${strongest.label.toLowerCase()} section is the strongest`;
    if (maxNorm - minNorm >= 0.2) {
      comment += `, while ${weakest.label.toLowerCase()} would benefit from further development`;
    }
    comment += `. `;
  }

  // Check for "surface" pattern
  const criticalChecks = PILLARS.map((p) => {
    const items = PILLAR_CHECKS[p.id];
    const ticked = items.filter((i) => pillarChecks[i.id]).length;
    return ticked / items.length;
  });
  const avgCritical = criticalChecks.reduce((a, b) => a + b, 0) / criticalChecks.length;
  if (avgCritical < 0.4) {
    comment += `The reflection would benefit from moving beyond description to genuine metacognitive analysis — examine the thinking process, not just the actions taken. `;
  }

  if (cap < 100) {
    comment += `Note: red flag issues limit the maximum achievable mark for this submission. `;
  }

  // Variation-aware context
  if (course === "module_journey") {
    comment += "As a module journey reflection, the three-part structure (starting point → cognitive shifts → development pathway) should provide a coherent retrospective arc with forward projection grounded in module themes.";
  } else {
    comment += "As a challenge-focused reflection, the five-component structure should show authentic engagement with a specific challenge, with metacognitive depth matching the emotional grounding that this variation naturally produces.";
  }

  return comment;
}

function createEmptyState() {
  const pillarChecks = {};
  Object.values(PILLAR_CHECKS).flat().forEach((c) => (pillarChecks[c.id] = false));
  const pillarScores = {};
  PILLARS.forEach((p) => (pillarScores[p.id] = 0));
  const redFlags = {};
  [...RED_FLAGS.critical, ...RED_FLAGS.moderate].forEach((r) => (redFlags[r.id] = false));
  const crossPillar = {};
  CROSS_PILLAR_CHECKS.forEach((c) => (crossPillar[c.id] = false));
  const initialChecks = {};
  INITIAL_CHECKS.forEach((c) => (initialChecks[c.id] = false));
  const pillarFeedback = {};
  PILLARS.forEach((p) => (pillarFeedback[p.id] = ""));
  return {
    studentId: "",
    markerInitials: "",
    course: "module_journey",
    initialChecks,
    initialBand: "",
    pillarChecks,
    pillarScores,
    pillarFeedback,
    redFlags,
    crossPillar,
    crossPillarAdj: "none",
    adjReason: "",
    overallComment: "",
    finalScore: 0,
    finalBand: "",
    holistic: { feelsRight: false, consistent: false, noRedFlags: false, moderation: false },
  };
}

// ─── STORAGE (Vercel KV via API routes) ──────────────────────────────────────

async function loadSavedGrades() {
  try {
    const res = await fetch("/api/grades");
    if (res.ok) return await res.json();
  } catch (e) { /* no data yet */ }
  return [];
}

async function saveGrade(record) {
  const res = await fetch("/api/grades", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });
  return await res.json();
}

async function deleteGrade(index) {
  const res = await fetch(`/api/grades/${index}`, { method: "DELETE" });
  return await res.json();
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function CheckItem({ checked, onChange, label, accent }) {
  return (
    <label style={{
      display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 0",
      cursor: "pointer", fontSize: 14, lineHeight: 1.5, color: "#1a1a1a",
    }}>
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 20, height: 20, minWidth: 20, marginTop: 1,
        borderRadius: 4, border: `1.5px solid ${checked ? (accent || "#2d6a4f") : "#ccc"}`,
        background: checked ? (accent || "#2d6a4f") : "#fff",
        transition: "all 0.15s ease",
      }}>
        {checked && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>✓</span>}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
      <span>{label}</span>
    </label>
  );
}

function ScoreSlider({ value, onChange, color, max = 25, suggestedValue }) {
  // Band boundaries mapped to the 0–max scale
  const bandStops = [
    { pct: 0, color: BANDS[4].color },       // unsatisfactory 0–49%
    { pct: 50, color: BANDS[3].color },       // satisfactory 50–59%
    { pct: 60, color: BANDS[2].color },       // good 60–69%
    { pct: 70, color: BANDS[1].color },       // excellent 70–84%
    { pct: 85, color: BANDS[0].color },       // outstanding 85–100%
  ];
  const bandBg = bandStops.map((s, i) => {
    const next = bandStops[i + 1]?.pct ?? 100;
    return `${s.color}30 ${s.pct}%, ${s.color}30 ${next}%`;
  }).join(", ");

  const pct = (value / max) * 100;
  const fillOverlay = `linear-gradient(to right, ${color} ${pct}%, transparent ${pct}%)`;
  const sugPct = suggestedValue != null ? (suggestedValue / max) * 100 : null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "4px 0" }}>
      <div style={{ flex: 1, position: "relative" }}>
        {/* Band region labels */}
        <div style={{ display: "flex", fontSize: 9, fontWeight: 600, color: "#999", marginBottom: 3, letterSpacing: "0.02em" }}>
          {[
            { label: "Unsatisfactory", pct: 50 },
            { label: "Satisfactory", pct: 10 },
            { label: "Good", pct: 10 },
            { label: "Excellent", pct: 15 },
            { label: "Outstanding", pct: 15 },
          ].map((b) => (
            <span key={b.label} style={{ width: `${b.pct}%`, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {b.label}
            </span>
          ))}
        </div>
        <div style={{ position: "relative", height: 8, borderRadius: 4, overflow: "hidden" }}>
          {/* Band background */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: 4,
            background: `linear-gradient(to right, ${bandBg})`,
          }} />
          {/* Active fill */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: 4,
            background: fillOverlay,
          }} />
          {/* Suggested value marker */}
          {sugPct != null && Math.round(suggestedValue) !== value && (
            <div style={{
              position: "absolute", top: 0, bottom: 0, left: `${sugPct}%`,
              width: 2, background: color, opacity: 0.45, borderRadius: 1,
            }} />
          )}
        </div>
        {/* Actual range input (transparent, overlaid for interaction) */}
        <input type="range" min={0} max={max} value={value} onChange={(e) => onChange(+e.target.value)}
          style={{
            position: "absolute", left: 0, right: 0, bottom: 0, width: "100%",
            height: 8, appearance: "none", background: "transparent",
            outline: "none", cursor: "pointer", margin: 0,
          }} />
      </div>
      <span style={{
        fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 20, fontWeight: 700,
        color, minWidth: 52, textAlign: "right",
      }}>{value}/{max}</span>
    </div>
  );
}

function pillarSuggestedScore(pillarId, checks) {
  const pillar = PILLARS.find((p) => p.id === pillarId);
  const items = PILLAR_CHECKS[pillarId];
  const ticked = items.filter((i) => checks[i.id]).length;
  if (ticked === 0) return 0;
  // Map checkbox ratio to a score: 0 ticks = 0, all ticks maps to ~84% (top of "excellent").
  // This leaves room for the marker to push into "outstanding" manually.
  const ratio = ticked / items.length;
  return Math.round(ratio * pillar.max * 0.84);
}

function PillarSection({ pillar, checks, scores, feedback, onCheckChange, onScoreChange, onFeedbackChange, onGenerate }) {
  const items = PILLAR_CHECKS[pillar.id];
  const tickedCount = items.filter((i) => checks[i.id]).length;
  const suggestedValue = pillarSuggestedScore(pillar.id, checks);

  const handleCheckChange = (itemId) => {
    onCheckChange(itemId);
    // Auto-set slider to suggested value when user hasn't manually adjusted away,
    // or when score is still at default 0
    const currentScore = scores[pillar.id];
    const currentSuggested = suggestedValue;
    // Compute what the new suggestion will be after this toggle
    const willBeChecked = !checks[itemId];
    const newTicked = tickedCount + (willBeChecked ? 1 : -1);
    const newSuggested = Math.round((newTicked / items.length) * pillar.max * 0.84);
    // Auto-set if score matches old suggestion (user hasn't adjusted) or is 0
    if (currentScore === currentSuggested || currentScore === 0) {
      onScoreChange(pillar.id, newSuggested);
    }
  };

  return (
    <div style={{
      background: "#fff", borderRadius: 12, border: "1.5px solid #d5d0c8",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden", marginBottom: 20,
    }}>
      <div style={{
        padding: "14px 20px", background: pillar.color,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <h3 style={{
          margin: 0, fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: 18, fontWeight: 700, color: "#fff",
        }}>{pillar.label} ({pillar.weight})</h3>
        <span style={{
          fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 500,
        }}>{tickedCount}/{items.length} checked</span>
      </div>
      <div style={{ padding: "12px 20px 4px" }}>
        {items.map((item) => (
          <CheckItem key={item.id} checked={checks[item.id]} accent={pillar.color}
            onChange={() => handleCheckChange(item.id)} label={item.label} />
        ))}
      </div>
      <div style={{ padding: "8px 20px 16px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
          Score
        </div>
        <ScoreSlider value={scores[pillar.id]} onChange={(v) => onScoreChange(pillar.id, v)} color={pillar.color} max={pillar.max} suggestedValue={suggestedValue} />
      </div>
      <div style={{ padding: "0 20px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Feedback
          </span>
          <button onClick={() => onGenerate(pillar.id)} style={{
            padding: "3px 10px", borderRadius: 6, border: `1px solid ${pillar.color}40`,
            background: `${pillar.color}10`, color: pillar.color,
            fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>Generate from checks</button>
        </div>
        <textarea value={feedback[pillar.id]} onChange={(e) => onFeedbackChange(pillar.id, e.target.value)}
          rows={3} placeholder="Pillar feedback (strength + improvement)…"
          style={{
            width: "100%", boxSizing: "border-box", border: "1.5px solid #e0dcd4",
            borderRadius: 8, padding: "10px 12px", fontSize: 13, lineHeight: 1.6,
            fontFamily: "'DM Sans', sans-serif", color: "#1a1a1a", resize: "vertical",
            background: "#fafaf7",
          }} />
      </div>
    </div>
  );
}

function RedFlagSection({ flags, onChange }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12, border: "1.5px solid #d5d0c8",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden", marginBottom: 20,
    }}>
      <div style={{ padding: "14px 20px", background: "#c62828" }}>
        <h3 style={{
          margin: 0, fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: 18, fontWeight: 700, color: "#fff",
        }}>Red Flags Check</h3>
      </div>
      <div style={{ padding: "8px 20px 4px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#c62828", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Critical (cap at Satisfactory/Good)</div>
        {RED_FLAGS.critical.map((rf) => (
          <div key={rf.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <CheckItem checked={flags[rf.id]} onChange={() => onChange(rf.id)} label={rf.label} accent="#c62828" />
            {flags[rf.id] && <span style={{ fontSize: 11, fontWeight: 700, color: "#c62828", whiteSpace: "nowrap", marginLeft: 8 }}>Cap: {rf.cap}%</span>}
          </div>
        ))}
      </div>
      <div style={{ padding: "4px 20px 16px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#e65100", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Moderate (cap at Good/Excellent)</div>
        {RED_FLAGS.moderate.map((rf) => (
          <div key={rf.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <CheckItem checked={flags[rf.id]} onChange={() => onChange(rf.id)} label={rf.label} accent="#e65100" />
            {flags[rf.id] && <span style={{ fontSize: 11, fontWeight: 700, color: "#e65100", whiteSpace: "nowrap", marginLeft: 8 }}>Cap: {rf.cap}%</span>}
          </div>
        ))}
      </div>
      {getScoreCap(flags) < 100 && (
        <div style={{
          padding: "10px 20px", background: "#ffebee", borderTop: "1px solid #ffcdd2",
          fontSize: 13, fontWeight: 600, color: "#c62828", textAlign: "center",
        }}>
          Active score cap: {getScoreCap(flags)}%
        </div>
      )}
    </div>
  );
}

function SavedRecordRow({ record, index, onDelete }) {
  const band = getBand(record.finalScore);
  const courseLabel = record.course === "module_journey" ? "Module Journey" : "Challenge-Focused";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
      background: index % 2 === 0 ? "#fafaf7" : "#fff", borderBottom: "1px solid #eee",
      fontSize: 13,
    }}>
      <span style={{ fontWeight: 600, width: 80, color: "#1a1a1a" }}>{record.studentId || "—"}</span>
      <span style={{ width: 50, color: "#888" }}>{record.markerInitials || "—"}</span>
      <span style={{ width: 110, color: "#888" }}>{courseLabel}</span>
      <span style={{
        fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 700,
        fontSize: 16, color: band.color, width: 50, textAlign: "center",
      }}>{record.finalScore}</span>
      <span style={{
        padding: "2px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600,
        background: `${band.color}15`, color: band.color, border: `1px solid ${band.color}30`,
      }}>{band.label}</span>
      <span style={{ flex: 1, textAlign: "right", fontSize: 11, color: "#aaa" }}>
        {record.savedAt ? new Date(record.savedAt).toLocaleString() : ""}
      </span>
      <button onClick={() => onDelete(index)} title="Delete" style={{
        background: "none", border: "none", color: "#ccc", cursor: "pointer",
        fontSize: 16, padding: "2px 6px", borderRadius: 4,
      }}>×</button>
    </div>
  );
}

function ExportModal({ records, onClose }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(records, null, 2);
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20,
    }}>
      <div style={{
        background: "#fff", borderRadius: 14, width: "100%", maxWidth: 640,
        maxHeight: "85vh", display: "flex", flexDirection: "column",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)", fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 20px", borderBottom: "1px solid #eee",
        }}>
          <h3 style={{ margin: 0, fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 20, fontWeight: 700 }}>Export Grades (JSON)</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#999" }}>✕</button>
        </div>
        <div style={{ padding: "16px 20px", flex: 1, overflow: "auto" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button onClick={() => {
              navigator.clipboard.writeText(json).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
            }} style={{
              padding: "5px 14px", borderRadius: 6, border: "none",
              background: copied ? "#1a7a3a" : "#2d6a4f", color: "#fff",
              fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>{copied ? "Copied!" : "Copy JSON"}</button>
          </div>
          <textarea readOnly value={json} style={{
            width: "100%", boxSizing: "border-box", height: 400, fontSize: 11,
            fontFamily: "monospace", padding: 12, border: "1.5px solid #d5d0c8",
            borderRadius: 8, background: "#fafaf7", resize: "vertical", color: "#333",
          }} />
        </div>
      </div>
    </div>
  );
}

// ─── OVERVIEW PANEL ──────────────────────────────────────────────────────────

function OverviewPanel({ records }) {
  const [courseFilter, setCourseFilter] = useState("all");
  const filtered = courseFilter === "all" ? records : records.filter((r) => r.course === courseFilter);

  const markers = [...new Set(filtered.map((r) => r.markerInitials || "—"))].sort();

  // Band distribution helper
  function bandDist(scores) {
    const dist = { Outstanding: 0, Excellent: 0, Good: 0, Satisfactory: 0, Unsatisfactory: 0 };
    scores.forEach((s) => { dist[getBand(s).label]++; });
    return dist;
  }

  // Stat helpers
  function mean(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }
  function median(arr) {
    if (!arr.length) return 0;
    const s = [...arr].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }
  function std(arr) {
    if (arr.length < 2) return 0;
    const m = mean(arr);
    return Math.sqrt(arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / (arr.length - 1));
  }

  // Bar chart component (horizontal stacked band distribution)
  function BandBar({ dist, total, label }) {
    if (total === 0) return null;
    const bandOrder = ["Outstanding", "Excellent", "Good", "Satisfactory", "Unsatisfactory"];
    const bandColorMap = {};
    BANDS.forEach((b) => { bandColorMap[b.label] = b.color; });
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a" }}>{label}</span>
          <span style={{ fontSize: 11, color: "#999" }}>n={total}</span>
        </div>
        <div style={{ display: "flex", height: 22, borderRadius: 6, overflow: "hidden", border: "1px solid #e0dcd4" }}>
          {bandOrder.map((b) => {
            const count = dist[b] || 0;
            if (count === 0) return null;
            const pct = (count / total) * 100;
            return (
              <div key={b} title={`${b}: ${count} (${Math.round(pct)}%)`} style={{
                width: `${pct}%`, background: bandColorMap[b],
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 600, color: "#fff",
                minWidth: count > 0 ? 18 : 0, transition: "width 0.3s ease",
              }}>
                {pct >= 12 ? count : ""}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Summary stat row
  function StatRow({ label, scores, pillarScores }) {
    if (scores.length === 0) return (
      <div style={{ padding: "10px 0", color: "#999", fontSize: 13 }}>No records</div>
    );
    return (
      <div style={{ padding: "10px 0", borderBottom: "1px solid #f0ede8" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{label}</span>
          <span style={{ fontSize: 11, color: "#999" }}>n={scores.length}</span>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
          {[
            { label: "Mean", value: mean(scores).toFixed(1) },
            { label: "Median", value: median(scores).toFixed(1) },
            { label: "Std Dev", value: std(scores).toFixed(1) },
            { label: "Min", value: Math.min(...scores) },
            { label: "Max", value: Math.max(...scores) },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Source Serif 4', Georgia, serif", color: "#1a1a1a" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#999", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
        {pillarScores && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PILLARS.map((p) => {
              const ps = pillarScores.map((r) => r[p.id] || 0);
              return (
                <div key={p.id} style={{
                  flex: 1, minWidth: 80, padding: "6px 10px", borderRadius: 8,
                  background: `${p.color}08`, border: `1px solid ${p.color}20`,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: p.color, marginBottom: 2 }}>{p.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Source Serif 4', Georgia, serif", color: p.color }}>
                    {mean(ps).toFixed(1)}<span style={{ fontSize: 10, fontWeight: 400 }}>/{p.max}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const allScores = filtered.map((r) => r.finalScore || 0);
  const allPillarScores = filtered.map((r) => r.pillarScores || {});

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
      <div style={{
        marginTop: 16, background: "#fff", borderRadius: 12,
        border: "1.5px solid #d5d0c8", overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}>
        {/* Header with filter */}
        <div style={{
          padding: "14px 20px", borderBottom: "1px solid #eee",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <h3 style={{
            margin: 0, fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: 18, fontWeight: 700, color: "#1a1a1a",
          }}>Score Overview</h3>
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { id: "all", label: "All" },
              { id: "module_journey", label: "Module Journey" },
              { id: "challenge_focused", label: "Challenge-Focused" },
            ].map((c) => (
              <button key={c.id} onClick={() => setCourseFilter(c.id)} style={{
                padding: "4px 12px", borderRadius: 6, border: "1.5px solid",
                borderColor: courseFilter === c.id ? "#2d6a4f" : "#e0dcd4",
                background: courseFilter === c.id ? "#2d6a4f" : "#fff",
                color: courseFilter === c.id ? "#fff" : "#888",
                fontSize: 11, fontWeight: 600, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}>{c.label}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: "16px 20px" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#999", fontSize: 13 }}>
              No saved grades{courseFilter !== "all" ? ` for ${courseFilter === "module_journey" ? "Module Journey" : "Challenge-Focused"}` : ""}. Complete a grading checklist and save it.
            </div>
          ) : (
            <>
              {/* Overall distribution */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                  Overall Distribution
                </div>
                <BandBar dist={bandDist(allScores)} total={allScores.length} label="All markers" />

                {/* Band legend */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4, marginBottom: 4 }}>
                  {BANDS.map((b) => (
                    <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: b.color }} />
                      <span style={{ fontSize: 10, color: "#888" }}>{b.label} ({b.range})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Per-marker distribution */}
              {markers.length > 1 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                    By Marker
                  </div>
                  {markers.map((m) => {
                    const markerRecords = filtered.filter((r) => (r.markerInitials || "—") === m);
                    const markerScores = markerRecords.map((r) => r.finalScore || 0);
                    return (
                      <BandBar key={m} dist={bandDist(markerScores)} total={markerScores.length} label={m} />
                    );
                  })}
                </div>
              )}

              {/* Summary statistics */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                  Summary Statistics
                </div>
                <StatRow label="All markers" scores={allScores} pillarScores={allPillarScores} />
                {markers.length > 1 && markers.map((m) => {
                  const markerRecords = filtered.filter((r) => (r.markerInitials || "—") === m);
                  return (
                    <StatRow key={m} label={`Marker: ${m}`}
                      scores={markerRecords.map((r) => r.finalScore || 0)}
                      pillarScores={markerRecords.map((r) => r.pillarScores || {})} />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function GradingTool() {
  const [state, setState] = useState(createEmptyState());
  const [step, setStep] = useState(0); // 0=setup, 1=initial, 2=pillars, 3=redflags, 4=crosspillar, 5=scoring
  const [savedRecords, setSavedRecords] = useState([]);
  const [showExport, setShowExport] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [saveConfirm, setSaveConfirm] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const topRef = useRef(null);

  useEffect(() => {
    loadSavedGrades().then((r) => { setSavedRecords(r); setLoadingRecords(false); });
  }, []);

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth" });

  const update = (patch) => setState((prev) => ({ ...prev, ...patch }));

  const toggleCheck = (key, group) => {
    setState((prev) => ({
      ...prev,
      [group]: { ...prev[group], [key]: !prev[group][key] },
    }));
  };

  const setScore = (pillarId, value) => {
    setState((prev) => ({
      ...prev,
      pillarScores: { ...prev.pillarScores, [pillarId]: value },
    }));
  };

  const setFeedback = (pillarId, value) => {
    setState((prev) => ({
      ...prev,
      pillarFeedback: { ...prev.pillarFeedback, [pillarId]: value },
    }));
  };

  const generateFeedbackFor = (pillarId) => {
    const fb = generatePillarFeedback(pillarId, state.pillarChecks);
    setFeedback(pillarId, fb);
  };

  const generateAllFeedback = () => {
    const newFeedback = {};
    PILLARS.forEach((p) => {
      newFeedback[p.id] = generatePillarFeedback(p.id, state.pillarChecks);
    });
    const overall = generateOverallComment(state.pillarScores, state.pillarChecks, state.redFlags, state.crossPillar, state.course);
    setState((prev) => ({
      ...prev,
      pillarFeedback: newFeedback,
      overallComment: overall,
    }));
  };

  const calcTotal = () => {
    const raw = Object.values(state.pillarScores).reduce((a, b) => a + b, 0);
    const adj = state.crossPillarAdj === "up" ? 2 : state.crossPillarAdj === "down" ? -2 : 0;
    const cap = getScoreCap(state.redFlags);
    return Math.min(Math.max(raw + adj, 0), cap);
  };

  const handleSave = async () => {
    const finalScore = calcTotal();
    const band = getBand(finalScore);
    const record = {
      ...state,
      finalScore,
      finalBand: band.label,
    };
    const updated = await saveGrade(record);
    setSavedRecords(updated);
    setSaveConfirm(true);
    setTimeout(() => {
      setSaveConfirm(false);
      setState(createEmptyState());
      setStep(0);
      scrollTop();
    }, 1500);
  };

  const handleDeleteRecord = async (idx) => {
    const updated = await deleteGrade(idx);
    setSavedRecords(updated);
  };

  const totalScore = calcTotal();
  const currentBand = getBand(totalScore);
  const scoreCap = getScoreCap(state.redFlags);

  const STEPS = [
    { label: "Setup", icon: "①" },
    { label: "Initial Read", icon: "②" },
    { label: "Pillars", icon: "③" },
    { label: "Red Flags", icon: "④" },
    { label: "Cross-Pillar", icon: "⑤" },
    { label: "Score & Feedback", icon: "⑥" },
  ];

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif", minHeight: "100vh",
      background: "#f7f5f0", color: "#1a1a1a",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:#fff; border:2px solid currentColor; cursor:pointer; margin-top:-6px; box-shadow:0 1px 3px rgba(0,0,0,0.15); }
        textarea:focus, input:focus { outline:none; border-color:#2d6a4f !important; box-shadow: 0 0 0 3px rgba(45,106,79,0.12) !important; }
        textarea::placeholder, input::placeholder { color:#999; font-style:italic; }
      `}</style>

      <div ref={topRef} />

      {/* Header */}
      <header style={{ position: "relative", padding: "32px 24px 20px", borderBottom: "1px solid #e0dcd4", background: "#fffef9" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #2d6a4f, #1b4965, #7b2d8e, #9e4a1a)" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
              Reflection Grading Tool
            </h1>
            <p style={{ fontSize: 14, color: "#888", marginTop: 4, marginBottom: 0 }}>
              Futures Mindset Personal Reflection — multi-marker checklist
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button onClick={() => { setShowOverview(!showOverview); if (!showOverview) setShowSaved(false); }} style={{
              padding: "7px 14px", borderRadius: 8, border: "1.5px solid #d5d0c8",
              background: showOverview ? "#2d6a4f" : "#fff", color: showOverview ? "#fff" : "#555",
              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>
              Overview
            </button>
            <button onClick={() => { setShowSaved(!showSaved); if (!showSaved) setShowOverview(false); }} style={{
              padding: "7px 14px", borderRadius: 8, border: "1.5px solid #d5d0c8",
              background: showSaved ? "#2d6a4f" : "#fff", color: showSaved ? "#fff" : "#555",
              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>
              Saved ({savedRecords.length})
            </button>
            {savedRecords.length > 0 && (
              <button onClick={() => setShowExport(true)} style={{
                padding: "7px 14px", borderRadius: 8, border: "1.5px solid #2d6a4f",
                background: "transparent", color: "#2d6a4f",
                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}>Export JSON</button>
            )}
          </div>
        </div>
      </header>

      {/* Saved records panel */}
      {showSaved && (
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
          <div style={{
            marginTop: 16, background: "#fff", borderRadius: 12,
            border: "1.5px solid #d5d0c8", overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}>
            {savedRecords.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "#999", fontSize: 13 }}>
                No saved grades yet. Complete a grading checklist and save it.
              </div>
            ) : savedRecords.map((r, i) => (
              <SavedRecordRow key={i} record={r} index={i} onDelete={handleDeleteRecord} />
            ))}
          </div>
        </div>
      )}

      {/* Overview panel */}
      {showOverview && <OverviewPanel records={savedRecords} />}

      {/* Step nav */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "16px 24px 0" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {STEPS.map((s, i) => (
            <button key={i} onClick={() => setStep(i)} style={{
              padding: "6px 14px", borderRadius: 8, border: "1.5px solid",
              borderColor: step === i ? "#2d6a4f" : "#e0dcd4",
              background: step === i ? "#2d6a4f" : "transparent",
              color: step === i ? "#fff" : "#888",
              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s ease",
            }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live score bar */}
      {step > 0 && (
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "12px 24px 0" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 16, padding: "10px 16px",
            background: "#fff", borderRadius: 10, border: "1.5px solid #e0dcd4",
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.04em" }}>Live score</span>
            <div style={{ flex: 1, height: 8, background: "#e0dcd4", borderRadius: 4, overflow: "hidden", position: "relative" }}>
              <div style={{ height: "100%", width: `${totalScore}%`, background: currentBand.color, borderRadius: 4, transition: "width 0.3s ease" }} />
              {scoreCap < 100 && <div style={{ position: "absolute", top: 0, bottom: 0, left: `${scoreCap}%`, width: 2, background: "#c62828" }} />}
            </div>
            <span style={{
              fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 20,
              fontWeight: 700, color: currentBand.color, minWidth: 36, textAlign: "right",
            }}>{totalScore}</span>
            <span style={{
              padding: "2px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600,
              background: `${currentBand.color}15`, color: currentBand.color,
              border: `1px solid ${currentBand.color}30`,
            }}>{currentBand.label}</span>
          </div>
        </div>
      )}

      {/* Main content */}
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "20px 24px 60px" }}>

        {/* STEP 0: Setup */}
        {step === 0 && (
          <div>
            <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#1b4965", margin: "0 0 16px" }}>
              Submission Details
            </h2>
            <div style={{
              background: "#fff", borderRadius: 12, border: "1.5px solid #d5d0c8",
              padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6, display: "block" }}>
                    Student ID
                  </label>
                  <input value={state.studentId} onChange={(e) => update({ studentId: e.target.value })}
                    placeholder="e.g. STU-2024-001"
                    style={{
                      width: "100%", boxSizing: "border-box", padding: "10px 12px",
                      border: "1.5px solid #d5d0c8", borderRadius: 8, fontSize: 14,
                      fontFamily: "'DM Sans', sans-serif",
                    }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6, display: "block" }}>
                    Marker Initials
                  </label>
                  <input value={state.markerInitials} onChange={(e) => update({ markerInitials: e.target.value.toUpperCase().slice(0, 4) })}
                    placeholder="e.g. DK"
                    maxLength={4}
                    style={{
                      width: "100%", boxSizing: "border-box", padding: "10px 12px",
                      border: "1.5px solid #d5d0c8", borderRadius: 8, fontSize: 14,
                      fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase",
                    }} />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8, display: "block" }}>
                  Reflection Variation
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  {COURSE_OPTIONS.map((c) => (
                    <button key={c.id} onClick={() => update({ course: c.id })} style={{
                      padding: "10px 20px", borderRadius: 8,
                      border: `1.5px solid ${state.course === c.id ? "#2d6a4f" : "#d5d0c8"}`,
                      background: state.course === c.id ? "#2d6a4f" : "#fff",
                      color: state.course === c.id ? "#fff" : "#555",
                      fontSize: 13, fontWeight: 600, cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                    }}>{c.label}</button>
                  ))}
                </div>
              </div>
              {/* Calibration reminders */}
              <div style={{
                padding: "14px 16px", borderRadius: 8, background: "#f0ede6",
                border: "1px solid #e0dcd4", marginBottom: 16,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#2d6a4f", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                  Calibration reminders
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.7, color: "#555" }}>
                  <strong>Grade what is present and genuine</strong>, not what is absent.
                  These are mid-career professionals — read as a <strong>mentor, not an examiner</strong>.
                  Authentic reflection deserves full credit; feedback develops what's missing.
                  {state.course === "module_journey"
                    ? " Module Journey: look for a coherent retrospective arc across the three-part structure (starting point → shifts → pathway), grounded in module themes."
                    : " Challenge-Focused: this variation naturally produces stronger emotional grounding — look for metacognitive depth to match the emotional honesty."}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => { setStep(1); scrollTop(); }} disabled={!state.studentId || !state.markerInitials}
                style={{
                  padding: "10px 28px", borderRadius: 8, border: "none",
                  background: state.studentId && state.markerInitials ? "#2d6a4f" : "#ccc",
                  color: "#fff", fontSize: 14, fontWeight: 600, cursor: state.studentId && state.markerInitials ? "pointer" : "not-allowed",
                  fontFamily: "'DM Sans', sans-serif",
                }}>Begin Grading →</button>
            </div>
          </div>
        )}

        {/* STEP 1: Initial Read */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#1b4965", margin: "0 0 6px" }}>
              Initial Read-Through
            </h2>
            <p style={{ fontSize: 14, color: "#888", marginTop: 0, marginBottom: 16 }}>
              Read once without scoring. Tick the quality indicators you observe.
            </p>
            <div style={{
              background: "#fff", borderRadius: 12, border: "1.5px solid #d5d0c8",
              padding: "12px 20px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 20,
            }}>
              {INITIAL_CHECKS.map((c) => (
                <CheckItem key={c.id} checked={state.initialChecks[c.id]}
                  onChange={() => toggleCheck(c.id, "initialChecks")} label={c.label} />
              ))}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8, display: "block" }}>
                Initial impression band
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {BANDS.map((b) => (
                  <button key={b.id} onClick={() => update({ initialBand: b.id })} style={{
                    padding: "7px 14px", borderRadius: 8,
                    border: `1.5px solid ${state.initialBand === b.id ? b.color : "#d5d0c8"}`,
                    background: state.initialBand === b.id ? b.color : "#fff",
                    color: state.initialBand === b.id ? "#fff" : b.color,
                    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  }}>{b.label}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => { setStep(0); scrollTop(); }} style={navBtn}>← Setup</button>
              <button onClick={() => { setStep(2); scrollTop(); }} style={{ ...navBtn, background: "#2d6a4f", color: "#fff", borderColor: "#2d6a4f" }}>Pillar Scoring →</button>
            </div>
          </div>
        )}

        {/* STEP 2: Pillar Scoring */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#1b4965", margin: "0 0 16px" }}>
              Pillar Scoring
            </h2>
            {PILLARS.map((p) => (
              <PillarSection key={p.id} pillar={p}
                checks={state.pillarChecks} scores={state.pillarScores}
                feedback={state.pillarFeedback}
                onCheckChange={(id) => toggleCheck(id, "pillarChecks")}
                onScoreChange={setScore} onFeedbackChange={setFeedback}
                onGenerate={generateFeedbackFor} />
            ))}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => { setStep(1); scrollTop(); }} style={navBtn}>← Initial Read</button>
              <button onClick={() => { setStep(3); scrollTop(); }} style={{ ...navBtn, background: "#2d6a4f", color: "#fff", borderColor: "#2d6a4f" }}>Red Flags →</button>
            </div>
          </div>
        )}

        {/* STEP 3: Red Flags */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#1b4965", margin: "0 0 6px" }}>
              Red Flags Check
            </h2>
            <p style={{ fontSize: 14, color: "#888", marginTop: 0, marginBottom: 16 }}>
              Tick any that apply. These cap the maximum achievable score.
            </p>
            <RedFlagSection flags={state.redFlags} onChange={(id) => toggleCheck(id, "redFlags")} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => { setStep(2); scrollTop(); }} style={navBtn}>← Pillars</button>
              <button onClick={() => { setStep(4); scrollTop(); }} style={{ ...navBtn, background: "#2d6a4f", color: "#fff", borderColor: "#2d6a4f" }}>Cross-Pillar →</button>
            </div>
          </div>
        )}

        {/* STEP 4: Cross-Pillar */}
        {step === 4 && (
          <div>
            <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#1b4965", margin: "0 0 6px" }}>
              Cross-Pillar Assessment
            </h2>
            <p style={{ fontSize: 14, color: "#888", marginTop: 0, marginBottom: 16 }}>
              Not separately weighted — these push borderline scores up or down.
            </p>
            <div style={{
              background: "#fff", borderRadius: 12, border: "1.5px solid #d5d0c8",
              padding: "12px 20px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 20,
            }}>
              {CROSS_PILLAR_CHECKS.map((c) => (
                <CheckItem key={c.id} checked={state.crossPillar[c.id]}
                  onChange={() => toggleCheck(c.id, "crossPillar")} label={c.label} />
              ))}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8, display: "block" }}>
                Holistic adjustment
              </label>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                {[
                  { id: "up", label: "Push up (+2)" },
                  { id: "none", label: "No change" },
                  { id: "down", label: "Push down (−2)" },
                ].map((opt) => (
                  <button key={opt.id} onClick={() => update({ crossPillarAdj: opt.id })} style={{
                    padding: "8px 16px", borderRadius: 8,
                    border: `1.5px solid ${state.crossPillarAdj === opt.id ? "#2d6a4f" : "#d5d0c8"}`,
                    background: state.crossPillarAdj === opt.id ? "#2d6a4f" : "#fff",
                    color: state.crossPillarAdj === opt.id ? "#fff" : "#555",
                    fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  }}>{opt.label}</button>
                ))}
              </div>
              <div style={{ fontSize: 11, color: "#999", marginBottom: 10, lineHeight: 1.5 }}>
                Up: exceptional integration, unusual honesty, original metaphors, vivid writing.
                Down: significant disconnect between parts, performed reflection, missing engagement with themes.
              </div>
              {state.crossPillarAdj !== "none" && (
                <input value={state.adjReason} onChange={(e) => update({ adjReason: e.target.value })}
                  placeholder="Brief reason for adjustment…"
                  style={{
                    width: "100%", boxSizing: "border-box", padding: "8px 12px",
                    border: "1.5px solid #d5d0c8", borderRadius: 8, fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                  }} />
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => { setStep(3); scrollTop(); }} style={navBtn}>← Red Flags</button>
              <button onClick={() => { generateAllFeedback(); setStep(5); scrollTop(); }}
                style={{ ...navBtn, background: "#2d6a4f", color: "#fff", borderColor: "#2d6a4f" }}>
                Generate Feedback →
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Final Score & Feedback */}
        {step === 5 && (
          <div>
            <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#1b4965", margin: "0 0 16px" }}>
              Final Score & Feedback
            </h2>

            {/* Score summary */}
            <div style={{
              background: "#fff", borderRadius: 12, border: "1.5px solid #d5d0c8",
              padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 20,
            }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                {PILLARS.map((p) => (
                  <div key={p.id} style={{
                    flex: 1, minWidth: 100, textAlign: "center", padding: "10px 8px",
                    borderRadius: 8, background: p.light,
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: p.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {p.label}
                    </div>
                    <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 24, fontWeight: 700, color: p.color }}>
                      {state.pillarScores[p.id]}<span style={{ fontSize: 14, fontWeight: 400 }}>/{p.max}</span>
                    </div>
                  </div>
                ))}
              </div>
              {state.crossPillarAdj !== "none" && (
                <div style={{ textAlign: "center", fontSize: 13, color: "#888", marginBottom: 8 }}>
                  Holistic adjustment: {state.crossPillarAdj === "up" ? "+2" : "−2"}
                  {state.adjReason ? ` (${state.adjReason})` : ""}
                </div>
              )}
              {scoreCap < 100 && (
                <div style={{ textAlign: "center", fontSize: 13, color: "#c62828", fontWeight: 600, marginBottom: 8 }}>
                  Red flag cap active: max {scoreCap}%
                </div>
              )}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
                padding: "16px 0 8px", borderTop: "1px solid #eee",
              }}>
                <span style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  fontSize: 44, fontWeight: 700, color: currentBand.color,
                }}>{totalScore}</span>
                <div>
                  <div style={{ fontSize: 13, color: "#888" }}>/ 100</div>
                  <div style={{
                    padding: "3px 14px", borderRadius: 12, fontSize: 13, fontWeight: 700,
                    background: `${currentBand.color}15`, color: currentBand.color,
                    border: `1.5px solid ${currentBand.color}30`, marginTop: 2,
                  }}>{currentBand.label}</div>
                </div>
              </div>
            </div>

            {/* Holistic checks */}
            <div style={{
              background: "#fff", borderRadius: 12, border: "1.5px solid #d5d0c8",
              padding: "12px 20px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 20,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
                Holistic sanity check
              </div>
              {[
                { id: "feelsRight", label: "Score feels right holistically" },
                { id: "consistent", label: "Consistent with other submissions I've graded" },
                { id: "noRedFlags", label: "No red flags overriding this score" },
                { id: "moderation", label: "Score would hold up if challenged by moderation" },
              ].map((c) => (
                <CheckItem key={c.id} checked={state.holistic[c.id]}
                  onChange={() => setState((prev) => ({ ...prev, holistic: { ...prev.holistic, [c.id]: !prev.holistic[c.id] } }))}
                  label={c.label} />
              ))}
            </div>

            {/* Feedback editing */}
            <div style={{
              background: "#fff", borderRadius: 12, border: "1.5px solid #d5d0c8",
              padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 20,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 18, fontWeight: 700, margin: 0, color: "#1b4965" }}>
                  Feedback (edit as needed)
                </h3>
                <button onClick={generateAllFeedback} style={{
                  padding: "5px 12px", borderRadius: 6, border: "1px solid #2d6a4f40",
                  background: "#2d6a4f10", color: "#2d6a4f",
                  fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}>Regenerate all</button>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6, display: "block" }}>
                  Overall Comment
                </label>
                <textarea value={state.overallComment} onChange={(e) => update({ overallComment: e.target.value })}
                  rows={4} style={{
                    width: "100%", boxSizing: "border-box", border: "1.5px solid #e0dcd4",
                    borderRadius: 8, padding: "10px 12px", fontSize: 13, lineHeight: 1.6,
                    fontFamily: "'DM Sans', sans-serif", color: "#1a1a1a", resize: "vertical", background: "#fafaf7",
                  }} />
              </div>

              {PILLARS.map((p) => (
                <div key={p.id} style={{ marginBottom: 12 }}>
                  <label style={{
                    fontSize: 12, fontWeight: 600, color: p.color,
                    textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4, display: "block",
                  }}>{p.label}</label>
                  <textarea value={state.pillarFeedback[p.id]} onChange={(e) => setFeedback(p.id, e.target.value)}
                    rows={2} style={{
                      width: "100%", boxSizing: "border-box", border: `1.5px solid ${p.color}30`,
                      borderRadius: 8, padding: "8px 12px", fontSize: 13, lineHeight: 1.6,
                      fontFamily: "'DM Sans', sans-serif", color: "#1a1a1a", resize: "vertical",
                      background: `${p.light}80`,
                    }} />
                </div>
              ))}
            </div>

            {/* Save */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={() => { setStep(4); scrollTop(); }} style={navBtn}>← Cross-Pillar</button>
              {saveConfirm ? (
                <div style={{
                  padding: "10px 28px", borderRadius: 8, background: "#1a7a3a",
                  color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                }}>✓ Saved — resetting…</div>
              ) : (
                <button onClick={handleSave} style={{
                  padding: "10px 28px", borderRadius: 8, border: "none",
                  background: "#2d6a4f", color: "#fff", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  boxShadow: "0 2px 8px rgba(45,106,79,0.3)",
                }}>Save & Next Student →</button>
              )}
            </div>
          </div>
        )}
      </main>

      {showExport && <ExportModal records={savedRecords} onClose={() => setShowExport(false)} />}
    </div>
  );
}

const navBtn = {
  padding: "9px 20px", borderRadius: 8, border: "1.5px solid #d5d0c8",
  background: "#fff", color: "#555", fontSize: 13, fontWeight: 600,
  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
};
