/**
 * BASARNAS ROV TRAINER SIMULATOR - LAUNCHER ENGINE v2.5
 * Fully matching Falah One Design System & Basarnas Figma Non-Simulation Screens
 */

// 1. DATASET SKENARIO SAR BASARNAS (1:1 DENGAN FIGMA NODE 46:7858)
const SCENARIOS = [
  {
    id: 'SKN-02',
    code: 'SKN-02',
    title: 'PEMULIHAN BLACK BOX PESAWAT',
    shortDesc: 'Cari lalu pulihkan black box pesawat dari dasar laut.',
    difficulty: 'Menengah',
    duration: '25 mnt',
    depth: '60 m',
    visibility: 'Vis. 5 m',
    current: '1.5 kn',
    status: 'Tersedia',
    progress: 'Belum dikerjakan',
    iconType: 'crosshair',
    currentDetail: '1,0 kn · tenggara',
    briefing: 'Black box diperkirakan berada di dasar laut pada kedalaman sekitar 60 m, di antara puing pesawat. Visibilitas terbatas dan ada arus sedang dari arah tenggara. Gunakan kamera depan dan lampu ROV untuk menemukan objek, jaga tether agar tidak tersangkut puing, lalu ambil black box dengan manipulator dan bawa kembali ke titik peluncuran.',
    objectives: [
      'Temukan lokasi black box di dasar laut',
      'Dekati black box tanpa membuat tether terbelit',
      'Ambil black box dengan manipulator',
      'Bawa ROV kembali ke titik peluncuran'
    ]
  },
  {
    id: 'SKN-01',
    code: 'SKN-01',
    title: 'ORIENTASI KENDALI DASAR',
    shortDesc: 'Kenali kendali gamepad, kamera ROV, dan panel instrumen di perairan tenang.',
    difficulty: 'Dasar',
    duration: '10 mnt',
    depth: '10 m',
    visibility: 'Vis. 15 m',
    current: '1.5 kn',
    status: 'Tersedia',
    progress: 'Terakhir: 08 Nov 2026',
    iconType: 'waves',
    currentDetail: '0 kn · tenang',
    briefing: 'Latihan pengenalan dasar bagi calon pilot ROV Basarnas. Anda akan mempelajari respons kendali analog 6-DOF (Surge, Sway, Heave, Yaw, Pitch, Roll), kalibrasi daya apung netral, penyesuaian sudut tilt kamera depan, dan membaca panel instrumen navigasi.',
    objectives: [
      'Lakukan uji gaya apung netral (neutral buoyancy check)',
      'Kemudikan ROV melewati 4 gerbang waypoint di kolam uji',
      'Uji tilt kamera depan dan aktifkan lampu LED utama',
      'Mendarat stabil pada landing pad dasar perairan'
    ]
  },
  {
    id: 'SKN-03',
    code: 'SKN-03',
    title: 'INSPEKSI BANGKAI KAPAL',
    shortDesc: 'Periksa lambung bangkai kapal dan dokumentasikan temuan dengan kamera ROV.',
    difficulty: 'Menengah',
    duration: '30 mnt',
    depth: '45 m',
    visibility: 'Vis. 8 m',
    current: '1.5 kn',
    status: 'Tersedia',
    progress: 'Belum dikerjakan',
    iconType: 'anchor',
    currentDetail: '1,5 kn · timur laut',
    briefing: 'Kapal kargo karam pada kedalaman 45 meter. Tim SAR memerlukan dokumentasi visual menyeluruh terhadap lambung bangkai kapal untuk mengidentifikasi titik kebocoran dan memastikan keamanan sebelum tim penyelam masuk.',
    objectives: [
      'Inspeksi perimeter haluan hingga buritan kapal karam',
      'Dokumentasikan retakan utama pada lambung kiri kapal',
      'Hindari kabel dan puing jaring nelayan yang tergantung',
      'Kembali ke tether umbilical cage dengan selamat'
    ]
  },
  {
    id: 'SKN-04',
    code: 'SKN-04',
    title: 'NAVIGASI ARUS KUAT',
    shortDesc: 'Pertahankan posisi dan arah ROV saat arus berubah-ubah.',
    difficulty: 'Menengah',
    duration: '15 mnt',
    depth: '30 m',
    visibility: 'Vis. 10 m',
    current: '1.5 kn',
    status: 'Tersedia',
    progress: 'Belum dikerjakan',
    iconType: 'waves',
    currentDetail: '2,5 kn · barat daya',
    briefing: 'Perairan dengan arus deras bawah laut. Uji ketangkasan pilot dalam mempertahankan posisi stasioner (station-keeping) dengan kompensasi vektor thruster lateral dan kendali auto-heading.',
    objectives: [
      'Pertahankan posisi stasioner selama 3 menit pada titik target',
      'Kompensasi dorongan arus saat mendekati docking beacon',
      'Cegah tegangan kabel tether berlebih akibat tarikan arus'
    ]
  },
  {
    id: 'SKN-05',
    code: 'SKN-05',
    title: 'PENCARIAN VISIBILITAS RENDAH',
    shortDesc: 'Temukan objek target saat jarak pandang kamera sangat terbatas.',
    difficulty: 'Lanjut',
    duration: '20 mnt',
    depth: '40 m',
    visibility: 'Vis. 2 m',
    current: '1.5 kn',
    status: 'Tersedia',
    progress: 'Belum dikerjakan',
    iconType: 'waves',
    currentDetail: '1,0 kn · selatan',
    briefing: 'Dasar laut berpartikel lumpur pekat dengan visibilitas kamera kurang dari 2 meter. Pilot wajib mengandalkan pembacaan sonar pemindai akustik dan altimeter digital untuk bernavigasi tanpa membentur rintangan.',
    objectives: [
      'Aktifkan sonar akustik dan identifikasi kontak target metalik',
      'Kendalikan laju vertikal agar tidak mengaduk lumpur dasar',
      'Lakukan kontak visual jarak dekat dan tandai koordinat GPS'
    ]
  },
  {
    id: 'SKN-06',
    code: 'SKN-06',
    title: 'PENANGANAN KEBOCORAN THRUSTER',
    shortDesc: 'Tanggapi peringatan gangguan dan bawa ROV kembali dengan aman.',
    difficulty: 'Lanjut',
    duration: '20 mnt',
    depth: '50 m',
    visibility: 'Vis. 6 m',
    current: '1.5 kn',
    status: 'Selesai',
    progress: 'Selesaikan SKN-04 dulu',
    iconType: 'crosshair',
    currentDetail: '1,8 kn · barat',
    briefing: 'Simulasi kegagalan operasional: terjadi kebocoran pada thruster vertikal bawah saat misi di kedalaman 50 meter. Pilot harus segera mengisolasi thruster yang bermasalah, menyeimbangkan gaya dorong manual, dan melakukan prosedur penyelamatan darurat.',
    objectives: [
      'Identifikasi alarm malafungsi thruster dan matikan saluran daya',
      'Kompensasi trim secara manual untuk mencegah ROV miring',
      'Bawa ROV naik kembali ke permukaan secara bertahap'
    ]
  }
];

// 2. DATASET DAFTAR LAPORAN (1:1 DENGAN FIGMA NODE 142:5804)
const REPORTS = [
  {
    id: 'LPR-0021',
    scenarioId: 'SKN-02',
    scenarioTitle: 'Pemulihan Black Box Pesawat',
    mode: 'Latihan mandiri',
    modeCategory: 'mandiri',
    date: '11 Nov 2026, 10.12',
    duration: '21:37',
    score: 82,
    status: 'SELESAI',
    statusBadge: 'badge-emerald',
    trainee: 'RAKA PRATAMA',
    objectivesCompleted: '4 / 4',
    faultsCount: 1,
    condition: 'ARUS 1,0 KN',
    timestampFull: '11 NOV 2026, 10.12 WIB',
    replayTime: '09:40 / 21:37'
  },
  {
    id: 'LPR-0019',
    scenarioId: 'SKN-01',
    scenarioTitle: 'Orientasi Kendali Dasar',
    mode: 'Penugasan',
    modeCategory: 'penugasan',
    date: '08 Nov 2026, 14.20',
    duration: '09:48',
    score: 91,
    status: 'SELESAI',
    statusBadge: 'badge-emerald',
    trainee: 'RAKA PRATAMA',
    objectivesCompleted: '4 / 4',
    faultsCount: 0,
    condition: 'ARUS 0 KN',
    timestampFull: '08 NOV 2026, 14.20 WIB',
    replayTime: '09:48 / 09:48'
  },
  {
    id: 'LPR-0018',
    scenarioId: 'SKN-01',
    scenarioTitle: 'Orientasi Kendali Dasar',
    mode: 'Latihan mandiri',
    modeCategory: 'mandiri',
    date: '07 Nov 2026, 15.02',
    duration: '11:20',
    score: 85,
    status: 'SELESAI',
    statusBadge: 'badge-emerald',
    trainee: 'RAKA PRATAMA',
    objectivesCompleted: '4 / 4',
    faultsCount: 1,
    condition: 'ARUS 0,5 KN',
    timestampFull: '07 NOV 2026, 15.02 WIB',
    replayTime: '11:20 / 11:20'
  },
  {
    id: 'LPR-0017',
    scenarioId: 'SKN-01',
    scenarioTitle: 'Orientasi Kendali Dasar',
    mode: 'Latihan mandiri',
    modeCategory: 'mandiri',
    date: '06 Nov 2026, 10.45',
    duration: '13:05',
    score: 68,
    status: 'SELESAI',
    statusBadge: 'badge-emerald',
    trainee: 'RAKA PRATAMA',
    objectivesCompleted: '3 / 4',
    faultsCount: 2,
    condition: 'ARUS 0,8 KN',
    timestampFull: '06 NOV 2026, 10.45 WIB',
    replayTime: '13:05 / 13:05'
  }
];

// 3. APPLICATION STATE
let activeScenarioFilter = 'all';
let scenarioSearchQuery = '';
let activeReportFilter = 'all';
let selectedScenario = SCENARIOS[0];
let selectedReport = REPORTS[0];
let currentScreen = 'login'; // Layar awal wajib ke login!
let isGamepadConnected = false;

// 4. LIFECYCLE INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  // Restore saved reports from localStorage if available
  try {
    const saved = localStorage.getItem('basarnas_reports');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        REPORTS.splice(0, REPORTS.length, ...parsed);
      }
    }
  } catch (e) {}

  initClock();
  initGamepadListener();
  renderScenarioGrid();
  renderReportTable();

  // Cek apakah ada hash di URL (misal #beranda, #deskripsi, dll)
  const hash = window.location.hash.replace('#', '');
  if (hash && ['beranda', 'deskripsi', 'kalibrasi', 'daftarlaporan', 'detaillaporan', 'hasilsesi', 'simulasi'].includes(hash)) {
    navigateTo(hash);
  } else {
    // Default: Membuka layar Login pertama kali
    navigateTo('login');
  }
});

// ==========================================================================
// A. PAGE NAVIGATION ROUTER
// Layar yang didukung: 'login' | 'beranda' | 'deskripsi' | 'kalibrasi' | 'daftarlaporan' | 'detaillaporan' | 'hasilsesi' | 'simulasi'
// ==========================================================================
function navigateTo(screenId, param = null) {
  currentScreen = screenId;

  // Sembunyikan semua layar
  const screens = [
    'page-login', 
    'page-beranda', 
    'page-deskripsi', 
    'page-kalibrasi', 
    'page-daftarlaporan', 
    'page-detaillaporan',
    'page-hasilsesi',
    'page-simulasi'
  ];
  
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  // Header & Footer visibility: hanya tampil bila BUKAN di layar login, hasilsesi atau simulasi!
  const headerEl = document.getElementById('app-header');
  const footerEl = document.getElementById('app-footer');
  const isImmersive = (screenId === 'login' || screenId === 'simulasi' || screenId === 'hasilsesi');
  if (headerEl) headerEl.classList.toggle('hidden', isImmersive);
  if (footerEl) footerEl.classList.toggle('hidden', isImmersive);

  // Tampilkan layar target
  const targetPage = document.getElementById(`page-${screenId}`);
  if (targetPage) targetPage.classList.remove('hidden');

  // Update status aktif tombol navigasi header (BERANDA vs LAPORAN)
  updateNavHeader(screenId);

  // Penanganan data khusus per layar
  if (screenId === 'beranda') {
    renderScenarioGrid();
  } else if (screenId === 'deskripsi') {
    if (param) selectedScenario = param;
    renderScenarioDetailPage(selectedScenario);
  } else if (screenId === 'kalibrasi') {
    startGamepadPolling();
  } else if (screenId === 'daftarlaporan') {
    renderReportTable();
  } else if (screenId === 'detaillaporan') {
    if (param) selectedReport = param;
    renderReportDetailPage(selectedReport);
  } else if (screenId === 'hasilsesi') {
    renderHasilSesiPage(param);
  } else if (screenId === 'simulasi') {
    if (window.startROVSimulation) {
      window.startROVSimulation(selectedScenario);
    }
    const simPage = document.getElementById('page-simulasi');
    if (simPage) simPage.focus();
    window.focus();
  }

  // Refresh Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// B. UPDATE HEADER NAVIGATION BUTTONS
function updateNavHeader(screenId) {
  const btnBeranda = document.getElementById('nav-btn-beranda');
  const btnLaporan = document.getElementById('nav-btn-laporan');

  if (btnBeranda) {
    if (screenId === 'beranda' || screenId === 'deskripsi' || screenId === 'kalibrasi') {
      btnBeranda.className = 'font-display font-bold text-base tracking-widest text-amber-400 pb-1 border-b-2 border-amber-400 uppercase transition-colors cursor-pointer';
    } else {
      btnBeranda.className = 'font-display font-bold text-base tracking-widest text-slate-400 hover:text-slate-200 pb-1 border-b-2 border-transparent uppercase transition-colors cursor-pointer';
    }
  }

  if (btnLaporan) {
    if (screenId === 'daftarlaporan' || screenId === 'detaillaporan') {
      btnLaporan.className = 'font-display font-bold text-base tracking-widest text-amber-400 pb-1 border-b-2 border-amber-400 uppercase transition-colors cursor-pointer';
    } else {
      btnLaporan.className = 'font-display font-bold text-base tracking-widest text-slate-400 hover:text-slate-200 pb-1 border-b-2 border-transparent uppercase transition-colors cursor-pointer';
    }
  }
}

// C. AUTHENTICATION (LOGIN & LOGOUT)
function handleLogin(e) {
  if (e) e.preventDefault();
  const loginBtn = document.getElementById('login-submit-btn');

  if (loginBtn) {
    loginBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> MEMERIKSA KREDENSIAL...`;
    loginBtn.disabled = true;
    if (window.lucide) window.lucide.createIcons();
  }

  setTimeout(() => {
    if (loginBtn) {
      loginBtn.innerHTML = `<img src="assets/icon_arrow.svg" alt="" class="w-4 h-4 shrink-0" /> <span>MASUK</span>`;
      loginBtn.disabled = false;
      if (window.lucide) window.lucide.createIcons();
    }
    // Masuk ke layar Beranda
    navigateTo('beranda');
  }, 400);
}

function handleLogout() {
  if (confirm("Apakah Anda yakin ingin keluar dari sesi Trainee ROV Sealion?")) {
    navigateTo('login');
  }
}

function togglePasswordVisibility() {
  const input = document.getElementById('login-pass-input');
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

// D. CLOCK REAL-TIME
function initClock() {
  const clockEl = document.getElementById('tactical-clock');
  const dateEl = document.getElementById('tactical-date');

  function update() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    if (clockEl) clockEl.textContent = `${h}:${m}:${s}`;

    const days = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
    const dStr = days[now.getDay()];
    const dNum = now.getDate();
    const mStr = months[now.getMonth()];
    const yNum = now.getFullYear();
    if (dateEl) dateEl.textContent = `${dStr}, ${dNum} ${mStr} ${yNum}`;
  }

  update();
  setInterval(update, 1000);
}

// ==========================================================================
// E. RENDER SCENARIO GRID (BERANDA - 1:1 FIGMA NODE 46:7858)
// Setiap card memiliki efek hover outline kuning (.card-tactical) + siku
// ==========================================================================
function renderScenarioGrid() {
  const gridContainer = document.getElementById('scenarios-grid');
  if (!gridContainer) return;

  const filtered = SCENARIOS.filter(s => {
    const matchFilter = activeScenarioFilter === 'all' || s.difficulty.toLowerCase() === activeScenarioFilter.toLowerCase();
    const matchSearch = s.title.toLowerCase().includes(scenarioSearchQuery.toLowerCase()) ||
                        s.id.toLowerCase().includes(scenarioSearchQuery.toLowerCase()) ||
                        s.difficulty.toLowerCase().includes(scenarioSearchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counterEl = document.getElementById('scenario-counter');
  if (counterEl) {
    counterEl.textContent = `12 SKENARIO · ${filtered.length} TERSEDIA`;
  }

  gridContainer.innerHTML = '';

  filtered.forEach((scenario, index) => {
    const card = document.createElement('div');
    
    // Default: Card pertama memiliki aksen kuning halus, dan SEMUA kartu saat di-hover memiliki outline kuning & siku!
    const isFirstCard = index === 0 && activeScenarioFilter === 'all';
    card.className = `card-tactical p-4 flex flex-col justify-between group ${isFirstCard ? 'border-amber-400/80 shadow-[0_0_12px_rgba(245,158,11,0.2)]' : 'bg-[#081e25]/90 border border-[#143d46]'}`;
    card.onclick = () => navigateTo('deskripsi', scenario);

    // Tactical Corner Brackets (Siku)
    const corners = `
      <div class="tactical-corner corner-tl ${isFirstCard ? '!opacity-100' : ''}"></div>
      <div class="tactical-corner corner-tr ${isFirstCard ? '!opacity-100' : ''}"></div>
      <div class="tactical-corner corner-bl ${isFirstCard ? '!opacity-100' : ''}"></div>
      <div class="tactical-corner corner-br ${isFirstCard ? '!opacity-100' : ''}"></div>
    `;

    // Icon Vector
    let iconVector = '';
    if (scenario.iconType === 'anchor') {
      iconVector = `<i data-lucide="anchor" class="w-12 h-12 text-teal-400/40"></i>`;
    } else if (scenario.iconType === 'waves') {
      iconVector = `<i data-lucide="waves" class="w-12 h-12 text-teal-400/40"></i>`;
    } else {
      iconVector = `
        <svg viewBox="0 0 60 60" class="w-12 h-12 stroke-teal-400/40 fill-none stroke-[1.5]">
          <circle cx="30" cy="30" r="22" stroke-dasharray="2 2" />
          <line x1="30" y1="4" x2="30" y2="56" />
          <line x1="4" y1="30" x2="56" y2="30" />
        </svg>
      `;
    }

    card.innerHTML = `
      ${corners}
      
      <div>
        <!-- Baris Atas: Kode Skenario, Badge Status, & Watermark Icon -->
        <div class="flex items-start justify-between mb-2">
          <span class="font-mono text-xs font-bold text-slate-300">${scenario.code}</span>
          <div class="flex items-center gap-2">
            <span class="badge ${scenario.status === 'Selesai' ? 'badge-emerald' : 'badge-teal'} text-[10px]">${scenario.status}</span>
          </div>
        </div>

        <!-- Watermark Art Posisi Kanan Atas -->
        <div class="flex justify-end -mt-2 mb-1">
          ${iconVector}
        </div>

        <!-- Tingkat Kesulitan -->
        <p class="font-mono text-[10px] text-teal-400 tracking-wider uppercase mb-1">
          TINGKAT: ${scenario.difficulty.toUpperCase()}
        </p>

        <!-- Judul Skenario -->
        <h3 class="font-display font-bold text-sm text-slate-100 uppercase tracking-wide group-hover:text-amber-300 transition-colors mb-1.5">
          ${scenario.title}
        </h3>

        <!-- Deskripsi Singkat -->
        <p class="font-body text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
          ${scenario.shortDesc}
        </p>
      </div>

      <!-- Baris Parameter & Status Bawah -->
      <div>
        <div class="flex items-center gap-3 text-[11px] font-mono text-slate-300 py-1.5 border-t border-[#10343c]">
          <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3 text-teal-400"></i>${scenario.duration}</span>
          <span class="flex items-center gap-1"><i data-lucide="arrow-down-up" class="w-3 h-3 text-teal-400"></i>${scenario.depth}</span>
          <span class="flex items-center gap-1"><i data-lucide="eye" class="w-3 h-3 text-teal-400"></i>${scenario.visibility}</span>
          <span class="flex items-center gap-1"><i data-lucide="wind" class="w-3 h-3 text-teal-400"></i>${scenario.current}</span>
        </div>

        <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-[#10343c]">
          <span class="${scenario.progress.includes('Terakhir') ? 'text-teal-300' : 'text-slate-400'}">${scenario.progress.toUpperCase()}</span>
          <i data-lucide="${scenario.status === 'Selesai' ? 'check' : 'chevron-right'}" class="w-3.5 h-3.5 text-teal-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all"></i>
        </div>
      </div>
    `;

    gridContainer.appendChild(card);
  });

  if (window.lucide) window.lucide.createIcons();
}

function filterScenarios(category) {
  activeScenarioFilter = category;
  const btns = document.querySelectorAll('.scenario-filter-btn');
  btns.forEach(btn => {
    btn.classList.remove('active', 'text-amber-400', 'border-b-2', 'border-amber-400');
    btn.classList.add('text-slate-400');
  });

  const activeBtn = document.querySelector(`[data-filter="${category}"]`);
  if (activeBtn) {
    activeBtn.classList.remove('text-slate-400');
    activeBtn.classList.add('active', 'text-amber-400', 'border-b-2', 'border-amber-400');
  }

  renderScenarioGrid();
}

function handleSearchScenario(val) {
  scenarioSearchQuery = val.trim();
  renderScenarioGrid();
}

// ==========================================================================
// F. RENDER DETAIL SKENARIO PAGE (1:1 FIGMA NODE 59:8576)
// ==========================================================================
function renderScenarioDetailPage(scenario) {
  if (!scenario) return;

  const codeEl = document.getElementById('desc-code');
  const diffEl = document.getElementById('desc-difficulty');
  const titleEl = document.getElementById('desc-title');
  const shortEl = document.getElementById('desc-short');
  const briefingEl = document.getElementById('desc-briefing-text');

  if (codeEl) codeEl.textContent = scenario.code;
  if (diffEl) diffEl.textContent = `TINGKAT ${scenario.difficulty.toUpperCase()}`;
  if (titleEl) titleEl.textContent = scenario.title;
  if (shortEl) shortEl.textContent = scenario.shortDesc;
  if (briefingEl) briefingEl.textContent = scenario.briefing;

  // Kondisi Misi Parameters
  const depthEl = document.getElementById('desc-cond-depth');
  const currEl = document.getElementById('desc-cond-current');
  const visEl = document.getElementById('desc-cond-vis');
  const durEl = document.getElementById('desc-cond-duration');

  if (depthEl) depthEl.textContent = scenario.depth;
  if (currEl) currEl.textContent = scenario.currentDetail || `${scenario.current} · tenggara`;
  if (visEl) visEl.textContent = scenario.visibility.replace('Vis. ', '');
  if (durEl) durEl.textContent = scenario.duration.replace('mnt', 'menit');

  // Objektif Misi (4 Cards)
  const objContainer = document.getElementById('desc-objectives-container');
  if (objContainer && scenario.objectives) {
    objContainer.innerHTML = '';
    scenario.objectives.forEach((objText, idx) => {
      const row = document.createElement('div');
      row.className = 'p-3 bg-[#081f26] border border-[#143b44] rounded flex items-center gap-3';
      row.innerHTML = `
        <span class="w-6 h-6 rounded bg-[#0b2b34] text-teal-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">${idx + 1}</span>
        <p class="font-body text-sm text-slate-200">${objText}</p>
      `;
      objContainer.appendChild(row);
    });
  }

  if (window.lucide) window.lucide.createIcons();
}

// ==========================================================================
// G. RENDER DAFTAR LAPORAN TABLE (1:1 FIGMA NODE 142:5804)
// ==========================================================================
function renderReportTable() {
  const tableBody = document.getElementById('report-table-body');
  if (!tableBody) return;

  const filtered = REPORTS.filter(r => {
    if (activeReportFilter === 'all') return true;
    return r.modeCategory === activeReportFilter;
  });

  tableBody.innerHTML = '';

  filtered.forEach((report, idx) => {
    const tr = document.createElement('tr');
    
    // Baris pertama (atau yang terpilih) memiliki highlight border amber sesuai Figma!
    const isFirstRow = idx === 0;
    tr.className = `group cursor-pointer transition-all ${isFirstRow ? 'bg-[#09222a] border border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]' : 'hover:bg-[#09222a]'}`;
    tr.onclick = () => navigateTo('detaillaporan', report);

    tr.innerHTML = `
      <td class="py-3.5 px-4 font-mono text-xs font-bold text-amber-400">${report.id}</td>
      <td class="py-3.5 px-4 font-body font-semibold ${isFirstRow ? 'text-amber-300' : 'text-slate-200'} group-hover:text-amber-300 transition-colors">
        ${report.scenarioTitle}
      </td>
      <td class="py-3.5 px-4 font-body text-xs text-slate-300">${report.mode}</td>
      <td class="py-3.5 px-4 font-mono text-xs text-slate-400">${report.date}</td>
      <td class="py-3.5 px-4 font-mono text-xs text-slate-300 text-center">${report.duration}</td>
      <td class="py-3.5 px-4 font-mono text-sm font-bold text-slate-100 text-center">${report.score}</td>
      <td class="py-3.5 px-4 text-center">
        <span class="badge ${report.statusBadge} text-[10px]">${report.status}</span>
      </td>
      <td class="py-3.5 px-4 text-right">
        <i data-lucide="chevron-right" class="w-4 h-4 text-teal-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all inline-block"></i>
      </td>
    `;

    tableBody.appendChild(tr);
  });

  if (window.lucide) window.lucide.createIcons();
}

function filterReportTable(tabType) {
  activeReportFilter = tabType;
  const tabs = document.querySelectorAll('.report-table-tab');
  tabs.forEach(tab => {
    tab.classList.remove('active', 'text-amber-400', 'border-b-2', 'border-amber-400');
    tab.classList.add('text-slate-400');
  });

  const activeTab = document.querySelector(`[data-reptab="${tabType}"]`);
  if (activeTab) {
    activeTab.classList.remove('text-slate-400');
    activeTab.classList.add('active', 'text-amber-400', 'border-b-2', 'border-amber-400');
  }

  renderReportTable();
}

// ==========================================================================
// H. RENDER DETAIL LAPORAN PAGE (1:1 FIGMA NODE 179:4543)
// ==========================================================================
function renderReportDetailPage(report) {
  if (!report) return;

  const breadcrumbEl = document.getElementById('detail-rep-breadcrumb');
  if (breadcrumbEl) {
    breadcrumbEl.textContent = `${report.id} · ${report.scenarioTitle.toUpperCase()}`;
  }

  // Metric Cards
  const traineeEl = document.getElementById('det-trainee');
  const scoreEl = document.getElementById('det-score');
  const durationEl = document.getElementById('det-duration');
  const objectivesEl = document.getElementById('det-objectives');
  const faultsEl = document.getElementById('det-faults');
  const conditionEl = document.getElementById('det-condition');

  if (traineeEl) traineeEl.textContent = report.trainee || 'RAKA PRATAMA';
  if (scoreEl) scoreEl.textContent = `${report.score} / 100`;
  if (durationEl) durationEl.textContent = report.duration;
  if (objectivesEl) objectivesEl.textContent = report.objectivesCompleted || '4 / 4';
  if (faultsEl) faultsEl.textContent = String(report.faultsCount ?? 1);
  if (conditionEl) conditionEl.textContent = report.condition || 'ARUS 1,0 KN';

  if (window.lucide) window.lucide.createIcons();
}

// ==========================================================================
// H2. RENDER HASIL SESI TRAINEE (1:1 FIGMA NODE 124:3803)
// ==========================================================================
function renderHasilSesiPage(sessionData) {
  const data = sessionData || {
    score: 82,
    scenarioTitle: 'PEMULIHAN BLACK BOX PESAWAT',
    timestamp: '11 NOV 2026, 10.12 – 10.34 WIB · REKAMAN TERSIMPAN',
    duration: '21:37',
    objectivesCompleted: '4 / 4',
    faultsCount: 1,
    collisionsCount: 2,
    objectives: [
      { text: 'Temukan lokasi black box di dasar laut', time: '03:12' },
      { text: 'Dekati black box tanpa membuat tether terbelit', time: '08:55' },
      { text: 'Ambil black box dengan manipulator', time: '15:20' },
      { text: 'Bawa ROV kembali ke titik peluncuran', time: '21:37' }
    ]
  };

  // 1. Skor Ring & Angka
  const scoreNumEl = document.getElementById('hasilsesi-score-num');
  if (scoreNumEl) scoreNumEl.textContent = data.score !== undefined ? data.score : 82;

  const scoreCircle = document.getElementById('hasilsesi-score-circle');
  if (scoreCircle) {
    const circumference = 515.22;
    const scoreVal = data.score !== undefined ? data.score : 82;
    const offset = circumference - (circumference * scoreVal / 100);
    scoreCircle.style.strokeDashoffset = offset;
  }

  // 2. Judul Skenario & Waktu
  const titleEl = document.getElementById('hasilsesi-scenario-title');
  if (titleEl) titleEl.textContent = data.scenarioTitle ? data.scenarioTitle.toUpperCase() : 'PEMULIHAN BLACK BOX PESAWAT';

  const timeEl = document.getElementById('hasilsesi-timestamp');
  if (timeEl) timeEl.textContent = data.timestamp || '11 NOV 2026, 10.12 – 10.34 WIB · REKAMAN TERSIMPAN';

  // 3. Stat Card Metrics
  const durEl = document.getElementById('hasilsesi-stat-duration');
  if (durEl) durEl.textContent = data.duration || '21:37';

  const objEl = document.getElementById('hasilsesi-stat-objectives');
  if (objEl) objEl.textContent = data.objectivesCompleted || '4 / 4';

  const faultsEl = document.getElementById('hasilsesi-stat-faults');
  if (faultsEl) faultsEl.textContent = String(data.faultsCount ?? 1);

  const collEl = document.getElementById('hasilsesi-stat-collisions');
  if (collEl) collEl.textContent = String(data.collisionsCount ?? 2);

  // 4. Checklist Objektif Timestamps
  if (data.objectives && Array.isArray(data.objectives)) {
    for (let i = 0; i < 4; i++) {
      const objTimeEl = document.getElementById(`hasilsesi-time-obj-${i + 1}`);
      if (objTimeEl && data.objectives[i]) {
        objTimeEl.textContent = data.objectives[i].time || '—';
      }
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

function addCompletedSessionReport(sessionResult) {
  if (!sessionResult) return;

  const newReport = {
    id: sessionResult.id || `LPR-00${String(REPORTS.length + 22).padStart(2, '0')}`,
    scenarioId: sessionResult.scenarioId || 'SKN-02',
    scenarioTitle: sessionResult.scenarioTitle || 'Pemulihan Black Box Pesawat',
    mode: 'Latihan mandiri',
    modeCategory: 'mandiri',
    date: sessionResult.timestamp ? sessionResult.timestamp.split('·')[0].trim() : '11 Nov 2026, 10.12',
    duration: sessionResult.duration || '21:37',
    score: sessionResult.score || 82,
    status: 'SELESAI',
    statusBadge: 'badge-emerald',
    trainee: 'RAKA PRATAMA',
    objectivesCompleted: '4 / 4',
    faultsCount: sessionResult.faultsCount !== undefined ? sessionResult.faultsCount : 1,
    condition: 'ARUS 1,0 KN',
    timestampFull: sessionResult.timestamp || '11 NOV 2026, 10.12 WIB',
    replayTime: `${sessionResult.duration || '21:37'} / ${sessionResult.duration || '21:37'}`
  };

  // Prepend ke REPORTS agar langsung muncul di baris paling atas tabel laporan!
  REPORTS.unshift(newReport);

  // Persist ke LocalStorage
  try {
    localStorage.setItem('basarnas_reports', JSON.stringify(REPORTS));
  } catch (e) {}

  // Re-render tabel daftar laporan
  renderReportTable();
}

// Expose secara global agar bisa dipanggil dari simulation.js
window.REPORTS = REPORTS;
window.renderHasilSesiPage = renderHasilSesiPage;
window.addCompletedSessionReport = addCompletedSessionReport;

// ==========================================================================
// I. KALIBRASI KONTROL (XBOX GAMEPAD API & KEYBOARD WASD + Q/E FALLBACK)
// ==========================================================================
function initGamepadListener() {
  window.addEventListener('gamepadconnected', (e) => {
    isGamepadConnected = true;
    updateGamepadBadge(true);
  });

  window.addEventListener('gamepaddisconnected', () => {
    isGamepadConnected = false;
    updateGamepadBadge(false);
  });

  setupKeyboardControls();
}

function updateGamepadBadge(connected) {
  const badge = document.getElementById('gamepad-status-badge');
  if (badge) {
    if (connected) {
      badge.className = 'badge badge-emerald font-mono';
      badge.textContent = 'TERHUBUNG';
    } else {
      badge.className = 'badge badge-amber font-mono';
      badge.textContent = 'KEYBOARD AKTIF';
    }
  }
}

function startGamepadPolling() {
  function poll() {
    if (currentScreen !== 'kalibrasi') return;

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    let gp = null;
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        gp = gamepads[i];
        break;
      }
    }

    if (gp) {
      updateGamepadBadge(true);
      updateGamepadVisuals(gp);
    }
    requestAnimationFrame(poll);
  }
  requestAnimationFrame(poll);
}

function updateGamepadVisuals(gp) {
  // Left Stick (Axes 0 & 1)
  const lx = gp.axes[0] || 0;
  const ly = gp.axes[1] || 0;
  setStickVisual('stick-left-dot', 'stick-left-coords', lx, ly);

  // Right Stick (Axes 2 & 3)
  const rx = gp.axes[2] || 0;
  const ry = gp.axes[3] || 0;
  setStickVisual('stick-right-dot', 'stick-right-coords', rx, ry);

  // ABXY Buttons
  setButtonState('gp-btn-a', gp.buttons[0]?.pressed);
  setButtonState('gp-btn-b', gp.buttons[1]?.pressed);
  setButtonState('gp-btn-x', gp.buttons[2]?.pressed);
  setButtonState('gp-btn-y', gp.buttons[3]?.pressed);

  // LB & RB
  setButtonState('gp-btn-lb', gp.buttons[4]?.pressed);
  setButtonState('gp-btn-rb', gp.buttons[5]?.pressed);

  // LT & RT Triggers
  setTriggerState('gp-btn-lt', gp.buttons[6]?.value || 0);
  setTriggerState('gp-btn-rt', gp.buttons[7]?.value || 0);
}

function setStickVisual(dotId, labelId, x, y) {
  const dot = document.getElementById(dotId);
  const label = document.getElementById(labelId);
  const maxPx = 40;
  if (dot) {
    dot.style.transform = `translate(${x * maxPx}px, ${y * maxPx}px)`;
  }
  if (label) {
    label.textContent = `X ${x >= 0 ? '+' : ''}${x.toFixed(2)} · Y ${y >= 0 ? '+' : ''}${y.toFixed(2)}`;
  }
}

function setButtonState(elementId, isPressed) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (isPressed) {
    el.classList.add('bg-amber-400', 'text-slate-950', 'ring-2', 'ring-amber-300', 'scale-110');
  } else {
    el.classList.remove('bg-amber-400', 'text-slate-950', 'ring-2', 'ring-amber-300', 'scale-110');
  }
}

function setTriggerState(elementId, value) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (value > 0.1) {
    el.classList.add('bg-amber-400', 'text-slate-950', 'ring-2', 'ring-amber-300');
  } else {
    el.classList.remove('bg-amber-400', 'text-slate-950', 'ring-2', 'ring-amber-300');
  }
}

// Keyboard Listeners: WASD (Gerak), Q (Turun Vertikal), E (Naik Vertikal), Panah (Kamera)
function setupKeyboardControls() {
  window.addEventListener('keydown', (e) => {
    if (currentScreen !== 'kalibrasi') return;
    const k = e.key.toLowerCase();

    // W / S / A / D: Analog Kiri (Surge & Sway)
    if (k === 'w') setStickVisual('stick-left-dot', 'stick-left-coords', 0, -0.95);
    if (k === 's') setStickVisual('stick-left-dot', 'stick-left-coords', 0, 0.95);
    if (k === 'a') setStickVisual('stick-left-dot', 'stick-left-coords', -0.95, 0);
    if (k === 'd') setStickVisual('stick-left-dot', 'stick-left-coords', 0.95, 0);

    // Q: TURUN VERTIKAL (HEAVE DOWN) & E: NAIK VERTIKAL (HEAVE UP)
    if (k === 'q') setButtonState('gp-btn-lb', true);
    if (k === 'e') setButtonState('gp-btn-rb', true);

    // Panah: Analog Kanan (Yaw & Tilt)
    if (k === 'arrowup') setStickVisual('stick-right-dot', 'stick-right-coords', 0, -0.95);
    if (k === 'arrowdown') setStickVisual('stick-right-dot', 'stick-right-coords', 0, 0.95);
    if (k === 'arrowleft') setStickVisual('stick-right-dot', 'stick-right-coords', -0.95, 0);
    if (k === 'arrowright') setStickVisual('stick-right-dot', 'stick-right-coords', 0.95, 0);

    // Action Buttons
    if (k === ' ') setButtonState('gp-btn-a', true);
    if (k === 'escape') setButtonState('gp-btn-b', true);
    if (k === 'f') setButtonState('gp-btn-x', true);
    if (k === 'v') setButtonState('gp-btn-y', true);
  });

  window.addEventListener('keyup', (e) => {
    if (currentScreen !== 'kalibrasi') return;
    const k = e.key.toLowerCase();

    if (['w', 's', 'a', 'd'].includes(k)) {
      setStickVisual('stick-left-dot', 'stick-left-coords', 0, 0);
    }
    if (k === 'q') setButtonState('gp-btn-lb', false);
    if (k === 'e') setButtonState('gp-btn-rb', false);

    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
      setStickVisual('stick-right-dot', 'stick-right-coords', 0, 0);
    }

    if (k === ' ') setButtonState('gp-btn-a', false);
    if (k === 'escape') setButtonState('gp-btn-b', false);
    if (k === 'f') setButtonState('gp-btn-x', false);
    if (k === 'v') setButtonState('gp-btn-y', false);
  });
}

// Simulasi Start Execution
function handleStartSimulation() {
  navigateTo('simulasi');
}
