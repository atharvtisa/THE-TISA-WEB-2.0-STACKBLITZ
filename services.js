
/* ============================================
   THE TISA — PREMIUM SERVICES INTERACTIONS

   01 Theme / Navigation
   02 Service Accordion
   03 Live Capability Preview
   04 WebGL2 Corner Waterfall
   05 Scroll / Text Reveal
   06 Variable Proximity
   07 Magnetic Links
============================================ */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const root = document.documentElement;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ========================================
     01 — THEME SWITCHER
  ======================================== */

  const themeButton = document.getElementById(
    "theme-toggle"
  );

  function syncThemeButton() {
    if (!themeButton) return;

    const light = root.dataset.theme === "light";

    themeButton.textContent = light ? "☾" : "☀";

    themeButton.setAttribute(
      "aria-label",
      light
        ? "Switch to dark mode"
        : "Switch to light mode"
    );

    themeButton.setAttribute(
      "aria-pressed",
      String(light)
    );
  }

  syncThemeButton();

  themeButton?.addEventListener("click", () => {
    const next = root.dataset.theme === "light"
      ? "dark"
      : "light";

    root.dataset.theme = next;

    try {
      localStorage.setItem("tisa-theme", next);
    } catch (error) {}

    syncThemeButton();
  });

  /* ========================================
     02 — MOBILE NAVIGATION
  ======================================== */

  const menu = document.getElementById(
    "menu-toggle"
  );

  const navLinks = document.getElementById(
    "nav-links"
  );

  if (menu && navLinks) {
    menu.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");

      menu.setAttribute(
        "aria-expanded",
        String(open)
      );
    });

    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menu.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        navLinks.classList.remove("open");
        menu.setAttribute("aria-expanded", "false");
      }
    });
  }

  const year = document.getElementById("footer-year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  /* ========================================
     03 — SERVICE ACCORDION + PREVIEW
  ======================================== */

  const rows = Array.from(
    document.querySelectorAll(".service-row")
  );

  const consoleEl = document.getElementById(
    "services-console"
  );

  const preview = document.getElementById(
    "capability-preview"
  );

  const previewSymbol = document.getElementById(
    "preview-symbol"
  );

  const previewNumber = document.getElementById(
    "preview-number"
  );

  const previewTitle = document.getElementById(
    "preview-title"
  );

  const previewDescription = document.getElementById(
    "preview-description"
  );

  const previewTags = document.getElementById(
    "preview-tags"
  );

  const activeNumber = document.getElementById(
    "directory-active-number"
  );

  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  let selectedIndex = Math.max(
    0,
    rows.findIndex(row => row.classList.contains("active"))
  );

  let hoveredIndex = null;
  let displayedIndex = -1;
  let previewToken = 0;
  let hoverEnergy = 0;
  let hoverEnergyTarget = 0;

  // Use the existing accordion as the
  // single source of service content.
  const services = rows.map((row, index) => ({
    index,
    symbol: row.dataset.icon || "✳",
    shortName: row.dataset.short || "CAPABILITY",
    title: row.querySelector(
      ".service-title"
    )?.textContent.trim() || "",
    description: row.querySelector(
      ".service-body-inner p"
    )?.textContent.trim() || "",
    tags: Array.from(
      row.querySelectorAll(".service-tags span")
    ).map(tag => tag.textContent.trim())
  }));

  function setPreview(index, animate = true) {
    const data = services[index];

    if (!data || displayedIndex === index) return;

    displayedIndex = index;

    const token = ++previewToken;

    // The expanded row and the previewed
    // row are intentionally independent.
    rows.forEach((row, i) => {
      row.classList.toggle(
        "is-previewed",
        i === index
      );
    });

    if (!preview) return;

    const content = preview.querySelector(
      ".preview-body"
    );

    function update() {
      if (token !== previewToken) return;

      previewSymbol.textContent = data.symbol;

      previewNumber.textContent =
        String(index + 1).padStart(2, "0") +
        " / " + data.shortName;

      previewTitle.textContent = data.title;

      previewDescription.textContent =
        data.description;

      previewTags.replaceChildren();

      data.tags.forEach(label => {
        const span = document.createElement("span");
        span.textContent = label;
        previewTags.appendChild(span);
      });

      if (content) {
        content.style.opacity = "1";
        content.style.transform = "translateY(0)";
      }
    }

    if (!animate || reduceMotion || !content) {
      update();
      return;
    }

    content.style.transition =
      "opacity .16s ease, transform .16s ease";

    content.style.opacity = ".2";
    content.style.transform = "translateY(7px)";

    window.setTimeout(update, 160);
  }

  function selectService(index) {
    if (!services[index]) return;

    selectedIndex = index;

    rows.forEach((row, i) => {
      const active = i === index;

      row.classList.toggle("active", active);

      const button = row.querySelector(
        ".service-trigger"
      );

      const toggle = row.querySelector(
        ".service-toggle"
      );

      button?.setAttribute(
        "aria-expanded",
        String(active)
      );

      if (toggle) {
        toggle.textContent = active ? "−" : "+";
      }
    });

    if (activeNumber) {
      activeNumber.textContent =
        String(index + 1).padStart(2, "0");
    }

    // Do not override an independent hover
    // unless a new selection was explicitly made.
    hoveredIndex = null;
    setPreview(index);
  }

  rows.forEach((row, index) => {
    const button = row.querySelector(
      ".service-trigger"
    );

    button?.addEventListener("click", () => {
      selectService(index);
    });

    button?.addEventListener("focus", () => {
      hoveredIndex = index;
      setPreview(index);
    });

    row.addEventListener("pointerenter", event => {
      if (
        event.pointerType === "mouse" &&
        finePointer.matches
      ) {
        hoveredIndex = index;
        setPreview(index);

        hoverEnergyTarget = 1;

        consoleEl?.classList.add(
          "is-energized"
        );
      }
    });
  });

  consoleEl?.addEventListener(
    "pointerleave",
    event => {
      if (
        event.pointerType !== "mouse" ||
        !finePointer.matches
      ) return;

      hoveredIndex = null;
      hoverEnergyTarget = 0;

      consoleEl.classList.remove(
        "is-energized"
      );

      setPreview(selectedIndex);
    }
  );

  consoleEl?.addEventListener("focusout", event => {
    if (
      event.relatedTarget &&
      consoleEl.contains(event.relatedTarget)
    ) return;

    hoveredIndex = null;
    hoverEnergyTarget = 0;

    consoleEl.classList.remove(
      "is-energized"
    );

    setPreview(selectedIndex);
  });

  setPreview(selectedIndex, false);

  /* ========================================
     04 — WEBGL2 CORNER WATERFALL

     Canvas is over the upper-right
     corner of the console.

     Rendering pauses offscreen.
  ======================================== */

  const directory = document.getElementById(
    "directory-right"
  );

  const stage = document.getElementById(
    "laser-stage"
  );

  const canvas = document.getElementById(
    "waterfall-canvas"
  );

  if (directory && stage && canvas && consoleEl) {

    const VERTEX = `#version 300 es
      in vec2 aPosition;

      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

   
const FRAGMENT = `#version 300 es

precision highp float;

out vec4 fragColor;

uniform vec2 uSize;
uniform float uDpr;
uniform float uTime;
uniform float uFront;
uniform float uImpact;
uniform float uTop;
uniform float uRight;
uniform float uBeamX;
uniform float uHover;
uniform float uLight;

float hash(vec2 p) {
  p = fract(p * vec2(123.34,456.21));
  p += dot(p,p+45.32);
  return fract(p.x*p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f*f*(3.0-2.0*f);

  return mix(
    mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),
    mix(hash(i+vec2(0.0,1.0)),hash(i+1.0),f.x),
    f.y
  );
}

float bell(float x) {
  return exp(-x*x);
}

void main() {

  vec2 uv = vec2(
    gl_FragCoord.x,
    uSize.y-gl_FragCoord.y
  ) / uDpr;

  float x = uv.x;
  float y = uv.y;

  float dx = x-uBeamX;
  float top = max(uTop,1.0);
  float edge = uRight;
  float t = uTime;

  vec3 purple = mix(
    vec3(0.48,0.27,1.0),
    vec3(0.39,0.16,0.81),
    uLight
  );

  vec3 lavender = mix(
    vec3(0.78,0.68,1.0),
    vec3(0.50,0.32,0.88),
    uLight
  );

  vec3 whiteGlow = mix(
    vec3(0.98,0.96,1.0),
    vec3(0.78,0.66,1.0),
    uLight
  );

  float pulse =
    1.0+0.055*sin(t*1.7);

  float energy =
    pulse*(1.0+0.23*uHover);

  vec3 color = vec3(0.0);

  /* ====================================
     01 — DOWNWARD MOVING LASER FRONT
  ==================================== */

  float frontMask =
    1.0-smoothstep(
      uFront-5.0,
      uFront+16.0,
      y
    );

  float aboveCard =
    1.0-smoothstep(
      top-3.0,
      top+2.0,
      y
    );

  float beamActive =
    frontMask*aboveCard;

  /* ====================================
     02 — THIN TOP / THICK BOTTOM

     At top: narrow intense core
     At middle: widening glow
     At bottom: broad light envelope
  ==================================== */

  float progress =
    clamp(y/top,0.0,1.0);

  float widening =
    pow(progress,2.15);

  float coreWidth =
    mix(1.8,16.0,widening);

  float innerWidth =
    mix(7.0,53.0,widening);

  float outerWidth =
    mix(18.0,138.0,widening);

  /* Core stays brighter
     and sharp at the top */

  float core =
    bell(dx/coreWidth);

  float inner =
    bell(dx/innerWidth);

  float outer =
    bell(dx/outerWidth);

  color += whiteGlow*
    core*beamActive*1.55;

  color += lavender*
    inner*beamActive*.62;

  color += purple*
    outer*beamActive*.25;

  /* ====================================
     03 — RAYS SPREAD TOWARD BOTTOM

     Narrow origin, fan-out
     closer to the console.
  ==================================== */

  float rayEnvelope =
    smoothstep(.20,.92,progress)*
    beamActive;

  for (int i=0; i<7; i++) {

    float fi = float(i)-3.0;

    float divergence =
      fi*13.5*
      pow(progress,2.65);

    float waviness =
      sin(
        y*.037-t*1.9+fi*1.7
      )*
      (1.0+progress*4.0);

    float rayX =
      dx-divergence-waviness;

    float rayWidth =
      mix(1.0,4.8,progress);

    float intensity =
      .09+
      .07*sin(t*1.4+fi*2.1);

    color += lavender*
      bell(rayX/rayWidth)*
      rayEnvelope*
      max(intensity,.035);
  }

  /* ====================================
     04 — ANIMATED LIGHT FOG
  ==================================== */

  float fogNoise =
    noise(vec2(
      x*.019+t*.035,
      y*.028-t*.115
    ));

  float fogShape =
    smoothstep(
      .44,.80,fogNoise
    )*
    bell(dx/(25.0+progress*110.0))*
    beamActive;

  color += purple*
    fogShape*
    (.08+.06*progress);

  /* ====================================
     05 — VERY BROAD IMPACT BLOOM
  ==================================== */

  float impactX =
    (x-uBeamX)/115.0;

  float impactY =
    (y-top)/39.0;

  float impactDistance =
    length(vec2(impactX,impactY));

  float impactBloom =
    bell(impactDistance)*uImpact;

  color += purple*
    impactBloom*.58;

  color += lavender*
    impactBloom*.37;

  /* Bright immediate contact region */

  float contactPoint =
    bell(length(vec2(
      (x-uBeamX)/24.0,
      (y-top)/11.0
    )))*uImpact;


    color += whiteGlow *
    contactPoint * 2.0;

  /* ====================================
     06 — LIGHT SPREAD ACROSS TOP BORDER
  ==================================== */

  float leftDistance =
    max(uBeamX-x,0.0);

  float topSurface =
    bell((y-top)/6.0);

  float topSpread =
    exp(-leftDistance/230.0)*
    topSurface*
    step(x,edge+2.0)*
    uImpact;

  color += lavender*
    topSpread*.95;

  /* Softer glow above and below edge */

  float topHalo =
    bell((y-top)/20.0)*
    exp(-leftDistance/170.0)*
    uImpact;

  color += purple*
    topHalo*.22;

  /* Travelling surface highlights */

  float surfaceWave =
    .5+.5*sin(
      leftDistance*.095-t*2.0
    );

  color += whiteGlow*
    topSpread*
    surfaceWave*.09;

  /* ====================================
     07 — WATERFALL DOWN RIGHT EDGE
  ==================================== */

  float down =
    max(y-top,0.0);

  float belowSurface =
    smoothstep(
      top-1.0,
      top+8.0,
      y
    );


    /*
    Waterfall keeps visible illumination
    all the way down the console edge.
  */
  
  float sideDecay =
    0.55 + 0.45 * exp(-down / 650.0);
  

  /* Central flow clings to card edge */

  float flowX =
    edge+
    sin(down*.032-t*1.6)*2.8;

  float flowCore =
    bell(
      (x-flowX)/
      (7.0+down*.035)
    );

  float flowGlow =
    bell(
      (x-edge)/
      (35.0+down*.16)
    );

 
/* BRIGHT WATERFALL EDGE */

color += lavender *
  flowCore *
  belowSurface *
  sideDecay *
  uImpact * 1.15;

/* Broad violet glow */

color += purple *
  flowGlow *
  belowSurface *
  sideDecay *
  uImpact * 0.72;

/* Sharper light hugging the border */

float sharpEdge =
  bell((x - edge) / 3.5);

color += whiteGlow *
  sharpEdge *
  belowSurface *
  sideDecay *
  uImpact * 0.42;


  /* Falling individual water-like
     light strands */

  for (int i=0; i<6; i++) {

    float fi = float(i);

    float strandX =
      edge-9.0+
      fi*5.2+
      sin(
        down*.040-t*2.1+fi
      )*
      (2.0+fi*.75);

    float strand =
      bell(
        (x-strandX)/
        (1.7+fi*.36)
      )*
     
(
  0.48 +
  0.52 * exp(
    -down / (480.0 + fi * 45.0)
  )
)
*
      belowSurface*
      uImpact;

    color += lavender*
      strand*
      (.10+fi*.014);
  }

  /* ====================================
     08 — FLOATING LIGHT PARTICLES
  ==================================== */

  vec2 dustUV = vec2(
    x/13.0,
    (y+t*20.0)/13.0
  );

  vec2 cell = floor(dustUV);
  vec2 f = fract(dustUV);

  vec2 dotPos = vec2(
    hash(cell+3.1),
    hash(cell+7.8)
  );

  float particle =
    bell(
      length(f-dotPos)/.075
    )*
    step(.86,hash(cell+4.3));

  float dustZone =
    bell(dx/(65.0+progress*80.0))*
    beamActive;

  color += lavender*
    particle*
    dustZone*.23;

  /* ====================================
     09 — FINAL LIGHT OUTPUT

     Preserve soft transparency.
     Avoid solid opaque laser bands.
  ==================================== */

  color *= energy*1.5;

  vec3 mapped =
    1.0-exp(-color);

  float alpha =
    clamp(
      max(
        mapped.r,
        max(mapped.g,mapped.b)
      ),
      0.0,
      .91
    );

    if (uLight > .5) {
      alpha *= .95;
    }

  fragColor=vec4(mapped,alpha);
}
`;


    let gl = null;
    let program = null;
    let vao = null;
    let vbo = null;
    let uniforms = null;

    let raf = null;
    let running = false;
    let started = false;
    let visible = false;
    let destroyed = false;
    let fallback = false;
    let gpuReady = false;

    let lastTime = 0;
    let elapsed = 0;
    let introTime = 0;

    let width = 1;
    let height = 1;
    let dpr = 1;

    let consoleTop = 300;
    let consoleRight = 500;
    let beamX = 482;

    const DESCENT_DURATION = 1.55;

    const clamp01 = value =>
      Math.max(0,Math.min(1,value));

    const easeInOut = t =>
      t*t*(3-2*t);

    function compile(type,source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader,source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(
        shader,gl.COMPILE_STATUS
      )) {
        console.warn(
          "Shader compile issue:",
          gl.getShaderInfoLog(shader)
        );
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    }

    function makeProgram() {
      const vertex = compile(
        gl.VERTEX_SHADER,VERTEX
      );

      const fragment = compile(
        gl.FRAGMENT_SHADER,FRAGMENT
      );

      if (!vertex || !fragment) {
        if (vertex) gl.deleteShader(vertex);
        if (fragment) gl.deleteShader(fragment);
        return null;
      }

      const result = gl.createProgram();

      gl.attachShader(result,vertex);
      gl.attachShader(result,fragment);
      gl.linkProgram(result);

      gl.deleteShader(vertex);
      gl.deleteShader(fragment);

      if (!gl.getProgramParameter(
        result,gl.LINK_STATUS
      )) {
        console.warn(
          "Shader link issue:",
          gl.getProgramInfoLog(result)
        );

        gl.deleteProgram(result);
        return null;
      }

      return result;
    }

    function enableFallback() {
      fallback = true;
      gpuReady = false;

      directory.classList.add("no-webgl");

      if (started) {
        directory.classList.add(
          "laser-started"
        );
      }
    }

    function initializeGPU() {
      try {
        if (!gl) {
          gl = canvas.getContext("webgl2", {
            alpha: true,
            antialias: false,
            depth: false,
            stencil: false,
            premultipliedAlpha: false
          });
        }

        if (!gl) {
          enableFallback();
          return;
        }

        program = makeProgram();

        if (!program) {
          enableFallback();
          return;
        }

        vao = gl.createVertexArray();
        vbo = gl.createBuffer();

        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ARRAY_BUFFER,vbo);

        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([
            -1,-1,
             3,-1,
            -1, 3
          ]),
          gl.STATIC_DRAW
        );

        const location = gl.getAttribLocation(
          program,"aPosition"
        );

        gl.enableVertexAttribArray(location);

        gl.vertexAttribPointer(
          location,2,gl.FLOAT,false,0,0
        );

        gl.bindVertexArray(null);

        uniforms = {};

        [
          "uSize",
          "uDpr",
          "uTime",
          "uFront",
          "uImpact",
          "uTop",
          "uRight",
          "uBeamX",
          "uHover",
          "uLight"
        ].forEach(name => {
          uniforms[name] =
            gl.getUniformLocation(program,name);
        });

        gl.enable(gl.BLEND);
        gl.blendFunc(
          gl.SRC_ALPHA,
          gl.ONE_MINUS_SRC_ALPHA
        );

        gpuReady = true;
        fallback = false;

        directory.classList.remove("no-webgl");

        measure();

      } catch (error) {
        console.warn(
          "WebGL waterfall unavailable:",
          error
        );

        enableFallback();
      }
    }

    /* ----------------------------------
       MEASURE REAL CONSOLE BORDER

       Use DOM geometry instead of
       hardcoded impact coordinates.
    ---------------------------------- */


    function measure() {
      const directoryRect =
        directory.getBoundingClientRect();
    
      const cardRect =
        consoleEl.getBoundingClientRect();
    
      /*
        Extend the Canvas to the real
        bottom edge of the service console.
    
        This recalculates whenever the
        accordion changes its height.
      */
    
      const canvasHeight = Math.ceil(
        cardRect.bottom - directoryRect.top + 12
      );
    
      canvas.style.height =
        `${Math.max(300, canvasHeight)}px`;
    
      const canvasRect =
        canvas.getBoundingClientRect();
    
      width = Math.max(1, canvasRect.width);
      height = Math.max(1, canvasRect.height);
    
      consoleTop =
        cardRect.top - canvasRect.top;
    
      consoleRight =
        cardRect.right - canvasRect.left;
    
      /*
        Keep the beam near the actual
        upper-right corner.
      */
    
      const cornerInset =
        window.innerWidth <= 480
          ? 14
          : window.innerWidth <= 900
            ? 19
            : 24;
    
      beamX = consoleRight - cornerInset;
    
      /*
        Cap pixel density to avoid
        excessive GPU work when the
        accordion is tall.
      */
    
      dpr = Math.min(
        window.devicePixelRatio || 1,
        window.innerWidth <= 760 ? 1 : 1.25
      );
    
      const pixelWidth =
        Math.max(1, Math.round(width * dpr));
    
      const pixelHeight =
        Math.max(1, Math.round(height * dpr));
    
      if (
        canvas.width !== pixelWidth ||
        canvas.height !== pixelHeight
      ) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
    
      if (gl && gpuReady) {
        gl.viewport(
          0,
          0,
          canvas.width,
          canvas.height
        );
      }
    }
    
    /* ----------------------------------
       WEBGL DRAW
    ---------------------------------- */

    function draw() {
      if (
        !gl ||
        !gpuReady ||
        !program ||
        destroyed
      ) return;

      const descent = easeInOut(
        clamp01(introTime/DESCENT_DURATION)
      );

      const front =
        -35+
        (consoleTop+47)*descent;

      const impact =
        reduceMotion
          ? .72
          : easeInOut(
              clamp01(
                (introTime-DESCENT_DURATION)/.53
              )
            );

      hoverEnergy += (
        hoverEnergyTarget-hoverEnergy
      )*.085;

      gl.clearColor(0,0,0,0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      gl.uniform2f(
        uniforms.uSize,
        canvas.width,
        canvas.height
      );

      gl.uniform1f(
        uniforms.uDpr,dpr
      );

      gl.uniform1f(
        uniforms.uTime,elapsed
      );

      gl.uniform1f(
        uniforms.uFront,
        reduceMotion
          ? consoleTop+50
          : front
      );

      gl.uniform1f(
        uniforms.uImpact,impact
      );

      gl.uniform1f(
        uniforms.uTop,consoleTop
      );

      gl.uniform1f(
        uniforms.uRight,consoleRight
      );

      gl.uniform1f(
        uniforms.uBeamX,beamX
      );

      gl.uniform1f(
        uniforms.uHover,hoverEnergy
      );

      gl.uniform1f(
        uniforms.uLight,
        root.dataset.theme === "light"
          ? 1 : 0
      );

      gl.bindVertexArray(vao);
      gl.drawArrays(
        gl.TRIANGLES,0,3
      );
      gl.bindVertexArray(null);
    }

    /* ----------------------------------
       ANIMATION LOOP
    ---------------------------------- */

    function frame(time) {
      raf = null;

      if (
        !running ||
        !visible ||
        document.hidden ||
        destroyed
      ) return;

      const delta = lastTime
        ? Math.min(
            (time-lastTime)/1000,.05
          )
        : 1/60;

      lastTime = time;

      elapsed += delta;

      if (!reduceMotion) {
        introTime = Math.min(
          DESCENT_DURATION+.7,
          introTime+delta
        );
      }

      draw();

      if (!reduceMotion) {
        raf = requestAnimationFrame(frame);
      }
    }

    function start() {
      if (
        destroyed ||
        !started ||
        !visible ||
        document.hidden
      ) return;

      if (fallback) {
        directory.classList.add(
          "laser-started"
        );
        return;
      }

      if (!gpuReady) return;

      if (!running) {
        running = true;
        lastTime = 0;
      }

      if (raf === null) {
        raf = requestAnimationFrame(frame);
      }
    }

    function stop() {
      running = false;

      if (raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
      }

      lastTime = 0;
    }

    function triggerIntro() {
      if (started) return;

      started = true;

      if (reduceMotion) {
        introTime = DESCENT_DURATION+1;
      }

      start();
    }

    /* ----------------------------------
       SCROLL ACTIVATION

       35% of laser region in viewport
       triggers the introduction once.
    ---------------------------------- */

    initializeGPU();

    const introObserver =
      new IntersectionObserver(
        entries => {
          const entry = entries[0];

          if (
            entry.isIntersecting &&
            entry.intersectionRatio >= .35
          ) {
            triggerIntro();
            introObserver.disconnect();
          }
        },
        {
          threshold: [0,.35,.6,1]
        }
      );

    introObserver.observe(stage);

    const visibilityObserver =
      new IntersectionObserver(
        entries => {
          visible = entries.some(
            entry => entry.isIntersecting
          );

          if (visible) start();
          else stop();
        },
        {
          threshold: 0
        }
      );

    visibilityObserver.observe(directory);

    const resizeObserver =
      new ResizeObserver(() => {
        measure();

        if (
          started &&
          gpuReady &&
          (visible || reduceMotion)
        ) {
          draw();
        }
      });

    resizeObserver.observe(directory);
    resizeObserver.observe(consoleEl);

    window.addEventListener(
      "resize",measure,
      { passive: true }
    );

    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) stop();
        else start();
      }
    );

    // If accordion height changes,
    // card alignment remains measured.
    consoleEl.addEventListener(
      "transitionend",
      event => {
        if (
          event.propertyName ===
          "grid-template-rows"
        ) {
          measure();
        }
      }
    );

    const themeObserver =
      new MutationObserver(() => {
        if (started && gpuReady) {
          draw();
        }
      });

    themeObserver.observe(root,{
      attributes: true,
      attributeFilter: ["data-theme"]
    });

    /* ----------------------------------
       GPU CONTEXT RECOVERY
    ---------------------------------- */

    canvas.addEventListener(
      "webglcontextlost",
      event => {
        event.preventDefault();
        stop();
        gpuReady = false;
        enableFallback();
      }
    );

    canvas.addEventListener(
      "webglcontextrestored",
      () => {
        gl = null;
        program = null;
        vao = null;
        vbo = null;
        uniforms = null;

        initializeGPU();
        start();
      }
    );

    /* ----------------------------------
       CLEANUP
    ---------------------------------- */

    window.addEventListener("pagehide", () => {
      destroyed = true;
      stop();

      introObserver.disconnect();
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();

      if (gl && !gl.isContextLost()) {
        if (vbo) gl.deleteBuffer(vbo);
        if (vao) gl.deleteVertexArray(vao);
        if (program) gl.deleteProgram(program);
      }
    });

  }

  /* ========================================
     05 — TEXT REVEAL + BLUR SCROLL

     Native replacement for GSAP
     scroll reveals.
  ======================================== */

  function setupScrollReveals() {

    const elements = document.querySelectorAll(
      ".js-reveal, .proximity-line"
    );

    if (reduceMotion) {
      elements.forEach(element => {
        element.classList.add("is-visible");
      });
      return;
    }

    // Mark animation setup only after
    // the elements are initialized.
    document.documentElement.classList.add(
      "js-ready"
    );

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add(
            "is-visible"
          );

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: .08,
        rootMargin: "0px 0px -5% 0px"
      }
    );

    elements.forEach((element,index) => {
      element.style.transitionDelay =
        `${Math.min(index%4,3)*65}ms`;

      observer.observe(element);
    });
  }

  /* ========================================
     06 — VARIABLE PROXIMITY HEADINGS

     Wrap individual letters without
     splitting words vertically.
  ======================================== */

  function setupProximity() {

    const headings = Array.from(
      document.querySelectorAll(
        "[data-proximity]"
      )
    );

    headings.forEach(heading => {

      // Wrap each direct text run in
      // its own reveal line.
      const nodes = Array.from(
        heading.childNodes
      );

      nodes.forEach(node => {
        if (
          node.nodeType === Node.TEXT_NODE &&
          node.textContent.trim()
        ) {
          const line = document.createElement(
            "span"
          );

          line.className = "proximity-line";

          line.textContent = node.textContent.trim();

          heading.replaceChild(line,node);
        }

        if (
          node.nodeType === Node.ELEMENT_NODE &&
          node.tagName === "SPAN"
        ) {
          node.classList.add("proximity-line");
        }
      });

      // Wrap text characters while keeping
      // nested accent spans intact.
      const walker = document.createTreeWalker(
        heading,
        NodeFilter.SHOW_TEXT
      );

      const textNodes = [];

      while (walker.nextNode()) {
        if (walker.currentNode.textContent.trim()) {
          textNodes.push(walker.currentNode);
        }
      }

      textNodes.forEach(textNode => {
        const text = textNode.textContent;

        const fragment =
          document.createDocumentFragment();

        const words = text.match(/\S+|\s+/g) || [];

        words.forEach(word => {

          if (/^\s+$/.test(word)) {
            fragment.appendChild(
              document.createTextNode(word)
            );
            return;
          }

          const wrapper = document.createElement(
            "span"
          );

          wrapper.className = "vp-word";

          for (const character of word) {
            const letter = document.createElement(
              "span"
            );

            letter.className = "vp-letter";
            letter.textContent = character;

            wrapper.appendChild(letter);
          }

          fragment.appendChild(wrapper);
        });

        textNode.replaceWith(fragment);
      });

    });

    if (reduceMotion) return;

    const allLetters = Array.from(
      document.querySelectorAll(".vp-letter")
    );

    const interactive = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

    if (!interactive) return;

    let mouseX = -9999;
    let mouseY = -9999;
    let pending = false;

    function updateWeights() {
      pending = false;

      allLetters.forEach(letter => {
        const rect =
          letter.getBoundingClientRect();

        const centerX =
          rect.left+rect.width/2;

        const centerY =
          rect.top+rect.height/2;

        const distance = Math.hypot(
          centerX-mouseX,
          centerY-mouseY
        );

    
/*
  SUBTLE VARIABLE PROXIMITY

  Smaller hover radius.
  Weight changes gently from 700 to 775.
*/

const influence = Math.max(
  0,
  1 - distance / 115
);

const smoothInfluence =
  influence * influence *
  (3 - 2 * influence);


 
/* ======================================
   SUBTLE PROXIMITY — SERVICES PAGE ONLY
====================================== */

const weight = Math.round(
  500 + smoothInfluence * 65
);

  


        letter.style.fontVariationSettings =
          `"wght" ${weight}`;
      });
    }

    window.addEventListener(
      "pointermove",
      event => {
        mouseX = event.clientX;
        mouseY = event.clientY;

        if (!pending) {
          pending = true;
          requestAnimationFrame(updateWeights);
        }
      },
      { passive: true }
    );

    document.addEventListener(
      "pointerleave",
      () => {
        mouseX = -9999;
        mouseY = -9999;

        if (!pending) {
          pending = true;
          requestAnimationFrame(updateWeights);
        }
      }
    );

  }

  /* ========================================
     07 — MAGNETIC LINKS
  ======================================== */

  function setupMagneticLinks() {
    if (
      reduceMotion ||
      !finePointer.matches
    ) return;

    document.querySelectorAll(
      ".magnetic-link"
    ).forEach(link => {

      link.addEventListener(
        "pointermove",
        event => {

          const rect =
            link.getBoundingClientRect();

          const x =
            event.clientX-
            (rect.left+rect.width/2);

          const y =
            event.clientY-
            (rect.top+rect.height/2);

          link.style.transform =
            `translate3d(${x*.12}px,${y*.22}px,0)`;
        },
        { passive: true }
      );

      link.addEventListener(
        "pointerleave",
        () => {
          link.style.transform = "";
        }
      );
    });
  }

  setupProximity();
  setupScrollReveals();
  setupMagneticLinks();

});
