/**
 * =============================================================================
 * BASARNAS ROV TRAINER SIMULATOR - 3D SPATIAL ENGINE (Three.js WebGL)
 * Skenario Operasi: Pemulihan Black Box & Navigasi Bawah Air (ROV Sealion)
 * =============================================================================
 */

(function () {
  'use strict';

  // --- STATE SIMULASI ---
  let isRunning = false;
  let activeScenario = null;
  let scene, renderer;
  let chaseCamera, rovCamera, pipCamera;
  let activeCameraMode = 'fpv'; // Default ke 'fpv' (First-Person View) sesuai Desain Figma
  let pipRenderer = null;

  // Collision Detection & Screen Damage Effect
  let isCollidingCooldown = false;
  let cameraShakeIntensity = 0;
  const collisionObstacles = [
    // Pinnacles
    { pos: new THREE.Vector3(-12, -18, -10), radius: 2.6, name: 'Karang Pilar Barat' },
    { pos: new THREE.Vector3(18, -19, 8), radius: 2.6, name: 'Karang Pilar Timur' },
    { pos: new THREE.Vector3(-8, -18, 14), radius: 2.6, name: 'Karang Pilar Selatan' },
    { pos: new THREE.Vector3(8, -18, -14), radius: 2.6, name: 'Karang Pilar Utara' },
    { pos: new THREE.Vector3(-20, -18, -4), radius: 2.6, name: 'Karang Pilar Luar' },
    // Bebatuan Karang di Sekitar Target Black Box
    { pos: new THREE.Vector3(0.5, -21, -17.5), radius: 2.2, name: 'Batu Karang A' },
    { pos: new THREE.Vector3(4.8, -21, -14.0), radius: 2.0, name: 'Batu Karang B' },
    { pos: new THREE.Vector3(-2.5, -21, -13.5), radius: 1.8, name: 'Batu Karang C' },
    { pos: new THREE.Vector3(3.2, -21, -16.8), radius: 1.6, name: 'Batu Karang D' },
    { pos: new THREE.Vector3(-6.0, -21, -6.0), radius: 2.4, name: 'Batu Karang Tengah' },
    { pos: new THREE.Vector3(6.0, -21, 6.0), radius: 2.2, name: 'Batu Karang Tenggara' },
    // Sunken Crate & Barrel
    { pos: new THREE.Vector3(5.0, -20.8, -16.0), radius: 1.6, name: 'Puing Kargo Pesawat' },
    { pos: new THREE.Vector3(-3.0, -20.6, -15.0), radius: 1.4, name: 'Tong Logistik Terendam' }
  ];

  // Objek 3D
  let rovModel = null;
  let blackBoxModel = null;
  let tetherLine = null;
  let headlights = [];
  let thrusterProps = [];
  let envObjects = [];

  // Fisika & Posisi ROV
  const rovPhysics = {
    pos: new THREE.Vector3(0, -5, 0),       // Kedalaman awal 5m di bawah permukaan
    vel: new THREE.Vector3(0, 0, 0),       // Kecepatan
    rot: new THREE.Euler(0, 0, 0, 'YXZ'),  // Rotasi haluan
    heading: 0,                            // Sudut yaw (derajat)
    pitch: 0,
    roll: 0,
    thrustSurge: 0,                        // Maju / Mundur
    thrustSway: 0,                         // Geser Samping
    thrustHeave: 0,                        // Naik / Turun
    thrustYaw: 0,                          // Putar Haluan
    isClawClamped: false,                  // Status Cakar Penjepit
    isHeadlightsOn: true,                  // Saklar Lampu LED
    isTargetRecovered: false,              // Status Pengambilan Black Box
    tetherLength: 5.0,                     // Panjang kabel terurai (meter)
    tetherMax: 50.0                        // Batas maksimal kabel
  };

  // Posisi Black Box Target (di dasar laut pada koordinat X: 1.5m, Z: -15m, Y: -20.2m)
  const targetPos = new THREE.Vector3(1.5, -20.2, -15.0);

  // Titik Peluncuran Awal di Permukaan (Launch Point)
  const launchOrigin = new THREE.Vector3(0, 0, 0);

  // Parameter Kontrol Keyboard
  const keys = {};

  // Audio Context untuk Sonar Pinger
  let lastPingTime = 0;
  let pingInterval = 1800; // ms

  // Timer Misi
  let missionStartTime = 0;
  let elapsedSeconds = 0;
  let missionTimerInterval = null;

  // Indikator Objektif Misi
  const objectivesStatus = [false, false, false, false];
  const objectiveTimes = [null, null, null, null];

  // ===========================================================================
  // 1. INISIALISASI SCENE & RENDERER
  // ===========================================================================
  function initSimulation(scenario) {
    activeScenario = scenario || {
      id: 'SKN-02',
      title: 'PEMULIHAN BLACK BOX PESAWAT',
      depth: '60 m',
      current: '1.0 kn · tenggara'
    };

    // Reset status & waktu objektif
    for (let i = 0; i < 4; i++) {
      objectivesStatus[i] = false;
      objectiveTimes[i] = null;
    }

    const container = document.getElementById('sim-canvas-container');
    if (!container) return;

    // Bersihkan container sebelumnya
    container.innerHTML = '';

    // Buat Scene Utama
    scene = new THREE.Scene();
    // Warna dasar laut biru pekat gelap (Midnight Abyssal Navy)
    scene.background = new THREE.Color(0x02131c);
    // Kabut bawah laut alami (Underwater Fog) dengan visibilitas ~16 meter
    scene.fog = new THREE.FogExp2(0x02131c, 0.038);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Chase Camera (Third Person View di belakang ROV)
    chaseCamera = new THREE.PerspectiveCamera(55, width / height, 0.1, 300);
    chaseCamera.position.set(0, -1.4, 4.5);
    chaseCamera.lookAt(0, -2.8, -1.5);

    // 2. ROV First-Person Camera (Kamera depan onboard ROV - FPV)
    rovCamera = new THREE.PerspectiveCamera(65, width / height, 0.05, 200);

    // 3. Mode Default: FPV (Kamera Depan Utama, Inset TAMPILAN 3D menampilkan ROV)
    activeCameraMode = 'fpv';
    pipCamera = chaseCamera;

    // WebGL Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // PIP Renderer Inset
    const pipContainer = document.getElementById('sim-pip-viewport');
    if (pipContainer) {
      pipContainer.innerHTML = '';
      pipRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      pipRenderer.setSize(pipContainer.clientWidth, pipContainer.clientHeight);
      pipRenderer.outputEncoding = THREE.sRGBEncoding;
      pipRenderer.toneMapping = THREE.ACESFilmicToneMapping;
      pipContainer.appendChild(pipRenderer.domElement);
    }

    // Pencahayaan Lingkungan Bawah Laut
    setupOceanLighting();

    // Buat Dasar Laut Bergelombang (Seabed Terrain)
    createSeabedTerrain();

    // Buat Permukaan Air Laut (Sea Surface)
    createOceanSurface();

    // Muat Model ROV Sealion
    loadROVSealion();

    // Muat Model Target Black Box
    loadBlackBoxTarget();

    // Muat Aset Lingkungan (Bebatuan Karang & Rumput Laut)
    loadEnvironmentProps();

    // Pasang Kabel Umbilical Tether
    initTetherLine();

    // Setup Event Listeners
    setupInputListeners();

    // Mulai Timer Misi
    missionStartTime = Date.now();
    elapsedSeconds = 0;
    if (missionTimerInterval) clearInterval(missionTimerInterval);
    missionTimerInterval = setInterval(updateMissionTimer, 1000);

    // Reset Fisika ROV
    rovPhysics.pos.set(0, -3.0, 0);
    rovPhysics.vel.set(0, 0, 0);
    rovPhysics.heading = 0;
    rovPhysics.pitch = 0;
    rovPhysics.roll = 0;
    rovPhysics.isClawClamped = false;
    rovPhysics.isTargetRecovered = false;

    isRunning = true;
    requestAnimationFrame(animationLoop);

    // Resize Handler
    window.addEventListener('resize', onWindowResize);
  }

  // ===========================================================================
  // 2. PENCAHAYAAN BAWAH LAUT & HEADLIGHTS
  // ===========================================================================
  function setupOceanLighting() {
    // 1. Ambient Light (Cahaya hamburan biru redup dasar laut)
    const ambientLight = new THREE.AmbientLight(0x083344, 1.2);
    scene.add(ambientLight);

    // 2. Directional Sun Light (Sinar matahari tropis menembus permukaan air)
    const sunLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    sunLight.position.set(20, 50, 20);
    scene.add(sunLight);

    // 3. Permukaan Air Bawah (Hemisphere Light)
    const hemiLight = new THREE.HemisphereLight(0x0284c7, 0x01141c, 0.8);
    scene.add(hemiLight);
  }

  // ===========================================================================
  // 3. SEABED TERRAIN & PERMUKAAN LAUT
  // ===========================================================================
  function createSeabedTerrain() {
    // Ukuran arena latihan: 70m x 70m pada kedalaman 21 meter
    const planeGeo = new THREE.PlaneGeometry(80, 80, 64, 64);
    planeGeo.rotateX(-Math.PI / 2);

    // Deformasi bergelombang alami dasar laut (dunes & depressions)
    const posAttr = planeGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      // Formula kontur pasir & lekukan karang
      const wave = Math.sin(x * 0.15) * Math.cos(z * 0.12) * 1.2 +
                   Math.sin(x * 0.35 + z * 0.25) * 0.5 +
                   Math.cos(x * 0.08) * 0.8;
      posAttr.setY(i, wave - 21.0); // Rata-rata kedalaman dasar laut 21m
    }
    planeGeo.computeVertexNormals();

    const sandMat = new THREE.MeshStandardMaterial({
      color: 0x0a2630,      // Pasir laut dalam kelabu kebiruan
      roughness: 0.92,
      metalness: 0.08,
      flatShading: false
    });

    const seabed = new THREE.Mesh(planeGeo, sandMat);
    scene.add(seabed);
  }

  function createOceanSurface() {
    // Permukaan air laut pada kedalaman 0m
    const surfaceGeo = new THREE.PlaneGeometry(120, 120, 16, 16);
    surfaceGeo.rotateX(Math.PI / 2);
    const surfaceMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.8
    });
    const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
    surfaceMesh.position.y = 0;
    scene.add(surfaceMesh);

    // Pelampung Titik Peluncuran di Permukaan (Launch Point Marker)
    const buoyGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.5, 16);
    const buoyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
    const buoy = new THREE.Mesh(buoyGeo, buoyMat);
    buoy.position.set(0, 0.25, 0);
    scene.add(buoy);
  }

  // ===========================================================================
  // 4. MEMUAT MODEL 3D ROV SEALION
  // ===========================================================================
  function loadROVSealion() {
    // 1. Buat model procedural darurat terlebih dahulu agar ROV, kamera, dan lampu sorot langsung aktif seketika
    createProceduralROV();

    const loader = new THREE.GLTFLoader();
    loader.load(
      'assets/rov_sealion.glb',
      function (gltf) {
        // Hapus model placeholder procedural
        if (rovModel) {
          scene.remove(rovModel);
        }

        rovModel = gltf.scene;
        rovModel.scale.set(1.0, 1.0, 1.0);
        rovModel.position.copy(rovPhysics.pos);
        scene.add(rovModel);

        // Pasang Kamera Depan ROV di dalam Model (Depan adalah -Z)
        rovModel.add(rovCamera);
        rovCamera.position.set(0, 0.02, -0.62); // Posisi viewport optik depan kaca dome
        rovCamera.rotation.set(0, 0, 0);

        // Pasang Sepasang Lampu Sorot LED Depan (Spotlights menghadap -Z)
        const lightLeft = createHeadlightSpot(-0.24, 0.16, -0.55);
        const lightRight = createHeadlightSpot(0.24, 0.16, -0.55);
        rovModel.add(lightLeft);
        rovModel.add(lightRight);
        headlights = [lightLeft, lightRight];
        headlights.forEach((spot) => {
          if (spot) spot.visible = rovPhysics.isHeadlightsOn;
        });

        // Cari Propeller Baling-Baling untuk Animasi Putar & Sembunyikan Tether Statis GLB
        thrusterProps = [];
        rovModel.traverse((child) => {
          if (child.name === 'Umbilical_Tether_Cable') {
            child.visible = false;
          }
          if (child.isMesh && (child.name.includes('Blade') || child.name.includes('Hub') || child.name.includes('Prop'))) {
            thrusterProps.push(child);
          }
        });

        console.log('[SIMULATOR] ROV Sealion 3D Model GLB berhasil dimuat.');
        updateObjectivesUI(0, true); // Objektif 1 selesai: ROV siap diluncurkan
      },
      undefined,
      function (err) {
        console.warn('[SIMULATOR] Mempertahankan model procedural ROV Sealion:', err);
      }
    );
  }

  function createProceduralROV() {
    rovModel = new THREE.Group();
    rovModel.position.copy(rovPhysics.pos);

    // Chassis Kuning Basarnas
    const bodyGeo = new THREE.BoxGeometry(0.75, 0.45, 1.1);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35, metalness: 0.2 });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    rovModel.add(bodyMesh);

    // Frame Pelindung Abu-abu Gelap
    const frameGeo = new THREE.BoxGeometry(0.85, 0.52, 1.15);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.8 });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    rovModel.add(frameMesh);

    // Kaca Kamera Dome Depan (-Z)
    const domeGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const domeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.7 });
    const domeMesh = new THREE.Mesh(domeGeo, domeMat);
    domeMesh.position.set(0, 0.02, -0.58);
    rovModel.add(domeMesh);

    // Pasang Lampu Sorot LED Depan
    const lightLeft = createHeadlightSpot(-0.24, 0.16, -0.55);
    const lightRight = createHeadlightSpot(0.24, 0.16, -0.55);
    rovModel.add(lightLeft);
    rovModel.add(lightRight);
    headlights = [lightLeft, lightRight];
    headlights.forEach((spot) => {
      if (spot) spot.visible = rovPhysics.isHeadlightsOn;
    });

    // Pasang Kamera Depan Onboard (FPV)
    rovModel.add(rovCamera);
    rovCamera.position.set(0, 0.02, -0.62);
    rovCamera.rotation.set(0, 0, 0);

    scene.add(rovModel);
    updateObjectivesUI(0, true);
  }

  function createHeadlightSpot(x, y, z) {
    const spot = new THREE.SpotLight(0xf0fdfa, 5.5, 35, Math.PI / 4.2, 0.35, 1.5);
    spot.position.set(x, y, z);
    // Target sorot ke depan (-Z) dan sedikit ke bawah
    const targetObj = new THREE.Object3D();
    targetObj.position.set(x, y - 0.3, z - 8.0);
    spot.target = targetObj;
    spot.add(targetObj);
    return spot;
  }

  // ===========================================================================
  // 5. MEMUAT MODEL BLACK BOX TARGET
  // ===========================================================================
  function loadBlackBoxTarget() {
    const loader = new THREE.GLTFLoader();
    loader.load(
      'assets/environment/black_box.glb',
      function (gltf) {
        blackBoxModel = gltf.scene;
        blackBoxModel.scale.set(1.1, 1.1, 1.1);
        blackBoxModel.position.copy(targetPos);
        // Rebahkan sedikit di antara pasir dasar laut
        blackBoxModel.rotation.set(0.12, 0.65, 0.08);
        scene.add(blackBoxModel);

        // Tambahkan Lampu Indikator Beacon Kedip (Acoustic Locator Beacon LED)
        const pingerLight = new THREE.PointLight(0x38bdf8, 2.0, 6.0);
        pingerLight.position.set(0, 0.25, 0);
        blackBoxModel.add(pingerLight);
        blackBoxModel.userData.pingerLight = pingerLight;

        console.log('[SIMULATOR] Flight Data Recorder (Black Box) ditempatkan di dasar laut:', targetPos);
      },
      undefined,
      function (err) {
        console.error('[SIMULATOR] Gagal memuat black_box.glb:', err);
      }
    );
  }

  // ===========================================================================
  // 6. MEMUAT ASET LINGKUNGAN (BEBATUAN, KELP, PUING TENGGELAM)
  // ===========================================================================
  function loadEnvironmentProps() {
    const loader = new THREE.GLTFLoader();

    // 1. Dinding Tebing Karang Pembatas Perimeter (Cliff Barrier)
    const perimeterRadius = 32.0;
    const numCliffs = 12;
    for (let i = 0; i < numCliffs; i++) {
      const angle = (i / numCliffs) * Math.PI * 2;
      const cx = Math.cos(angle) * perimeterRadius;
      const cz = Math.sin(angle) * perimeterRadius;
      
      loader.load('assets/environment/cliff_barrier.glb', function (gltf) {
        const cliff = gltf.scene;
        cliff.scale.set(3.5, 5.0, 3.5);
        cliff.position.set(cx, -21.0, cz);
        cliff.rotation.y = angle + Math.PI;
        scene.add(cliff);
        envObjects.push(cliff);
      });
    }

    // 2. Pilar-Pilar Karang Menjulang (Rock Pinnacles)
    const pinnaclePositions = [
      [-12, -18, -10], [18, -19, 8], [-8, -18, 14], [8, -18, -14], [-20, -18, -4]
    ];
    pinnaclePositions.forEach(([px, py, pz]) => {
      loader.load('assets/environment/rock_pinnacle.glb', function (gltf) {
        const pin = gltf.scene;
        pin.scale.set(2.2, 3.2, 2.2);
        pin.position.set(px, py, pz);
        pin.rotation.y = Math.random() * Math.PI * 2;
        scene.add(pin);
        envObjects.push(pin);
      });
    });

    // 3. Bebatuan Karang Besar di Sekitar Black Box
    const rockPositions = [
      [0.5, -21, -17.5, 'rock_large_a.glb', 2.2],
      [4.8, -21, -14.0, 'rock_large_b.glb', 2.0],
      [-2.5, -21, -13.5, 'rock_small_a.glb', 1.8],
      [3.2, -21, -16.8, 'rock_small_b.glb', 1.6],
      [-6.0, -21, -6.0, 'rock_large_a.glb', 2.5],
      [6.0, -21, 6.0, 'rock_large_b.glb', 2.3]
    ];
    rockPositions.forEach(([rx, ry, rz, file, scale]) => {
      loader.load(`assets/environment/${file}`, function (gltf) {
        const rock = gltf.scene;
        rock.scale.set(scale, scale, scale);
        rock.position.set(rx, ry, rz);
        rock.rotation.y = Math.random() * Math.PI * 2;
        scene.add(rock);
        envObjects.push(rock);
      });
    });

    // 4. Rumpun Rumput Laut / Kelp
    const kelpPositions = [
      [-1.5, -21, -16], [3.8, -21, -13], [2.2, -21, -18], [-5, -21, -7], [4, -21, -8]
    ];
    kelpPositions.forEach(([kx, ky, kz]) => {
      loader.load('assets/environment/kelp_bush.glb', function (gltf) {
        const kelp = gltf.scene;
        kelp.scale.set(1.5, 2.2, 1.5);
        kelp.position.set(kx, ky, kz);
        scene.add(kelp);
        envObjects.push(kelp);
      });
    });

    // 5. Puing Kargo Tenggelam (Sunken Barrel & Crate)
    loader.load('assets/environment/sunken_crate.glb', function (gltf) {
      const crate = gltf.scene;
      crate.scale.set(1.4, 1.4, 1.4);
      crate.position.set(5.0, -20.8, -16.0);
      crate.rotation.set(0.1, 0.4, 0.2);
      scene.add(crate);
    });

    loader.load('assets/environment/sunken_barrel.glb', function (gltf) {
      const barrel = gltf.scene;
      barrel.scale.set(1.3, 1.3, 1.3);
      barrel.position.set(-3.0, -20.6, -15.0);
      barrel.rotation.set(Math.PI / 2.2, 0, 0.8);
      scene.add(barrel);
    });
  }

  // ===========================================================================
  // 7. KABEL UMBILICAL TETHER DINAMIS (3D TUBE GEOMETRY)
  // ===========================================================================
  let tetherMesh = null;
  const tetherMat = new THREE.MeshStandardMaterial({ 
    color: 0xf59e0b, 
    roughness: 0.35, 
    metalness: 0.15 
  });

  function initTetherLine() {
    // Dipersiapkan di updateTetherLine saat ROV model dimuat
  }

  function updateTetherLine() {
    if (!rovModel) return;

    // Titik awal di pelampung permukaan
    const startPt = new THREE.Vector3(0, 0.1, 0);
    // Titik akhir di buritan belakang ROV Sealion (+Z adalah belakang)
    const endPt = rovPhysics.pos.clone().add(new THREE.Vector3(0, 0.23, 0.54).applyEuler(rovPhysics.rot));

    // Hitung kurva catenary dengan lendutan arus air
    const points = [];
    const numPts = 14;
    for (let i = 0; i <= numPts; i++) {
      const t = i / numPts;
      const pt = new THREE.Vector3().lerpVectors(startPt, endPt, t);
      // Lendutan gravitasi dan arus air halus di tengah kabel
      const weight = Math.pow(Math.sin(t * Math.PI), 1.6);
      pt.y -= weight * 1.1;
      pt.x += Math.sin(t * Math.PI) * 0.35; // Hanyutan arus
      points.push(pt);
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 18, 0.026, 6, false);

    if (tetherMesh) {
      tetherMesh.geometry.dispose();
      tetherMesh.geometry = tubeGeo;
    } else {
      tetherMesh = new THREE.Mesh(tubeGeo, tetherMat);
      scene.add(tetherMesh);
    }

    // Hitung panjang kabel terbentang
    const straightDist = startPt.distanceTo(endPt);
    rovPhysics.tetherLength = Math.round((straightDist * 1.15) * 10) / 10;
  }

  // ===========================================================================
  // 8. INPUT LISTENERS (KEYBOARD & GAMEPAD XBOX)
  // ===========================================================================
  let isInputListenersAttached = false;

  function setupInputListeners() {
    if (isInputListenersAttached) return;
    isInputListenersAttached = true;

    window.addEventListener('keydown', (e) => {
      // Hanya tangkap input jika simulasi sedang berjalan
      if (!isRunning) return;

      const code = e.code || '';
      const key = (e.key || '').toLowerCase();

      keys[code] = true;
      if (key) keys[key] = true;

      // Cegah eksekusi berulang jika tombol ditahan (e.repeat)
      if (e.repeat) return;

      // 1. Saklar Lampu LED (L)
      if (code === 'KeyL' || key === 'l') {
        e.preventDefault();
        toggleHeadlights();
      }

      // 2. Toggle Kamera Chase / FPV (C)
      if (code === 'KeyC' || key === 'c') {
        e.preventDefault();
        toggleCameraMode();
      }

      // 3. Cakar Manipulator (Spasi)
      if (code === 'Space' || key === ' ' || key === 'spacebar') {
        e.preventDefault();
        toggleClawClamp();
      }

      // 4. Tombol Esc untuk Pause/Exit
      if (code === 'Escape' || key === 'escape') {
        e.preventDefault();
        handlePauseOrExit();
      }
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code || '';
      const key = (e.key || '').toLowerCase();
      keys[code] = false;
      if (key) keys[key] = false;
    });

    // 5. Mouse Drag Steering (Klik tahan & geser mouse untuk memutar haluan ROV secara instan & halus)
    let isPointerDragging = false;
    let lastPointerX = 0;

    window.addEventListener('pointerdown', (e) => {
      if (!isRunning) return;
      if (e.target.closest('button') || e.target.closest('#sim-hud-objectives-panel')) return;
      isPointerDragging = true;
      lastPointerX = e.clientX;
    });

    window.addEventListener('pointermove', (e) => {
      if (!isRunning || !isPointerDragging) return;
      const deltaX = e.clientX - lastPointerX;
      lastPointerX = e.clientX;
      // Geser mouse ke kanan -> membelokkan haluan ROV ke kanan
      rovPhysics.heading -= deltaX * 0.0055;
    });

    window.addEventListener('pointerup', () => {
      isPointerDragging = false;
    });

    window.addEventListener('pointercancel', () => {
      isPointerDragging = false;
    });
  }

  function pollGamepadInput() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0];
    if (!gp) return;

    // Left Stick: Maju/Mundur (Surge) & Geser Lateral (Sway)
    const deadzone = 0.15;
    const axSway = Math.abs(gp.axes[0]) > deadzone ? gp.axes[0] : 0;
    const axSurge = Math.abs(gp.axes[1]) > deadzone ? -gp.axes[1] : 0;

    // Right Stick: Yaw Heading
    const axYaw = Math.abs(gp.axes[2]) > deadzone ? -gp.axes[2] : 0;

    // Trigger / Bumper: Heave (LB = Turun, RB = Naik)
    let axHeave = 0;
    if (gp.buttons[4] && gp.buttons[4].pressed) axHeave -= 1.0; // LB
    if (gp.buttons[5] && gp.buttons[5].pressed) axHeave += 1.0; // RB

    if (axSurge !== 0) rovPhysics.thrustSurge = axSurge;
    if (axSway !== 0) rovPhysics.thrustSway = axSway;
    if (axHeave !== 0) rovPhysics.thrustHeave = axHeave;
    if (axYaw !== 0) rovPhysics.thrustYaw = axYaw;

    // Button A: Cakar Manipulator
    if (gp.buttons[0] && gp.buttons[0].pressed && !gp._lastA) {
      toggleClawClamp();
    }
    gp._lastA = gp.buttons[0] && gp.buttons[0].pressed;

    // Button B: Saklar Lampu
    if (gp.buttons[1] && gp.buttons[1].pressed && !gp._lastB) {
      toggleHeadlights();
    }
    gp._lastB = gp.buttons[1] && gp.buttons[1].pressed;

    // Button X: Toggle Kamera
    if (gp.buttons[2] && gp.buttons[2].pressed && !gp._lastX) {
      toggleCameraMode();
    }
    gp._lastX = gp.buttons[2] && gp.buttons[2].pressed;
  }

  function toggleHeadlights() {
    rovPhysics.isHeadlightsOn = !rovPhysics.isHeadlightsOn;
    headlights.forEach((spot) => {
      if (spot) spot.visible = rovPhysics.isHeadlightsOn;
    });

    const lightBadge = document.getElementById('sim-hud-light-status');
    if (lightBadge) {
      if (rovPhysics.isHeadlightsOn) {
        lightBadge.textContent = 'ON (8.5k lm)';
        lightBadge.className = 'badge badge-teal font-mono text-[10px]';
      } else {
        lightBadge.textContent = 'OFF';
        lightBadge.className = 'badge bg-slate-800 text-slate-400 font-mono text-[10px]';
      }
    }

    showMissionNotification(
      'LAMPU LED ROV (L)',
      rovPhysics.isHeadlightsOn ? 'Lampu sorot LED aktif (8.500 Lumens).' : 'Lampu sorot LED dimatikan.'
    );
  }

  function toggleCameraMode() {
    activeCameraMode = (activeCameraMode === 'fpv') ? 'chase' : 'fpv';
    const camBadge = document.getElementById('sim-hud-cam-status');
    const pipLabel = document.getElementById('sim-pip-label');
    const crosshair = document.getElementById('sim-fpv-crosshair');

    if (activeCameraMode === 'fpv') {
      if (camBadge) {
        camBadge.textContent = 'ROV CAM (FPV)';
        camBadge.className = 'badge bg-[#082933] text-cyan-300 font-mono text-[10px]';
      }
      if (pipLabel) pipLabel.textContent = 'TAMPILAN 3D';
      if (crosshair) crosshair.classList.remove('hidden');
      showMissionNotification('KAMERA ROV (C)', 'Beralih ke Kamera Depan Onboard (FPV).');
    } else {
      if (camBadge) {
        camBadge.textContent = 'CHASE CAM (3RD)';
        camBadge.className = 'badge bg-amber-950/80 text-amber-300 font-mono text-[10px] border border-amber-600/50';
      }
      if (pipLabel) pipLabel.textContent = 'KAMERA DEPAN (FPV)';
      if (crosshair) crosshair.classList.add('hidden');
      showMissionNotification('KAMERA ROV (C)', 'Beralih ke Kamera Luar (Third-Person Chase Cam).');
    }
  }

  function toggleClawClamp() {
    rovPhysics.isClawClamped = !rovPhysics.isClawClamped;

    const clawBadge = document.getElementById('sim-hud-claw-status');
    if (clawBadge) {
      if (rovPhysics.isClawClamped) {
        clawBadge.textContent = 'MENJEPIT (CLAMPED)';
        clawBadge.className = 'badge badge-emerald font-mono text-[10px]';
      } else {
        clawBadge.textContent = 'TERBUKA (OPEN)';
        clawBadge.className = 'badge badge-amber font-mono text-[10px]';
      }
    }

    // Periksa apakah dekat dengan Black Box untuk proses evakuasi
    if (blackBoxModel && !rovPhysics.isTargetRecovered) {
      const distToTarget = rovPhysics.pos.distanceTo(blackBoxModel.position);
      if (distToTarget < 3.8 && rovPhysics.isClawClamped) {
        // Berhasil menjepit Black Box!
        rovPhysics.isTargetRecovered = true;
        if (rovModel) {
          rovModel.add(blackBoxModel);
          blackBoxModel.position.set(0.16, -0.22, -0.95);
          blackBoxModel.rotation.set(0, 0, 0);
        }

        // Update Objektif 3: Berhasil mengambil black box
        updateObjectivesUI(2, true);
        showMissionNotification('BLACK BOX BERHASIL DIAMBIL!', 'Bawa ROV kembali ke titik peluncuran permukaan (Radius 5m dari titik awal).');
        return;
      }
    }

    showMissionNotification(
      'CAKAR MANIPULATOR (SPASI)',
      rovPhysics.isClawClamped ? 'Cakar manipulator ditutup / menjepit.' : 'Cakar manipulator dibuka.'
    );
  }

  // ===========================================================================
  // 9. LOOP FISIKA & ANIMASI (60 FPS)
  // ===========================================================================
  function animationLoop(timestamp) {
    if (!isRunning) return;

    // 1. Baca Input Keyboard
    handleKeyboardInput();

    // 2. Baca Input Gamepad
    pollGamepadInput();

    // 3. Update Fisika Gerak ROV Sealion
    updateROVPhysics();

    // 4. Update Kabel Tether
    updateTetherLine();

    // 5. Update Kedip Beacon & Sonar Pinger
    updateAcousticPinger(timestamp);

    // 6. Cek Penyelesaian Objektif Misi
    checkMissionProgress();

    // 7. Update Telemetri HUD
    updateTelemetryHUD();

    // 8. Render Kamera
    renderViewports();

    requestAnimationFrame(animationLoop);
  }

  function handleKeyboardInput() {
    // Reset thrust setiap frame
    rovPhysics.thrustSurge = 0;
    rovPhysics.thrustSway = 0;
    rovPhysics.thrustHeave = 0;
    rovPhysics.thrustYaw = 0;

    // Maju / Mundur (W / S atau Panah Atas / Bawah)
    if (keys['KeyW'] || keys['w'] || keys['ArrowUp'] || keys['arrowup']) rovPhysics.thrustSurge += 1.0;
    if (keys['KeyS'] || keys['s'] || keys['ArrowDown'] || keys['arrowdown']) rovPhysics.thrustSurge -= 1.0;

    // Deteksi tombol Shift
    const isShiftPressed = keys['ShiftLeft'] || keys['ShiftRight'] || keys['shift'];

    // KONTROL BELOK HALUAN vs GESER LATERAL:
    // 1. Tombol A & D: Langsung membelokkan haluan ROV ke Kiri & Kanan!
    // 2. Tombol SHIFT + A / D: Berfungsi geser menyamping (lateral strafe).
    // 3. Tombol Z / X: Alternatif tombol khusus geser menyamping murni.
    // 4. Tombol Panah Kiri / Kanan (← / →): Juga membelokkan haluan ROV.
    if (isShiftPressed) {
      if (keys['KeyA'] || keys['a']) rovPhysics.thrustSway -= 1.0; // Geser Kiri
      if (keys['KeyD'] || keys['d']) rovPhysics.thrustSway += 1.0; // Geser Kanan
    } else {
      if (keys['KeyA'] || keys['a']) rovPhysics.thrustYaw += 1.0; // Belok Kiri
      if (keys['KeyD'] || keys['d']) rovPhysics.thrustYaw -= 1.0; // Belok Kanan
    }

    // Tombol Alternatif Geser Lateral Murni (Z & X)
    if (keys['KeyZ'] || keys['z']) rovPhysics.thrustSway -= 1.0;
    if (keys['KeyX'] || keys['x']) rovPhysics.thrustSway += 1.0;

    // Turun / Naik (Q / E)
    if (keys['KeyQ'] || keys['q']) rovPhysics.thrustHeave -= 1.0; // Turun ke kedalaman
    if (keys['KeyE'] || keys['e']) rovPhysics.thrustHeave += 1.0; // Naik ke permukaan

    // Putar Haluan via Panah Kiri / Kanan (← / →)
    if (keys['ArrowLeft'] || keys['arrowleft']) rovPhysics.thrustYaw += 1.0; // Belok Kiri
    if (keys['ArrowRight'] || keys['arrowright']) rovPhysics.thrustYaw -= 1.0; // Belok Kanan
  }

  function updateROVPhysics() {
    if (!rovModel) return;

    // Kecepatan putar yaw (perlambat agar terasa berbobot & mantap)
    const yawSpeed = 0.014;
    rovPhysics.heading += rovPhysics.thrustYaw * yawSpeed;

    // Vektor arah lokal ROV: Depan adalah -Z
    const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, rovPhysics.heading, 0));
    const right = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, rovPhysics.heading, 0));
    const up = new THREE.Vector3(0, 1, 0);

    // Hitung gaya pendorong ROV berat (realistis bawah air)
    const surgeAcc = 0.0035;
    const swayAcc = 0.0028;
    const heaveAcc = 0.0028;

    // Akselerasi
    rovPhysics.vel.addScaledVector(forward, rovPhysics.thrustSurge * surgeAcc);
    rovPhysics.vel.addScaledVector(right, rovPhysics.thrustSway * swayAcc);
    rovPhysics.vel.addScaledVector(up, rovPhysics.thrustHeave * heaveAcc);

    // Hanyutan & Redaman Fisika Air: Diam di air tenang tanpa input (PRD F-09)
    const isMoving = (rovPhysics.thrustSurge !== 0 || rovPhysics.thrustSway !== 0 || rovPhysics.thrustHeave !== 0 || rovPhysics.thrustYaw !== 0);
    if (!isMoving) {
      // Damping cepat berhenti saat idle (menghilangkan dorongan magnet)
      rovPhysics.vel.multiplyScalar(0.85);
      if (rovPhysics.vel.lengthSq() < 0.000001) {
        rovPhysics.vel.set(0, 0, 0);
      }
    } else {
      // Gesekan kental air hidrodinamis saat melaju
      rovPhysics.vel.multiplyScalar(0.91);
    }

    // Batas Kecepatan Maksimal Realistis (~0.8 m/s)
    rovPhysics.vel.clampLength(0, 0.045);

    // Pembatasan Tether (Maksimal 50 Meter dari titik luncur)
    const nextPos = rovPhysics.pos.clone().add(rovPhysics.vel);
    const distFromOrigin = nextPos.distanceTo(launchOrigin);

    if (distFromOrigin >= rovPhysics.tetherMax) {
      // Kabel menegang, tahan gerak ROV menjauh
      rovPhysics.vel.multiplyScalar(0.1);
      const tetherWarn = document.getElementById('sim-tether-warning');
      if (tetherWarn) tetherWarn.classList.remove('hidden');
    } else {
      const tetherWarn = document.getElementById('sim-tether-warning');
      if (tetherWarn) tetherWarn.classList.add('hidden');
      rovPhysics.pos.copy(nextPos);
    }

    // Deteksi Tabrakan dengan Karang, Pilar & Tebing (Efek Benturan Layar Merah FPS)
    checkCollisions();

    // Pembatasan Dasar Laut (Jangan sampai menembus pasir di Y = -20.2m)
    if (rovPhysics.pos.y < -20.2) {
      rovPhysics.pos.y = -20.2;
      rovPhysics.vel.y = Math.max(0, rovPhysics.vel.y);
    }

    // Pembatasan Permukaan Air (Maksimal di Y = -0.5m)
    if (rovPhysics.pos.y > -0.5) {
      rovPhysics.pos.y = -0.5;
      rovPhysics.vel.y = Math.min(0, rovPhysics.vel.y);
    }

    // Update Transformasi ROV
    rovModel.position.copy(rovPhysics.pos);

    // Kemiringan hidrodinamis saat melaju (Hydrodynamic pitch & roll tilting)
    const targetPitch = -rovPhysics.thrustSurge * 0.05;
    const targetRoll = rovPhysics.thrustSway * 0.05;
    rovPhysics.pitch = THREE.MathUtils.lerp(rovPhysics.pitch, targetPitch, 0.08);
    rovPhysics.roll = THREE.MathUtils.lerp(rovPhysics.roll, targetRoll, 0.08);

    rovPhysics.rot.set(rovPhysics.pitch, rovPhysics.heading, rovPhysics.roll, 'YXZ');
    rovModel.rotation.copy(rovPhysics.rot);

    // Animasi Baling-Baling Pendorong Berputar
    if (isMoving) {
      thrusterProps.forEach((prop) => {
        prop.rotation.z += 0.35;
      });
    }

    // Update Posisi Chase Camera (Di belakang ROV pada +Z, melihat ke depan -Z)
    const camOffset = new THREE.Vector3(0, 1.4, 4.0).applyEuler(new THREE.Euler(0, rovPhysics.heading, 0));
    const targetCamPos = rovPhysics.pos.clone().add(camOffset);
    chaseCamera.position.lerp(targetCamPos, 0.1);
    chaseCamera.lookAt(rovPhysics.pos.clone().add(new THREE.Vector3(0, 0.15, -2.0).applyEuler(new THREE.Euler(0, rovPhysics.heading, 0))));

    // Screen Shake Effect saat tabrakan
    if (cameraShakeIntensity > 0) {
      const shakeX = (Math.random() - 0.5) * cameraShakeIntensity;
      const shakeY = (Math.random() - 0.5) * cameraShakeIntensity;
      chaseCamera.position.x += shakeX;
      chaseCamera.position.y += shakeY;
      rovCamera.position.x += shakeX * 0.5;
      rovCamera.position.y += shakeY * 0.5;
      cameraShakeIntensity *= 0.82;
      if (cameraShakeIntensity < 0.01) {
        cameraShakeIntensity = 0;
        rovCamera.position.set(0, 0.02, -0.62);
      }
    }
  }

  // ===========================================================================
  // SISTEM DETEKSI TABRAKAN (COLLISION DAMAGE SCREEN FLASH FPS)
  // ===========================================================================
  function checkCollisions() {
    const rovRadius = 0.75;
    
    // 1. Cek Perimeter Barrier (Jurang/Tebing Lingkar 32 meter)
    const distFromCenter = Math.sqrt(rovPhysics.pos.x * rovPhysics.pos.x + rovPhysics.pos.z * rovPhysics.pos.z);
    if (distFromCenter > 30.5) {
      const normal = new THREE.Vector3(-rovPhysics.pos.x, 0, -rovPhysics.pos.z).normalize();
      triggerCollision('Dinding Tebing Perimeter', normal);
      return;
    }

    // 2. Cek Bebatuan Karang, Pilar & Puing
    for (let i = 0; i < collisionObstacles.length; i++) {
      const obs = collisionObstacles[i];
      const dx = rovPhysics.pos.x - obs.pos.x;
      const dz = rovPhysics.pos.z - obs.pos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Cek benturan jika berada di ketinggian karang (di bawah Y = -12m)
      if (rovPhysics.pos.y < -12.0 && dist < (obs.radius + rovRadius)) {
        const normal = new THREE.Vector3(dx, 0, dz).normalize();
        triggerCollision(obs.name, normal);
        break;
      }
    }
  }

  function triggerCollision(obstacleName, normalVector) {
    if (isCollidingCooldown) return;
    isCollidingCooldown = true;
    setTimeout(() => { isCollidingCooldown = false; }, 650);

    // 1. Efek Layar Merah Vignette FPS (Screen Hit Flash)
    const flashEl = document.getElementById('sim-collision-flash');
    if (flashEl) {
      flashEl.style.opacity = '1';
      setTimeout(() => {
        flashEl.style.opacity = '0';
      }, 350);
    }

    // 2. Efek Guncangan Kamera (Camera Shake)
    cameraShakeIntensity = 0.25;

    // 3. Rebound Fisika (Terpental sedikit dari batu)
    rovPhysics.pos.addScaledVector(normalVector, 0.15);
    rovPhysics.vel.set(0, 0, 0);
    rovPhysics.vel.addScaledVector(normalVector, 0.025);

    // 4. Suara Dentuman Lambung Bawah Laut
    playCollisionSound();

    // 5. Notifikasi Peringatan Benturan
    showMissionNotification('PERINGATAN BENTURAN!', `Lambung ROV membentur ${obstacleName}. Jaga jarak aman navigasi.`);
  }

  function playCollisionSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(95, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(32, audioCtx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}
  }

  // ===========================================================================
  // 10. AKUSTIK PINGER BEACON & AUDIO SYNTHESIZER
  // ===========================================================================
  function updateAcousticPinger(timestamp) {
    if (!blackBoxModel) return;

    // Hitung jarak ROV ke Black Box
    const dist = rovPhysics.pos.distanceTo(targetPos);

    // Semakin dekat, frekuensi interval kedip dan bunyi pinger semakin cepat
    pingInterval = Math.max(350, Math.min(2200, dist * 65));

    if (timestamp - lastPingTime > pingInterval) {
      lastPingTime = timestamp;

      // Kedip Lampu LED Beacon di Black Box
      if (blackBoxModel.userData.pingerLight) {
        blackBoxModel.userData.pingerLight.intensity = 8.0;
        setTimeout(() => {
          if (blackBoxModel && blackBoxModel.userData.pingerLight) {
            blackBoxModel.userData.pingerLight.intensity = 0.5;
          }
        }, 120);
      }

      // Bunyi Sonar Beep sintetis Web Audio API
      playSonarPing(dist);

      // Kedipkan Indikator Sinyal di HUD
      const signalDot = document.getElementById('sim-pinger-dot');
      if (signalDot) {
        signalDot.classList.add('bg-teal-300', 'shadow-[0_0_12px_#2dd4bf]');
        setTimeout(() => {
          signalDot.classList.remove('bg-teal-300', 'shadow-[0_0_12px_#2dd4bf]');
        }, 150);
      }
    }

    // Update Kekuatan Sinyal di HUD (0% - 100%)
    const signalPercent = Math.max(5, Math.min(100, Math.round((1 - (dist / 40.0)) * 100)));
    const signalBar = document.getElementById('sim-pinger-bar');
    const signalText = document.getElementById('sim-pinger-text');
    if (signalBar) signalBar.style.width = `${signalPercent}%`;
    if (signalText) signalText.textContent = `${signalPercent}% · 37.5 kHz`;

    // Cek Objektif 2: Temukan lokasi black box (jarak < 5m)
    if (dist < 6.0 && !objectivesStatus[1]) {
      updateObjectivesUI(1, true);
      showMissionNotification('BLACK BOX TERDETEKSI!', 'Gunakan cakar manipulator untuk mengambil black box (Dekati hingga < 2m lalu tekan Spasi / Tombol A).');
    }
  }

  function playSonarPing(distance) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      // Nada akustik maritim 1.8 kHz
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1850, audioCtx.currentTime);

      // Volume proporsional dengan kedekatan
      const vol = Math.max(0.02, Math.min(0.22, (1 - distance / 35.0) * 0.22));
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}
  }

  // ===========================================================================
  // 11. CHECK PROGRESS & KELULUSAN SKENARIO
  // ===========================================================================
  function checkMissionProgress() {
    // Objektif 4: Bawa ROV kembali ke titik peluncuran dengan selamat
    if (rovPhysics.isTargetRecovered) {
      const distToLaunch = rovPhysics.pos.distanceTo(new THREE.Vector3(0, -2, 0));
      if (distToLaunch < 4.5 && !objectivesStatus[3]) {
        updateObjectivesUI(3, true);
        finishMissionSuccess();
      }
    }
  }

  const objectiveDescriptions = [
    'Luncurkan ROV ke kedalaman air',
    'Dekati black box tanpa tether terbelit',
    'Jepit black box dengan manipulator (Spasi)',
    'Bawa ROV kembali ke titik peluncuran'
  ];

  function updateObjectivesUI(index, isDone) {
    objectivesStatus[index] = isDone;
    if (isDone && !objectiveTimes[index]) {
      objectiveTimes[index] = formatTimer(elapsedSeconds);
    }

    // 1. Tentukan indeks objektif aktif saat ini
    let activeObjIdx = 0;
    for (let i = 0; i < objectivesStatus.length; i++) {
      if (!objectivesStatus[i]) {
        activeObjIdx = i;
        break;
      }
      activeObjIdx = objectivesStatus.length - 1;
    }

    // 2. Update Banner Objektif Atas (Identik Figma: OBJEKTIF 2/4 Dekati black box...)
    const bannerIdx = document.getElementById('sim-banner-obj-index');
    const bannerTxt = document.getElementById('sim-banner-obj-text');
    if (bannerIdx) bannerIdx.textContent = `OBJEKTIF ${activeObjIdx + 1}/4`;
    if (bannerTxt) bannerTxt.textContent = objectiveDescriptions[activeObjIdx];

    // 3. Update HUD Floating Checklist (Panel Kanan Atas)
    const doneCount = objectivesStatus.filter(Boolean).length;
    const badgeCount = document.getElementById('sim-hud-obj-count-badge');
    if (badgeCount) badgeCount.textContent = `${doneCount} / 4`;

    for (let i = 0; i < 4; i++) {
      const itemEl = document.getElementById(`sim-hud-obj-${i}`);
      if (!itemEl) continue;

      const iconBox = itemEl.querySelector('.sim-obj-icon');
      const statusTxt = itemEl.querySelector('.sim-obj-status');
      const labelSpan = itemEl.querySelector('span.truncate');

      if (objectivesStatus[i]) {
        // Status Selesai
        itemEl.className = 'flex items-center justify-between p-2 rounded-sm bg-[#041c21] border border-[#115e59] transition-all';
        if (iconBox) iconBox.innerHTML = '<i data-lucide="check" class="w-3 h-3 text-emerald-400"></i>';
        if (statusTxt) {
          statusTxt.className = 'sim-obj-status font-mono text-[10px] text-emerald-400 font-semibold shrink-0 uppercase';
          statusTxt.textContent = objectiveTimes[i] || 'SELESAI';
        }
        if (labelSpan) labelSpan.className = 'font-body text-xs text-slate-200 truncate';
      } else if (i === activeObjIdx) {
        // Status Aktif
        itemEl.className = 'flex items-center justify-between p-2 rounded-sm bg-amber-950/40 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)] transition-all';
        if (iconBox) iconBox.innerHTML = '<div class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></div>';
        if (statusTxt) {
          statusTxt.className = 'sim-obj-status font-mono text-[10px] text-amber-400 font-semibold shrink-0 uppercase';
          statusTxt.textContent = 'AKTIF';
        }
        if (labelSpan) labelSpan.className = 'font-body text-xs text-amber-200 font-medium truncate';
      } else {
        // Status Menunggu
        itemEl.className = 'flex items-center justify-between p-2 rounded-sm bg-[#020b10] border border-slate-800/80 opacity-60 transition-all';
        if (iconBox) iconBox.innerHTML = '';
        if (statusTxt) {
          statusTxt.className = 'sim-obj-status font-mono text-[10px] text-slate-500 shrink-0 uppercase';
          statusTxt.textContent = 'MENUNGGU';
        }
        if (labelSpan) labelSpan.className = 'font-body text-xs text-slate-400 truncate';
      }
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function finishMissionSuccess() {
    isRunning = false;
    clearInterval(missionTimerInterval);

    // Catat waktu objektif ke-4
    if (!objectiveTimes[3]) objectiveTimes[3] = formatTimer(elapsedSeconds);

    // Hitung Nilai berdasarkan tabrakan dan durasi
    const collCount = rovPhysics.collisionCount || 0;
    const calculatedScore = Math.max(65, Math.min(100, 95 - (collCount * 5)));

    // Tampilkan Modal Selesai Misi
    const modal = document.getElementById('sim-finish-modal');
    if (modal) {
      modal.classList.remove('hidden');
      const timeEl = document.getElementById('sim-final-time');
      if (timeEl) timeEl.textContent = formatTimer(elapsedSeconds);

      const scoreEl = document.getElementById('sim-final-score');
      if (scoreEl) scoreEl.textContent = calculatedScore;

      const collEl = document.getElementById('sim-final-collisions');
      if (collEl) collEl.textContent = collCount;

      if (window.lucide) window.lucide.createIcons();
    }
  }

  function finishMissionAndShowResults() {
    stopSimulation();

    // Sembunyikan Modal
    const modal = document.getElementById('sim-finish-modal');
    if (modal) modal.classList.add('hidden');

    const collCount = rovPhysics.collisionCount || 0;
    const calculatedScore = Math.max(65, Math.min(100, 95 - (collCount * 5)));
    const finalDuration = formatTimer(elapsedSeconds);

    // Sekarang tanggal & jam saat ini
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const timeFormatted = `${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;
    const timestampFull = `${dateFormatted}, ${timeFormatted} WIB · REKAMAN TERSIMPAN`;

    // Bentuk data sesi latihan lengkap
    const sessionResult = {
      id: `LPR-00${String((window.REPORTS ? window.REPORTS.length : 4) + 22).padStart(2, '0')}`,
      scenarioId: (activeScenario && activeScenario.id) || 'SKN-02',
      scenarioTitle: (activeScenario && activeScenario.title) || 'PEMULIHAN BLACK BOX PESAWAT',
      score: calculatedScore,
      duration: finalDuration || '21:37',
      targetDuration: 'Target 25:00',
      objectivesCompleted: '4 / 4',
      objectivesSubtitle: 'Semua tercapai',
      faultsCount: 1,
      faultsSubtitle: 'Ditangani dalam 0:25',
      collisionsCount: collCount,
      collisionsSubtitle: 'Dengan puing di dasar',
      timestamp: timestampFull,
      objectives: [
        { text: 'Temukan lokasi black box di dasar laut', time: objectiveTimes[0] || '03:12' },
        { text: 'Dekati black box tanpa membuat tether terbelit', time: objectiveTimes[1] || '08:55' },
        { text: 'Ambil black box dengan manipulator', time: objectiveTimes[2] || '15:20' },
        { text: 'Bawa ROV kembali ke titik peluncuran', time: objectiveTimes[3] || finalDuration || '21:37' }
      ]
    };

    // 1. Simpan ke dataset Laporan
    if (window.addCompletedSessionReport) {
      window.addCompletedSessionReport(sessionResult);
    }

    // 2. Arahkan ke Layar Hasil Sesi Trainee (1:1 Figma Node 124:3803)
    if (window.navigateTo) {
      window.navigateTo('hasilsesi', sessionResult);
    }
  }

  // Fungsi pengujian cepat untuk simulasi kelulusan misi
  function testCompleteMission() {
    for (let i = 0; i < 4; i++) {
      objectivesStatus[i] = true;
    }
    finishMissionSuccess();
  }

  function updateMissionTimer() {
    elapsedSeconds++;
    const timerEl = document.getElementById('sim-hud-timer');
    if (timerEl) {
      timerEl.textContent = formatTimer(elapsedSeconds);
    }
  }

  function formatTimer(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function showMissionNotification(title, message) {
    const notif = document.getElementById('sim-mission-notif');
    if (!notif) return;
    document.getElementById('sim-notif-title').textContent = title;
    document.getElementById('sim-notif-msg').textContent = message;
    notif.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => {
      notif.classList.add('hidden');
    }, 6000);
  }

  // ===========================================================================
  // 12. UPDATE TELEMETRI HUD & CANVAS GAUGES (IDENTIK FIGMA)
  // ===========================================================================
  function updateTelemetryHUD() {
    // 1. Kedalaman Real-Time (Format sesuai Figma: 40,2 m)
    const depthMeters = Math.abs(rovPhysics.pos.y);
    const depthEl = document.getElementById('sim-hud-depth');
    if (depthEl) depthEl.textContent = `${depthMeters.toFixed(1).replace('.', ',')} m`;

    // 2. Heading Kompas Maritim (0 - 360 derajat) & Canvas Tape Kompas (Ruler)
    // Arah maritim: Belok Kanan = menuju Timur (0° -> 90°), Tape bergerak ke KIRI.
    // Belok Kiri = menuju Barat (0° -> 270°), Tape bergerak ke KANAN.
    let maritimeHeading = Math.round(-THREE.MathUtils.radToDeg(rovPhysics.heading)) % 360;
    if (maritimeHeading < 0) maritimeHeading += 360;
    drawCompassTape(maritimeHeading);

    // 3. Roll & Pitch Telemetri & Canvas Attitude Indicator
    let rollDeg = Math.round(THREE.MathUtils.radToDeg(rovPhysics.roll));
    let pitchDeg = Math.round(THREE.MathUtils.radToDeg(rovPhysics.pitch));
    const rollPitchEl = document.getElementById('sim-roll-pitch-text');
    if (rollPitchEl) {
      const rollSign = rollDeg >= 0 ? '+' : '';
      const pitchSign = pitchDeg >= 0 ? '+' : '';
      rollPitchEl.textContent = `ROLL ${rollSign}${rollDeg}° · PITCH ${pitchSign}${pitchDeg}°`;
    }
    drawAttitudeIndicator(rovPhysics.roll, rovPhysics.pitch);

    // 4. Tekanan Hidrostatis (Tekanan meningkat terhadap kedalaman)
    const pressurePct = Math.min(95, Math.max(30, Math.round(45 + (depthMeters / 21.0) * 40)));
    const pressVal = document.getElementById('sim-pressure-val');
    const pressBar = document.getElementById('sim-pressure-bar');
    if (pressVal) pressVal.textContent = `${pressurePct}%`;
    if (pressBar) pressBar.style.width = `${pressurePct}%`;

    // 5. Daya Baterai Internal
    const batteryPct = Math.max(12, Math.round(85 - (elapsedSeconds * 0.035)));
    const batVal = document.getElementById('sim-battery-val');
    const batBar = document.getElementById('sim-battery-bar');
    if (batVal) batVal.textContent = `${batteryPct}%`;
    if (batBar) batBar.style.width = `${batteryPct}%`;

    // 6. Jam Taktis Realtime
    const clockEl = document.getElementById('sim-realtime-clock');
    if (clockEl) {
      const now = new Date();
      clockEl.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    // 7. Koordinat GPS (Terupdate aktif & dinamis real-time sesuai pergerakan ROV)
    // Koordinat dasar: 6°07'12.0" S, 106°48'33.0" E
    // 1 meter perpindahan ROV = ~0.08 detik busur untuk visualisasi aktif responsif
    const baseLatDeg = 6;
    const baseLatMin = 7;
    let totalLatSec = 12.0 + (rovPhysics.pos.z * 0.08); // +Z (Selatan/Mundur) menambah Lintang S
    let latMin = baseLatMin;
    let latDeg = baseLatDeg;
    while (totalLatSec >= 60.0) {
      totalLatSec -= 60.0;
      latMin += 1;
    }
    while (totalLatSec < 0.0) {
      totalLatSec += 60.0;
      latMin -= 1;
    }

    const baseLonDeg = 106;
    const baseLonMin = 48;
    let totalLonSec = 33.0 + (rovPhysics.pos.x * 0.08); // +X (Timur/Kanan) menambah Bujur E
    let lonMin = baseLonMin;
    let lonDeg = baseLonDeg;
    while (totalLonSec >= 60.0) {
      totalLonSec -= 60.0;
      lonMin += 1;
    }
    while (totalLonSec < 0.0) {
      totalLonSec += 60.0;
      lonMin -= 1;
    }

    const latEl = document.getElementById('sim-gps-lat');
    const lonEl = document.getElementById('sim-gps-lon');
    if (latEl) latEl.textContent = `${latDeg}°${String(latMin).padStart(2, '0')}'${totalLatSec < 10 ? '0' : ''}${totalLatSec.toFixed(1)}" S`;
    if (lonEl) lonEl.textContent = `${lonDeg}°${String(lonMin).padStart(2, '0')}'${totalLonSec < 10 ? '0' : ''}${totalLonSec.toFixed(1)}" E`;
  }

  // ===========================================================================
  // CANVAS COMPASS TAPE / RULER (IDENTIK FIGMA)
  // ===========================================================================
  function drawCompassTape(headingDeg) {
    const canvas = document.getElementById('compass-tape-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const centerX = w / 2;
    const pxPerDeg = 2.4; // 15 derajat = 36 px

    // Top border line
    ctx.strokeStyle = '#123945';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, 1);
    ctx.lineTo(w - 10, 1);
    ctx.stroke();

    // Draw ticks and degree markers
    ctx.textAlign = 'center';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';

    const minDeg = Math.floor(headingDeg - 70);
    const maxDeg = Math.ceil(headingDeg + 70);

    for (let d = minDeg; d <= maxDeg; d++) {
      if (d % 5 === 0) {
        const x = centerX + (d - headingDeg) * pxPerDeg;
        if (x < 10 || x > w - 10) continue;

        const normDeg = (d % 360 + 360) % 360;

        if (d % 15 === 0) {
          // Major tick
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(x, 2);
          ctx.lineTo(x, 10);
          ctx.stroke();

          // Cardinal labels
          let label = String(normDeg).padStart(3, '0');
          if (normDeg === 0) label = 'U';
          else if (normDeg === 90) label = 'T';
          else if (normDeg === 180) label = 'S';
          else if (normDeg === 270) label = 'B';

          ctx.fillStyle = (normDeg % 90 === 0) ? '#38bdf8' : '#94a3b8';
          ctx.fillText(label, x, 22);
        } else {
          // Minor tick
          ctx.strokeStyle = '#1e4c59';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, 2);
          ctx.lineTo(x, 6);
          ctx.stroke();
        }
      }
    }

    // Center indicator (Yellow Triangle ▼ and Degree readout, identik Figma)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(centerX - 3.5, 25);
    ctx.lineTo(centerX + 3.5, 25);
    ctx.lineTo(centerX, 29);
    ctx.closePath();
    ctx.fill();

    // Center degree readout
    const currentNorm = Math.round((headingDeg % 360 + 360) % 360);
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`${String(currentNorm).padStart(3, '0')}°`, centerX, 39);
  }

  // ===========================================================================
  // CANVAS ARTIFICIAL HORIZON / GYRO ATTITUDE INDICATOR (IDENTIK FIGMA)
  // ===========================================================================
  function drawAttitudeIndicator(rollRad, pitchRad) {
    const canvas = document.getElementById('attitude-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = 54;

    ctx.clearRect(0, 0, w, h);

    // Circular clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    // Transform by Roll and Pitch
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-rollRad);
    // Pitch shift: clamp pitch displacement
    const pitchPx = Math.max(-36, Math.min(36, pitchRad * 80));
    ctx.translate(0, pitchPx);

    // Sky half (Top - Teal Marine)
    ctx.fillStyle = '#0a3644';
    ctx.fillRect(-100, -120, 200, 120);

    // Ground half (Bottom - Deep Ocean Trench Brown)
    ctx.fillStyle = '#4c2415';
    ctx.fillRect(-100, 0, 200, 120);

    // Horizon line (Gold)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-100, 0);
    ctx.lineTo(100, 0);
    ctx.stroke();

    // Pitch ladder rungs
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    [-24, -12, 12, 24].forEach((py) => {
      ctx.beginPath();
      ctx.moveTo(-12, py);
      ctx.lineTo(12, py);
      ctx.stroke();
    });

    ctx.restore(); // Restore transform inside clip

    // Fixed Reference Aircraft Wings (Amber crosshair)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#f59e0b';
    
    // Left wing
    ctx.beginPath();
    ctx.moveTo(cx - 24, cy);
    ctx.lineTo(cx - 10, cy);
    ctx.lineTo(cx - 10, cy + 3);
    ctx.stroke();

    // Right wing
    ctx.beginPath();
    ctx.moveTo(cx + 10, cy);
    ctx.lineTo(cx + 24, cy);
    ctx.lineTo(cx + 10, cy + 3);
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // Restore clip

    // Outer bezel ring
    ctx.strokeStyle = '#185361';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  function updateHUDStatusText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ===========================================================================
  // 13. RENDER VIEWPORTS & DUAL-CAM PIP
  // ===========================================================================
  function renderViewports() {
    if (!renderer || !scene) return;

    if (activeCameraMode === 'fpv') {
      // Main Viewport: Kamera Onboard Depan ROV (FPV Sesuai Figma)
      renderer.render(scene, rovCamera);
      // Inset Box: TAMPILAN 3D ROV Sealion
      if (pipRenderer && chaseCamera) {
        pipRenderer.render(scene, chaseCamera);
      }
    } else {
      // Main Viewport: Chase Camera (Third Person View)
      renderer.render(scene, chaseCamera);
      // Inset Box: Kamera Depan ROV
      if (pipRenderer && rovCamera) {
        pipRenderer.render(scene, rovCamera);
      }
    }
  }

  function onWindowResize() {
    const container = document.getElementById('sim-canvas-container');
    if (!container || !renderer) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    chaseCamera.aspect = width / height;
    chaseCamera.updateProjectionMatrix();

    rovCamera.aspect = width / height;
    rovCamera.updateProjectionMatrix();

    renderer.setSize(width, height);
  }

  // ===========================================================================
  // 14. EXIT & EXPORT GLOBAL HANDLERS
  // ===========================================================================
  function handlePauseOrExit(skipConfirm = false) {
    if (skipConfirm || !isRunning || confirm('Apakah Anda ingin menghentikan sesi latihan simulasi dan kembali ke Launcher?')) {
      stopSimulation();
      const modal = document.getElementById('sim-finish-modal');
      if (modal) modal.classList.add('hidden');
      if (window.navigateTo) {
        window.navigateTo('beranda');
      }
    }
  }

  function stopSimulation() {
    isRunning = false;
    if (missionTimerInterval) clearInterval(missionTimerInterval);
    if (renderer && renderer.domElement) {
      renderer.domElement.remove();
    }
    if (pipRenderer && pipRenderer.domElement) {
      pipRenderer.domElement.remove();
    }
  }

  // Expose ke Global Window
  window.startROVSimulation = initSimulation;
  window.stopROVSimulation = stopSimulation;
  window.toggleROVCamera = toggleCameraMode;
  window.toggleROVClaw = toggleClawClamp;
  window.toggleROVLights = toggleHeadlights;
  window.exitROVSimulation = handlePauseOrExit;
  window.triggerROVCollision = triggerCollision;
  window.finishMissionAndShowResults = finishMissionAndShowResults;
  window.testCompleteMission = testCompleteMission;

})();
