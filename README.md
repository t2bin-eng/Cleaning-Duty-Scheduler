# Cleaning Zone Planner

A static classroom cleaning-zone assignment app. It runs with plain HTML, CSS, and Vanilla JavaScript, so it can be deployed to GitHub Pages, Vercel, or any static host without installing frontend dependencies.

## Features

- Add cleaning zones with a required number of students.
- Generate zone cards and empty assignment slots dynamically.
- Switch between a modern dashboard theme and a soft pastel card theme.
- Drag student cards with mouse or touch.
- Move students between zones or back to the unassigned roster.
- Lock a zone so random assignment keeps its current students.
- Randomly fill only remaining empty slots with currently unassigned students.

## Data Model

Student data is stored in `src/main.js`.

```js
const students = [
  { id: 1, name: '\uae40\ubbfc\uc900' },
  { id: 2, name: '\uc774\uc11c\uc5f0' },
];
```

Zone data keeps the zone name, required capacity, lock state, and assigned student IDs.

```js
const zones = [
  {
    id: 'zone-id',
    name: '\uad50\uc2e4 \uc55e\ubb38',
    capacity: 2,
    fixed: false,
    assignedStudentIds: [1, 2],
  },
];
```

The random assignment logic is in `assignRandomStudents` in `src/main.js`.

- Zones with `fixed: true` are left unchanged.
- Students already assigned to any zone are excluded.
- Remaining students are shuffled and placed into available empty slots.

## Local Run

The app can be opened directly with `index.html`.

For a local server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Build Check

No bundling step is required because this is a static app.

```bash
npm run build
```

## GitHub Upload

```bash
git init
git add .
git commit -m "Initial cleaning zone planner"
git remote add origin https://github.com/YOUR_NAME/YOUR_REPOSITORY.git
git branch -M main
git push -u origin main
```

## Vercel Deployment

1. Log in to [Vercel](https://vercel.com).
2. Select `Add New...` and then `Project`.
3. Import the GitHub repository.
4. Framework Preset: `Other`.
5. Build Command: leave empty or use `npm run build`.
6. Output Directory: leave empty.
7. Click `Deploy`.

After deployment, every push to the GitHub `main` branch will trigger a new Vercel deployment.

## Project Structure

```text
.
|-- index.html
|-- package.json
|-- README.md
|-- server.js
`-- src
    |-- main.js
    `-- styles.css
```
