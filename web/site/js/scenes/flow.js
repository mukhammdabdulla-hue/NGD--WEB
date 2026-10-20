// Bosh ekran sahnasi: "xaosdan tizimga".
// 65 ming zarracha GPU'da hisoblanadi. Xaos holatida ular turbulent (curl noise) oqimda,
// skroll bilan laminar oqimga o'tadi: parallel yo'laklar, besh bekat, chiqishda yashil natija.
// Izlar (long exposure) teskari aloqa buferida to'planadi.
// Sahna kutubxonasiz, to'g'ridan-to'g'ri WebGL2 bilan chiziladi: shaderlar avvalgi bilan bir xil, kod esa ~140 KB o'rniga bir necha KB.
import { yieldNow } from '../core.js';

const GATES = [-4.2, -2.1, 0, 2.1, 4.2];
const LANES = 9;
const LANE_GAP = 0.3;
const X0 = -7.6, X1 = 7.6;
const GATE_H = ((LANES - 1) / 2) * LANE_GAP * 2 + 1.1; // bekat chizig'ining balandligi

// Piksel zichligi va zarracha ulushi pog'onalari: kuchsiz qurilmada ketma-ket pasayadi (0-pog'ona: asl ko'rinish)
const TIERS = [[1, 1], [0.85, 1], [0.7, 0.75], [0.55, 0.5], [0.5, 0.25]];

const HEAD_V = '#version 300 es\nprecision highp float;precision highp int;precision highp sampler2D;\n#define varying out\n#define texture2D texture\n';
const HEAD_F = '#version 300 es\nprecision highp float;precision highp int;precision highp sampler2D;\n#define varying in\n#define texture2D texture\nout vec4 fragColor;\n#define gl_FragColor fragColor\n';

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

// Uchburchak butun ekranni qoplaydi (vUv: 0..1)
const FULL_V = /* glsl */`
varying vec2 vUv;
void main(){ vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2)); vUv=p; gl_Position=vec4(p*2.-1.,0.,1.); }
`;

const simF = (SIZE) => /* glsl */`
uniform sampler2D texturePosition;
#define resolution vec2(${SIZE}.,${SIZE}.)
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

// Har zarracha uchun bitta kesma: tepaliklar raqami (gl_VertexID) zarracha o'rnini va kesma uchini belgilaydi
const lineV = (SIZE) => /* glsl */`
uniform sampler2D uPos, uPrev;
uniform float uOrder, uFind, uGlow, uOut;
uniform mat4 modelViewMatrix, projectionMatrix;
varying vec3 vCol; varying float vA;
${HASH}
void main(){
  int seg=gl_VertexID>>1;
  vec2 ref=(vec2(float(seg%${SIZE}),float(seg/${SIZE}))+.5)/${SIZE}.;
  float end=float(gl_VertexID&1);
  vec4 c=texture2D(uPos,ref), p=texture2D(uPrev,ref);
  vec3 pos=mix(p.xyz,c.xyz,end);
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
// Bekatlar: nozik vertikal yorug'lik chiziqlari (bitta chaqiruvda beshta to'rtburchak)
const GATE_V = /* glsl */`
uniform mat4 modelViewMatrix, projectionMatrix;
uniform float uGate[${GATES.length}];
varying vec2 vUv;
void main(){
  vec2 c=vec2(float(gl_VertexID&1),float(gl_VertexID>>1));
  vUv=c;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(uGate[gl_InstanceID]+(c.x-.5)*.012,(c.y-.5)*${GATE_H.toFixed(2)},0.,1.);
}
`;
const GATE_F = /* glsl */`uniform float uA; varying vec2 vUv; void main(){ float a=smoothstep(0.,.25,vUv.y)*smoothstep(1.,.75,vUv.y); gl_FragColor=vec4(vec3(.62,.75,1.)*a*uA,1.); }`;

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };

// Kamera nuqtalari: xaos (old), tizim (yonboshdan), oqim ichiga.
const CAM = [
  { p: [0, 0, 7.4], l: [0, 0, 0] },
  { p: [-4.6, 2.05, 4.7], l: [0.9, -0.2, 0] },
  { p: [-2.6, 0.95, 2.6], l: [3.2, -0.08, 0] },
];
const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

// Ustunlar bo'yicha 4x4 matritsalar: ko'rish (kamera tepa tomoni +Y) va perspektiva
function lookAt(m, e, t) {
  let zx = e[0] - t[0], zy = e[1] - t[1], zz = e[2] - t[2];
  let l = Math.hypot(zx, zy, zz) || 1; zx /= l; zy /= l; zz /= l;
  let xx = zz, xz = -zx; l = Math.hypot(xx, xz) || 1; xx /= l; xz /= l;
  const yx = zy * xz, yy = zz * xx - zx * xz, yz = -zy * xx;
  m.set([xx, yx, zx, 0, 0, yy, zy, 0, xz, yz, zz, 0, -(xx * e[0] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1]);
}
function perspective(m, fov, aspect, n, f) {
  const t = 1 / Math.tan((fov * Math.PI) / 360);
  m.set([t / aspect, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, (2 * f * n) / (n - f), 0]);
}

export async function createFlow(canvas, { mobile = false, reduce = false } = {}) {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false });
  if (!gl) throw new Error('WebGL2 yo\'q');
  const f32 = !!gl.getExtension('EXT_color_buffer_float');
  if (!f32 && !gl.getExtension('EXT_color_buffer_half_float')) throw new Error('suzuvchi nuqtali render nishoni yo\'q');
  const par = gl.getExtension('KHR_parallel_shader_compile');
  const SIZE = mobile ? 128 : 256;
  const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75);
  const BASE_I = mobile ? 0.3 : 0.15;

  // --- dasturlar: hammasi birdan kompilyatsiya qilinadi, tayyor bo'lguncha asosiy oqim bo'sh turadi
  const sources = {
    sim: [HEAD_V + FULL_V, HEAD_F + simF(SIZE)], line: [HEAD_V + lineV(SIZE), HEAD_F + LINE_F],
    fade: [HEAD_V + FULL_V, HEAD_F + FADE_F], show: [HEAD_V + FULL_V, HEAD_F + SHOW_F], gate: [HEAD_V + GATE_V, HEAD_F + GATE_F],
  };
  const prog = {};
  for (const [k, [vs, fs]] of Object.entries(sources)) {
    const p = prog[k] = gl.createProgram();
    for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
      const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh); gl.attachShader(p, sh); gl.deleteShader(sh);
    }
    gl.linkProgram(p);
  }
  // Brauzer dasturlarni parallel jarayonda bog'laydi: tayyor bo'lishini so'rab turamiz (bog'lash tugamasdan holatni so'rash oqimni to'xtatadi)
  const progs = Object.values(prog);
  if (par) while (progs.some((p) => !gl.getProgramParameter(p, par.COMPLETION_STATUS_KHR))) await new Promise((r) => setTimeout(r, 8));
  for (const [k, p] of Object.entries(prog)) if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(`shader (${k}): ${gl.getProgramInfoLog(p)}`);
  const loc = (p, names) => Object.fromEntries(names.split(' ').map((n) => [n, gl.getUniformLocation(p, n)]));
  const U = {
    sim: loc(prog.sim, 'texturePosition uTime uDt uOrder uMouseF uMouse'),
    line: loc(prog.line, 'uPos uPrev uOrder uFind uGlow uOut uIntensity modelViewMatrix projectionMatrix'),
    fade: loc(prog.fade, 'tPrev uFade'),
    show: loc(prog.show, 'tTrail uExposure uTime uReveal uRes uBgA uBgB'),
    gate: loc(prog.gate, 'modelViewMatrix projectionMatrix uGate uA'),
  };
  gl.useProgram(prog.sim); gl.uniform1i(U.sim.texturePosition, 0);
  gl.useProgram(prog.line); gl.uniform1i(U.line.uPos, 1); gl.uniform1i(U.line.uPrev, 2); gl.uniform1f(U.line.uGlow, 2.2);
  gl.useProgram(prog.fade); gl.uniform1i(U.fade.tPrev, 0);
  gl.useProgram(prog.show); gl.uniform1i(U.show.tTrail, 0); gl.uniform1f(U.show.uExposure, 1.25); gl.uniform3f(U.show.uBgA, 0.02, 0.085, 0.17); gl.uniform3f(U.show.uBgB, 0.004, 0.02, 0.042);
  gl.useProgram(prog.gate); gl.uniform1fv(U.gate.uGate, GATES);
  await yieldNow();

  // --- bufer va teksturalar
  const texture = (w, h, fmt, levels, min) => {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texStorage2D(gl.TEXTURE_2D, levels, fmt, w, h);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, min);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, min === gl.NEAREST ? gl.NEAREST : gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  };
  const target = (tex, w, h, levels = 1) => {
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('render nishoni to\'liq emas');
    return { tex, fbo, w, h, levels };
  };

  // Zarrachalar holati (x, y, z, umr): ikki tekstura almashib turadi. Boshlang'ich qiymat har ikkisiga yoziladi.
  const init = new Float32Array(SIZE * SIZE * 4);
  for (let i = 0; i < init.length; i += 4) {
    init[i] = (Math.random() * 2 - 1) * 7.4;
    init[i + 1] = (Math.random() * 2 - 1) * 3.7;
    init[i + 2] = (Math.random() * 2 - 1) * 3.2;
    init[i + 3] = Math.random() * 6;
  }
  const sim = [0, 1].map(() => {
    const t = texture(SIZE, SIZE, f32 ? gl.RGBA32F : gl.RGBA16F, 1, gl.NEAREST);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, SIZE, SIZE, gl.RGBA, gl.FLOAT, init);
    return target(t, SIZE, SIZE);
  });
  let cur = 0; // hozirgi holat sim[cur]da
  await yieldNow();

  let tier = 0, rows = SIZE, dens = 1;
  let trail = [], W = 1, H = 1;
  const mkTrail = (w, h) => {
    const levels = Math.floor(Math.log2(Math.max(w, h))) + 1;
    return target(texture(w, h, gl.RGBA16F, levels, gl.LINEAR_MIPMAP_LINEAR), w, h, levels);
  };
  const free = (r) => { gl.deleteFramebuffer(r.fbo); gl.deleteTexture(r.tex); };

  const proj = new Float32Array(16), view = new Float32Array(16);
  const cam = { fov: 38, aspect: 1 };

  // To'liq ekranli uchburchak (bo'sh VAO yetarli: tepaliklar gl_VertexID'dan olinadi)
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.disable(gl.DEPTH_TEST);

  function resize(keep) {
    const pr = dpr * TIERS[tier][0];
    W = canvas.clientWidth || window.innerWidth;
    H = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.max(1, Math.floor(W * pr));
    canvas.height = Math.max(1, Math.floor(H * pr));
    const w = Math.max(1, Math.floor(W * pr)), h = Math.max(1, Math.floor(H * pr));
    cam.aspect = W / H;
    // tor ekranda sahna to'liq sig'ishi uchun kamerani uzoqlashtiramiz
    cam.fov = cam.aspect < 0.8 ? 58 : cam.aspect < 1.2 ? 46 : 38;
    perspective(proj, cam.fov, cam.aspect, 0.1, 60);
    const old = trail;
    gl.disable(gl.BLEND);
    trail = [mkTrail(w, h), mkTrail(w, h)];
    for (const r of trail) { gl.bindFramebuffer(gl.FRAMEBUFFER, r.fbo); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); }
    if (keep && old.length) { // pog'ona o'zgarganda izlar o'chib ketmasin: eski rasm yangi o'lchamga ko'chiriladi
      gl.bindFramebuffer(gl.FRAMEBUFFER, trail[0].fbo); gl.viewport(0, 0, w, h);
      gl.useProgram(prog.fade); gl.uniform1f(U.fade.uFade, 1);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, old[0].tex);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    old.forEach(free);
    gl.useProgram(prog.show); gl.uniform2f(U.show.uRes, W, H);
  }
  resize();

  // --- holat
  const st = { q: 0, qs: 0, reveal: 0, mx: 0, my: 0, sx: 0, sy: 0, mouseF: 0, lastMove: 0, t: 0 };
  const mouse = [99, 99, 0];
  const uni = { order: 0, find: 0, out: 0, fade: 0.9, i: BASE_I, gate: 0 };

  function onMove(e) {
    st.mx = (e.clientX / window.innerWidth) * 2 - 1;
    st.my = -(e.clientY / window.innerHeight) * 2 + 1;
    st.lastMove = performance.now();
  }
  if (!mobile && !reduce) window.addEventListener('pointermove', onMove, { passive: true });

  const eff = { ms: 1000 / 60 }; // bitta chizilgan kadr davomiyligi (ekran yangilanish tezligiga bog'liq), ms

  function step(dt) {
    st.t += dt;
    st.qs = lerp(st.qs, st.q, 1 - Math.pow(0.0015, dt));
    const q = st.qs;
    const order = smooth(0.1, 0.6, q);
    const find = smooth(0.08, 0.2, q) * (1 - smooth(0.3, 0.42, q));
    // kamera: skroll + intro yaqinlashuvi + sichqoncha parallaksi
    const k1 = smooth(0.1, 0.62, q), k2 = smooth(0.62, 1, q);
    const p = mix3(mix3(CAM[0].p, CAM[1].p, k1), CAM[2].p, k2), l = mix3(mix3(CAM[0].l, CAM[1].l, k1), CAM[2].l, k2);
    st.sx = lerp(st.sx, st.mx, 1 - Math.pow(0.02, dt));
    st.sy = lerp(st.sy, st.my, 1 - Math.pow(0.02, dt));
    const push = (1 - st.reveal) * 3.2;
    const e = [p[0] + st.sx * 0.35, p[1] + st.sy * 0.22, p[2] + push];
    lookAt(view, e, l);

    // sichqoncha dunyo koordinatasida (z=0 tekislik): kameradan o'tuvchi nur
    const idle = performance.now() - st.lastMove > 900;
    st.mouseF = lerp(st.mouseF, idle || mobile ? 0 : 1, 1 - Math.pow(0.05, dt));
    const kx = st.mx / proj[0], ky = st.my / proj[5];
    let dx = view[0] * kx + view[1] * ky - view[2], dy = view[4] * kx + view[5] * ky - view[6], dz = view[8] * kx + view[9] * ky - view[10];
    const dl = Math.hypot(dx, dy, dz) || 1; dx /= dl; dy /= dl; dz /= dl;
    const tz = -e[2] / dz, s = tz > 0 ? tz : 50;
    mouse[0] = e[0] + dx * s; mouse[1] = e[1] + dy * s; mouse[2] = e[2] + dz * s;

    // zarrachalar: faqat ko'rinadigan qatorlar hisoblanadi (kuchsiz qurilmada ulushi kamayadi)
    const nxt = cur ^ 1;
    gl.bindFramebuffer(gl.FRAMEBUFFER, sim[nxt].fbo);
    gl.viewport(0, 0, SIZE, SIZE);
    gl.disable(gl.BLEND); // suzuvchi nuqtali (32 bit) nishonga qo'shish yoqilmaydi
    if (rows < SIZE) { gl.enable(gl.SCISSOR_TEST); gl.scissor(0, 0, SIZE, rows); }
    gl.useProgram(prog.sim);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, sim[cur].tex);
    gl.uniform1f(U.sim.uTime, st.t);
    gl.uniform1f(U.sim.uDt, Math.min(dt, 1 / 30));
    gl.uniform1f(U.sim.uOrder, order);
    gl.uniform1f(U.sim.uMouseF, st.mouseF);
    gl.uniform3fv(U.sim.uMouse, mouse);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (rows < SIZE) gl.disable(gl.SCISSOR_TEST);
    cur = nxt;

    uni.order = order;
    uni.find = find;
    uni.out = smooth(0.62, 0.86, q);
    // kadr uzoqroq/qisqaroq bo'lsa ham iz bir xil tezlikda so'nadi (60 Gs'da koeffitsient o'zgarmaydi)
    uni.fade = Math.pow(lerp(0.84, 0.945, order), eff.ms / (1000 / 60));
    // o'tish paytida zarrachalar bir yo'lakka siqilib, ortiqcha yorug' bo'lib ketmasin
    uni.i = BASE_I * dens * lerp(1, 0.5, order) * (1 - 0.5 * Math.sin(Math.PI * order));
    uni.gate = smooth(0.42, 0.62, q) * 0.5 * st.reveal;
  }

  function render() {
    const [a, b] = trail;
    // 1) iz: oldingi kadr so'ndiriladi, ustiga zarrachalar chiziqlari qo'shiladi
    gl.bindFramebuffer(gl.FRAMEBUFFER, b.fbo);
    gl.viewport(0, 0, b.w, b.h);
    gl.disable(gl.BLEND);
    gl.useProgram(prog.fade);
    gl.uniform1f(U.fade.uFade, uni.fade);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, a.tex);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.useProgram(prog.line);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, sim[cur].tex);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, sim[cur ^ 1].tex);
    gl.uniform1f(U.line.uOrder, uni.order);
    gl.uniform1f(U.line.uFind, uni.find);
    gl.uniform1f(U.line.uOut, uni.out);
    gl.uniform1f(U.line.uIntensity, uni.i);
    gl.uniformMatrix4fv(U.line.modelViewMatrix, false, view);
    gl.uniformMatrix4fv(U.line.projectionMatrix, false, proj);
    gl.drawArrays(gl.LINES, 0, rows * SIZE * 2);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, b.tex);
    gl.generateMipmap(gl.TEXTURE_2D);
    // 2) ekran: iz, fon va donalar; ustidan bekat chiziqlari
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.disable(gl.BLEND);
    gl.useProgram(prog.show);
    gl.uniform1f(U.show.uTime, st.t);
    gl.uniform1f(U.show.uReveal, st.reveal);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (uni.gate > 0.001) {
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.useProgram(prog.gate);
      gl.uniform1f(U.gate.uA, uni.gate);
      gl.uniformMatrix4fv(U.gate.modelViewMatrix, false, view);
      gl.uniformMatrix4fv(U.gate.projectionMatrix, false, proj);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, GATES.length);
    }
    trail = [b, a];
  }

  // Kuchsiz qurilmada sifat pog'onasi pasayadi: kadrlar median bo'yicha ekran tezligidan sezilarli uzoq davom etsa (bitta sakrash e'tiborga olinmaydi)
  const adaptive = !/[?&]q=hi/.test(location.search) && !reduce;
  const win = [];
  let slow = 0, calm = 0;
  function adapt(ms) {
    if (!adaptive || tier >= TIERS.length - 1) return;
    if (calm > 0) { calm--; return; } // pog'ona almashgandan keyin biroz kutiladi
    win.push(ms);
    if (win.length < 40) return;
    win.sort((x, y) => x - y);
    const med = win[20]; win.length = 0;
    slow = med > eff.ms * 1.45 ? slow + 1 : 0;
    if (slow < 2) return;
    slow = 0; calm = 60;
    tier++;
    rows = Math.max(8, Math.round(SIZE * TIERS[tier][1]));
    dens = Math.min(2.5, SIZE / rows);
    resize(true);
  }

  // --- tsikl. Ekran yangilanish davri eng qisqa kadrdan aniqlanadi (dastlabki 24 kadr hali chizilmaydi, shuning uchun yuk uni buzmaydi).
  // 100 Gs dan yuqori ekranlarda har ikkinchi kadr chiziladi: ko'rinish 60 Gs dagidek qoladi, GPU yuki esa ikki baravar kamayadi.
  const hold = new Set(); // to'xtatish sabablari: 'view' (ekranda yo'q), 'cover' (boshqa bo'lim yopgan), 'menu', 'lost'
  const SNAP = [4.17, 6.94, 8.33, 11.11, 16.67, 33.33]; // 240, 144, 120, 90, 60, 30 Gs
  let raf = 0, last = 0, acc = 0, div = 1, frame = 0, best = Infinity;
  const kick = () => {
    const run = !hold.size && !document.hidden;
    if (run && !raf && !reduce) { last = 0; acc = 0; raf = requestAnimationFrame(loop); }
    else if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
  };
  function loop(now) {
    raf = requestAnimationFrame(loop);
    const d = last ? now - last : 0; // davom etganda birinchi kadr faqat vaqtni belgilaydi: to'liq bo'lmagan oraliq o'lchovni buzmasin
    last = now;
    if (!d) return;
    if (++frame > 4 && d > 3 && d < best * 0.97) {
      best = d;
      const snap = SNAP.reduce((b, s) => (Math.abs(s - d) < Math.abs(b - d) ? s : b));
      const ms = Math.abs(snap - d) / snap < 0.12 ? snap : d;
      div = Math.max(1, Math.floor((1000 / ms + 10) / 60));
      eff.ms = Math.min(33.4, ms * div);
    }
    if (frame < 24) return;
    acc += d;
    if (frame % div) return;
    const ms = acc; acc = 0;
    adapt(ms);
    step(Math.min(0.05, ms / 1000));
    render();
  }

  if (reduce) {
    // harakat kamaytirilgan: bitta tayyor kadr (bo'laklarga bo'linib hisoblanadi)
    st.q = st.qs = 0.78; st.reveal = 1;
    const work = async () => {
      for (let i = 0; i < 320; i++) { step(1 / 60); if (i % 80 === 79) await yieldNow(); }
      for (let i = 0; i < 140; i++) { step(1 / 60); render(); if (i % 35 === 34) await yieldNow(); }
    };
    await work();
  }

  // O'lcham o'zgarishi: faqat haqiqiy o'zgarishda, biroz kechikib (oyna sudralganda har kadrda qayta ajratilmasin)
  let lw = W, lh = H, tm = 0;
  const ro = new ResizeObserver(() => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === lw && h === lh) return;
    clearTimeout(tm);
    tm = setTimeout(async () => {
      lw = canvas.clientWidth; lh = canvas.clientHeight;
      resize(true);
      if (reduce) for (let i = 0; i < 90; i++) { step(1 / 60); render(); if (i % 30 === 29) await yieldNow(); }
    }, 150);
  });
  ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) hold.delete('view'); else hold.add('view'); kick(); });
  io.observe(canvas);
  const onVis = () => kick();
  document.addEventListener('visibilitychange', onVis);
  const lost = (e) => { e.preventDefault(); hold.add('lost'); kick(); canvas.dispatchEvent(new CustomEvent('flowlost')); };
  canvas.addEventListener('webglcontextlost', lost);
  kick();

  return {
    setProgress(q) { st.q = clamp01(q); },
    get reveal() { return st.reveal; },
    set reveal(v) { st.reveal = v; },
    // sahna boshqa bo'lim ostida qolganda yoki menyu ochiqligida hisoblash to'xtaydi
    hold(key, on) { on ? hold.add(key) : hold.delete(key); kick(); },
    destroy() {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', onVis); canvas.removeEventListener('webglcontextlost', lost); window.removeEventListener('pointermove', onMove);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
