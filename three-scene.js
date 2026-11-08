/**
 * PUSHPA RAJ SYNDICATE — 3D WEBGL LABORATORY
 * Powered by Three.js
 */

(function () {
  const container = document.getElementById('three-canvas-container');
  const loaderEl = document.getElementById('canvas-loader');

  if (!container) return;

  function showFallback(msg) {
    if (loaderEl) {
      loaderEl.innerHTML = '<span></span>';
      loaderEl.querySelector('span').textContent = msg;
    }
  }

  // Graceful fallback if the CDN script failed or WebGL is unavailable
  if (typeof THREE === 'undefined') {
    showFallback('3D ENGINE UNAVAILABLE — CHECK YOUR CONNECTION');
    return;
  }
  const webglOk = (function () {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
    } catch (e) { return false; }
  })();
  if (!webglOk) {
    showFallback('WEBGL NOT SUPPORTED ON THIS DEVICE');
    return;
  }

  // Scene variables
  let scene, camera, renderer, controls;
  let currentGroup, logGroup, axeGroup;
  let emberParticles, particleGeo;
  let activeModel = 'log'; // 'log' or 'axe'

  // Lighting
  let rimLightRed, pointLightGold;

  // Animation frame
  let clock = new THREE.Clock();
  let isVisible = true;

  function init() {
    // 1. Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0706, 0.04);

    // 2. Camera setup
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    camera.position.set(0, 1.8, 4.5);

    // 3. Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    if (THREE.OrbitControls) {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxDistance = 8;
      controls.minDistance = 2;
      controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't flip under floor
    }

    camera.lookAt(0, 0, 0);

    // 5. Lighting Setup
    setupLighting();

    // 6. Build Models
    buildProceduralLog();
    buildPushpaAxe();
    buildEmberParticles();

    // Show Default Model
    scene.add(logGroup);
    currentGroup = logGroup;

    // 7. Event listeners
    window.addEventListener('resize', onWindowResize);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
      }, { threshold: 0 }).observe(container);
    }
    setupUIControls();

    // Hide loader
    setTimeout(() => {
      if (loaderEl) {
        loaderEl.style.opacity = '0';
        setTimeout(() => loaderEl.remove(), 500);
      }
    }, 400);

    // Start render loop
    animate();
  }

  function setupLighting() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xfff0e6, 0.5);
    scene.add(ambient);

    // Main Warm Key Light
    const keyLight = new THREE.DirectionalLight(0xffdfb3, 1.8);
    keyLight.position.set(4, 5, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Dramatic Crimson Rim Light
    rimLightRed = new THREE.PointLight(0xe5383b, 3.5, 12);
    rimLightRed.position.set(-3, 2, -2);
    scene.add(rimLightRed);

    // Golden Fill Point Light
    pointLightGold = new THREE.PointLight(0xd4af37, 2.5, 10);
    pointLightGold.position.set(3, -1, 2);
    scene.add(pointLightGold);

    // Dark rustic floor shadow catcher
    const floorGeo = new THREE.PlaneGeometry(15, 15);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x060504,
      roughness: 0.9,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.2;
    floor.receiveShadow = true;
    scene.add(floor);
  }

  /**
   * Helper: Generate procedurally drawn cross-section texture for Red Sandalwood rings
   */
  function createSandalwoodEndGrainCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Deep Blood-Red core base
    const grad = ctx.createRadialGradient(256, 256, 10, 256, 256, 250);
    grad.addColorStop(0, '#590d10');     // Dark heartwood core
    grad.addColorStop(0.2, '#800e13');   // Rich crimson red
    grad.addColorStop(0.6, '#a8181e');   // Santalin red
    grad.addColorStop(0.85, '#6e1115');  // Outer ring
    grad.addColorStop(0.96, '#2b1d16');  // Sapwood transition
    grad.addColorStop(1.0, '#120b08');   // Bark border
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Concentric growth rings
    ctx.lineWidth = 1.8;
    for (let r = 12; r < 240; r += 4 + Math.random() * 3) {
      ctx.beginPath();
      ctx.strokeStyle = Math.random() > 0.4 ? 'rgba(40, 5, 8, 0.45)' : 'rgba(215, 50, 55, 0.35)';
      ctx.arc(256, 256, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Natural drying cracks / rays
    ctx.strokeStyle = 'rgba(25, 4, 6, 0.65)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 2 / 18) * i + (Math.random() - 0.5) * 0.2;
      const len = 60 + Math.random() * 150;
      ctx.beginPath();
      ctx.moveTo(256, 256);
      ctx.lineTo(256 + Math.cos(angle) * len, 256 + Math.sin(angle) * len);
      ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Helper: Bark procedural texture
   */
  function createBarkTextureCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1c130e';
    ctx.fillRect(0, 0, 512, 512);

    // Deep rough ridges
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#100a07' : '#2b1c14';
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const w = 4 + Math.random() * 8;
      const h = 25 + Math.random() * 70;
      ctx.fillRect(x, y, w, h);
    }

    // Sap droplets (Golden amber resin)
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = 'rgba(224, 169, 109, 0.85)';
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 2 + Math.random() * 4;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 4);
    return tex;
  }

  /**
   * BUILD MODEL 1: Realistic 3D Red Sandalwood Log Stack
   */
  function buildProceduralLog() {
    logGroup = new THREE.Group();

    const endTexture = createSandalwoodEndGrainCanvas();
    const barkTexture = createBarkTextureCanvas();

    // Multi-materials for cylinder: [side, top cap, bottom cap]
    const barkMat = new THREE.MeshStandardMaterial({
      map: barkTexture,
      roughness: 0.85,
      metalness: 0.05
    });

    const endGrainMat = new THREE.MeshStandardMaterial({
      map: endTexture,
      roughness: 0.45,
      metalness: 0.1
    });

    const materials = [barkMat, endGrainMat, endGrainMat];

    // Main Center Log (laying horizontally)
    const logGeo = new THREE.CylinderGeometry(0.55, 0.58, 3.2, 32);
    const mainLog = new THREE.Mesh(logGeo, materials);
    mainLog.rotation.z = Math.PI / 2;
    mainLog.castShadow = true;
    mainLog.receiveShadow = true;
    logGroup.add(mainLog);

    // Secondary smaller stacked log behind
    const subLogGeo = new THREE.CylinderGeometry(0.42, 0.44, 2.9, 28);
    const subLog1 = new THREE.Mesh(subLogGeo, materials);
    subLog1.rotation.z = Math.PI / 2;
    subLog1.position.set(0.1, -0.45, -0.6);
    subLog1.castShadow = true;
    subLog1.receiveShadow = true;
    logGroup.add(subLog1);

    // Front bottom log
    const subLog2 = new THREE.Mesh(subLogGeo, materials);
    subLog2.rotation.z = Math.PI / 2;
    subLog2.position.set(-0.2, -0.45, 0.55);
    subLog2.castShadow = true;
    subLog2.receiveShadow = true;
    logGroup.add(subLog2);

    // Rustic Timber Support Skid Base
    const beamGeo = new THREE.BoxGeometry(0.25, 0.25, 2.4);
    const beamMat = new THREE.MeshStandardMaterial({
      color: 0x1f1611,
      roughness: 0.95
    });
    
    const beam1 = new THREE.Mesh(beamGeo, beamMat);
    beam1.position.set(-1.1, -0.9, 0);
    beam1.castShadow = true;
    logGroup.add(beam1);

    const beam2 = new THREE.Mesh(beamGeo, beamMat);
    beam2.position.set(1.1, -0.9, 0);
    beam2.castShadow = true;
    logGroup.add(beam2);

    // Embedded axe blade stuck into the main log!
    const stuckAxeBladeGeo = new THREE.BoxGeometry(0.4, 0.6, 0.08);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0x5a5856,
      metalness: 0.85,
      roughness: 0.25
    });
    const stuckBlade = new THREE.Mesh(stuckAxeBladeGeo, bladeMat);
    stuckBlade.position.set(0.4, 0.7, 0.1);
    stuckBlade.rotation.x = 0.2;
    stuckBlade.rotation.y = 0.3;
    stuckBlade.castShadow = true;
    logGroup.add(stuckBlade);

    // Axe handle sticking out
    const handleGeo = new THREE.CylinderGeometry(0.045, 0.05, 1.8, 16);
    const handleMat = new THREE.MeshStandardMaterial({
      color: 0x3d271d,
      roughness: 0.7
    });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(0.65, 1.45, 0.25);
    handle.rotation.z = -0.35;
    handle.castShadow = true;
    logGroup.add(handle);

    logGroup.position.y = 0.3;
  }

  /**
   * BUILD MODEL 2: Pushpa's Forged Combat Axe
   */
  function buildPushpaAxe() {
    axeGroup = new THREE.Group();

    // 1. Long curved wooden haft / handle
    const haftGeo = new THREE.CylinderGeometry(0.065, 0.08, 3.2, 24);
    const haftMat = new THREE.MeshStandardMaterial({
      color: 0x2e1a12,
      roughness: 0.65,
      metalness: 0.1
    });
    const haft = new THREE.Mesh(haftGeo, haftMat);
    haft.castShadow = true;
    axeGroup.add(haft);

    // Leather wrap near the base and grip
    const wrapGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.9, 20);
    const wrapMat = new THREE.MeshStandardMaterial({
      color: 0x541212, // Crimson dark leather wrap
      roughness: 0.8
    });
    const wrap = new THREE.Mesh(wrapGeo, wrapMat);
    wrap.position.y = -0.9;
    axeGroup.add(wrap);

    // 2. Heavy Forged Iron Axe Head (Composite)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.25, 0);

    // Axe Eye Collar (collar around handle)
    const eyeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.45, 16);
    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.9,
      roughness: 0.3
    });
    const eyeCollar = new THREE.Mesh(eyeGeo, ironMat);
    eyeCollar.castShadow = true;
    headGroup.add(eyeCollar);

    // Heavy Curved Blade Body
    const bladeBodyGeo = new THREE.BoxGeometry(0.85, 0.6, 0.12);
    const bladeBody = new THREE.Mesh(bladeBodyGeo, ironMat);
    bladeBody.position.set(0.45, 0, 0);
    bladeBody.castShadow = true;
    headGroup.add(bladeBody);

    // Razor Sharp Beveled Cutting Edge
    const edgeGeo = new THREE.CylinderGeometry(0.01, 0.75, 0.85, 3);
    const sharpEdgeMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.95,
      roughness: 0.15
    });
    const edge = new THREE.Mesh(edgeGeo, sharpEdgeMat);
    edge.position.set(0.9, 0, 0);
    edge.rotation.z = Math.PI / 2;
    edge.castShadow = true;
    headGroup.add(edge);

    // Back Hammer poll / spike
    const spikeGeo = new THREE.ConeGeometry(0.12, 0.5, 12);
    const spike = new THREE.Mesh(spikeGeo, ironMat);
    spike.position.set(-0.35, 0, 0);
    spike.rotation.z = Math.PI / 2;
    headGroup.add(spike);

    // Golden Syndicate Medallion Inlaid on Axe Blade
    const medalGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.14, 24);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.2
    });
    const medal = new THREE.Mesh(medalGeo, goldMat);
    medal.rotation.x = Math.PI / 2;
    medal.position.set(0.35, 0, 0);
    headGroup.add(medal);

    axeGroup.add(headGroup);

    // Angle the axe dramatically for display
    axeGroup.rotation.z = 0.35;
    axeGroup.rotation.y = 0.4;
    axeGroup.position.set(0, 0.1, 0);
  }

  /**
   * BUILD 3D EMBERS PARTICLES
   */
  function buildEmberParticles() {
    const particleCount = 280;
    particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = Math.random() * 4 - 1.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      scales[i] = Math.random() * 0.08 + 0.02;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Custom glowing particle texture canvas
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d');
    const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 230, 150, 1)');
    grad.addColorStop(0.3, 'rgba(240, 80, 40, 0.9)');
    grad.addColorStop(0.8, 'rgba(180, 20, 20, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 64, 64);

    const particleTexture = new THREE.CanvasTexture(pCanvas);

    const pMat = new THREE.PointsMaterial({
      size: 0.14,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xffaa44
    });

    emberParticles = new THREE.Points(particleGeo, pMat);
    scene.add(emberParticles);
  }

  /**
   * UI Controls & Model Switcher
   */
  function setupUIControls() {
    const btnWood = document.getElementById('btn-model-wood');
    const btnAxe = document.getElementById('btn-model-axe');
    const btnBurst = document.getElementById('btn-ember-burst');
    const btnReset = document.getElementById('btn-reset-cam');

    // Spec Readout Elements
    const specCode = document.getElementById('spec-code');
    const specDensity = document.getElementById('spec-density');
    const specColor = document.getElementById('spec-color');
    const specOrigin = document.getElementById('spec-origin');
    const specVal = document.getElementById('spec-val');

    function switchModel(type) {
      if (type === activeModel) return;

      scene.remove(currentGroup);

      if (type === 'wood' || type === 'log') {
        scene.add(logGroup);
        currentGroup = logGroup;
        activeModel = 'log';
        btnWood.classList.add('active');
        btnAxe.classList.remove('active');

        // Update Spec info
        if (specCode) specCode.textContent = 'SPEC: RC-GRADE-A1';
        if (specDensity) specDensity.textContent = '1,240 kg/m³ (Sinks in Water)';
        if (specColor) specColor.textContent = 'Deep Crimson Sangria (Santalin Rich)';
        if (specOrigin) specOrigin.textContent = 'Seshachalam Biosphere Reserve (Secret Sector 9)';
        if (specVal) specVal.textContent = '₹ 4.85 Crores / Container';
      } else {
        scene.add(axeGroup);
        currentGroup = axeGroup;
        activeModel = 'axe';
        btnAxe.classList.add('active');
        btnWood.classList.remove('active');

        // Update Spec info
        if (specCode) specCode.textContent = 'SPEC: FORGED AXE #01';
        if (specDensity) specDensity.textContent = 'High-Carbon Forged Steel & Teak Wood';
        if (specColor) specColor.textContent = 'Smoked Obsidian Steel & Crimson Binding';
        if (specOrigin) specOrigin.textContent = 'Custom Forged in Tirupati Underworld Armory';
        if (specVal) specVal.textContent = 'PRICELESS // SYNDICATE SCEPTRE';
      }

      // Quick ember burst when switching
      triggerEmberBurst();
    }

    if (btnWood) btnWood.addEventListener('click', () => switchModel('wood'));
    if (btnAxe) btnAxe.addEventListener('click', () => switchModel('axe'));

    if (btnBurst) {
      btnBurst.addEventListener('click', triggerEmberBurst);
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        camera.position.set(0, 1.8, 4.5);
        if (controls) {
          controls.target.set(0, 0, 0);
          controls.update();
        } else {
          camera.lookAt(0, 0, 0);
        }
      });
    }
  }

  function triggerEmberBurst() {
    if (!particleGeo) return;
    const positions = particleGeo.attributes.position.array;
    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3 + 1] = Math.random() * 1.5 - 0.5;
      positions[i * 3 + 0] = (Math.random() - 0.5) * 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    particleGeo.attributes.position.needsUpdate = true;
  }

  function onWindowResize() {
    if (!container || !renderer || !camera) return;
    if (!container.clientWidth || !container.clientHeight) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  /**
   * Main Animation Loop
   */
  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible || document.hidden) return; // skip work when off-screen

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Idle rotation for active 3D model
    if (currentGroup) {
      currentGroup.rotation.y += 0.005;
      // Gentle floating bob
      currentGroup.position.y = (activeModel === 'log' ? 0.3 : 0.1) + Math.sin(elapsedTime * 1.5) * 0.05;
    }

    // Dynamic ember particle rising animation
    if (emberParticles && particleGeo) {
      const positions = particleGeo.attributes.position.array;
      for (let i = 0; i < positions.length / 3; i++) {
        // Rise up
        positions[i * 3 + 1] += 0.012 + (i % 5) * 0.003;
        // Drift slightly with wind
        positions[i * 3 + 0] += Math.sin(elapsedTime + i) * 0.003;

        // Reset if reached top
        if (positions[i * 3 + 1] > 3) {
          positions[i * 3 + 1] = -1.2;
          positions[i * 3 + 0] = (Math.random() - 0.5) * 5;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;
    }

    // Orbit dynamic colored rim lights
    if (rimLightRed) {
      rimLightRed.position.x = Math.sin(elapsedTime * 0.8) * 3.5;
      rimLightRed.position.z = Math.cos(elapsedTime * 0.8) * 3.5;
    }

    if (controls) {
      controls.update();
    }

    renderer.render(scene, camera);
  }

  // Run on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
