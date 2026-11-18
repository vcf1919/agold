/*
 * AGOLD · «Metamorfosis» — mariposa de pan de oro en WebGL (Three.js)
 * Se carga de forma diferida desde main.js. Expone una API que main.js
 * conecta con el scroll (desarme y caída de las láminas sobre las fotos).
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';
import { FACETS, BODY, ANTENNA } from './butterfly-geometry.js';

const U = 1 / 40; // unidades de diseño → mundo
const GOLD = new THREE.Color('#C9A45C');
const EDGE = new THREE.Color('#F4D892');
const FOV = 30;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Pseudoaleatorio determinista (misma composición en cada visita)
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Relieve low-poly: cada vértice compartido recibe la misma z → facetas con normales distintas
const relief = (x, y) => {
  const ax = Math.abs(x);
  return (0.16 * Math.sin(ax * 0.11 + y * 0.07) + 0.1 * Math.cos(y * 0.13 - ax * 0.05) + ax * 0.0045) * 1.0;
};

/** Estudio fotográfico claro para los reflejos (sin HDRI externo) */
function studioEnvironment(renderer) {
  const scene = new THREE.Scene();
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(24, 16, 24),
    new THREE.MeshBasicMaterial({ color: new THREE.Color('#8f8577'), side: THREE.BackSide })
  );
  room.position.y = 3;
  scene.add(room);
  const panel = (w, h, intensity, pos, rot, tint = '#ffffff') => {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(intensity) });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    p.position.set(...pos);
    p.rotation.set(...rot);
    scene.add(p);
  };
  panel(12, 6, 5.5, [0, 10.9, 0], [Math.PI / 2, 0, 0]); // softbox cenital
  panel(3, 10, 7, [-11.9, 4, -2], [0, Math.PI / 2, 0]); // tira izquierda
  panel(2.2, 9, 4.5, [11.9, 4, 3], [0, -Math.PI / 2, 0], '#fff4e2'); // tira derecha cálida
  panel(9, 3.2, 3.2, [0, 2, 11.9], [0, Math.PI, 0], '#fff8ee'); // frontal suave
  panel(6, 2, 2.4, [-4, 5, -11.9], [0, 0, 0]); // fondo
  panel(24, 24, 0.9, [0, -4.9, 0], [-Math.PI / 2, 0, 0], '#efe6d8'); // suelo marfil
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(scene, 0.035).texture;
  pmrem.dispose();
  scene.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
  return tex;
}

export function createHero({ container, mobile = false, lowPower = false, onSlow } = {}) {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.environment = studioEnvironment(renderer);
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);

  const key = new THREE.DirectionalLight('#fff3dc', 1.6);
  key.position.set(2, 3, 4);
  scene.add(key);

  // ─── Mariposa ───
  const root = new THREE.Group();
  const wingR = new THREE.Group();
  const wingL = new THREE.Group();
  const body = new THREE.Group();
  root.add(wingR, wingL, body);
  scene.add(root);

  const rand = rng(1919);
  const pieces = [];
  const edgeMat = new THREE.LineBasicMaterial({ color: EDGE, transparent: true, opacity: 0.8 });

  FACETS.forEach((f, i) => {
    const v = f.pts.map(([x, y]) => new THREE.Vector3(x * U, -y * U, relief(x, y)));
    const c = v[0].clone().add(v[1]).add(v[2]).multiplyScalar(1 / 3);
    const local = v.map((p) => p.clone().sub(c).multiplyScalar(0.965)); // pequeña junta entre facetas
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(local.flatMap((p) => [p.x, p.y, p.z]), 3));
    geo.computeVertexNormals();
    const mat = new THREE.MeshPhysicalMaterial({
      color: GOLD,
      metalness: 1,
      roughness: 0.1 + rand() * 0.14,
      side: THREE.DoubleSide,
      emissive: new THREE.Color('#ffcf7a'),
      emissiveIntensity: 0,
      transparent: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    const eg = new THREE.BufferGeometry().setFromPoints([local[0], local[1], local[1], local[2], local[2], local[0]]);
    mesh.add(new THREE.LineSegments(eg, edgeMat));
    mesh.position.copy(c);
    (f.side > 0 ? wingR : wingL).add(mesh);

    // Parámetros por pieza
    const dir = new THREE.Vector3(c.x + (rand() - 0.5) * 1.2, c.y + (rand() - 0.2) * 1.6, 0).normalize();
    const p = {
      mesh, mat, rest: c.clone(), side: f.side, wing: f.wing,
      delay: rand() * 0.5,
      introFrom: c.clone().add(dir.multiplyScalar(5 + rand() * 4)).add(new THREE.Vector3(0, 1.5 + rand() * 2, (rand() - 0.5) * 6)),
      introRot: new THREE.Euler((rand() - 0.5) * 9, (rand() - 0.5) * 9, (rand() - 0.5) * 9),
      swirl: (rand() - 0.5) * 2.2,
      spinRot: new THREE.Euler((rand() - 0.5) * 5, (rand() - 0.5) * 5, (rand() - 0.5) * 3.4),
      r1: rand(), r2: rand(), r3: rand(), r4: rand(),
      frame: i % 3,
      perim: rand(),
      fallRot: (rand() - 0.5) * 1.2,
      phase: rand() * Math.PI * 2,
      explode: new THREE.Vector3(),
      fall: new THREE.Vector3(),
    };
    pieces.push(p);
  });

  // Cuerpo y antenas
  const bodyMat = new THREE.MeshPhysicalMaterial({ color: GOLD, metalness: 1, roughness: 0.24 });
  const bead = new THREE.SphereGeometry(1, 18, 12);
  BODY.forEach(([cy, rx, ry]) => {
    const m = new THREE.Mesh(bead, bodyMat);
    m.scale.set(rx * U, ry * U, rx * U * 0.9);
    m.position.set(0, -cy * U, 0.05);
    body.add(m);
  });
  [1, -1].forEach((s) => {
    const a = new THREE.Vector3(ANTENNA.from[0] * s * U, -ANTENNA.from[1] * U, 0.05);
    const b = new THREE.Vector3(ANTENNA.to[0] * s * U, -ANTENNA.to[1] * U, 0.1);
    const len = a.distanceTo(b);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, len, 6), bodyMat);
    stem.position.copy(a).add(b).multiplyScalar(0.5);
    stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    body.add(stem);
    const tip = new THREE.Mesh(bead, bodyMat);
    tip.scale.set(ANTENNA.tip.rx * U, ANTENNA.tip.ry * U, ANTENNA.tip.rx * U);
    tip.position.copy(b).add(b.clone().sub(a).normalize().multiplyScalar(0.06));
    tip.quaternion.copy(stem.quaternion);
    body.add(tip);
  });

  // ─── Estado ───
  const state = {
    w: 1, h: 1, H: 1, W: 1, camY: 0,
    intro: 1, introStart: 0, shimmerStart: -10, introDone: true,
    explode: 0, fall: 0,
    frames: [], // rects en px de los marcos destino
    pointer: { x: 0, y: 0, tx: 0, ty: 0, auto: true },
    running: false, visible: true, raf: 0, last: 0, t0: performance.now(),
    fpsCap: lowPower ? 30 : 60, frames_: 0, slowAcc: 0, slowN: 0, checked: false,
  };

  function resize() {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    state.w = w; state.h = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const bw = 3.2, bh = 3.05;
    const portrait = w / h < 0.85;
    const heightFit = bh / (portrait ? 0.5 : 0.54);
    const widthFit = bw / (portrait ? 0.92 : 0.8) / camera.aspect;
    state.H = Math.max(heightFit, widthFit);
    state.W = state.H * camera.aspect;
    const d = state.H / 2 / Math.tan((FOV * Math.PI) / 360);
    state.camY = -0.06 * state.H; // mariposa ligeramente por encima del centro
    camera.position.set(0, state.camY, d);
    camera.lookAt(0, state.camY, 0);
    camera.updateProjectionMatrix();
    computeExplodeTargets(portrait);
  }

  function computeExplodeTargets(portrait) {
    const hw = state.W / 2, hh = state.H / 2;
    pieces.forEach((p) => {
      const c = p.rest;
      if (portrait) {
        // Móvil vertical: se abren hacia arriba y hacia abajo
        const up = p.wing === 'upper' ? 1 : -1;
        const x = clamp(c.x * 1.25 + (p.r1 - 0.5) * 0.9, -hw * 0.9, hw * 0.9);
        const y = up * hh * (0.68 + p.r2 * 0.27);
        p.explode.set(x, y + state.camY, (p.r3 - 0.5) * 2.4);
      } else {
        // Escritorio: abanico hacia el marco de la pantalla, dejando libre el titular
        const a = Math.atan2(c.y + (p.r4 - 0.5) * 0.6, c.x) + (p.r1 - 0.5) * 0.5;
        const ca = Math.cos(a), sa = Math.sin(a);
        const r = 0.8 + p.r2 * 0.2;
        const k = r / Math.pow(Math.pow(Math.abs(ca) / hw, 4) + Math.pow(Math.abs(sa) / (hh * 0.96), 4), 0.25);
        p.explode.set(ca * k, sa * k + state.camY, (p.r3 - 0.5) * 3);
      }
    });
  }

  // px de pantalla → punto del mundo en z = 0
  const tmp = new THREE.Vector3();
  function screenToWorld(sx, sy, out) {
    const nx = (sx / state.w) * 2 - 1;
    const ny = -((sy / state.h) * 2 - 1);
    return out.set(nx * state.W / 2, ny * state.H / 2 + state.camY, 0);
  }
  function perimeterPoint(rect, u, out) {
    const pad = 10;
    const x0 = rect.left - pad, y0 = rect.top - pad, x1 = rect.right + pad, y1 = rect.bottom + pad;
    const w = x1 - x0, h = y1 - y0, P = 2 * (w + h);
    let d = u * P;
    let sx, sy;
    if (d < w) { sx = x0 + d; sy = y0; }
    else if ((d -= w) < h) { sx = x1; sy = y0 + d; }
    else if ((d -= h) < w) { sx = x1 - d; sy = y1; }
    else { d -= w; sx = x0; sy = y1 - d; }
    return screenToWorld(sx, sy, out);
  }

  // ─── Bucle ───
  const qa = new THREE.Quaternion();
  const qb = new THREE.Quaternion();
  const eTmp = new THREE.Euler();
  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const inv = new THREE.Matrix4();

  function frame(now) {
    state.raf = requestAnimationFrame(frame);
    const minDt = 1000 / state.fpsCap - 2;
    if (now - state.last < minDt) return;
    const dt = Math.min(0.05, (now - state.last) / 1000 || 0.016);
    // Vigilante de rendimiento: si el dispositivo no llega, baja a 30 fps; si aún así no, fallback SVG
    if (state.last && !state.checked && state.introDone) {
      state.slowAcc += now - state.last; state.slowN++;
      if (state.slowN === 90) {
        const avg = state.slowAcc / state.slowN;
        if (avg > 45 && state.fpsCap === 60) { state.fpsCap = 30; renderer.setPixelRatio(1); resize(); state.slowAcc = 0; state.slowN = 0; }
        else { state.checked = true; if (avg > 75 && onSlow) onSlow(); }
      }
    }
    state.last = now;
    const t = (now - state.t0) / 1000;
    update(t, dt, now);
    renderer.render(scene, camera);
  }

  function update(t, dt, now) {
    const s = state;
    // Intro
    let introT = 1;
    if (!s.introDone) {
      introT = (now - s.introStart) / 1000;
      if (introT > 1.75) { s.introDone = true; s.shimmerStart = now; }
    }
    // Puntero suavizado (cursor / giroscopio / automático)
    if (s.pointer.auto) {
      s.pointer.tx = Math.sin(t * 0.37) * 0.45;
      s.pointer.ty = Math.cos(t * 0.29) * 0.25;
    }
    s.pointer.x = lerp(s.pointer.x, s.pointer.tx, 1 - Math.pow(0.04, dt));
    s.pointer.y = lerp(s.pointer.y, s.pointer.ty, 1 - Math.pow(0.04, dt));

    const ex = s.explode;
    const fa = s.fall;
    const calm = (1 - smooth(0, 0.5, ex));
    const introCalm = s.introDone ? 1 : smooth(1.2, 1.75, introT);
    // Aleteo lento (~4 s por ciclo) y balanceo
    const flap = (0.5 - 0.5 * Math.cos((t * Math.PI * 2) / 4)) ;
    const amp = (0.1 + 0.42 * easeInOut(flap)) * calm * introCalm;
    wingR.rotation.y = -amp;
    wingL.rotation.y = amp;
    root.position.y = Math.sin(t * 0.9) * 0.06 * calm;
    root.rotation.z = Math.sin(t * 0.6) * 0.05 * calm;
    root.rotation.x = (0.18 + s.pointer.y * 0.35) * calm;
    root.rotation.y = s.pointer.x * 0.55 * calm;
    key.position.set(2 + s.pointer.x * 3, 3 - s.pointer.y * 2, 4);

    // Cuerpo: se desvanece al desarmarse
    const bs = 1 - smooth(0.05, 0.45, ex);
    body.scale.setScalar(Math.max(0.0001, bs));
    body.visible = bs > 0.001;

    // Barrido de destello tras encajar la última pieza
    const sh = (now - s.shimmerStart) / 1000;
    const sweepX = lerp(-2.2, 2.2, clamp(sh / 0.9));
    const shimmerOn = sh >= 0 && sh < 1.1;

    const fe = easeInOut(fa);
    const scaleFall = mobileQuery() ? 0.26 : 0.32;
    if (fa > 0) root.updateMatrixWorld(true);

    for (let i = 0; i < pieces.length; i++) {
      const p = pieces[i];
      const m = p.mesh;
      // 1) Intro: de dispersas a ensambladas
      let ip = 1;
      if (!s.introDone) ip = clamp((introT - p.delay) / 1.15);
      const ie = easeOutCubic(ip);
      vA.copy(p.introFrom).lerp(p.rest, ie);
      if (ip < 1) {
        const sw = Math.sin(ip * Math.PI) * (1 - ip) * p.swirl;
        vA.x += sw; vA.z += sw * 0.6;
      }
      // 2) Desarme por scroll
      const e = smooth(0.0, 1, ex * (0.85 + p.r1 * 0.3));
      vA.lerp(p.explode, easeInOut(e));
      // 3) Caída sobre los marcos de las fotos
      if (fa > 0 && s.frames.length) {
        const rect = s.frames[p.frame % s.frames.length];
        perimeterPoint(rect, p.perim, vB);
        // a coordenadas locales del ala (que en este punto ya está casi en reposo)
        inv.copy(m.parent.matrixWorld).invert();
        vB.applyMatrix4(inv);
        const fp = clamp((fa - p.r2 * 0.25) / 0.75);
        const fpe = easeInOut(fp);
        vA.lerp(vB, fpe);
        vA.x += Math.sin(fp * Math.PI * 2 + p.phase) * 0.25 * (1 - fp) * fp * 4;
      }
      m.position.copy(vA);

      // Rotación
      const ri = 1 - easeOutQuart(ip);
      eTmp.set(
        p.introRot.x * ri + p.spinRot.x * e,
        p.introRot.y * ri + p.spinRot.y * e,
        p.introRot.z * ri + p.spinRot.z * e
      );
      qa.setFromEuler(eTmp);
      if (fa > 0) {
        const fp = clamp((fa - p.r2 * 0.25) / 0.75);
        eTmp.set(0, 0, p.fallRot);
        qb.setFromEuler(eTmp);
        qa.slerp(qb, easeInOut(fp));
      }
      m.quaternion.copy(qa);
      const sc = lerp(1 - 0.12 * easeInOut(e), scaleFall, fe);
      m.scale.setScalar(sc);

      // Destello
      p.mat.emissiveIntensity = shimmerOn ? 0.85 * Math.exp(-Math.pow((p.rest.x - sweepX) / 0.45, 2)) : 0;
    }
  }

  const mq = window.matchMedia('(max-width: 899px)');
  const mobileQuery = () => mq.matches;

  // ─── API ───
  const api = {
    renderer,
    start() {
      if (state.running) return;
      state.running = true; state.last = 0;
      state.raf = requestAnimationFrame(frame);
    },
    stop() {
      state.running = false;
      cancelAnimationFrame(state.raf);
    },
    playIntro() {
      state.introDone = false;
      state.introStart = performance.now();
    },
    skipIntro() {
      if (!state.introDone) { state.introDone = true; state.shimmerStart = performance.now(); }
    },
    isIntroDone: () => state.introDone,
    setExplode(v) { state.explode = clamp(v); },
    setFall(v, rects) { state.fall = clamp(v); if (rects) state.frames = rects; },
    setPointer(x, y) { state.pointer.auto = false; state.pointer.tx = clamp(x, -1, 1); state.pointer.ty = clamp(y, -1, 1); },
    autoPointer() { state.pointer.auto = true; },
    resize,
    destroy() {
      api.stop();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };

  resize();
  // Primer frame ya renderizado (evita parpadeo)
  update(0, 0.016, performance.now());
  renderer.render(scene, camera);
  return api;
}
