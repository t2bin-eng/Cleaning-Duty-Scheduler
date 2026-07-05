# Cleaning Zone Planner

A static classroom cleaning-zone assignment app. It runs with plain HTML, CSS, and Vanilla JavaScript, so it can be deployed to GitHub Pages, Vercel, or any static host without installing frontend dependencies.

## Features

- Add cleaning zones with a required number of students.
- Upload a student roster from `.xlsx`, `.xls`, `.csv`, or `.txt`.
- Generate zone cards and empty assignment slots dynamically.
- Switch between a modern dashboard theme and a soft pastel card theme.
- Drag student cards with mouse or touch.
- Move students between zones or back to the unassigned roster.
- Fill only empty slots with unassigned students.
- Reshuffle all non-locked zones while preserving locked zones.
- Print or save only the current cleaning assignment board.
- Confirm an assignment date and show the elapsed D-day count.

## Student Upload

Use the upload control to select a roster file. The app looks for a column named `이름`, `성명`, `학생명`, `name`, `student`, or `student name`. If no matching header is found, the first column is treated as the student-name column.

Excel files are parsed in the browser with SheetJS loaded from its CDN. CSV and TXT files work without the CDN.

Uploading a new roster clears current assignments so the board can be reassigned from the new student list.

## Random Assignment Modes

- `빈 슬롯 랜덤`: keeps all current assignments and fills only empty slots with unassigned students.
- `고정 제외 전체 재배정`: keeps zones checked as locked, then reshuffles every student outside locked zones across all unlocked zones.

If no zones are locked, `고정 제외 전체 재배정` shuffles the full roster and assigns students from scratch.

## Print And Save

The print button uses a dedicated A4 table layout with only the cleaning zone, assigned count, and assigned students. It does not print the card controls, empty slots, setup controls, or unassigned student list. The board title uses the local computer clock for the current month/date and displays:

```text
x월 x학년 x반 청소구역
```

Click `청소구역 확정` to save the confirmation date. The title area then shows how many days have passed as `D+0`, `D+1`, and so on.

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

Run the local server:

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
6. Output Directory: leave empty. Do not set it to `public` or `dist`.
7. Click `Deploy`.

After deployment, every push to the GitHub `main` branch will trigger a new Vercel deployment.

## Project Structure

```text
.
|-- index.html
|-- package.json
|-- README.md
|-- server.js
|-- start-app.cmd
|-- vercel.json
`-- src
    |-- main.js
    `-- styles.css
```
