// 3D 島嶼頁專用
// ==========================================
// 3D 渲染核心
// ==========================================
if (!window.THREE || !THREE.OrbitControls) { $("#stage").innerHTML = '<p style="padding:30px">3D 載入失敗，請確認已連上網路載入 Three.js。</p>'; } 
else { boot(); }

let fl = null, mt = 0, last = performance.now();
const fly = (p, t) => { fl = { p0: window.cam.position.clone(), t0: window.ctl.target.clone(), p1: new THREE.Vector3(...p), t1: new THREE.Vector3(...t), s: performance.now() }; };

function boot() {
  const stage = $("#stage"), ren = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }), cvs = ren.domElement, lab = $("#lab");
  ren.setPixelRatio(Math.min(devicePixelRatio, 2)); ren.shadowMap.enabled = true; ren.shadowMap.type = THREE.PCFSoftShadowMap; ren.outputEncoding = THREE.sRGBEncoding;
  stage.prepend(cvs);

  window.cam = new THREE.PerspectiveCamera(28, 1, 0.5, 350); cam.position.set(-30, 42, 60);
  window.ctl = new THREE.OrbitControls(cam, cvs); ctl.enableDamping = true; ctl.dampingFactor = 0.06; ctl.enablePan = true; ctl.maxPolarAngle = 1.40; ctl.minDistance = 0.1; ctl.maxDistance = 140; ctl.target.set(0, 1.0, 4);

  const scene = new THREE.Scene();
  const hemi = new THREE.HemisphereLight("#fffdf7", "#7c9885", 0.86);
  const sun = new THREE.DirectionalLight("#fff8e7", 0.96); sun.position.set(25, 42, 30); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 130 });
  scene.add(hemi, sun);

  const M = (g, c, opts = {}) => { const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: opts.r !== undefined ? opts.r : 0.82, metalness: opts.m !== undefined ? opts.m : 0.05, emissive: opts.em || "#000000", emissiveIntensity: opts.emi || 0 })); m.castShadow = opts.cs !== undefined ? opts.cs : true; m.receiveShadow = opts.rs !== undefined ? opts.rs : true; return m; };
  const water = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshStandardMaterial({ color: "#38bdf8", roughness: 0.42, metalness: 0.08 })); water.rotation.x = -Math.PI / 2; water.position.y = -0.5; water.receiveShadow = true; scene.add(water);
  scene.fog = new THREE.FogExp2("#38bdf8", 0.007);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const sceneElements = { clouds: [], boats: [], cloudMats: [] };

  const mountains = new THREE.Group();
  for(let i = 0; i < 40; i++) { const angle = (i / 40) * Math.PI * 2; const dist = 85 + Math.random() * 25; const h = 15 + Math.random() * 25; const m = M(new THREE.ConeGeometry(h * 0.9, h, 6), "#1f3a28", {r: 0.9}); m.position.set(Math.cos(angle) * dist, h/2 - 3, Math.sin(angle) * dist); m.rotation.y = Math.random(); mountains.add(m); } scene.add(mountains);

  function makeEdgeTex(type) {
    const c = document.createElement("canvas"); c.width = 256; c.height = 64; const ctx = c.getContext("2d");
    if (type === "stripe") { ctx.fillStyle = "#f4d35e"; ctx.fillRect(0, 0, 256, 64); ctx.fillStyle = "#2b2d42"; for (let i = -64; i < 256; i += 32) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 16, 0); ctx.lineTo(i + 48, 64); ctx.lineTo(i + 32, 64); ctx.fill(); } } 
    else if (type === "mosaic") { const cols = ["#f4a261", "#e76f51", "#2a9d8f", "#e9c46a", "#264653", "#f8f9fa"]; for (let x = 0; x < 256; x += 16) { for (let y = 0; y < 64; y += 16) { ctx.fillStyle = cols[(x / 16 + y / 16) % cols.length]; ctx.fillRect(x, y, 16, 16); } } } 
    else { ctx.fillStyle = "#d9c5b2"; ctx.fillRect(0, 0, 256, 64); ctx.fillStyle = "#b09882"; ctx.fillRect(0, 0, 256, 14); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(12, 1); t.encoding = THREE.sRGBEncoding; return t;
  }

  const pick = [], houses = [], pins = [], ils = [], seen = {}, zBeacons = []; window.pins = pins;
  Zs.forEach((zn, i) => {
    const G = new THREE.Group(); G.position.set(zn.x, 0, zn.z); const radius = zn.r;
    const edgeMat = new THREE.MeshStandardMaterial({ map: makeEdgeTex(zn.edge), roughness: 0.8 });
    const topMat = new THREE.MeshStandardMaterial({ color: i === 2 ? "#f3d5a5" : "#dcd8cf", roughness: 0.88, flatShading: true });
    
    if (i===0) topMat.color.setHex(0xccfbf1); if (i===3) topMat.color.setHex(0xe0e7ff); if (i===4) topMat.color.setHex(0xfef3c7);
    const baseBlock = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.9, 40), [edgeMat, topMat, edgeMat]);
    baseBlock.position.y = -0.2; baseBlock.receiveShadow = true; baseBlock.castShadow = true; baseBlock.userData.z = i; pick.push(baseBlock); G.add(baseBlock);

    const zN = N.filter(q => q.z === i), nc = zN.length; const caseOffsets = []; for (let j = 0; j < nc; j++) { const angle = j * (Math.PI * 2 / nc) - Math.PI / 2 + 0.3; caseOffsets.push([Math.cos(angle) * (radius - 1.5), Math.sin(angle) * (radius - 1.5)]); }
    for (let j = 0; j < nc; j++) {
      const [hx, hz] = caseOffsets[j], n = zN[j], cg = new THREE.Group(); cg.position.set(hx, 0.3, hz);
      const kBase = M(new THREE.BoxGeometry(1.15, 0.78, 1.05), "#fdfcdc"); kBase.position.y = 0.39; const kRoof = M(new THREE.ConeGeometry(0.96, 0.58, 4), zn.c); kRoof.position.y = 1.06; kRoof.rotation.y = Math.PI / 4;
      const hit = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.2, 1.7), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); hit.position.y = 1.0; hit.userData.cid = n.id; pick.push(hit); cg.add(kBase, kRoof, hit); G.add(cg); houses.push({ g: cg, n, x: zn.x + hx, z: zn.z + hz, i, j });
    }

    const bm = new THREE.MeshStandardMaterial({ color: "#9ca3af", emissive: "#9ca3af", emissiveIntensity: 0.5, flatShading: true });
    const bc = new THREE.Mesh(new THREE.OctahedronGeometry(0.5), bm); bc.scale.y = 1.4; bc.position.set(0, 6.2, 0); G.add(bc); zBeacons.push(bc);
    scene.add(G);

    const il = document.createElement("button"); il.className = "il"; il.onclick = () => { openZone(i); }; lab.appendChild(il); ils.push(il);
  });

  F.forEach((f, k) => {
    const A = Zs[f.a], B = Zs[f.b];
    f.curve = new THREE.CatmullRomCurve3([V(A.x, 0.42, A.z), V((A.x + B.x) * 0.5, 0.45, (A.z + B.z) * 0.5), V(B.x, 0.42, B.z)]);
    f.tube = new THREE.Mesh(new THREE.TubeGeometry(f.curve, 32, 0.08, 6, false), new THREE.MeshBasicMaterial({ color: "#ea580c" })); f.tube.visible = false; scene.add(f.tube);
    f.w = [];
  });

  // ---- 補回：驗證機構地標 / 歷史事件彩蛋 / 金幣（拆檔時遺失，造成 courtEls is not defined）----
  const courtEls = [], eggMeshes = []; let coinGroup = null;
  COURT_LANDMARKS.forEach(c => {
    const g = new THREE.Group(); g.position.set(c.x, 0, c.z);
    const plat = M(new THREE.CylinderGeometry(10, 10, 0.9, 40), "#e7e5e4"); plat.position.y = -0.2;
    const step = M(new THREE.BoxGeometry(15, 0.6, 8), "#d6d3d1"); step.position.y = 0.55;
    const body = M(new THREE.BoxGeometry(12, 6, 5), "#f5f5f4"); body.position.y = 3.85;
    const roof = M(new THREE.ConeGeometry(9, 3, 4), "#0f766e"); roof.position.y = 8.35; roof.rotation.y = Math.PI / 4; roof.scale.z = 0.55;
    g.add(plat, step, body, roof);
    for (let k = 0; k < 6; k++) { const col = M(new THREE.CylinderGeometry(0.42, 0.46, 6, 12), "#fafaf9"); col.position.set(-5 + k * 2, 3.85, 3.2); g.add(col); }
    scene.add(g);
    const el = document.createElement("button"); el.className = "court-lbl"; el.textContent = c.title;
    el.onclick = () => {
      exitWalk(); fly([0, 12.5, 16.5], [0, 4.5, -24]);
      $("#cc").innerHTML = `<div class="ch"><div class="tile">🏛️</div><div><div class="eb">驗證機構</div><h2>${c.historyTitle}</h2></div></div><p class="lede">${c.historyDesc}</p>`;
      $("#card").hidden = false;
    };
    lab.appendChild(el); courtEls.push({ el, x: c.x, y: c.y, z: c.z });
  });
  EGGS.forEach(e => {
    const g = new THREE.Group(); g.position.set(e.x, 1.6, e.z);
    const gem = M(new THREE.OctahedronGeometry(0.5), "#fbbf24", { em: "#f59e0b", emi: 0.8 }); gem.scale.y = 1.3;
    const hit = new THREE.Mesh(new THREE.SphereGeometry(1.3, 8, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
    hit.userData.eggId = e.id; pick.push(hit); g.add(gem, hit); scene.add(g); eggMeshes[e.id] = { g };
  });

  let speedMulti = 1.0;
  const TP = {
    safe: { b: "#059669", h: 0.95, d: 1.0, dc: "#fef3c7", w: "#34d399", emi: 0.6, fog: "#059669", cloud: "#d1fae5", speed: 1.8 },
    flat: { b: "#38bdf8", h: 0.78, d: 0.85, dc: "#fff8e7", w: "#38bdf8", emi: 0.15, fog: "#93c5fd", cloud: "#ffffff", speed: 1.0 },
    danger: { b: "#111827", h: 0.4, d: 0.3, dc: "#fca5a5", w: "#1f2937", emi: 1.5, fog: "#450a0a", cloud: "#7f1d1d", speed: 0.4 }
  };
  window.tod = function(k) {
    const p = TP[k]; speedMulti = p.speed; scene.background = new THREE.Color(p.b); if (scene.fog) scene.fog.color.set(p.fog);
    sceneElements.cloudMats.forEach(m => m.color.set(p.cloud)); hemi.intensity = p.h; sun.intensity = p.d; sun.color.set(p.dc); water.material.color.set(p.w);
    document.querySelectorAll("#tm button").forEach(b => b.classList.toggle("on", b.dataset.t === k));
  };
  window.tod("flat");

  let isWalkMode = false, selZ = -1, selC = -1, selF = -1, names = true, allFlows = false, bird = false, currentSearchQuery = "";
  ctl.addEventListener("start", () => fl = null);

  // 顯示專案大廳 (Project Lobby)
  N.forEach(n => {
    const e = document.createElement("button"); e.className = "pin"; 
    e.onclick = () => {
      const h = houses[n.id]; selZ = n.z; selC = n.id;
      if(!seen[n.id]) { seen[n.id] = 1; }
      fly([h.x - 4.5, 5.5, h.z + 6.8], [h.x, 1.0, h.z]);
            openItemCard(n);
    };
    lab.appendChild(e); pins.push(e);
  });

  window.openZone = function(i) {
    selZ = i; selC = -1; selF = -1; const z = Zs[i];
    fly([z.x - 7.5, 10.5, z.z + 11.5], [z.x, 0.8, z.z]);
    F.forEach((f, k) => f.tube.visible = allFlows || f.a === i || f.b === i);
    $("#cc").innerHTML = `
      <div class="ch"><div class="tile">${z.e}</div><div><div class="eb">${/條款/.test(z.n) ? "ISMS 本文條款" : "附錄 A（2022）"}・${z.p}</div><h2>${z.n}</h2></div></div>
      <p class="lede">${SUM[i]}</p>
      <div class="zp"><span>${zDone(i)}/${zTot(i)} 完成・${zState(i).t}・期限第 ${ZDUE[i]} 月</span><input placeholder="負責人" value="${esc(P.own[i])}" ${canEdit() ? "" : "disabled"} onchange="pgOwn(${i}, this.value)"></div>
      <div class="blk"><h4>為什麼這樣分組</h4><p>${z.why}</p></div><h3>此島的控制措施</h3><div class="rows">${N.filter(n => n.z === i).map(rowC).join("")}</div>
      <h3>跨域關聯</h3><div class="chips">${chips(i)}</div>`;
    $("#card").hidden = false; sync();
  };

  window.openFlow = function(k) {
    const f = F[k]; selF = k; selC = -1;
    F.forEach((g, q) => g.tube.visible = allFlows || q === k);
    const mx = (Zs[f.a].x + Zs[f.b].x) / 2, mz = (Zs[f.a].z + Zs[f.b].z) / 2; fly([mx - 10, 16, mz + 16], [mx, 0.5, mz]);
    $("#cc").innerHTML = `
      <div class="ch"><div class="tile">${f.e}</div><div><div class="eb">CONTROL FLOW · F${k + 1}</div><h2>${f.c}</h2></div></div>
      <div class="route"><button class="chip" onclick="openZone(${f.a})"><b>${Zs[f.a].n.split(" ")[0]}</b>${Zs[f.a].p}</button><i>⇄</i><button class="chip" onclick="openZone(${f.b})"><b>${Zs[f.b].n.split(" ")[0]}</b>${Zs[f.b].p}</button></div>
      <p class="lede">${f.t}</p>`;
    $("#card").hidden = false; sync();
  };

  function sync() {
    ils.forEach((e, i) => { e.style.display = names && !isWalkMode ? "" : "none"; e.innerHTML = `<span class="dot" style="background:${zState(i).c}"></span><b>${Zs[i].n.split(" ")[0]}</b> ${Zs[i].n.split(" ")[1]} <small>${zDone(i)}/${zTot(i)}</small>`; e.classList.toggle("sel", i === selZ); });
    const qLower = (window.searchQ || "").toLowerCase();
    pins.forEach((e, id) => {
      const n = N[id]; const showPin = names && !isWalkMode && (selZ >= 0 ? n.z === selZ : !!qLower); e.style.display = showPin ? "" : "none";
      let isMatch = false; if (qLower && [n.no, n.ti, n.en, n.ev, Zs[n.z].n].join("").toLowerCase().includes(qLower)) isMatch = true;
      e.className = "pin" + (isNA(n.no) ? " na" : stOf(n.no) === 2 ? " done" : seen[id] ? " read" : "") + (id === selC ? " on" : "") + (isMatch ? " match" : ""); e.innerHTML = `<b>${stOf(n.no) === 2 ? "✓" : n.j + 1}</b>${dn(n.no)} ${n.ti}${tplN(n.no) ? " 📎" : ""}`;
    });
    courtEls.forEach(c => { c.el.style.display = names && !isWalkMode ? "" : "none"; });
  }

  const exitWalk = () => { isWalkMode = false; const w = $("#walkBtn"); w.classList.remove("walk-on"); w.setAttribute("aria-pressed", "false"); ctl.maxPolarAngle = 1.40; ctl.minDistance = 4; ctl.maxDistance = 140; };
  $("#home").onclick = () => { $("#card").hidden = true; selZ = -1; selC = -1; selF = -1; F.forEach(f => f.tube.visible = allFlows); exitWalk(); fly([-15, 34, 44], [5, 1.0, -2]); sync(); };
  $("#courtBtn").onclick = () => { $("#card").hidden = true; exitWalk(); fly([0, 12.5, 16.5], [0, 4.5, -24]); sync(); };
  $("#cx").onclick = () => { $("#card").hidden = true; };
  $("#tm").onclick = e => { const b = e.target.closest("button"); if (b) window.tod(b.dataset.t); };
  $("#tg").onclick = e => {
    const b = e.target.closest("button"); if (!b) return;
    const k = b.dataset.g, v = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", v);
    if (k === "names") { names = v; sync(); }
    if (k === "bird") { bird = v; exitWalk(); fly(bird ? [5, 65, 15] : [-15, 34, 44], [5, 1.0, -2]); sync(); }
    if (k === "walk") {
      if (v) { isWalkMode = true; b.classList.add("walk-on"); fly([Zs[0].x, 1.5, Zs[0].z + 3], [Zs[0].x, 1.5, Zs[0].z]); ctl.maxPolarAngle = Math.PI / 2; ctl.minDistance = 0.1; ctl.maxDistance = 5; }
      else { exitWalk(); fly([-15, 34, 44], [5, 1.0, -2]); }
      sync();
    }
  };
  $("#menu").onclick = () => sb.classList.toggle("open");
  
  $("#modeBtn").onclick = () => { location.href = "dashboard.html"; };


  const ray = new THREE.Raycaster(), nd = new THREE.Vector2(); let downPos = null;
  cvs.addEventListener("pointerdown", e => downPos = [e.clientX, e.clientY]);
  cvs.addEventListener("pointerup", e => {
  if (!downPos || Math.hypot(e.clientX - downPos[0], e.clientY - downPos[1]) > 5) return;
    const r = cvs.getBoundingClientRect(); nd.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(nd, cam);
    const h = ray.intersectObjects(pick, false);
    if (h.length) {
      const u = h[0].object.userData;
      if (u.cid !== undefined) pins[u.cid].onclick();
      else if (u.z !== undefined) { ils[u.z].onclick(); exitWalk(); }
      else if (u.eggId !== undefined) { 
        EGGS[u.eggId].found = true; eggMeshes[u.eggId].g.visible = false; 
        fly([EGGS[u.eggId].x - 6, 8, EGGS[u.eggId].z + 8], [EGGS[u.eggId].x, 1, EGGS[u.eggId].z]);
        $("#cc").innerHTML = `<div class="ch"><div class="tile">${EGGS[u.eggId].icon}</div><div><div class="eb">資安歷史事件</div><h2>${EGGS[u.eggId].title}</h2></div></div><p class="lede">${EGGS[u.eggId].desc}</p><p><button class="btn" onclick="document.getElementById('card').hidden=true">記取教訓</button></p>`;
        $("#card").hidden = false;
      }
    }
  });

  const size = () => { 
    if (document.body.classList.contains("serious-mode")) return; 
    const w = stage.clientWidth || 1, h = stage.clientHeight || 1;
    ren.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); 
  };
  new ResizeObserver(size).observe(stage); size(); window.__size = size;
  const v3 = V(0, 0, 0);
  const place = (el, x, y, z, w, h) => { v3.set(x, y, z).project(cam); el.style.visibility = v3.z < 1 ? "" : "hidden"; el.style.left = `${(v3.x * 0.5 + 0.5) * w}px`; el.style.top = `${(-v3.y * 0.5 + 0.5) * h}px`; };

  function loop(ts) {
    requestAnimationFrame(loop);
    if (document.body.classList.contains("serious-mode")) return; 
    
    const dt = Math.min(0.08, (ts - last) / 1000) * speedMulti; last = ts; mt += dt;

    if (fl) {
      let k = Math.min(1, (performance.now() - fl.s) / 980); k = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      cam.position.lerpVectors(fl.p0, fl.p1, k); ctl.target.lerpVectors(fl.t0, fl.t1, k);
      if (k >= 1) fl = null;
    }
    ctl.update();
    if (coinGroup) coinGroup.rotation.y = mt * 0.8;
    zBeacons.forEach((b, i) => { b.rotation.y = mt * 1.5; b.position.y = 6.2 + Math.sin(mt * 2 + i) * 0.15; });
    
    sceneElements.clouds.forEach(c => { c.g.position.x += c.speed * dt * 10; if (c.g.position.x > 100) c.g.position.x = -100; });
    sceneElements.boats.forEach(b => {
      b.angle += b.speed * dt; b.g.position.x = Math.cos(b.angle) * b.dist; b.g.position.z = Math.sin(b.angle) * b.dist;
      b.g.rotation.y = -b.angle; b.g.position.y = Math.sin(mt * 2 + b.bob) * 0.1 - 0.1;
    });

    const w = stage.clientWidth || 1, h = stage.clientHeight || 1;
    ils.forEach((e, i) => { if (e.style.display !== "none") place(e, Zs[i].x - Zs[i].r * 0.5, 2.3, Zs[i].z - Zs[i].r * 0.5, w, h); });
    pins.forEach((e, id) => { if (e.style.display !== "none") place(e, houses[id].x, 2.0, houses[id].z, w, h); });
    courtEls.forEach(c => { if (c.el.style.display !== "none") place(c.el, c.x, c.y, c.z, w, h); });
    ren.render(scene, cam);
  }
  

  window.sync3d = sync; window.render3D = () => ren.render(scene, cam);
  window.on3dRefresh = () => { zBeacons.forEach((bc, i) => { const c = zState(i).c; bc.material.color.set(c); bc.material.emissive.set(c); }); };
  requestAnimationFrame(loop);
}

// 員工進入 3D 頁：選好專案後收起側邊面板、重新量測畫布
window.onProjectSelected = () => { sb.classList.remove("open"); requestAnimationFrame(() => window.__size && window.__size()); };
enterApp();