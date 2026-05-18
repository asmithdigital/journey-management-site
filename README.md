# Journey Management Site

A static React application for managing and navigating customer journey research. It reads JSON data files at runtime and renders a journey management interface with four views: Dashboard, Journey Map, Opportunity Matrix, and Search. There is no backend or database — all data lives in JSON files in `public/data/`, making it easy to update by editing a file and pushing to main.

---

## Running locally

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173/journey-management-site/`.

---

## Data schema

### `public/data/index.json`

The root index file. Defines the journey hierarchy and top-level metadata.

| Field | Type | Description |
|---|---|---|
| `hierarchy` | array | Top-level journey groups |
| `hierarchy[].id` | string | Unique ID for this group |
| `hierarchy[].name` | string | Display name |
| `hierarchy[].description` | string | Short description shown on Dashboard |
| `hierarchy[].owner` | string | Owning team |
| `hierarchy[].children` | array | Sub-journey references (`id` + `name` + `level`) |
| `metadata.totalJourneys` | number | Displayed on Dashboard stat card |
| `metadata.totalInsights` | number | Displayed on Dashboard stat card |
| `metadata.lastUpdated` | string | ISO date string (YYYY-MM-DD) |

### `public/data/journeys/[id].json`

One file per sub-journey. The filename must match the `id` in `index.json`.

| Field | Type | Description |
|---|---|---|
| `id` | string | Must match the filename and hierarchy entry |
| `name` | string | Full display name |
| `level` | string | `"sub-journey"` |
| `parent` | string | ID of the parent journey group |
| `owner` | string | Owning team |
| `status` | string | `validated`, `draft`, or `archived` |
| `lastUpdated` | string | ISO date string |
| `summary` | string | 1–2 sentence overview shown at top of Journey Map |
| `stages` | array | Ordered journey stages (see below) |
| `insights` | array | Research findings (see below) |

**Stage object:**

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique within this journey |
| `name` | string | Stage display name |
| `order` | number | Sort order (1-based) |
| `touchpoints` | string[] | Channels or surfaces at this stage |
| `actions` | string[] | What the user does |
| `thoughts` | string[] | What the user is thinking |
| `emotions.label` | string | Emotion name (e.g. "Frustrated") |
| `emotions.score` | number | 1–5 scale (1 = very negative, 5 = very positive) |
| `emotions.description` | string | One-line elaboration |
| `painPoints` | string[] | Problems encountered at this stage |
| `opportunities` | string[] | Design or product opportunities |

**Insight object:**

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique ID (e.g. `ins-001`) |
| `text` | string | The insight statement |
| `source` | string | Research source and date |
| `sourceType` | string | `usability-test`, `analytics`, `experiment`, `interview` |
| `severity` | string | `high`, `medium`, or `low` |
| `stage` | string | Stage ID this insight relates to |
| `recurrence` | number or null | Number of participants who showed this pattern |
| `totalParticipants` | number or null | Total participants in the study |

---

## How to add a new journey

1. Create a new file at `public/data/journeys/[new-journey-id].json` following the schema above.
2. Open `public/data/index.json` and add a reference to the new journey under the relevant parent's `children` array:
   ```json
   { "id": "new-journey-id", "name": "New Journey Name", "level": "sub-journey" }
   ```
3. Update `metadata.totalJourneys` and `metadata.lastUpdated` in `index.json`.
4. Commit and push to `main`. The site rebuilds automatically.

---

## How to update an existing journey

1. Edit the relevant file in `public/data/journeys/`.
2. Update `lastUpdated` to today's date.
3. Commit and push to `main`.

---

## Deployment

The site is deployed automatically to GitHub Pages via GitHub Actions. Every push to `main` triggers a build (`npm run build`) and deploys the `dist/` folder to the `gh-pages` branch using `peaceiris/actions-gh-pages`.

**Live URL:** https://asmithdigital.github.io/journey-management-site/

To enable GitHub Pages on a new fork:
1. Go to **Settings → Pages**
2. Set **Source** to **GitHub Actions**

---

## Update workflow

1. **Research** — conduct usability studies, interviews, or analytics analysis
2. **Process findings** — translate findings into JSON (add stages, insights, update emotions and pain points)
3. **Push to main** — `git add . && git commit -m "..." && git push`
4. **Site rebuilds** — GitHub Actions builds and deploys within ~2 minutes
5. **Share** — send the live URL to stakeholders
