const labels = {
  add: '\ucd94\uac00',
  allAssigned: '\ubaa8\ub4e0 \ud559\uc0dd\uc774 \ubc30\uc815\ub418\uc5c8\uc2b5\ub2c8\ub2e4.',
  assigned: '\ubc30\uc815',
  capacity: '\ud544\uc694 \uc778\uc6d0',
  cleanTitle: '\uccad\uc18c \uad6c\uc5ed \ubc30\uce58\ub3c4',
  classLabel: '\ubc18',
  confirm: '\uccad\uc18c\uad6c\uc5ed \ud655\uc815',
  createFrame: '\ud2c0 \uc0dd\uc131',
  daysElapsedPrefix: 'D+',
  deleteZone: '\uad6c\uc5ed \uc0ad\uc81c',
  exportImage: '\ud30c\uc77c\ub85c \uc800\uc7a5',
  emptySlot: '\ube48 \uc2ac\ub86f',
  fillRandom: '\ube48 \uc2ac\ub86f \ub79c\ub364',
  fixedZone: '\uad6c\uc5ed \uace0\uc815',
  gradeLabel: '\ud559\ub144',
  imported: '\uba85\uc758 \ud559\uc0dd\uc744 \ubd88\ub7ec\uc654\uc2b5\ub2c8\ub2e4.',
  importFail: '\ud30c\uc77c\uc744 \uc77d\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4. .xlsx, .csv \ud30c\uc77c\uc744 \ud655\uc778\ud574 \uc8fc\uc138\uc694.',
  importStudents: '\ud559\uc0dd \uba85\ub82c \uc5c5\ub85c\ub4dc',
  modern: '\ubaa8\ub358',
  modernTitle: '\ubaa8\ub358\ud55c \ub300\uc2dc\ubcf4\ub4dc \uc2a4\ud0c0\uc77c',
  monthLabel: '\uc6d4',
  pastel: '\ud30c\uc2a4\ud154',
  pastelTitle: '\ud30c\uc2a4\ud154\ud1a4 \uce74\ub4dc \ub808\uc774\uc544\uc6c3',
  peopleAssigned: '\uba85 \ubc30\uc815',
  print: '\uc778\uc1c4',
  randomize: '\ub79c\ub364 \ubc30\uce58',
  reshuffle: '\uace0\uc815 \uc81c\uc678 \uc804\uccb4 \uc7ac\ubc30\uc815',
  reset: '\ucd08\uae30\ud654',
  roster: '\ubc30\uc815\ub418\uc9c0 \uc54a\uc740 \ud559\uc0dd',
  slots: '\uc2ac\ub86f',
  student: '\ud559\uc0dd',
  themeSelect: '\ud14c\ub9c8 \uc120\ud0dd',
  zoneName: '\uad6c\uc5ed \uc774\ub984',
  zonePlaceholder: '\uc608: \uad50\uc2e4 \uc55e\ubb38',
  zoneSetupHint: '\uad6c\uc5ed\uc744 \ucd94\uac00\ud55c \ub4a4 \ud2c0\uc744 \uc0dd\uc131\ud574 \uc8fc\uc138\uc694.',
};

let students = [
  { id: 1, name: '\uae40\ubbfc\uc900' },
  { id: 2, name: '\uc774\uc11c\uc5f0' },
  { id: 3, name: '\ubc15\ub3c4\uc724' },
  { id: 4, name: '\ucd5c\ud558\ub9b0' },
  { id: 5, name: '\uc815\uc9c0\uc6b0' },
  { id: 6, name: '\uac15\uc720\uc900' },
  { id: 7, name: '\uc870\uc544\ub9b0' },
  { id: 8, name: '\uc724\uc11c\uc900' },
  { id: 9, name: '\uc7a5\uc608\ub098' },
  { id: 10, name: '\uc784\uc2dc\uc6b0' },
  { id: 11, name: '\ud55c\uc9c0\ubbfc' },
  { id: 12, name: '\uc624\ud558\uc900' },
];

let zones = [
  createZone('\uad50\uc2e4 \uc55e\ubb38', 2),
  createZone('\uce60\ud310', 1),
  createZone('\ubd84\ub9ac\uc218\uac70', 2),
  createZone('\ubcf5\ub3c4', 3),
];

const state = {
  theme: 'modern',
  frameCreated: true,
  dragging: null,
  draftZoneName: '',
  draftCapacity: 1,
  month: new Date().getMonth() + 1,
  grade: 1,
  classNumber: 1,
  confirmedAt: localStorage.getItem('cleaning-zone-confirmed-at') || '',
  uploadMessage: '',
};

const pastelColors = ['mint', 'peach', 'lilac', 'sky', 'lemon', 'rose'];
const app = document.querySelector('#app');

function createZone(name, capacity) {
  return {
    id: crypto.randomUUID(),
    name,
    capacity,
    fixed: false,
    assignedStudentIds: [],
  };
}

function getAssignedStudentIds() {
  return new Set(zones.flatMap((zone) => zone.assignedStudentIds));
}

function getStudentById(studentId) {
  return students.find((student) => student.id === studentId);
}

function shuffleItems(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function compactZones(currentZones) {
  return currentZones.map((zone) => ({
    ...zone,
    assignedStudentIds: zone.assignedStudentIds.slice(0, zone.capacity),
  }));
}

function assignRandomStudents(currentZones, unassignedStudentIds) {
  const availableStudents = shuffleItems(unassignedStudentIds);
  let cursor = 0;

  return currentZones.map((zone) => {
    if (zone.fixed) {
      return zone;
    }

    const openSlots = Math.max(zone.capacity - zone.assignedStudentIds.length, 0);
    const nextStudents = availableStudents.slice(cursor, cursor + openSlots);
    cursor += nextStudents.length;

    return {
      ...zone,
      assignedStudentIds: [...zone.assignedStudentIds, ...nextStudents],
    };
  });
}

function reshuffleUnlockedAssignments(currentZones) {
  const fixedStudentIds = new Set(
    currentZones
      .filter((zone) => zone.fixed)
      .flatMap((zone) => zone.assignedStudentIds),
  );
  const pool = shuffleItems(students.filter((student) => !fixedStudentIds.has(student.id)).map((student) => student.id));
  let cursor = 0;

  return currentZones.map((zone) => {
    if (zone.fixed) {
      return zone;
    }

    const nextStudents = pool.slice(cursor, cursor + zone.capacity);
    cursor += nextStudents.length;

    return {
      ...zone,
      assignedStudentIds: nextStudents,
    };
  });
}

function getBoardTitle() {
  return `${state.month}\uc6d4 ${state.grade}\ud559\ub144 ${state.classNumber}\ubc18 \uccad\uc18c\uad6c\uc5ed`;
}

function getTodayLabel() {
  const today = new Date();
  return `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
}

function getDaysElapsed() {
  if (!state.confirmedAt) {
    return '';
  }

  const confirmedDate = new Date(state.confirmedAt);
  const today = new Date();
  const start = new Date(confirmedDate.getFullYear(), confirmedDate.getMonth(), confirmedDate.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dayMs = 24 * 60 * 60 * 1000;
  return `${labels.daysElapsedPrefix}${Math.max(Math.floor((end - start) / dayMs), 0)}`;
}

function moveStudent(studentId, targetZoneId) {
  if (targetZoneId !== 'unassigned') {
    const targetZone = zones.find((zone) => zone.id === targetZoneId);
    const alreadyInTarget = targetZone?.assignedStudentIds.includes(studentId);

    if (!targetZone || (!alreadyInTarget && targetZone.assignedStudentIds.length >= targetZone.capacity)) {
      render();
      return;
    }
  }

  const withoutStudent = zones.map((zone) => ({
    ...zone,
    assignedStudentIds: zone.assignedStudentIds.filter((id) => id !== studentId),
  }));

  if (targetZoneId === 'unassigned') {
    zones = withoutStudent;
    render();
    return;
  }

  zones = withoutStudent.map((zone) => {
    if (zone.id !== targetZoneId) {
      return zone;
    }

    return {
      ...zone,
      assignedStudentIds: [...zone.assignedStudentIds, studentId],
    };
  });
  render();
}

function icon(name) {
  const icons = {
    add: '+',
    check: 'OK',
    confirm: 'Done',
    file: 'File',
    print: 'Print',
    shuffle: 'R',
    reset: 'Reset',
    save: 'Save',
    trash: 'X',
    lock: 'Lock',
    unlock: 'Open',
    modern: 'Grid',
    pastel: 'Star',
  };
  return `<span class="button-icon" aria-hidden="true">${icons[name]}</span>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function studentCard(student, draggingId) {
  return `
    <button
      class="student-card ${draggingId === student.id ? 'dragging' : ''}"
      type="button"
      data-student-id="${student.id}"
    >
      <span>${escapeHtml(student.name)}</span>
    </button>
  `;
}

function render() {
  const assignedStudentIds = getAssignedStudentIds();
  const unassignedStudents = students.filter((student) => !assignedStudentIds.has(student.id));
  const assignedCount = assignedStudentIds.size;
  const totalSlots = zones.reduce((sum, zone) => sum + zone.capacity, 0);
  const daysElapsed = getDaysElapsed();

  app.className = `app ${state.theme}`;
  app.innerHTML = `
    <header class="topbar">
      <div>
        <p class="eyebrow">Cleaning Zone Planner</p>
        <h1>${labels.cleanTitle}</h1>
      </div>
      <div class="topbar-tools">
        <div class="theme-switch" aria-label="${labels.themeSelect}">
          <button class="${state.theme === 'modern' ? 'active' : ''}" type="button" data-action="theme" data-theme="modern" title="${labels.modernTitle}">
            ${icon('modern')} ${labels.modern}
          </button>
          <button class="${state.theme === 'pastel' ? 'active' : ''}" type="button" data-action="theme" data-theme="pastel" title="${labels.pastelTitle}">
            ${icon('pastel')} ${labels.pastel}
          </button>
        </div>
      </div>
    </header>

    <section class="board-title-panel">
      <div>
        <p class="eyebrow">${getTodayLabel()}</p>
        <h2>${getBoardTitle()}</h2>
      </div>
      <div class="day-counter">${daysElapsed || '\uc544\uc9c1 \ud655\uc815 \uc804'}</div>
    </section>

    <section class="setup-panel">
      <div class="setup-fields">
        <label>
          ${labels.monthLabel}
          <input id="setting-month" min="1" max="12" type="number" value="${state.month}" />
        </label>
        <label>
          ${labels.gradeLabel}
          <input id="setting-grade" min="1" max="6" type="number" value="${state.grade}" />
        </label>
        <label>
          ${labels.classLabel}
          <input id="setting-class" min="1" type="number" value="${state.classNumber}" />
        </label>
        <label>
          ${labels.zoneName}
          <input id="zone-name" value="${escapeHtml(state.draftZoneName)}" placeholder="${labels.zonePlaceholder}" />
        </label>
        <label>
          ${labels.capacity}
          <input id="zone-capacity" min="1" type="number" value="${state.draftCapacity}" />
        </label>
        <button class="icon-button primary" type="button" data-action="add-zone">
          ${icon('add')} ${labels.add}
        </button>
        <button class="icon-button" type="button" data-action="create-frame">
          ${icon('check')} ${labels.createFrame}
        </button>
      </div>
      <div class="stats">
        <span>${labels.student} ${students.length}\uba85</span>
        <span>${labels.assigned} ${assignedCount}\uba85</span>
        <span>${labels.slots} ${totalSlots}\uac1c</span>
      </div>
    </section>

    <section class="upload-panel">
      <label class="file-upload">
        ${icon('file')} ${labels.importStudents}
        <input id="student-file" accept=".xlsx,.xls,.csv,.txt" type="file" />
      </label>
      <p>${state.uploadMessage || '.xlsx, .xls, .csv \ud30c\uc77c\uc758 \uc774\ub984/\uc131\uba85 \uc5f4\uc744 \uc77d\uc5b4\uc635\ub2c8\ub2e4.'}</p>
    </section>

    <section class="actions">
      <button class="icon-button primary" type="button" data-action="fill-random">
        ${icon('shuffle')} ${labels.fillRandom}
      </button>
      <button class="icon-button" type="button" data-action="reshuffle">
        ${icon('shuffle')} ${labels.reshuffle}
      </button>
      <button class="icon-button" type="button" data-action="confirm">
        ${icon('confirm')} ${labels.confirm}
      </button>
      <button class="icon-button" type="button" data-action="print">
        ${icon('print')} ${labels.print}
      </button>
      <button class="icon-button" type="button" data-action="export-image">
        ${icon('save')} ${labels.exportImage}
      </button>
      <button class="icon-button" type="button" data-action="reset">
        ${icon('reset')} ${labels.reset}
      </button>
    </section>

    <div class="workspace">
      <aside class="student-roster" data-drop-id="unassigned">
        <div class="section-title">
          <h2>${labels.roster}</h2>
          <span>${unassignedStudents.length}</span>
        </div>
        <div class="student-list">
          ${
            unassignedStudents.length
              ? unassignedStudents.map((student) => studentCard(student, state.dragging?.studentId)).join('')
              : `<p class="empty-text">${labels.allAssigned}</p>`
          }
        </div>
      </aside>

      ${renderBoardSnapshot()}
    </div>
  `;

  bindEvents();
}

function renderBoardSnapshot() {
  return `
    <section class="print-sheet" id="print-sheet">
      <div class="print-title-row">
        <div>
          <p>${getTodayLabel()}</p>
          <h2>${getBoardTitle()}</h2>
        </div>
        <strong>${getDaysElapsed() || ''}</strong>
      </div>
      <section class="zone-board">
        ${
          state.frameCreated
            ? zones.map(zoneCard).join('')
            : `<p class="empty-text">${labels.zoneSetupHint}</p>`
        }
      </section>
    </section>
  `;
}

function zoneCard(zone, index) {
  const emptySlots = zone.capacity - zone.assignedStudentIds.length;
  const assignedSlots = zone.assignedStudentIds
    .map((studentId) => `
      <div class="slot">
        ${studentCard(getStudentById(studentId), state.dragging?.studentId)}
      </div>
    `)
    .join('');
  const emptySlotMarkup = Array.from({ length: emptySlots })
    .map(() => `<div class="slot empty">${labels.emptySlot}</div>`)
    .join('');

  return `
    <article class="zone-card pastel-${pastelColors[index % pastelColors.length]}" data-drop-id="${zone.id}">
      <div class="zone-header">
        <div>
          <h2>${escapeHtml(zone.name)}</h2>
          <p>${zone.assignedStudentIds.length}/${zone.capacity}${labels.peopleAssigned}</p>
        </div>
        <button class="square-button" type="button" data-action="remove-zone" data-zone-id="${zone.id}" title="${labels.deleteZone}">
          ${icon('trash')}
        </button>
      </div>

      <div class="zone-options">
        <label class="capacity-control">
          ${labels.capacity.replace('\ud544\uc694 ', '')}
          <input min="1" type="number" value="${zone.capacity}" data-action="capacity" data-zone-id="${zone.id}" />
        </label>
        <label class="lock-toggle">
          <input ${zone.fixed ? 'checked' : ''} type="checkbox" data-action="fixed" data-zone-id="${zone.id}" />
          ${icon(zone.fixed ? 'lock' : 'unlock')} ${labels.fixedZone}
        </label>
      </div>

      <div class="slots">
        ${assignedSlots}
        ${emptySlotMarkup}
      </div>
    </article>
  `;
}

function bindEvents() {
  document.querySelector('#setting-month')?.addEventListener('input', (event) => {
    state.month = Math.min(Math.max(Number(event.target.value) || 1, 1), 12);
    render();
  });

  document.querySelector('#setting-grade')?.addEventListener('input', (event) => {
    state.grade = Math.max(Number(event.target.value) || 1, 1);
    render();
  });

  document.querySelector('#setting-class')?.addEventListener('input', (event) => {
    state.classNumber = Math.max(Number(event.target.value) || 1, 1);
    render();
  });

  document.querySelector('#zone-name')?.addEventListener('input', (event) => {
    state.draftZoneName = event.target.value;
  });

  document.querySelector('#zone-capacity')?.addEventListener('input', (event) => {
    state.draftCapacity = event.target.value;
  });

  document.querySelector('#zone-name')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      addZone();
    }
  });

  document.querySelectorAll('[data-action]').forEach((element) => {
    if (element.matches('button')) {
      element.addEventListener('click', handleAction);
      return;
    }
    element.addEventListener('change', handleAction);
  });

  document.querySelectorAll('[data-student-id]').forEach((element) => {
    element.addEventListener('pointerdown', startDrag);
  });

  document.querySelector('#student-file')?.addEventListener('change', handleStudentFile);
}

function handleAction(event) {
  const { action, theme, zoneId } = event.currentTarget.dataset;

  if (action === 'theme') {
    state.theme = theme;
    render();
  }

  if (action === 'add-zone') {
    addZone();
  }

  if (action === 'create-frame') {
    zones = compactZones(zones);
    state.frameCreated = true;
    render();
  }

  if (action === 'fill-random') {
    const alreadyAssigned = getAssignedStudentIds();
    const remainingStudentIds = students
      .filter((student) => !alreadyAssigned.has(student.id))
      .map((student) => student.id);
    zones = assignRandomStudents(zones, remainingStudentIds);
    render();
  }

  if (action === 'reshuffle') {
    zones = reshuffleUnlockedAssignments(zones);
    render();
  }

  if (action === 'confirm') {
    state.confirmedAt = new Date().toISOString();
    localStorage.setItem('cleaning-zone-confirmed-at', state.confirmedAt);
    render();
  }

  if (action === 'print') {
    preparePrintLayout();
    window.print();
  }

  if (action === 'export-image') {
    exportBoardImage();
  }

  if (action === 'reset') {
    zones = zones.map((zone) => ({
      ...zone,
      fixed: false,
      assignedStudentIds: [],
    }));
    render();
  }

  if (action === 'remove-zone') {
    zones = zones.filter((zone) => zone.id !== zoneId);
    render();
  }

  if (action === 'capacity') {
    zones = compactZones(
      zones.map((zone) =>
        zone.id === zoneId
          ? { ...zone, capacity: Math.max(Number(event.currentTarget.value), 1) }
          : zone,
      ),
    );
    render();
  }

  if (action === 'fixed') {
    zones = zones.map((zone) =>
      zone.id === zoneId ? { ...zone, fixed: event.currentTarget.checked } : zone,
    );
    render();
  }
}

function addZone() {
  const name = state.draftZoneName.trim();
  const capacity = Math.max(Number(state.draftCapacity), 1);

  if (!name) {
    return;
  }

  zones = [...zones, createZone(name, capacity)];
  state.draftZoneName = '';
  state.draftCapacity = 1;
  state.frameCreated = false;
  render();
}

function setStudentsFromNames(names) {
  const uniqueNames = [...new Set(names.map((name) => String(name).trim()).filter(Boolean))];

  if (!uniqueNames.length) {
    state.uploadMessage = labels.importFail;
    render();
    return;
  }

  students = uniqueNames.map((name, index) => ({
    id: index + 1,
    name,
  }));

  zones = zones.map((zone) => ({
    ...zone,
    fixed: false,
    assignedStudentIds: [],
  }));
  state.confirmedAt = '';
  localStorage.removeItem('cleaning-zone-confirmed-at');
  state.uploadMessage = `${uniqueNames.length}${labels.imported}`;
  render();
}

function extractNamesFromRows(rows) {
  const cleanRows = rows
    .map((row) => row.map((cell) => String(cell ?? '').trim()))
    .filter((row) => row.some(Boolean));

  if (!cleanRows.length) {
    return [];
  }

  const header = cleanRows[0].map((cell) => cell.toLowerCase());
  const nameColumnIndex = header.findIndex((cell) =>
    ['이름', '성명', '학생명', 'name', 'student', 'student name'].includes(cell),
  );
  const columnIndex = nameColumnIndex >= 0 ? nameColumnIndex : 0;
  const startRow = nameColumnIndex >= 0 ? 1 : 0;

  return cleanRows.slice(startRow).map((row) => row[columnIndex]).filter(Boolean);
}

function parseDelimitedText(text) {
  const delimiter = text.includes('\t') ? '\t' : ',';
  const rows = text
    .split(/\r?\n/)
    .map((line) => line.split(delimiter).map((cell) => cell.replace(/^"|"$/g, '').trim()));
  return extractNamesFromRows(rows);
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = reader.result;
      const utf8Text = new TextDecoder('utf-8').decode(buffer);
      if (!utf8Text.includes('\ufffd')) {
        resolve(utf8Text);
        return;
      }

      try {
        resolve(new TextDecoder('euc-kr').decode(buffer));
      } catch {
        resolve(utf8Text);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

function loadSheetJs() {
  if (window.XLSX) {
    return Promise.resolve(window.XLSX);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
    script.onload = () => resolve(window.XLSX);
    script.onerror = () => reject(new Error('SheetJS load failed'));
    document.head.appendChild(script);
  });
}

async function handleStudentFile(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    const extension = file.name.split('.').pop()?.toLowerCase();
    let names = [];

    if (['csv', 'txt', 'tsv'].includes(extension)) {
      names = parseDelimitedText(await readFileAsText(file));
    } else {
      const XLSX = await loadSheetJs();
      const workbook = XLSX.read(await readFileAsArrayBuffer(file), { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, blankrows: false });
      names = extractNamesFromRows(rows);
    }

    setStudentsFromNames(names);
  } catch (error) {
    console.error(error);
    state.uploadMessage = labels.importFail;
    render();
  }
}

function getStylesForExport() {
  return [...document.styleSheets]
    .map((sheet) => {
      try {
        return [...sheet.cssRules].map((rule) => rule.cssText).join('\n');
      } catch {
        return '';
      }
    })
    .join('\n');
}

function preparePrintLayout() {
  const sheet = document.querySelector('#print-sheet');
  if (!sheet) {
    return;
  }

  const zoneCount = Math.max(zones.length, 1);
  const maxCapacity = Math.max(...zones.map((zone) => zone.capacity), 1);
  const pageRatio = 1.42;
  let columns = Math.ceil(Math.sqrt(zoneCount * pageRatio));

  if (zoneCount <= 2) {
    columns = zoneCount;
  } else if (zoneCount <= 4) {
    columns = 2;
  }

  columns = Math.min(Math.max(columns, 1), Math.min(zoneCount, 6));
  const rows = Math.ceil(zoneCount / columns);
  const density = Math.max(rows, Math.ceil(maxCapacity / 4));
  const fontSize = Math.max(7, Math.min(12, 13 - density));
  const slotHeight = Math.max(6, Math.min(12, 15 - density));
  const cardPadding = Math.max(3, Math.min(8, 10 - rows));
  const gap = Math.max(2, Math.min(5, 7 - rows));

  sheet.style.setProperty('--print-cols', columns);
  sheet.style.setProperty('--print-rows', rows);
  sheet.style.setProperty('--print-font-size', `${fontSize}pt`);
  sheet.style.setProperty('--print-slot-height', `${slotHeight}mm`);
  sheet.style.setProperty('--print-card-padding', `${cardPadding}mm`);
  sheet.style.setProperty('--print-gap', `${gap}mm`);
}

async function exportBoardImage() {
  const sheet = document.querySelector('#print-sheet');
  if (!sheet) {
    return;
  }

  preparePrintLayout();
  const clone = sheet.cloneNode(true);
  const width = Math.max(sheet.scrollWidth, 900);
  const height = sheet.scrollHeight + 24;
  const html = `
    <div xmlns="http://www.w3.org/1999/xhtml" class="app ${state.theme} export-root">
      <style>${getStylesForExport()}</style>
      ${clone.outerHTML}
    </div>
  `;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">${html}</foreignObject>
    </svg>
  `;
  const image = new Image();
  const svgUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));

  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0);
    URL.revokeObjectURL(svgUrl);

    const link = document.createElement('a');
    link.download = `${getBoardTitle()}-${getTodayLabel()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  image.onerror = () => {
    URL.revokeObjectURL(svgUrl);
    window.print();
  };

  image.src = svgUrl;
}

function startDrag(event) {
  event.preventDefault();
  const sourceElement = event.currentTarget;
  const studentId = Number(sourceElement.dataset.studentId);
  const rect = sourceElement.getBoundingClientRect();

  state.dragging = {
    studentId,
    x: event.clientX,
    y: event.clientY,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top,
    width: rect.width,
    sourceElement,
  };

  sourceElement.setPointerCapture(event.pointerId);
  sourceElement.addEventListener('pointermove', dragMove);
  sourceElement.addEventListener('pointerup', dragEnd);
  sourceElement.classList.add('dragging');
  document.body.insertAdjacentHTML(
    'beforeend',
    `<div class="drag-preview" style="left:${event.clientX - state.dragging.offsetX}px; top:${event.clientY - state.dragging.offsetY}px; width:${rect.width}px;">${escapeHtml(getStudentById(studentId).name)}</div>`,
  );
}

function dragMove(event) {
  if (!state.dragging) {
    return;
  }

  state.dragging.x = event.clientX;
  state.dragging.y = event.clientY;
  const preview = document.querySelector('.drag-preview');
  if (preview) {
    preview.style.left = `${state.dragging.x - state.dragging.offsetX}px`;
    preview.style.top = `${state.dragging.y - state.dragging.offsetY}px`;
  }
}

function dragEnd(event) {
  if (!state.dragging) {
    return;
  }

  const { studentId, sourceElement } = state.dragging;
  sourceElement.releasePointerCapture(event.pointerId);
  sourceElement.removeEventListener('pointermove', dragMove);
  sourceElement.removeEventListener('pointerup', dragEnd);

  const preview = document.querySelector('.drag-preview');
  if (preview) {
    preview.remove();
  }

  const dropTarget = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-drop-id]');
  state.dragging = null;

  if (dropTarget) {
    moveStudent(studentId, dropTarget.dataset.dropId);
    return;
  }

  render();
}

render();

window.addEventListener('beforeprint', preparePrintLayout);
