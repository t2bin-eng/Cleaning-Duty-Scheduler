# 청소 구역 배치도 자동 생성 및 관리 웹앱

학급 학생을 청소 구역별 필요 인원에 맞게 배정하는 정적 웹앱입니다. 별도 프레임워크 설치 없이 HTML, CSS, Vanilla JavaScript만으로 동작합니다.

## 주요 기능

- 청소 구역 이름과 필요 인원 입력
- `틀 생성` 버튼으로 구역 카드와 슬롯 동적 생성
- 모던 대시보드 / 파스텔 카드 레이아웃 테마 실시간 전환
- 마우스와 터치 기반 학생 카드 드래그 앤 드롭
- 미배정 명단, 다른 구역, 기존 구역 간 학생 이동
- 고정된 구역은 랜덤 배치 시 현재 상태 유지
- 이미 직접 배정된 학생은 랜덤 배치 대상에서 제외

## 데이터 구조

학생 데이터는 `src/main.js`의 배열로 관리합니다.

```js
const students = [
  { id: 1, name: '김민준' },
  { id: 2, name: '이서연' },
];
```

청소 구역 데이터는 구역별 슬롯 수, 고정 여부, 배정 학생 ID 목록을 함께 관리합니다.

```js
const zones = [
  {
    id: 'zone-id',
    name: '교실 앞문',
    capacity: 2,
    fixed: false,
    assignedStudentIds: [1, 2],
  },
];
```

랜덤 배치 로직은 `src/main.js`의 `assignRandomStudents` 함수에 있습니다.

- `fixed: true`인 구역은 그대로 둡니다.
- 이미 어느 구역에든 배정된 학생은 제외합니다.
- 미배정 학생만 섞은 뒤 빈 슬롯에 순서대로 채웁니다.

## 로컬 실행

이 프로젝트는 정적 파일이라 `index.html`을 브라우저로 열어도 동작합니다. 로컬 서버로 확인하려면 아래 명령을 사용합니다.

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`을 엽니다.

## 빌드 확인

별도 번들링이 필요하지 않습니다. Vercel에는 정적 파일 그대로 배포할 수 있습니다.

```bash
npm run build
```

## GitHub 업로드 절차

1. Git 저장소를 초기화합니다.

```bash
git init
git add .
git commit -m "Initial cleaning zone planner"
```

2. GitHub에서 새 저장소를 만듭니다.

3. 원격 저장소를 연결하고 푸시합니다.

```bash
git remote add origin https://github.com/사용자명/저장소명.git
git branch -M main
git push -u origin main
```

## Vercel 배포 절차

1. [Vercel](https://vercel.com)에 로그인합니다.
2. `Add New...`에서 `Project`를 선택합니다.
3. GitHub 저장소를 Import 합니다.
4. Framework Preset은 `Other` 또는 자동 감지 상태 그대로 둡니다.
5. Build Command는 비워두거나 `npm run build`로 둡니다.
6. Output Directory는 비워둡니다.
7. `Deploy`를 누릅니다.

배포 후 GitHub `main` 브랜치에 새 커밋을 푸시하면 Vercel이 자동으로 다시 배포합니다.

## 파일 구성

```text
.
├─ index.html
├─ package.json
├─ README.md
├─ server.js
└─ src
   ├─ main.js
   └─ styles.css
```
