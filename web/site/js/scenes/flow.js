// Bosh ekran sahnasi: "xaosdan tizimga".
// 65 ming zarracha GPU'da hisoblanadi. Xaos holatida ular turbulent (curl noise) oqimda,
// skroll bilan laminar oqimga o'tadi: parallel yo'laklar, besh bekat, chiqishda yashil natija.
// Izlar (long exposure) teskari aloqa buferida to'planadi.
import {
  WebGLRenderer, Scene, PerspectiveCamera, BufferGeometry, BufferAttribute, LineSegments, Mesh,
  PlaneGeometry, ShaderMaterial, WebGLRenderTarget, HalfFloatType, FloatType, LinearFilter,
  LinearMipmapLinearFilter, AdditiveBlending, NoBlending, Vector3, Vector2,
} from 'three';
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';

const GATES = [-4.2, -2.1, 0, 2.1, 4.2];
const LANES = 9;
const LANE_GAP = 0.3;
const X0 = -7.6, X1 = 7.6;

const NOISE = /* glsl */`
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+10.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
vec3 snoise3(vec3 x){return vec3(snoise(x),snoise(vec3(x.y-19.1,x.z+33.4,x.x+47.2)),snoise(vec3(x.z+74.2,x.x-124.5,x.y+99.4)));}
vec3 curl(vec3 p){
  const float e=.1;vec3 dx=vec3(e,0.,0.),dy=vec3(0.,e,0.),dz=vec3(0.,0.,e);
  vec3 x0=snoise3(p-dx),x1=snoise3(p+dx),y0=snoise3(p-dy),y1=snoise3(p+dy),z0=snoise3(p-dz),z1=snoise3(p+dz);
  return vec3(y1.z-y0.z-z1.y+z0.y, z1.x-z0.x-x1.z+x0.z, x1.y-x0.y-y1.x+y0.x)/(2.*e);
}
`;

const HASH = /* glsl */`
float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
`;

const SIM = /* glsl */`
uniform float uTime, uDt, uOrder, uMouseF;
uniform vec3 uMouse;
${NOISE}
${HASH}
const float LANES=${LANES.toFixed(1)}, GAP=${LANE_GAP}, X0=${X0}, X1=${X1};
void main(){
  vec2 uv=gl_FragCoord.xy/resolution.xy;
  vec4 d=texture2D(texturePosition,uv);
  vec3 pos=d.xyz; float life=d.w;
  float s1=hash12(uv*91.7), s2=hash12(uv*17.3+4.1), s3=hash12(uv*53.9+9.7);
  float lane=(floor(s1*LANES)-(LANES-1.)*.5)*GAP;
  // Xaos: turbulent oqim, markazga yengil tortiladi
  vec3 vc=curl(pos*.26+vec3(0.,0.,uTime*.035))*.42 - pos*vec3(.015,.05,.06);
  // Tizim: chapdan o'ngga laminar oqim, yo'lakka prujina, bekatlarda sekinlashadi
  float slow=0.;
  ${GATES.map((g) => `slow+=exp(-pow((pos.x-(${g.toFixed(2)}))*3.2,2.));`).join('')}
  float sp=(.78+s2*.5)*(1.-.55*min(slow,1.));
  vec3 tgt=vec3(pos.x, lane+(s3-.5)*.035, (s2-.5)*.05);
  vec3 vo=vec3(sp,0.,0.)+(tgt-pos)*vec3(0.,5.2,5.2);
  float o=smoothstep(0.,1.,uOrder);
  vec3 v=mix(vc, vo, o);
  // kursor oqimni yon tomonga suradi, keyin oqim tiklanadi
  vec3 dm=pos-uMouse; dm.z*=.35;
  float r2=dot(dm.xy,dm.xy);
  v+=normalize(dm+vec3(1e-4))*uMouseF*2.2*exp(-r2*2.6);
  pos+=v*uDt;
  life-=uDt*(1.-o*.92);
  bool out_=abs(pos.y)>4.2||abs(pos.z)>4.5||pos.x>X1||pos.x<X0-1.;
  if(life<=0.||out_){
    float r1=hash12(uv+fract(uTime*.37)), r2b=hash12(uv*1.31+fract(uTime*.53)), r3=hash12(uv*1.77+fract(uTime*.71));
    vec3 pc=(vec3(r1,r2b,r3)*2.-1.)*vec3(7.4,3.7,3.2);
    vec3 po=vec3(X0+r1*.6, lane+(s3-.5)*.035, (s2-.5)*.05);
    pos=o>.5?po:pc;
    life=1.6+r2b*4.5;
  }
  gl_FragColor=vec4(pos,life);
}
`;

const LINE_V = /* glsl */`
uniform sampler2D uPos, uPrev;
uniform float uOrder, uFind, uGlow, uOut;
varying vec3 vCol; varying float vA;
${HASH}
void main(){
  vec2 ref=position.xy;
  vec4 c=texture2D(uPos,ref), p=texture2D(uPrev,ref);
  vec3 pos=mix(p.xyz,c.xyz,position.z);
  float jump=step(.35,distance(c.xyz,p.xyz));
  float s=hash12(ref*91.7+.5);
  bool waste=s<.17;
  vec3 red=vec3(1.,.28,.20), cool=vec3(.46,.58,.78), blue=vec3(.18,.46,1.), white=vec3(.72,.86,1.), green=vec3(.10,.95,.52);
  vec3 cc=waste?red:cool;
  float x=c.x;
  vec3 oc=s>.86?white:blue;
  // kirishda isrof qizil, birinchi bekatdan keyin ko'k, oxirgi bekatdan keyin yashil
  oc=mix(waste?red:oc, oc, smoothstep(${GATES[0] - 0.5}, ${GATES[0] + 0.15}, x));
  oc=mix(oc, green, smoothstep(${GATES[4] - 0.5}, ${GATES[4] + 0.5}, x)*uOut);
  float o=smoothstep(0.,1.,uOrder);
  vCol=mix(cc,oc,o);
  float g=0.;
  ${GATES.map((gx) => `g+=exp(-pow((x-(${gx.toFixed(2)}))*7.,2.));`).join('')}
  float fade=smoothstep(0.,.5,c.w)*smoothstep(${X1.toFixed(2)},${(X1 - 1.2).toFixed(2)},x*o+(-9.)*(1.-o));
  float find=waste?1.+uFind*2.6:1.-uFind*.62;
  // yo'lakka hali yetib bormagan zarrachalar xira: o'tish paytidagi "tuman" yo'qoladi
  float lane=(floor(hash12(ref*91.7)*${LANES.toFixed(1)})-${((LANES - 1) / 2).toFixed(1)})*${LANE_GAP};
  float stray=smoothstep(.2,2.,abs(c.y-lane));
  vec4 mv=modelViewMatrix*vec4(pos,1.);
  float depth=mix(.2,1.15,smoothstep(15.,5.,-mv.z));
  vA=(1.-jump)*fade*find*depth*(1.+g*o*uGlow)*mix(1.,.22,stray*o);
  gl_Position=projectionMatrix*mv;
}
`;
const LINE_F = /* glsl */`
uniform float uIntensity;
varying vec3 vCol; varying float vA;
void main(){ gl_FragColor=vec4(vCol*vA*uIntensity,1.); }
`;

const QUAD_V = /* glsl */`varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`;
const FADE_F = /* glsl */`uniform sampler2D tPrev; uniform float uFade; varying vec2 vUv; void main(){ gl_FragColor=texture2D(tPrev,vUv)*uFade; }`;
const SHOW_F = /* glsl */`
uniform sampler2D tTrail; uniform float uExposure, uTime, uReveal; uniform vec2 uRes; uniform vec3 uBgA, uBgB;
varying vec2 vUv;
${HASH}
void main(){
  vec3 c=texture2D(tTrail,vUv).rgb;
  vec3 g1=textureLod(tTrail,vUv,3.).rgb, g2=textureLod(tTrail,vUv,5.).rgb;
  c=c+g1*.55+g2*.85;
  c=1.-exp(-c*uExposure);
  float d=length((vUv-vec2(.42,.55))*vec2(uRes.x/uRes.y,1.));
  vec3 bg=mix(uBgA,uBgB,smoothstep(0.,1.15,d));
  vec3 col=bg+c*uReveal;
  col+=(hash12(vUv*uRes+fract(uTime)*311.)-.5)*.028;
  gl_FragColor=vec4(col,1.);
}
`;
const GATE_V = /* glsl */`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`;
const GATE_F = /* glsl */`uniform float uA; varying vec2 vUv; void main(){ float a=smoothstep(0.,.25,vUv.y)*smoothstep(1.,.75,vUv.y); gl_FragColor=vec4(vec3(.62,.75,1.)*a*uA,1.); }`;

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };

// Kamera nuqtalari: xaos (old), tizim (yonboshdan), oqim ichiga.
const CAM = [
  { p: new Vector3(0, 0, 7.4), l: new Vector3(0, 0, 0) },
  { p: new Vector3(-4.6, 2.05, 4.7), l: new Vector3(0.9, -0.2, 0) },
  { p: new Vector3(-2.6, 0.95, 2.6), l: new Vector3(3.2, -0.08, 0) },
];

export function createFlow(canvas, { mobile = false, reduce = false, labels = [] } = {}) {
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  const gl = renderer.getContext();
  const floatOK = renderer.extensions.has('EXT_color_buffer_float');
  const SIZE = mobile ? 128 : 256;
  const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.autoClear = false;

  const camera = new PerspectiveCamera(38, 1, 0.1, 60);
  camera.position.copy(CAM[0].p);
  const look = CAM[0].l.clone();

  // --- GPU simulyatsiya
  const gpu = new GPUComputationRenderer(SIZE, SIZE, renderer);
  if (!floatOK) gpu.setDataType(HalfFloatType);
  const tex0 = gpu.createTexture();
  const a = tex0.image.data;
  for (let i = 0; i < a.length; i += 4) {
    a[i] = (Math.random() * 2 - 1) * 7.4;
    a[i + 1] = (Math.random() * 2 - 1) * 3.7;
    a[i + 2] = (Math.random() * 2 - 1) * 3.2;
    a[i + 3] = Math.random() * 6;
  }
  const posVar = gpu.addVariable('texturePosition', SIM, tex0);
  gpu.setVariableDependencies(posVar, [posVar]);
  const su = posVar.material.uniforms;
  Object.assign(su, {
    uTime: { value: 0 }, uDt: { value: 0.016 }, uOrder: { value: 0 },
    uMouse: { value: new Vector3(99, 99, 0) }, uMouseF: { value: 0 },
  });
  const err = gpu.init();
  if (err) throw new Error(err);

  // --- Izlar uchun chiziqlar
  const N = SIZE * SIZE;
  const pa = new Float32Array(N * 2 * 3);
  for (let i = 0, o = 0; i < N; i++, o += 6) {
    const u = ((i % SIZE) + 0.5) / SIZE, v = (Math.floor(i / SIZE) + 0.5) / SIZE;
    pa[o] = u; pa[o + 1] = v; pa[o + 3] = u; pa[o + 4] = v; pa[o + 5] = 1;
  }
  const lg = new BufferGeometry();
  lg.setAttribute('position', new BufferAttribute(pa, 3));
  const lineMat = new ShaderMaterial({
    vertexShader: LINE_V, fragmentShader: LINE_F,
    uniforms: {
      uPos: { value: null }, uPrev: { value: null }, uOrder: { value: 0 }, uFind: { value: 0 },
      uGlow: { value: 2.2 }, uOut: { value: 0 }, uIntensity: { value: mobile ? 0.3 : 0.15 },
    },
    blending: AdditiveBlending, depthTest: false, depthWrite: false, transparent: true,
  });
  const lines = new LineSegments(lg, lineMat);
  lines.frustumCulled = false;
  lines.renderOrder = 1;

  const quad = new PlaneGeometry(2, 2);
  const fadeMat = new ShaderMaterial({
    vertexShader: QUAD_V, fragmentShader: FADE_F,
    uniforms: { tPrev: { value: null }, uFade: { value: 0.9 } },
    blending: NoBlending, depthTest: false, depthWrite: false,
  });
  const fadeQuad = new Mesh(quad, fadeMat);
  fadeQuad.frustumCulled = false;
  fadeQuad.renderOrder = 0;
  const trailScene = new Scene();
  trailScene.add(fadeQuad, lines);

  const showMat = new ShaderMaterial({
    vertexShader: QUAD_V, fragmentShader: SHOW_F,
    uniforms: {
      tTrail: { value: null }, uExposure: { value: 1.25 }, uTime: { value: 0 }, uReveal: { value: 0 },
      uRes: { value: new Vector2(1, 1) },
      uBgA: { value: new Vector3(0.02, 0.085, 0.17) }, uBgB: { value: new Vector3(0.004, 0.02, 0.042) },
    },
    depthTest: false, depthWrite: false,
  });
  const showQuad = new Mesh(quad, showMat);
  showQuad.frustumCulled = false;
  const showScene = new Scene();
  showScene.add(showQuad);

  // Bekatlar: nozik vertikal yorug'lik chiziqlari
  const gateScene = new Scene();
  const gateMat = new ShaderMaterial({
    vertexShader: GATE_V, fragmentShader: GATE_F, uniforms: { uA: { value: 0 } },
    blending: AdditiveBlending, depthTest: false, depthWrite: false, transparent: true,
  });
  const half = ((LANES - 1) / 2) * LANE_GAP;
  for (const gx of GATES) {
    const m = new Mesh(new PlaneGeometry(0.012, half * 2 + 1.1), gateMat);
    m.position.set(gx, 0, 0);
    gateScene.add(m);
  }

  let rtA, rtB, W = 1, H = 1;
  const makeRT = () => new WebGLRenderTarget(Math.max(1, Math.floor(W * renderer.getPixelRatio())), Math.max(1, Math.floor(H * renderer.getPixelRatio())), {
    type: HalfFloatType, minFilter: LinearMipmapLinearFilter, magFilter: LinearFilter,
    generateMipmaps: true, depthBuffer: false,
  });
  function resize() {
    W = canvas.clientWidth || window.innerWidth;
    H = canvas.clientHeight || window.innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    // tor ekranda sahna to'liq sig'ishi uchun kamerani uzoqlashtiramiz
    camera.fov = W / H < 0.8 ? 58 : W / H < 1.2 ? 46 : 38;
    camera.updateProjectionMatrix();
    rtA?.dispose(); rtB?.dispose();
    rtA = makeRT(); rtB = makeRT();
    showMat.uniforms.uRes.value.set(W, H);
  }
  resize();

  // --- holat
  const st = { q: 0, qs: 0, reveal: 0, mx: 0, my: 0, sx: 0, sy: 0, mouseF: 0, lastMove: 0, active: true, t: 0 };
  const tmp = new Vector3(), tmp2 = new Vector3(), ray = new Vector3();

  function onMove(e) {
    st.mx = (e.clientX / window.innerWidth) * 2 - 1;
    st.my = -(e.clientY / window.innerHeight) * 2 + 1;
    st.lastMove = performance.now();
  }
  if (!mobile && !reduce) window.addEventListener('pointermove', onMove, { passive: true });

  function camAt(q, out, outL) {
    const k1 = smooth(0.1, 0.62, q), k2 = smooth(0.62, 1, q);
    out.copy(CAM[0].p).lerp(CAM[1].p, k1).lerp(CAM[2].p, k2);
    outL.copy(CAM[0].l).lerp(CAM[1].l, k1).lerp(CAM[2].l, k2);
  }

  function step(dt) {
    st.t += dt;
    st.qs = lerp(st.qs, st.q, 1 - Math.pow(0.0015, dt));
    const q = st.qs;
    const order = smooth(0.1, 0.6, q);
    const find = smooth(0.08, 0.2, q) * (1 - smooth(0.3, 0.42, q));
    // kamera: skroll + intro yaqinlashuvi + sichqoncha parallaksi
    camAt(q, tmp, tmp2);
    st.sx = lerp(st.sx, st.mx, 1 - Math.pow(0.02, dt));
    st.sy = lerp(st.sy, st.my, 1 - Math.pow(0.02, dt));
    const push = (1 - st.reveal) * 3.2;
    camera.position.set(tmp.x + st.sx * 0.35, tmp.y + st.sy * 0.22, tmp.z + push);
    look.copy(tmp2);
    camera.lookAt(look);

    // sichqoncha dunyo koordinatasida (z=0 tekislik)
    const idle = performance.now() - st.lastMove > 900;
    st.mouseF = lerp(st.mouseF, idle || mobile ? 0 : 1, 1 - Math.pow(0.05, dt));
    ray.set(st.mx, st.my, 0.5).unproject(camera).sub(camera.position).normalize();
    const tz = -camera.position.z / ray.z;
    su.uMouse.value.copy(camera.position).addScaledVector(ray, tz > 0 ? tz : 50);

    su.uTime.value = st.t;
    su.uDt.value = Math.min(dt, 1 / 30);
    su.uOrder.value = order;
    su.uMouseF.value = st.mouseF;
    gpu.compute();

    const lu = lineMat.uniforms;
    lu.uPos.value = gpu.getCurrentRenderTarget(posVar).texture;
    lu.uPrev.value = gpu.getAlternateRenderTarget(posVar).texture;
    lu.uOrder.value = order;
    lu.uFind.value = find;
    lu.uOut.value = smooth(0.62, 0.86, q);
    fadeMat.uniforms.uFade.value = lerp(0.84, 0.945, order);
    // o'tish paytida zarrachalar bir yo'lakka siqilib, ortiqcha yorug' bo'lib ketmasin
    lu.uIntensity.value = (mobile ? 0.3 : 0.15) * lerp(1, 0.5, order) * (1 - 0.5 * Math.sin(Math.PI * order));
    gateMat.uniforms.uA.value = smooth(0.42, 0.62, q) * 0.5 * st.reveal;
  }

  function render() {
    fadeMat.uniforms.tPrev.value = rtA.texture;
    renderer.setRenderTarget(rtB);
    renderer.render(trailScene, camera);
    renderer.setRenderTarget(null);
    renderer.clear();
    showMat.uniforms.tTrail.value = rtB.texture;
    showMat.uniforms.uTime.value = st.t;
    showMat.uniforms.uReveal.value = st.reveal;
    renderer.render(showScene, camera);
    renderer.render(gateScene, camera);
    [rtA, rtB] = [rtB, rtA];
    placeLabels();
  }

  // Bekat yorliqlari HTML'da, 3D nuqtaga proyeksiya qilinadi
  const lab = labels.map((el, i) => ({ el, p: new Vector3(GATES[i], half + 0.42, 0) }));
  function placeLabels() {
    if (!lab.length) return;
    const vis = smooth(0.5, 0.64, st.qs) * st.reveal;
    for (const { el, p } of lab) {
      tmp.copy(p).project(camera);
      const x = (tmp.x * 0.5 + 0.5) * W, y = (-tmp.y * 0.5 + 0.5) * H;
      el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      el.style.opacity = vis.toFixed(3);
    }
  }

  // Kuchsiz qurilmada piksel zichligini pasaytiradi (1.5 soniya davomida kadr >30 ms bo'lsa)
  let slow = 0, scale = 1;
  const adaptive = !/[?&]q=hi/.test(location.search) && !reduce;
  function adapt(dt) {
    if (!adaptive || scale <= 0.5) return;
    slow = dt > 0.032 ? slow + dt : Math.max(0, slow - dt * 2);
    if (slow > 1.5) {
      slow = 0; scale = Math.max(0.5, scale - 0.25);
      renderer.setPixelRatio(dpr * scale);
      resize();
    }
  }
  let raf = 0, last = performance.now();
  function loop(now) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!st.active) return;
    adapt(dt);
    step(dt);
    render();
  }

  if (reduce) {
    st.q = st.qs = 0.78; st.reveal = 1;
    for (let i = 0; i < 320; i++) step(1 / 60);
    for (let i = 0; i < 140; i++) { step(1 / 60); render(); }
  } else {
    raf = requestAnimationFrame(loop);
  }

  const ro = new ResizeObserver(() => { resize(); if (reduce) for (let i = 0; i < 140; i++) { step(1 / 60); render(); } });
  ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => { st.active = e.isIntersecting; last = performance.now(); });
  io.observe(canvas);
  document.addEventListener('visibilitychange', () => { last = performance.now(); });

  return {
    gl,
    setProgress(q) { st.q = clamp01(q); },
    get reveal() { return st.reveal; },
    set reveal(v) { st.reveal = v; },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); renderer.dispose(); },
  };
}
