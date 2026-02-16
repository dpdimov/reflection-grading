# Grading Tool Replication Guide

How to create a new grading checklist tool for a different course/assignment, using `entfin-grading` as the base template.

---

## Architecture

Each grading tool is a standalone Vite + React app deployed on Vercel with Upstash Redis for persistence. The structure is identical across tools — only the **configuration block** in `GradingTool.jsx` changes.

```
your-grading-tool/
├── package.json            # rename project
├── vite.config.js          # identical
├── index.html              # update <title>
├── vercel.json             # identical
├── .gitignore              # identical
├── api/
│   ├── grades.js           # change KV key
│   └── grades/
│       └── [index].js      # change KV key
├── src/
│   ├── main.jsx            # identical
│   └── GradingTool.jsx     # ← all course-specific config lives here
```

## Step-by-step

### 1. Scaffold the project

Copy these files verbatim from `entfin-grading`:
- `vite.config.js`
- `vercel.json`
- `src/main.jsx`
- `.gitignore`

Modify slightly:
- **`package.json`** — change `"name"` to your project name
- **`index.html`** — update `<title>`
- **`api/grades.js`** and **`api/grades/[index].js`** — change the `KEY` constant to a unique namespace (e.g. `'yourproject:records'`) so multiple tools can share one Upstash instance without collision

### 2. Configure GradingTool.jsx

The entire file follows the same structure. You only change the configuration constants at the top and the text/logic that references them. Below is what to customise.

#### PILLARS

Define your assessment criteria. Each pillar has:

| Field | Description |
|-------|-------------|
| `id` | Unique identifier (used as keys in state) |
| `label` | Display name |
| `color` | Hex colour for headers, sliders, charts |
| `light` | Light background hex for score summary cards |
| `max` | Maximum score for this pillar (all must sum to 100) |
| `weight` | Display string, e.g. `"25%"` |

**Example (equal weights):**
```js
const PILLARS = [
  { id: "analysis", label: "Analysis", color: "#2d6a4f", light: "#e8f5e9", max: 25, weight: "25%" },
  { id: "evidence", label: "Evidence", color: "#1b4965", light: "#e3f2fd", max: 25, weight: "25%" },
  { id: "argument", label: "Argument", color: "#7b2d8e", light: "#f3e5f5", max: 25, weight: "25%" },
  { id: "writing",  label: "Writing",  color: "#9e4a1a", light: "#fbe9e7", max: 25, weight: "25%" },
];
```

**Example (uneven weights):**
```js
const PILLARS = [
  { id: "depth",     label: "Depth",     color: "#2d6a4f", light: "#e8f5e9", max: 30, weight: "30%" },
  { id: "framework", label: "Framework", color: "#1b4965", light: "#e3f2fd", max: 25, weight: "25%" },
  { id: "transform", label: "Transform", color: "#7b2d8e", light: "#f3e5f5", max: 25, weight: "25%" },
  { id: "pathway",   label: "Pathway",   color: "#9e4a1a", light: "#fbe9e7", max: 20, weight: "20%" },
];
```

The rest of the UI adapts automatically: slider max, band regions, overview panel denominators, score summary cards all read from `pillar.max`.

#### BANDS

Usually identical across tools. Change only if your institution uses different grade boundaries:

```js
const BANDS = [
  { id: "outstanding",    label: "Outstanding",    range: "85–100%", color: "#1a7a3a" },
  { id: "excellent",      label: "Excellent",      range: "70–84%",  color: "#2d6a4f" },
  { id: "good",           label: "Good",           range: "60–69%",  color: "#1b4965" },
  { id: "satisfactory",   label: "Satisfactory",   range: "50–59%",  color: "#9e7a1a" },
  { id: "unsatisfactory", label: "Unsatisfactory",  range: "0–49%",  color: "#c1121f" },
];
```

#### INITIAL_CHECKS

First-read quality indicators (Step 2). These are simple checkboxes with no feedback text — just `id` and `label`. Aim for 5–7 items that a marker would notice on a single read-through.

```js
const INITIAL_CHECKS = [
  { id: "sources", label: "More than 2 independent sources cited" },
  { id: "critical", label: "Evidence of critical questioning" },
  // ...
];
```

#### PILLAR_CHECKS

The core of the rubric. Each pillar gets an array of check items, each with:

| Field | Description |
|-------|-------------|
| `id` | Unique across all pillars |
| `label` | Short description shown next to checkbox |
| `positive` | Feedback sentence when checked (strength) |
| `negative` | Feedback sentence when unchecked (improvement area) |

Aim for 5–8 checks per pillar. The feedback text should read as a mentor responding to a professional — credit what's present, develop what's missing.

```js
const PILLAR_CHECKS = {
  analysis: [
    {
      id: "ana_sources",
      label: "Independent sources used to validate claims",
      positive: "Good use of independent sources to validate claims.",
      negative: "The analysis relies on pitch materials — verify claims independently."
    },
    // ...
  ],
  // repeat for each pillar
};
```

**Auto-suggest formula:** The `pillarSuggestedScore` function maps checkbox completion to ~84% of max (top of "Excellent"), leaving room for the marker to push into "Outstanding" manually. This formula works regardless of pillar max:

```js
suggestedScore = Math.round(ratio * pillar.max * 0.84)
```

#### RED_FLAGS

Score caps that override pillar scores. Two tiers:

```js
const RED_FLAGS = {
  critical: [
    { id: "rf_no_analysis", label: "No critical analysis evident", cap: 59 },
    // cap values typically: 59 (locks in Satisfactory) or 69 (locks in Good)
  ],
  moderate: [
    { id: "rf_shallow", label: "Superficial treatment of 2+ pillars", cap: 79 },
    // cap values typically: 74, 79, or 84
  ],
};
```

Aim for 4–6 per tier. Critical flags indicate fundamental problems; moderate flags indicate significant but not fatal issues.

#### CROSS_PILLAR_CHECKS

Integration quality indicators (Step 5). Simple `id` + `label`, no feedback text. These inform the ±2 holistic adjustment, not scored directly.

```js
const CROSS_PILLAR_CHECKS = [
  { id: "cp_coherent", label: "All pillars tell a coherent, integrated story" },
  { id: "cp_structure", label: "Structure is logical with clear progression" },
  // ...
];
```

Aim for 6–8 items.

#### COURSE_OPTIONS

If the assignment has variations (e.g. different word counts, different structures), define them here:

```js
const COURSE_OPTIONS = [
  { id: "variant_a", label: "Variant A (1,500 words)" },
  { id: "variant_b", label: "Variant B (2,500 words)" },
];
```

If there's only one variant, you can simplify the UI to remove the selector. The course value is stored in saved records and used for filtering in the Overview panel.

### 3. Customise text and logic

These sections reference the assignment context and need updating:

| Location | What to change |
|----------|---------------|
| **Header** `<h1>` and `<p>` | Tool name and subtitle |
| **Calibration reminders** (Step 1) | Assignment-specific grading guidance |
| **`generateOverallComment()`** | Band-level opening sentences, strongest/weakest pillar commentary, surface-level pattern detection, variation-aware closing |
| **Holistic adjustment guidance** (Step 5) | What justifies +2 / −2 for this assignment |
| **Overview filter labels** | Match `COURSE_OPTIONS` labels |
| **`SavedRecordRow` course display** | Map course IDs to display labels |

### 4. Deploy

1. Create a GitHub repo
2. Push the project
3. Create a Vercel project linked to the repo
4. Connect Upstash Redis storage (can share the same instance as other tools — keys are namespaced)
5. If the Vercel integration creates env vars with names like `KV_REST_API_URL` / `KV_REST_API_TOKEN`, make sure `api/grades.js` uses those names:

```js
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});
```

### 5. Verify

1. `npm run dev` → tool loads locally
2. Walk through all 6 steps with test data
3. Confirm pillar sliders have correct max values and band regions
4. Confirm red flag caps work (total score respects the cap)
5. Confirm cross-pillar ±2 adjustment applies
6. `npx vite build` succeeds
7. After deploy: save/load/delete/export all work
8. Overview panel filters by course variant correctly

---

## Checklist for a new tool

- [ ] Unique `KEY` in both API files (e.g. `'projectname:records'`)
- [ ] `package.json` name updated
- [ ] `index.html` title updated
- [ ] `PILLARS` defined (ids, labels, colours, max values summing to 100)
- [ ] `PILLAR_CHECKS` written (5–8 per pillar, with positive/negative feedback)
- [ ] `RED_FLAGS` defined (critical + moderate, with cap values)
- [ ] `INITIAL_CHECKS` defined (5–7 first-read indicators)
- [ ] `CROSS_PILLAR_CHECKS` defined (6–8 integration indicators)
- [ ] `COURSE_OPTIONS` defined (or removed if single variant)
- [ ] Header text updated
- [ ] Calibration reminders updated
- [ ] `generateOverallComment()` rewritten for assignment context
- [ ] Holistic adjustment guidance text updated
- [ ] Overview filter labels match course options
- [ ] Build passes
- [ ] Deployed with correct Upstash env vars

---

## Existing tools

| Tool | Repo | KV Key | Pillars |
|------|------|--------|---------|
| entfin-grading | `dpdimov/entfin-grading` | `grading:records` | Opportunity, Scalability, Execution, Return (25/25/25/25) |
| reflection-grading | `dpdimov/reflection-grading` | `reflection:records` | Metacognitive Self-Awareness, KTS Framework Application, Cognitive Transformation, Development Pathway (30/25/25/20) |
