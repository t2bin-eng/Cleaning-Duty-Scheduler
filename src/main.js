const students = [
  { id: 1, name: '김민준' },
  { id: 2, name: '이서연' },
  { id: 3, name: '박도윤' },
  { id: 4, name: '최하린' },
  { id: 5, name: '정지우' },
  { id: 6, name: '강유준' },
  { id: 7, name: '조아린' },
  { id: 8, name: '윤서준' },
  { id: 9, name: '장예나' },
  { id: 10, name: '임시우' },
  { id: 11, name: '한지민' },
  { id: 12, name: '오하준' },
];

let zones = [
  createZone('교실 앞문', 2),
  createZone('칠판', 1),
  createZone('분리수거', 2),
  createZone('복도', 3),
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
    if (zone.id !== targetZoneId || zone.assignedStudentIds.length >= zone.capacity) {
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
    check: '✓',
    shuffle: '⇄',
    reset: '↺',
    trash: '×',
    lock: 'L',
    unlock: 'U',
    modern: '▦',
    pastel: '✦',
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
        <h1>청소 구역 배치도</h1>
      </div>
      <div class="theme-switch" aria-label="테마 선택">
        <button class="${state.theme === 'modern' ? 'active' : ''}" type="button" data-action="theme" data-theme="modern" title="모던한 대시보드 스타일">
          ${icon('modern')} 모던
        </button>
        <button class="${state.theme === 'pastel' ? 'active' : ''}" type="button" data-action="theme" data-theme="pastel" title="파스텔톤 카드 레이아웃">
          ${icon('pastel')} 파스텔
        </button>
      </div>
    </header>

    <section class="setup-panel">
      <div class="setup-fields">
        <label>
          구역 이름
          <input id="zone-name" value="${escapeHtml(state.draftZoneName)}" placeholder="예: 교실 앞문" />
        </label>
        <label>
          필요 인원
          <input id="zone-capacity" min="1" type="number" value="${state.draftCapacity}" />
        </label>
        <button class="icon-button primary" type="button" data-action="add-zone">
          ${icon('add')} 추가
        </button>
        <button class="icon-button" type="button" data-action="create-frame">
          ${icon('check')} 틀 생성
        </button>
      </div>
      <div class="stats">
        <span>학생 ${students.length}명</span>
        <span>배정 ${assignedCount}명</span>
        <span>슬롯 ${totalSlots}개</span>
      </div>
    </section>

    <section class="actions">
      <button class="icon-button primary" type="button" data-action="randomize">
        ${icon('shuffle')} 랜덤 배치
      </button>
      <button class="icon-button" type="button" data-action="reset">
        ${icon('reset')} 초기화
      </button>
    </section>

    <div class="workspace">
      <aside class="student-roster" data-drop-id="unassigned">
        <div class="section-title">
          <h2>배정되지 않은 학생</h2>
          <span>${unassignedStudents.length}</span>
        </div>
        <div class="student-list">
          ${
            unassignedStudents.length
              ? unassignedStudents.map((student) => studentCard(student, state.dragging?.studentId)).join('')
              : '<p class="empty-text">모든 학생이 배정되었습니다.</p>'
          }
        </div>
      </aside>

      <section class="zone-board">
        ${
          state.frameCreated
            ? zones.map(zoneCard).join('')
            : '<p class="empty-text">구역을 추가한 뒤 틀을 생성해 주세요.</p>'
        }
      </section>
    </div>

    ${
      state.dragging
        ? `<div class="drag-preview" style="left:${state.dragging.x - state.dragging.offsetX}px; top:${state.dragging.y - state.dragging.offsetY}px; width:${state.dragging.width}px;">${escapeHtml(getStudentById(state.dragging.studentId).name)}</div>`
        : ''
    }
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
    .map(() => '<div class="slot empty">빈 슬롯</div>')
    .join('');

  return `
    <article class="zone-card pastel-${pastelColors[index % pastelColors.length]}" data-drop-id="${zone.id}">
      <div class="zone-header">
        <div>
          <h2>${escapeHtml(zone.name)}</h2>
          <p>${zone.assignedStudentIds.length}/${zone.capacity}명 배정</p>
        </div>
        <button class="square-button" type="button" data-action="remove-zone" data-zone-id="${zone.id}" title="구역 삭제">
          ${icon('trash')}
        </button>
      </div>

      <div class="zone-options">
        <label class="capacity-control">
          인원
          <input min="1" type="number" value="${zone.capacity}" data-action="capacity" data-zone-id="${zone.id}" />
        </label>
        <label class="lock-toggle">
          <input ${zone.fixed ? 'checked' : ''} type="checkbox" data-action="fixed" data-zone-id="${zone.id}" />
          ${icon(zone.fixed ? 'lock' : 'unlock')} 구역 고정
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
