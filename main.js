const labels = {
  add: '\ucd94\uac00',
  allAssigned: '\ubaa8\ub4e0 \ud559\uc0dd\uc774 \ubc30\uc815\ub418\uc5c8\uc2b5\ub2c8\ub2e4.',
  assigned: '\ubc30\uc815',
  capacity: '\ud544\uc694 \uc778\uc6d0',
  cleanTitle: '\uccad\uc18c \uad6c\uc5ed \ubc30\uce58\ub3c4',
  createFrame: '\ud2c0 \uc0dd\uc131',
  deleteZone: '\uad6c\uc5ed \uc0ad\uc81c',
  emptySlot: '\ube48 \uc2ac\ub86f',
  fixedZone: '\uad6c\uc5ed \uace0\uc815',
  modern: '\ubaa8\ub358',
  modernTitle: '\ubaa8\ub358\ud55c \ub300\uc2dc\ubcf4\ub4dc \uc2a4\ud0c0\uc77c',
  pastel: '\ud30c\uc2a4\ud154',
  pastelTitle: '\ud30c\uc2a4\ud154\ud1a4 \uce74\ub4dc \ub808\uc774\uc544\uc6c3',
  peopleAssigned: '\uba85 \ubc30\uc815',
  randomize: '\ub79c\ub364 \ubc30\uce58',
  reset: '\ucd08\uae30\ud654',
  roster: '\ubc30\uc815\ub418\uc9c0 \uc54a\uc740 \ud559\uc0dd',
  slots: '\uc2ac\ub86f',
  student: '\ud559\uc0dd',
  themeSelect: '\ud14c\ub9c8 \uc120\ud0dd',
  zoneName: '\uad6c\uc5ed \uc774\ub984',
  zonePlaceholder: '\uc608: \uad50\uc2e4 \uc55e\ubb38',
  zoneSetupHint: '\uad6c\uc5ed\uc744 \ucd94\uac00\ud55c \ub4a4 \ud2c0\uc744 \uc0dd\uc131\ud574 \uc8fc\uc138\uc694.',
};

const students = [
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
    shuffle: 'R',
    reset: 'Reset',
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

  app.className = `app ${state.theme}`;
  app.innerHTML = `
    <header class="topbar">
      <div>
        <p class="eyebrow">Cleaning Zone Planner</p>
        <h1>${labels.cleanTitle}</h1>
      </div>
      <div class="theme-switch" aria-label="${labels.themeSelect}">
        <button class="${state.theme === 'modern' ? 'active' : ''}" type="button" data-action="theme" data-theme="modern" title="${labels.modernTitle}">
          ${icon('modern')} ${labels.modern}
        </button>
        <button class="${state.theme === 'pastel' ? 'active' : ''}" type="button" data-action="theme" data-theme="pastel" title="${labels.pastelTitle}">
          ${icon('pastel')} ${labels.pastel}
        </button>
      </div>
    </header>

    <section class="setup-panel">
      <div class="setup-fields">
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

    <section class="actions">
      <button class="icon-button primary" type="button" data-action="randomize">
        ${icon('shuffle')} ${labels.randomize}
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

      <section class="zone-board">
        ${
          state.frameCreated
            ? zones.map(zoneCard).join('')
            : `<p class="empty-text">${labels.zoneSetupHint}</p>`
        }
      </section>
    </div>
  `;

  bindEvents();
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

  if (action === 'randomize') {
    const alreadyAssigned = getAssignedStudentIds();
    const remainingStudentIds = students
      .filter((student) => !alreadyAssigned.has(student.id))
      .map((student) => student.id);
    zones = assignRandomStudents(zones, remainingStudentIds);
    render();
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
