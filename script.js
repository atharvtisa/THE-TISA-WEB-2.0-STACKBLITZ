
/* ==============================================
   THE TISA — COMPLETE WEBSITE JAVASCRIPT
   PHASES 1–7 + VARIABLE PROXIMITY
   HTML / CSS / VANILLA JS / GSAP
============================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const hasGSAP = typeof window.gsap !== "undefined";
  const hasScrollTrigger =
    hasGSAP && typeof window.ScrollTrigger !== "undefined";

  if (hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  const canAnimate = () =>
    hasGSAP && !reduceMotion.matches;

  /* ==========================================
     01 — HEADER AND MOBILE NAVIGATION
  ========================================== */

  const header = document.getElementById("site-header");
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");

  function updateHeader() {
    if (!header) return;
    header.classList.toggle(
      "scrolled",
      window.scrollY > 20
    );
  }

  window.addEventListener("scroll", updateHeader, {
    passive: true
  });

  updateHeader();

  function setMenuState(open) {
    if (!menuToggle || !navLinks) return;

    menuToggle.classList.toggle("open", open);
    navLinks.classList.toggle("open", open);

    menuToggle.setAttribute(
      "aria-expanded",
      String(open)
    );

    menuToggle.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation"
    );
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      setMenuState(
        menuToggle.getAttribute("aria-expanded") !== "true"
      );
    });

    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        setMenuState(false);
      });
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        setMenuState(false);
      }
    });

    document.addEventListener("click", event => {
      if (
        navLinks.classList.contains("open") &&
        !navLinks.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        setMenuState(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) {
        setMenuState(false);
      }
    });
  }

  /* ==========================================
     02 — COPYRIGHT YEAR
  ========================================== */

  const footerYear = document.getElementById("footer-year");

  if (footerYear) {
    footerYear.textContent =
      String(new Date().getFullYear());
  }

  /* ==========================================
     03 — ACCESSIBLE AI SOLUTION TABS
     WORKS WITHOUT GSAP
  ========================================== */

  const solutionTabs = Array.from(
    document.querySelectorAll(".usecase-tab")
  );

  const solutionPanels = solutionTabs.map(tab =>
    document.getElementById(
      tab.getAttribute("aria-controls")
    )
  );

  function activateSolution(index, moveFocus = false) {
    if (
      !solutionTabs[index] ||
      !solutionPanels[index]
    ) return;

    solutionTabs.forEach((tab, i) => {
      const selected = index === i;

      tab.classList.toggle("is-selected", selected);

      tab.setAttribute(
        "aria-selected",
        String(selected)
      );

      tab.tabIndex = selected ? 0 : -1;

      if (solutionPanels[i]) {
        solutionPanels[i].hidden = !selected;

        solutionPanels[i].classList.toggle(
          "is-active",
          selected
        );
      }
    });

    if (moveFocus) solutionTabs[index].focus();

    const panel = solutionPanels[index];

    if (!canAnimate()) return;

    const nodes = panel.querySelectorAll(
      ".usecase-workflow-node"
    );

    const content = panel.querySelector(
      ".usecase-panel-content"
    );

    gsap.killTweensOf(nodes);

    if (content) gsap.killTweensOf(content);

    gsap.fromTo(
      nodes,
      { opacity: 0, y: 15 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.08,
        ease: "power2.out",
        clearProps: "all"
      }
    );

    if (content) {
      gsap.fromTo(
        content,
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          delay: 0.12,
          ease: "power2.out",
          clearProps: "all"
        }
      );
    }
  }

  solutionTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      activateSolution(index);
    });

    tab.addEventListener("keydown", event => {
      const last = solutionTabs.length - 1;
      let next = index;

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          next = index === last ? 0 : index + 1;
          break;

        case "ArrowLeft":
        case "ArrowUp":
          next = index === 0 ? last : index - 1;
          break;

        case "Home":
          next = 0;
          break;

        case "End":
          next = last;
          break;

        default:
          return;
      }

      event.preventDefault();
      activateSolution(next, true);
    });
  });

  /* ==========================================
     04 — VARIABLE PROXIMITY HEADINGS
     VANILLA JS — FIXED TEXT WRAPPING
  ========================================== */

  const VP = {
    selector: "h1, h2, h3",
    radius: 150,
    minWeight: 450,
    maxWeight: 850,
    minOpticalSize: 14,
    maxOpticalSize: 40,
    smoothing: 0.17
  };

  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  const vpLetters = [];

  let pointer = null;
  let vpFrame = 0;
  let vpLastTime = 0;

  /* ------------------------------------------
     SPLIT TEXT WITHOUT CHANGING THE
     EXISTING HEADING CONTAINER STRUCTURE
  ------------------------------------------ */

  function prepareHeading(heading) {
    if (heading.dataset.vpReady === "true") {
      return;
    }

    const originalText = heading.textContent
      .replace(/\s+/g, " ")
      .trim();

    if (!originalText) return;

    const walker = document.createTreeWalker(
      heading,
      NodeFilter.SHOW_TEXT
    );

    const textNodes = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;

      if (
        node.parentElement.closest(
          "script, style, .vp-word"
        )
      ) continue;

      if (node.nodeValue.trim()) {
        textNodes.push(node);
      }
    }

    textNodes.forEach(node => {
      const fragment =
        document.createDocumentFragment();

      const parts =
        node.nodeValue.match(/\s+|\S+/g) || [];

      parts.forEach(part => {
        if (/^\s+$/.test(part)) {
          fragment.appendChild(
            document.createTextNode(part)
          );
          return;
        }

        /* Each word remains together.
           The next word may wrap normally. */

        const word = document.createElement("span");

        word.className = "vp-word";
        word.setAttribute("aria-hidden", "true");

        word.style.setProperty(
          "display",
          "inline-block",
          "important"
        );

        word.style.setProperty(
          "white-space",
          "nowrap",
          "important"
        );

        word.style.verticalAlign = "baseline";

        for (const character of part) {
          const letter = document.createElement("span");

          letter.className = "vp-letter";
          letter.textContent = character;

          letter.setAttribute("aria-hidden", "true");

          /* Important:
             Overrides heading span rules that might
             otherwise turn letters into blocks. */

          letter.style.setProperty(
            "display",
            "inline-block",
            "important"
          );

          letter.style.setProperty(
            "white-space",
            "nowrap",
            "important"
          );

          letter.style.fontVariationSettings =
            `'wght' ${VP.minWeight}, ` +
            `'opsz' ${VP.minOpticalSize}`;

          letter.style.transformOrigin = "50% 80%";

          word.appendChild(letter);

          vpLetters.push({
            element: letter,
            heading: heading,
            current: 0,
            target: 0
          });
        }

        fragment.appendChild(word);
      });

      node.replaceWith(fragment);
    });

    heading.classList.add("vp-heading");

    heading.setAttribute(
      "aria-label",
      originalText
    );

    heading.dataset.vpReady = "true";
  }

  /* ------------------------------------------
     CALCULATE CURSOR DISTANCE
  ------------------------------------------ */

  function updateProximityTargets() {
    const active =
      pointer !== null &&
      finePointer.matches &&
      !reduceMotion.matches;

    const nearbyHeadings = new Set();

    if (active) {
      document.querySelectorAll(
        ".vp-heading"
      ).forEach(heading => {
        const rect =
          heading.getBoundingClientRect();

        const dx = Math.max(
          rect.left - pointer.x,
          0,
          pointer.x - rect.right
        );

        const dy = Math.max(
          rect.top - pointer.y,
          0,
          pointer.y - rect.bottom
        );

        if (Math.hypot(dx, dy) < VP.radius) {
          nearbyHeadings.add(heading);
        }
      });
    }

    vpLetters.forEach(item => {
      item.target = 0;

      if (
        !active ||
        !nearbyHeadings.has(item.heading)
      ) return;

      const rect =
        item.element.getBoundingClientRect();

      const centerX =
        rect.left + rect.width / 2;

      const centerY =
        rect.top + rect.height / 2;

      const distance = Math.hypot(
        pointer.x - centerX,
        pointer.y - centerY
      );

      item.target = Math.max(
        0,
        1 - distance / VP.radius
      );
    });
  }

  /* ------------------------------------------
     SMOOTH LETTER ANIMATION
  ------------------------------------------ */

  function animateProximity(now) {
    vpFrame = 0;

    const delta = vpLastTime
      ? Math.min(now - vpLastTime, 64)
      : 16;

    vpLastTime = now;

    const easing = 1 - Math.exp(
      -delta / (VP.smoothing * 250)
    );

    let moving = false;

    vpLetters.forEach(item => {
      const difference =
        item.target - item.current;

      if (Math.abs(difference) > 0.002) {
        item.current += difference * easing;
        moving = true;
      } else {
        item.current = item.target;
      }

      const weight =
        VP.minWeight +
        (VP.maxWeight - VP.minWeight) *
        item.current;

      const opticalSize =
        VP.minOpticalSize +
        (VP.maxOpticalSize - VP.minOpticalSize) *
        item.current;

      const settings =
        `'wght' ${weight.toFixed(1)}, ` +
        `'opsz' ${opticalSize.toFixed(1)}`;

      if (
        item.element.style.fontVariationSettings !==
        settings
      ) {
        item.element.style.fontVariationSettings =
          settings;
      }
    });

    if (moving) {
      vpFrame = requestAnimationFrame(
        animateProximity
      );
    } else {
      vpLastTime = 0;
    }
  }

  function scheduleProximity() {
    updateProximityTargets();

    if (!vpFrame) {
      vpFrame = requestAnimationFrame(
        animateProximity
      );
    }
  }

  /* ------------------------------------------
     INITIALIZE VARIABLE PROXIMITY
  ------------------------------------------ */

  if (!reduceMotion.matches) {
    document.querySelectorAll(
      VP.selector
    ).forEach(prepareHeading);
  }

  document.addEventListener(
    "pointermove",
    event => {
      if (event.pointerType === "touch") return;
      if (!finePointer.matches) return;

      pointer = {
        x: event.clientX,
        y: event.clientY
      };

      scheduleProximity();
    },
    { passive: true }
  );

  document.documentElement.addEventListener(
    "pointerleave",
    () => {
      pointer = null;
      scheduleProximity();
    }
  );

  window.addEventListener("blur", () => {
    pointer = null;
    scheduleProximity();
  });

  window.addEventListener(
    "scroll",
    scheduleProximity,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    scheduleProximity,
    { passive: true }
  );

  reduceMotion.addEventListener(
    "change",
    () => {
      window.location.reload();
    }
  );

  /* ==========================================
     05 — GSAP UTILITIES
  ========================================== */

  if (!canAnimate()) return;

  function animateFrom(selector, options = {}) {
    const elements =
      document.querySelectorAll(selector);

    if (!elements.length) return;

    gsap.from(elements, {
      opacity: 0,
      y: 35,
      duration: 0.85,
      ease: "power3.out",
      ...options
    });
  }

  function scrollReveal(
    selector,
    trigger = selector,
    options = {}
  ) {
    if (!hasScrollTrigger) return;

    const elements =
      document.querySelectorAll(selector);

    const triggerElement =
      document.querySelector(trigger);

    if (!elements.length || !triggerElement) {
      return;
    }

    gsap.from(elements, {
      opacity: 0,
      y: 35,
      duration: 0.85,
      ease: "power3.out",
      ...options,

      scrollTrigger: {
        trigger: triggerElement,
        start: "top 85%",
        once: true
      }
    });
  }

  function floating(selector, amount, duration) {
    if (!document.querySelector(selector)) {
      return;
    }

    gsap.to(selector, {
      y: amount,
      duration,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }

  /* ==========================================
     06 — PHASE 1: HERO ANIMATIONS
  ========================================== */

  const intro = gsap.timeline({
    defaults: {
      ease: "power3.out"
    }
  });

  if (document.querySelector(".eyebrow")) {
    intro.from(".eyebrow", {
      y: 18,
      opacity: 0,
      duration: 0.7
    });
  }

  if (document.querySelector(".title-inner")) {
    intro.from(
      ".title-inner",
      {
        yPercent: 110,
        duration: 1.1,
        stagger: 0.12,
        ease: "power4.out"
      },
      "-=0.35"
    );
  }

  [
    [".hero-description", 0.8],
    [".hero-actions", 0.8],
    [".hero-footer", 0.6]
  ].forEach(([selector, duration]) => {
    if (!document.querySelector(selector)) return;

    intro.from(
      selector,
      {
        y: 20,
        opacity: 0,
        duration
      },
      "-=0.5"
    );
  });

  if (document.querySelector(".hero-visual")) {
    intro.from(
      ".hero-visual",
      {
        x: 35,
        opacity: 0,
        duration: 1.3,
        ease: "power3.out"
      },
      0.35
    );
  }


  if (
    hasScrollTrigger &&
    document.querySelector(".hero")
  ) {
    gsap.to(".hero-content", {
      y: -35,
      opacity: 0.45,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "65% top",
        end: "bottom top",
        scrub: true
      }
    });

    gsap.to(".visual-stage", {
      y: -25,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  }

  /* ==========================================
     07 — PHASE 2: BUSINESS CHALLENGES
  ========================================== */

  scrollReveal(
    ".challenges-heading-block",
    ".challenges-intro",
    { y: 45, duration: 0.9 }
  );

  scrollReveal(
    ".challenges-intro-side",
    ".challenges-intro",
    { y: 35, delay: 0.15 }
  );

  if (hasScrollTrigger) {
    ScrollTrigger.batch(".challenge-card", {
      start: "top 92%",
      once: true,

      onEnter: batch => {
        gsap.from(batch, {
          y: 55,
          opacity: 0,
          duration: 0.85,
          stagger: 0.12,
          ease: "power3.out",
          overwrite: "auto"
        });
      }
    });
  }

  /* ==========================================
     08 — PHASE 3: SERVICES
  ========================================== */

  scrollReveal(
    ".services-header-main",
    ".services-header",
    { y: 45, duration: 0.9 }
  );

  scrollReveal(
    ".services-header-aside",
    ".services-header",
    { delay: 0.15 }
  );

  if (hasScrollTrigger) {
    ScrollTrigger.batch(".service-panel", {
      start: "top 90%",
      once: true,

      onEnter: batch => {
        gsap.from(batch, {
          y: 45,
          opacity: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out"
        });
      }
    });
  }

  scrollReveal(
    ".capabilities-items span",
    ".services-capabilities",
    {
      y: 16,
      duration: 0.55,
      stagger: 0.06
    }
  );

  /* ==========================================
     09 — PHASE 4: ENGINEERING APPROACH
  ========================================== */

  scrollReveal(
    ".approach-intro-copy",
    ".approach-intro",
    { y: 45 }
  );

  scrollReveal(
    ".approach-intro-aside",
    ".approach-intro",
    { y: 25 }
  );

  if (
    hasScrollTrigger &&
    document.querySelector(".approach-process")
  ) {
    gsap.to(".approach-rail-progress", {
      scaleY: 1,
      ease: "none",

      scrollTrigger: {
        trigger: ".approach-process",
        start: "top 65%",
        end: "bottom 65%",
        scrub: 0.6
      }
    });

    gsap.utils.toArray(".approach-step").forEach(
      step => {
        const content = step.querySelector(
          ".approach-step-content"
        );

        const visual = step.querySelector(
          ".approach-visual"
        );

        if (content) {
          gsap.from(content, {
            y: 32,
            opacity: 0,
            duration: 0.85,
            ease: "power3.out",

            scrollTrigger: {
              trigger: step,
              start: "top 85%",
              once: true
            }
          });
        }

        if (visual) {
          gsap.from(visual, {
            y: 35,
            opacity: 0,
            duration: 0.95,
            delay: 0.12,
            ease: "power3.out",

            scrollTrigger: {
              trigger: step,
              start: "top 82%",
              once: true
            }
          });
        }

        ScrollTrigger.create({
          trigger: step,
          start: "top 65%",
          end: "bottom 35%",

          onEnter: () =>
            step.classList.add("is-active"),

          onEnterBack: () =>
            step.classList.add("is-active"),

          onLeave: () =>
            step.classList.remove("is-active"),

          onLeaveBack: () =>
            step.classList.remove("is-active")
        });
      }
    );
  }

  const chartPath = document.querySelector(
    ".deployment-chart-path"
  );

  if (chartPath && hasScrollTrigger) {
    const length = chartPath.getTotalLength();

    gsap.set(chartPath, {
      strokeDasharray: length,
      strokeDashoffset: length
    });

    gsap.to(chartPath, {
      strokeDashoffset: 0,
      duration: 1.7,
      ease: "power2.out",

      scrollTrigger: {
        trigger: ".approach-deployment",
        start: "top 85%",
        once: true
      }
    });
  }

  scrollReveal(
    ".approach-footer",
    ".approach-footer",
    { y: 25 }
  );

  /* ==========================================
     10 — PHASE 5: AI SOLUTIONS
  ========================================== */

  scrollReveal(
    ".usecases-header > *",
    ".usecases-header",
    { y: 36, stagger: 0.14 }
  );

  scrollReveal(
    ".usecases-selector",
    ".usecases-layout",
    { x: -25, y: 0 }
  );

  scrollReveal(
    ".usecases-display",
    ".usecases-layout",
    { x: 25, y: 0 }
  );

  scrollReveal(
    ".usecases-footer",
    ".usecases-footer",
    { y: 20 }
  );

  /* ==========================================
     11 — PHASE 6: WHY THE TISA
  ========================================== */

  scrollReveal(
    ".why-eyebrow, .why-description",
    ".why-intro",
    {
      y: 32,
      stagger: 0.12
    }
  );

  scrollReveal(
    ".why-signature-visual",
    ".why-signature-visual",
    { y: 25 }
  );

  if (hasScrollTrigger) {
    gsap.utils.toArray(".why-principle").forEach(
      principle => {
        gsap.from(principle, {
          y: 25,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",

          scrollTrigger: {
            trigger: principle,
            start: "top 88%",
            once: true
          }
        });

        ScrollTrigger.create({
          trigger: principle,
          start: "top 75%",
          end: "bottom 30%",

          onEnter: () =>
            principle.classList.add("is-current"),

          onEnterBack: () =>
            principle.classList.add("is-current"),

          onLeave: () =>
            principle.classList.remove("is-current"),

          onLeaveBack: () =>
            principle.classList.remove("is-current")
        });
      }
    );
  }

  scrollReveal(
    ".why-cta-content",
    ".why-cta",
    { y: 30, duration: 0.9 }
  );

  if (
    hasScrollTrigger &&
    document.querySelector(".why-cta-decoration")
  ) {
    gsap.to(".why-cta-decoration", {
      y: -18,
      ease: "none",

      scrollTrigger: {
        trigger: ".why-cta",
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  }

  /* ==========================================
     12 — PHASE 7: CONTACT AND FOOTER
  ========================================== */

  scrollReveal(
    ".final-contact-content > *",
    ".final-contact-shell",
    {
      y: 35,
      stagger: 0.12
    }
  );

  scrollReveal(
    ".final-contact-art",
    ".final-contact-art",
    {
      y: 0,
      scale: 0.94,
      duration: 1.1
    }
  );

  floating(".final-node-one", -9, 4);
  floating(".final-node-two", 9, 4.8);
  floating(".final-node-three", -7, 5);

  if (hasScrollTrigger) {
    ScrollTrigger.batch(".footer-main > *", {
      start: "top 92%",
      once: true,

      onEnter: batch => {
        gsap.from(batch, {
          opacity: 0,
          y: 22,
          duration: 0.75,
          stagger: 0.09,
          ease: "power3.out"
        });
      }
    });
  }

  scrollReveal(
    ".footer-statement",
    ".footer-statement",
    {
      y: 25,
      duration: 0.9
    }
  );

  /* ==========================================
     13 — REFRESH SCROLLTRIGGER AFTER FONTS
  ========================================== */

  if (hasScrollTrigger) {
    if (document.fonts) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    window.addEventListener("load", () => {
      ScrollTrigger.refresh();
    }, { once: true });
  }

  /* ==========================================
     END — THE TISA WEBSITE
  ========================================== */


  

/* ==============================================
   THE TISA — ENHANCED CRYSTAL ENERGY BALL
   Thick Electric Rim + Mouse Particle Physics
   Canvas 2D / Vanilla JavaScript
============================================== */

(function () {
  "use strict";

  function initCrystalBall() {
    const canvas = document.getElementById(
      "tisa-crystal-canvas"
    );

    if (!canvas || canvas.dataset.initialized) return;

    const ctx = canvas.getContext("2d", {
      alpha: true
    });

    if (!ctx) return;

    canvas.dataset.initialized = "true";

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const CONFIG = {
      // React Bits inspired plasma palette
      color: [242, 91, 208],

      // Sphere
      size: 0.62,

      // Electric border
      borderWidth: 3.6,
      strands: 6,
      crackle: 0.48,
      glow: 0.88,

      // Particle system
     

      particleCount: 3200,
      particleSize: 1.8,
      particleSpeed: 0.75,
      
      mouseRadius: 2.50,
      mouseAttraction: 4,
      mouseSwirl: 1.35,
      hoverStrength: 2.0,
      
      borderWidth: 3.2,
      strands: 5,
      crackle: 0.42,
      glow: 0.80,
      


      // General
      speed: 0.85
    };

    
// ======================================
// CRYSTAL BALL — THEME-AWARE PALETTE
// ======================================

const BALL_THEMES = {
  dark: {
    color: [142, 91, 208],
    core: "rgba(255,230,252,0.96)",
    strand: "rgba(255,165,238,0.58)",
    particleBrighten: 35,
    glow: 1.15
  },

  light: {
    color: [19, 80, 217],
    core: "rgba(216,180,254,0.98)",
    strand: "rgba(124,58,237,0.82)",
    particleBrighten: 0,
    glow: 1.55
  }
};

let ballTheme = "dark";

function updateBallTheme() {
  ballTheme =
    document.documentElement.dataset.theme === "light"
      ? "light"
      : "dark";

  const palette = BALL_THEMES[ballTheme];

  CONFIG.color = [...palette.color];
  CONFIG.glow = palette.glow;

  draw();
}


    const TAU = Math.PI * 2;

    let width = 1;
    let height = 1;
    let radius = 100;
    let dpr = 1;

    let time = 0;
    let lastTime = 0;
    let frameId = 0;
    let visible = true;

    const pointer = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      inside: false,
      strength: 0
    };

    const particles = [];

    function random(min, max) {
      return min + Math.random() * (max - min);
    }

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function color(alpha, brighten = 0) {
      const [r, g, b] = CONFIG.color;

      return `rgba(${Math.min(255, r + brighten)},
        ${Math.min(255, g + brighten)},
        ${Math.min(255, b + brighten)},
        ${alpha})`;
    }

    /* ======================================
       PARTICLE CREATION
    ====================================== */

    function createParticles() {
      particles.length = 0;

      for (let i = 0; i < CONFIG.particleCount; i++) {
        // Create a denser particle cloud near
        // the bottom, like the React Bits sphere.
        const angle = random(0, TAU);
        const radial = Math.sqrt(Math.random()) * 0.95;

        let x = Math.cos(angle) * radial;
        let y = Math.sin(angle) * radial;

        if (Math.random() < 0.78) {
          y = random(0.02, 0.90);
          const limit = Math.sqrt(
            Math.max(0, 0.94 * 0.94 - y * y)
          );
          x = random(-limit, limit);
        }

        particles.push({
          homeX: x,
          homeY: y,

          x,
          y,

          vx: 0,
          vy: 0,

          depth: random(0.3, 1),
          size: random(0.5, 1.9),
          opacity: random(0.35, 1),

          phase: random(0, TAU),
          speed: random(0.4, 1.3)
        });
      }
    }

    createParticles();

    /* ======================================
       RESIZE
    ====================================== */

    function resize() {
      const rect = canvas.getBoundingClientRect();

      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);

      dpr = Math.min(
        window.devicePixelRatio || 1,
        2
      );

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      radius = Math.min(width, height) *
        CONFIG.size * 0.5;

      draw();
      start();
    }

    /* ======================================
       THICK ELECTRIC GLASS RIM
    ====================================== */

    function rimDisplacement(angle, strand = 0) {
      const phase = strand * 1.73;

      const waveA = Math.sin(
        angle * (23 + strand * 3) +
        time * 1.4 + phase
      );

      const waveB = Math.sin(
        angle * (57 + strand * 5) -
        time * 2.7 + phase
      );

      const waveC = Math.sin(
        angle * (113 + strand * 7) +
        time * 4.2 + phase
      );

      let displacement = (
        waveA * 0.45 +
        waveB * 0.35 +
        waveC * 0.2
      );

      displacement *= radius *
        0.017 * CONFIG.crackle;

      // Increase electric distortion
      // near the cursor's angular position.
      if (pointer.inside) {
        const mouseAngle = Math.atan2(
          pointer.y,
          pointer.x
        );

        const difference = Math.atan2(
          Math.sin(angle - mouseAngle),
          Math.cos(angle - mouseAngle)
        );

        const heat = Math.exp(
          -difference * difference * 7
        );

        displacement += (
          heat *
          pointer.strength *
          radius *
          0.018 *
          Math.sin(angle * 80 + time * 8)
        );
      }

      return displacement;
    }

    function traceRim(cx, cy, strand = 0) {
      ctx.beginPath();

      const steps = 340;

      for (let i = 0; i <= steps; i++) {
        const angle = i / steps * TAU;

        const displacement = rimDisplacement(
          angle,
          strand
        );

        const rr = radius + displacement;

        const x = cx + Math.cos(angle) * rr;
        const y = cy + Math.sin(angle) * rr;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.closePath();
    }



    /* ==========================================
   BORDER SPARKLES — ONLY ON THE RIM
========================================== */

function drawBorderSparkles(cx, cy) {
  const isLight = ballTheme === "light";

  ctx.save();

  ctx.globalCompositeOperation = isLight
    ? "source-over"
    : "screen";

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const mouseAngle = Math.atan2(pointer.y, pointer.x);
  const sparkleCount = pointer.inside ? 12 : 8;

  for (let i = 0; i < sparkleCount; i++) {
    // Some sparkles randomly appear around the rim,
    // some cluster near the cursor angle.
    const nearMouse = pointer.inside && Math.random() < 0.6;

    const baseAngle = nearMouse
      ? mouseAngle + (Math.random() - 0.5) * 1.2
      : ((i / sparkleCount) * TAU) + time * 0.22 + i * 0.31;

      const arcLength = 0.02 + Math.random() * 0.04;
    const startAngle = baseAngle - arcLength * 0.5;
    const endAngle = baseAngle + arcLength * 0.5;

    const pulse =
      0.45 +
      0.55 *
        Math.max(
          0,
          Math.sin(time * (4.5 + i * 0.17) + i * 1.83)
        );

    const alpha = pulse * (pointer.inside ? 1 : 0.8);

    // Use a slightly jittered radius so the sparkle
    // feels electric, but still stays attached to the border.
    const localRadius =
      radius +
      Math.sin(time * 8 + i * 2.7) * radius * 0.004;

    // Outer glow
    ctx.beginPath();
    ctx.arc(cx, cy, localRadius, startAngle, endAngle);

    ctx.strokeStyle = isLight
      ? `rgba(124,58,237,${alpha * 0.20})`
      : `rgba(242,91,208,${alpha * 0.28})`;

    ctx.lineWidth = 5.5;
    ctx.shadowColor = isLight
      ? `rgba(109,40,217,${alpha * 0.65})`
      : `rgba(242,91,208,${alpha})`;

    ctx.shadowBlur = isLight ? 8 : 18;
    ctx.stroke();

    // Mid electric stroke
    ctx.beginPath();
    ctx.arc(
      cx,
      cy,
      localRadius,
      startAngle + 0.002,
      endAngle - 0.002
    );

    ctx.strokeStyle = isLight
      ? `rgba(91,33,182,${alpha * 0.95})`
      : `rgba(255,120,223,${alpha})`;

    ctx.lineWidth = 2.4;
    ctx.shadowBlur = isLight ? 5 : 12;
    ctx.stroke();

    // Bright hot core
    ctx.beginPath();
    ctx.arc(
      cx,
      cy,
      localRadius,
      startAngle + 0.006,
      endAngle - 0.006
    );

    ctx.strokeStyle = isLight
      ? `rgba(76,29,149,${alpha})`
      : `rgba(255,240,252,${alpha})`;

    ctx.lineWidth = 0.9;
    ctx.shadowBlur = 2;
    ctx.stroke();
  }

  ctx.restore();
}

    
/* ==========================================
   PREMIUM FUTURISTIC PLASMA RIM
   Smooth electric movement, no random bolts
========================================== */

/* ==========================================
   PREMIUM FUTURISTIC PLASMA RIM
   WITH BORDER ELECTRIC SPARKLES
========================================== */

function drawElectricRim(cx, cy) {
  const isLight = ballTheme === "light";

  const mainColor = isLight
    ? "109,40,217"
    : "242,91,208";

  const brightColor = isLight
    ? "76,29,149"
    : "255,235,251";

  ctx.save();

  ctx.globalCompositeOperation = isLight
    ? "source-over"
    : "screen";

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // 1) Soft ambient border glow
  traceRim(cx, cy, 0);
  ctx.strokeStyle = `rgba(${mainColor},0.10)`;
  ctx.lineWidth = CONFIG.borderWidth * 5.2;
  ctx.shadowColor = `rgba(${mainColor},0.42)`;
  ctx.shadowBlur = isLight ? 9 : 22;
  ctx.stroke();

  // 2) Main visible ring
  traceRim(cx, cy, 0);
  ctx.strokeStyle = `rgba(${mainColor},0.84)`;
  ctx.lineWidth = CONFIG.borderWidth * 1.7;
  ctx.shadowColor = `rgba(${mainColor},0.70)`;
  ctx.shadowBlur = isLight ? 5 : 13;
  ctx.stroke();

  // 3) Sharp bright inner edge
  traceRim(cx, cy, 0);
  ctx.strokeStyle = `rgba(${brightColor},0.92)`;
  ctx.lineWidth = Math.max(1.0, CONFIG.borderWidth * 0.42);
  ctx.shadowBlur = 3;
  ctx.stroke();

  // 4) Fine animated current strands
  for (let i = 1; i < CONFIG.strands; i++) {
    traceRim(cx, cy, i);

    ctx.strokeStyle = isLight
      ? `rgba(91,33,182,${0.16 + i * 0.03})`
      : `rgba(255,150,231,${0.16 + i * 0.04})`;

    ctx.lineWidth = 0.75;
    ctx.shadowBlur = 2;
    ctx.stroke();
  }

  ctx.restore();

  // 5) Sparkling electrical detail ON the rim only
  drawBorderSparkles(cx, cy);
}

    /* ======================================
       SPHERE BACKGROUND
    ====================================== */


    function drawBackground(cx, cy) {
      const isLight = ballTheme === "light";
    
      const gradient = ctx.createRadialGradient(
        cx,
        cy + radius * 0.4,
        radius * 0.05,
        cx,
        cy,
        radius
      );
    
      if (isLight) {
        gradient.addColorStop(
          0,
          "rgba(124,58,237,0.12)"
        );
    
        gradient.addColorStop(
          0.55,
          "rgba(167,139,250,0.065)"
        );
    
        gradient.addColorStop(
          1,
          "rgba(124,58,237,0)"
        );
      } else {
        gradient.addColorStop(
          0,
          "rgba(242,91,208,0.14)"
        );
    
        gradient.addColorStop(
          0.5,
          "rgba(124,58,237,0.065)"
        );
    
        gradient.addColorStop(
          1,
          "rgba(11,11,16,0.02)"
        );
      }
    
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    

    /* ======================================
       MOUSE-RESPONSIVE PARTICLE PHYSICS
    ====================================== */


/* ==========================================
   REACT BITS STYLE — FLUID PARTICLE HOVER
========================================== */


/* ==========================================
   FLUID PARTICLE DISPLACEMENT
   Push apart on hover, recover smoothly
========================================== */

function updateParticles(dt) {
  const step = Math.min(dt, 0.04);
  const hover = pointer.strength;

  const mx = pointer.x;
  const my = pointer.y;

  const influenceRadius = CONFIG.mouseRadius;

  for (const p of particles) {
    // Smooth background wave motion
    const waveX =
      Math.sin(
        p.homeY * 5.0 +
        time * 0.7 +
        p.phase * 0.3
      ) * 0.015;

    const waveY =
      Math.cos(
        p.homeX * 4.2 -
        time * 0.55 +
        p.phase * 0.25
      ) * 0.012;

    // Each particle has its own resting position
    let targetX = p.homeX + waveX;
    let targetY = p.homeY + waveY;

    if (hover > 0.001) {
      // Use the RESTING position so particles
      // don't pile up at the cursor.
      const dx = targetX - mx;
      const dy = targetY - my;

      const distance = Math.max(
        0.0001,
        Math.hypot(dx, dy)
      );

      // Smooth influence inside mouse radius
      const normalized = Math.min(
        1,
        distance / influenceRadius
      );

      const falloff =
        Math.pow(1 - normalized, 2);

      // Maximum outward displacement
      const pushDistance = 0.34 * hover * falloff;

      // Push particles away from the pointer
      const nx = dx / distance;
      const ny = dy / distance;

      targetX += nx * pushDistance;
      targetY += ny * pushDistance;

      // Subtle sideways fluid displacement
      // prevents a rigid, mechanical-looking hole
      const swirl =
        Math.sin(
          time * 1.3 +
          p.phase * 0.25
        ) *
        0.025 *
        falloff *
        hover;

      targetX += -ny * swirl;
      targetY += nx * swirl;
    }

    // Spring movement toward displaced position
    const spring = 19;
    const damping = 9;

    p.vx += (targetX - p.x) * spring * step;
    p.vy += (targetY - p.y) * spring * step;

    const decay = Math.exp(-damping * step);

    p.vx *= decay;
    p.vy *= decay;

    p.x += p.vx * step;
    p.y += p.vy * step;

    // Keep particles inside the circle
    const distanceFromCenter = Math.hypot(
      p.x,
      p.y
    );

    const maxRadius = 0.955;

    if (distanceFromCenter > maxRadius) {
      const nx = p.x / distanceFromCenter;
      const ny = p.y / distanceFromCenter;

      p.x = nx * maxRadius;
      p.y = ny * maxRadius;

      // Cancel only the outward velocity
      const outwardVelocity =
        p.vx * nx + p.vy * ny;

      if (outwardVelocity > 0) {
        p.vx -= nx * outwardVelocity;
        p.vy -= ny * outwardVelocity;
      }
    }
  }
}




/* ==========================================
   DENSE PLASMA PARTICLE RENDERING
========================================== */


function drawParticles(cx, cy) {
  const isLight = ballTheme === "light";

  ctx.save();

  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.965, 0, TAU);
  ctx.clip();

  ctx.globalCompositeOperation = isLight
    ? "source-over"
    : "screen";

  const scale = Math.max(
    0.7,
    radius / 190
  );

  for (const p of particles) {
    const x = cx + p.x * radius;
    const y = cy + p.y * radius;

    const twinkle =
      0.8 +
      0.2 * Math.sin(
        time * (1.4 + p.speed) + p.phase
      );

    const alpha = clamp(
      p.opacity * p.depth * twinkle,
      0.08,
      0.95
    );

    const size = Math.max(
      0.5,
      p.size * CONFIG.particleSize * scale
    );

    ctx.fillStyle = isLight
      ? `rgba(91,33,182,${alpha * 0.85})`
      : `rgba(255,134,225,${alpha})`;

    ctx.fillRect(
      x - size / 2,
      y - size / 2,
      size,
      size
    );
  }

  ctx.restore();
}



    /* ======================================
       ELECTRIC FLARES
    ====================================== */

    function drawFlares(cx, cy) {
      ctx.save();

      ctx.globalCompositeOperation = "screen";

      for (let i = 0; i < 8; i++) {
        const angle = (
          i / 8 * TAU +
          time * (i % 2 === 0 ? 0.11 : -0.09)
        );

        const strength = (
          Math.sin(time * 2 + i * 2.4) + 1
        ) * 0.5;

        const length = radius * (
          0.03 + strength * 0.065
        );

        const sx = cx + Math.cos(angle) * radius;
        const sy = cy + Math.sin(angle) * radius;

        const ex = cx + Math.cos(angle) *
          (radius + length);

        const ey = cy + Math.sin(angle) *
          (radius + length);

        ctx.beginPath();
        ctx.moveTo(sx, sy);

        ctx.quadraticCurveTo(
          sx + Math.sin(angle) * length * 0.5,
          sy - Math.cos(angle) * length * 0.5,
          ex,
          ey
        );

        ctx.strokeStyle = color(
          0.12 + strength * 0.32,
          40
        );

        ctx.lineWidth = 1.1;
        ctx.shadowColor = color(0.8);
        ctx.shadowBlur = 9;
        ctx.stroke();
      }

      ctx.restore();
    }



    
/* ==========================================
   THE TISA — ELECTRIC BORDER LIGHTNING
   Must stay INSIDE initCrystalBall()
========================================== */

const lightningBolts = [];
let lightningSpawnTimer = 0;

function spawnLightning() {
  const mouseAngle = Math.atan2(
    pointer.y,
    pointer.x
  );

  // More electricity appears near the mouse.
  const nearMouse =
    pointer.inside && Math.random() < 0.75;

  const angle = nearMouse
    ? mouseAngle + (Math.random() - 0.5) * 1.5
    : Math.random() * TAU;

  lightningBolts.push({
    angle,
    angularLength: 0.15 + Math.random() * 0.38,
    direction: Math.random() > 0.5 ? 1 : -1,
    height: 0.035 + Math.random() * 0.06,
    seed: Math.random() * 1000,
    width: 0.8 + Math.random() * 1.2,
    life: 1,
    decay: 2.8 + Math.random() * 2.5
  });

  // Limit how many active lightning arcs exist.
  if (lightningBolts.length > 20) {
    lightningBolts.shift();
  }
}

function updateLightning(dt) {
  const interval = pointer.inside ? 0.055 : 0.15;

  lightningSpawnTimer += dt;

  while (lightningSpawnTimer >= interval) {
    lightningSpawnTimer -= interval;
    spawnLightning();
  }

  for (let i = lightningBolts.length - 1; i >= 0; i--) {
    const bolt = lightningBolts[i];

    bolt.life -= dt * bolt.decay;

    if (bolt.life <= 0) {
      lightningBolts.splice(i, 1);
    }
  }
}

function drawLightning(cx, cy) {
  const isLight = ballTheme === "light";

  ctx.save();

  ctx.globalCompositeOperation = isLight
    ? "source-over"
    : "screen";

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const bolt of lightningBolts) {
    const alpha = Math.max(0, bolt.life);
    const points = [];
    const segments = 16;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;

      const angle =
        bolt.angle +
        t * bolt.angularLength * bolt.direction;

      // Lightning is attached to the circle
      // at both ends and jumps outward between.
      const envelope = Math.sin(Math.PI * t);

      const jitter =
        Math.sin(i * 19.73 + bolt.seed) * 0.5 +
        Math.sin(i * 37.41 + bolt.seed * 0.7) * 0.5;

      const outward =
        envelope *
        radius *
        (bolt.height + jitter * 0.016);

      const rr = radius + outward;

      points.push({
        x: cx + Math.cos(angle) * rr,
        y: cy + Math.sin(angle) * rr
      });
    }

    function strokeArc(strokeColor, lineWidth, blur) {
      ctx.beginPath();

      points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;

      ctx.shadowColor = isLight
        ? `rgba(109,40,217,${alpha * 0.65})`
        : `rgba(242,91,208,${alpha})`;

      ctx.shadowBlur = blur;
      ctx.stroke();
    }

    // Broad electric glow
    strokeArc(
      isLight
        ? `rgba(124,58,237,${alpha * 0.2})`
        : `rgba(242,91,208,${alpha * 0.3})`,
      bolt.width * 6,
      isLight ? 8 : 20
    );

    // Strong visible lightning
    strokeArc(
      isLight
        ? `rgba(91,33,182,${alpha * 0.95})`
        : `rgba(255,95,218,${alpha})`,
      bolt.width * 2.5,
      isLight ? 4 : 10
    );

    // Sharp lightning core
    strokeArc(
      isLight
        ? `rgba(76,29,149,${alpha})`
        : `rgba(255,240,252,${alpha})`,
      Math.max(0.65, bolt.width * 0.6),
      2
    );
  }

  ctx.restore();
}


    /* ======================================
       RENDER
    ====================================== */

    

    function draw() {
      ctx.clearRect(0, 0, width, height);
    
      const cx = width / 2;
      const cy = height / 2;
    
      drawBackground(cx, cy);
      drawParticles(cx, cy);
    
      // Existing circle
      drawElectricRim(cx, cy);
    
      // New lightning around the border
      // drawLightning(cx, cy);
    }
    


    /* ======================================
       ANIMATION LOOP
    ====================================== */

 
function frame(now) {
  frameId = 0;

  if (!visible || document.hidden) return;

  const dt = lastTime
    ? Math.min((now - lastTime) / 1000, 0.05)
    : 0.016;

  lastTime = now;

  if (!reduceMotion.matches) {
    time += dt * CONFIG.speed;

    const pointerSmoothing =
      1 - Math.exp(-dt * 12);

    pointer.x +=
      (pointer.targetX - pointer.x) *
      pointerSmoothing;

    pointer.y +=
      (pointer.targetY - pointer.y) *
      pointerSmoothing;

    const targetStrength =
      pointer.inside ? CONFIG.hoverStrength : 0;

    pointer.strength +=
      (targetStrength - pointer.strength) *
      (1 - Math.exp(-dt * 6));

    // Keep existing particle movement
    updateParticles(dt);

    // Animate electric lightning
    // updateLightning(dt);
  }

  draw();

  if (!reduceMotion.matches) {
    start();
  }
}


    function start() {
      if (
        frameId ||
        !visible ||
        reduceMotion.matches ||
        document.hidden
      ) return;

      frameId = requestAnimationFrame(frame);
    }

    /* ======================================
       MOUSE INTERACTION
    ====================================== */

    function locatePointer(event) {
      const rect = canvas.getBoundingClientRect();

      const px = event.clientX - rect.left -
        rect.width / 2;

      const py = event.clientY - rect.top -
        rect.height / 2;

      return {
        x: px / Math.max(radius, 1),
        y: py / Math.max(radius, 1),
        distance: Math.hypot(px, py)
      };
    }


    function onPointerMove(event) {
      if (event.pointerType === "touch") return;
    
      const point = locatePointer(event);
    
      pointer.targetX = point.x;
      pointer.targetY = point.y;
    
      pointer.inside =
        point.distance <= radius * 1.1;
    
      // Make the effect react promptly on hover
      // while keeping the movement smooth.
      if (pointer.inside) {
        pointer.strength = Math.max(
          pointer.strength,
          0.35
        );
      }
    
      start();
    }
    

    function onPointerLeave() {
      pointer.inside = false;
      pointer.targetX = 0;
      pointer.targetY = 0;
      start();
    }

    function onPointerDown(event) {
      if (reduceMotion.matches) return;

      const point = locatePointer(event);

      if (point.distance > radius * 1.1) return;

      pointer.inside = true;
      pointer.targetX = point.x;
      pointer.targetY = point.y;
      pointer.strength = 1;

      // Repulsive impulse creates a click disturbance
      for (const p of particles) {
        const dx = p.x - point.x;
        const dy = p.y - point.y;
        const distance = Math.max(
          0.02,
          Math.hypot(dx, dy)
        );

        const strength = Math.exp(
          -distance * distance / 0.18
        ) * 1.7;

        p.vx += dx / distance * strength;
        p.vy += dy / distance * strength;
      }

      start();
    }

    canvas.addEventListener(
      "pointermove",
      onPointerMove,
      { passive: true }
    );

    canvas.addEventListener(
      "pointerleave",
      onPointerLeave
    );

    canvas.addEventListener(
      "pointerdown",
      onPointerDown
    );

    /* ======================================
       VISIBILITY / RESPONSIVENESS
    ====================================== */

    const resizeObserver = new ResizeObserver(
      resize
    );

    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(
      entries => {
        visible = entries[0].isIntersecting;

        if (!visible) {
          cancelAnimationFrame(frameId);
          frameId = 0;
          lastTime = 0;
        } else {
          start();
        }
      },
      { threshold: 0.01 }
    );

    intersectionObserver.observe(canvas);

    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) {
          cancelAnimationFrame(frameId);
          frameId = 0;
          lastTime = 0;
        } else {
          start();
        }
      }
    );

    reduceMotion.addEventListener(
      "change",
      () => {
        cancelAnimationFrame(frameId);
        frameId = 0;
        lastTime = 0;

        if (reduceMotion.matches) {
          draw();
        } else {
          start();
        }
      }
    );

// Apply the current theme when the ball initializes
updateBallTheme();

// Watch for light/dark mode changes
const ballThemeObserver = new MutationObserver(() => {
  updateBallTheme();
});

ballThemeObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-theme"]
});

// Start the existing Canvas animation
resize();
draw();
start();

  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initCrystalBall,
      { once: true }
    );
  } else {
    initCrystalBall();
  }
})();


/* ==============================================
   THE TISA — SCROLL REVEAL FOR ALL HEADINGS

   React Bits inspired / Vanilla JavaScript
   Works with existing Variable Proximity
   Preserves existing GSAP animations
============================================== */

(function () {
  "use strict";

  const CONFIG = {
    // Apply to all page headings
    selector: "main section:not(.hero) h2, main section:not(.hero) h3",

    // Animation
    duration: 0.65,
stagger: 0.035,
baseOpacity: 0.2,
blurStrength: 2,
baseOffset: 12,

    // Scroll activation
    start: "top 88%",

    // Optional highlight during reveal
    // Keep empty to preserve all existing colors.
    highlightColor: ""
  };

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  /* ======================================
     SPLIT UNSPLIT TEXT INTO WORDS

     If Variable Proximity has already
     generated .vp-word wrappers,
     reuse those existing elements.
  ====================================== */

  function prepareHeading(heading) {
    if (heading.dataset.srReady === "true") {
      return [];
    }

    heading.dataset.srReady = "true";
    heading.classList.add("sr-heading");

    // If the existing Variable Proximity
    // script has split the heading, reuse
    // its words instead of splitting again.

    const existingWords = Array.from(
      heading.querySelectorAll(".vp-word")
    );

    if (existingWords.length > 0) {
      existingWords.forEach(word => {
        word.classList.add("sr-word");
      });

      return existingWords;
    }

    /* No VP wrappers:
       Split ordinary heading text into words
       while preserving nested highlight spans. */

    const walker = document.createTreeWalker(
      heading,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (
            !node.nodeValue ||
            !node.nodeValue.trim()
          ) {
            return NodeFilter.FILTER_REJECT;
          }

          if (
            node.parentElement.closest(
              ".sr-word, script, style"
            )
          ) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const textNodes = [];

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach(node => {
      const fragment =
        document.createDocumentFragment();

      const parts =
        node.nodeValue.match(/\s+|\S+/g) || [];

      parts.forEach(part => {
        if (/^\s+$/.test(part)) {
          fragment.appendChild(
            document.createTextNode(part)
          );

          return;
        }

        const word = document.createElement(
          "span"
        );

        word.className = "sr-word";
        word.textContent = part;

        fragment.appendChild(word);
      });

      node.replaceWith(fragment);
    });

    return Array.from(
      heading.querySelectorAll(".sr-word")
    );
  }

  /* ======================================
     REVEAL ANIMATION
  ====================================== */

  function createReveal(heading) {
    const words = prepareHeading(heading);

    if (!words.length) return;

    if (
      reduceMotion.matches ||
      typeof window.gsap === "undefined"
    ) {
      return;
    }

    const gsapInstance = window.gsap;

    const scrollAvailable =
      typeof window.ScrollTrigger !== "undefined";

    if (scrollAvailable) {
      gsapInstance.registerPlugin(
        window.ScrollTrigger
      );
    }

    // Preserve any existing word-level styles
    // by animating only opacity, y and blur.

    gsapInstance.set(words, {
      opacity: CONFIG.baseOpacity,
      y: CONFIG.baseOffset,
      filter: `blur(${CONFIG.blurStrength}px)`
    });

    let played = false;

    function playReveal() {
      if (played) return;

      played = true;

      const timeline = gsapInstance.timeline({
        defaults: {
          ease: "power3.out"
        }
      });

      timeline.to(words, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: CONFIG.duration,
        stagger: CONFIG.stagger,
        overwrite: "auto",

        onComplete: () => {
          // Remove properties GSAP no longer needs,
          // allowing Variable Proximity to work.

          gsapInstance.set(words, {
            clearProps: "opacity,transform,filter"
          });
        }
      });
    }

    /* ======================================
       HERO HEADLINE

       Do not add another entrance trigger.
       Let the existing hero intro animation
       handle the section entrance.
    ====================================== */

    if (heading.closest(".hero")) {
      const delay =
        gsapInstance.delayedCall(0.35, playReveal);

      heading._srDelay = delay;

      return;
    }

    /* ======================================
       OTHER SECTION HEADINGS
    ====================================== */

    if (scrollAvailable) {
      window.ScrollTrigger.create({
        trigger: heading,
        start: CONFIG.start,
        once: true,

        onEnter: playReveal,

        onRefresh: self => {
          if (self.progress > 0) {
            playReveal();
          }
        }
      });
    } else {
      // Fallback when ScrollTrigger is missing
      playReveal();
    }
  }

  /* ======================================
     INITIALIZATION
  ====================================== */

  function initScrollReveal() {
    const headings = document.querySelectorAll(
      CONFIG.selector
    );

    headings.forEach(createReveal);

    if (
      typeof window.ScrollTrigger !== "undefined"
    ) {
      if (document.fonts) {
        document.fonts.ready.then(() => {
          window.ScrollTrigger.refresh();
        });
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initScrollReveal,
      { once: true }
    );
  } else {
    initScrollReveal();
  }

  /* ======================================
     REDUCED MOTION CHANGE
  ====================================== */

  reduceMotion.addEventListener(
    "change",
    () => {
      window.location.reload();
    }
  );

})();



// ==========================================
// BUILD & INTEGRATE — SCROLL-TRIGGERED BARS
// ==========================================

if (
  typeof gsap !== "undefined" &&
  typeof ScrollTrigger !== "undefined" &&
  !window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches
) {
  gsap.registerPlugin(ScrollTrigger);

  const developmentCard = document.querySelector(
    ".approach-development .development-editor"
  );

  if (developmentCard) {
    const codeLines = developmentCard.querySelectorAll(
      ".code-visual-line"
    );

    // Animation plays once when the card appears
    const codeTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: developmentCard,
        start: "top 82%",
        toggleActions: "play none none reset"
      }
    });

    codeLines.forEach((line, index) => {
      const bars = line.querySelectorAll("i");

      codeTimeline.fromTo(
        bars,
        {
          scaleX: 0,
          opacity: 0
        },
        {
          scaleX: 1,
          opacity: 1,
          duration: 0.75,
          stagger: 0.12,
          ease: "power3.out"
        },
        index * 0.18
      );
    });
  }
}


/* ==============================================
   THE TISA — LIGHT / DARK THEME SWITCHER
   Vanilla JavaScript
   Preserves all existing animations
============================================== */

(function () {
  "use strict";

  const STORAGE_KEY = "tisa-theme";

  const root = document.documentElement;

  function readSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      // Theme still works when storage is unavailable.
    }
  }

  function updateThemeButton(theme) {
    const button = document.getElementById(
      "theme-toggle"
    );

    if (!button) return;

    const light = theme === "light";

    button.setAttribute(
      "aria-label",
      light ? "Switch to dark mode" : "Switch to light mode"
    );

    button.setAttribute(
      "aria-pressed",
      String(light)
    );

    button.setAttribute(
      "title",
      light ? "Switch to dark mode" : "Switch to light mode"
    );
  }

  function updateBrowserTheme(theme) {
    const meta = document.querySelector(
      'meta[name="theme-color"]'
    );

    if (meta) {
      meta.setAttribute(
        "content",
        theme === "light" ? "#F8F9FC" : "#0B0B10"
      );
    }
  }

  function applyTheme(theme, persist = true) {
    const resolvedTheme =
      theme === "light" ? "light" : "dark";

    root.dataset.theme = resolvedTheme;

    root.style.colorScheme = resolvedTheme;

    updateThemeButton(resolvedTheme);
    updateBrowserTheme(resolvedTheme);

    if (persist) {
      saveTheme(resolvedTheme);
    }

    // Keep ScrollTrigger positions accurate after
    // any theme-dependent layout changes.
    if (window.ScrollTrigger) {
      requestAnimationFrame(() => {
        window.ScrollTrigger.refresh();
      });
    }
  }


  function initThemeToggle() {
    const savedTheme = readSavedTheme();
  
    applyTheme(
      savedTheme === "light" ? "light" : "dark",
      false
    );
  
    // Event delegation works even if the
    // theme button is rendered or moved later.
    if (document.documentElement.dataset.themeBound === "true") {
      return;
    }
  
    document.documentElement.dataset.themeBound = "true";
  
    document.addEventListener("click", event => {
      const button = event.target.closest(
        "#theme-toggle"
      );
  
      if (!button) return;
  
      event.preventDefault();
  
      const nextTheme =
        document.documentElement.dataset.theme === "light"
          ? "dark"
          : "light";
  
      applyTheme(nextTheme);
    });
  }
  

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initThemeToggle,
      { once: true }
    );
  } else {
    initThemeToggle();
  }
})();



/* ==========================================
   ELECTRIC LIGHTNING — CIRCLE BORDER ONLY
========================================== */

const lightningBolts = [];
let lightningSpawnTimer = 0;

function spawnLightning() {
  const angle = Math.random() * Math.PI * 2;

  // Lightning appears around the circular edge.
  const length = radius * (0.10 + Math.random() * 0.18);

  // Some arcs branch outward, others crawl
  // around the circumference.
  const direction = Math.random() < 0.65 ? 1 : -1;

  lightningBolts.push({
    angle,
    length,
    direction,
    life: 1,
    decay: 2.8 + Math.random() * 3,
    seed: Math.random() * 1000,
    width: 0.9 + Math.random() * 1.2
  });

  if (lightningBolts.length > 18) {
    lightningBolts.shift();
  }
}

function updateLightning(dt) {
  lightningSpawnTimer += dt;

  const interval = pointer.inside ? 0.055 : 0.17;

  while (lightningSpawnTimer > interval) {
    lightningSpawnTimer -= interval;
    spawnLightning();
  }

  for (let i = lightningBolts.length - 1; i >= 0; i--) {
    lightningBolts[i].life -=
      dt * lightningBolts[i].decay;

    if (lightningBolts[i].life <= 0) {
      lightningBolts.splice(i, 1);
    }
  }
}

function drawLightning(cx, cy) {
  const isLight =
    document.documentElement.dataset.theme === "light";

  ctx.save();

  // Screen blending looks brighter on dark themes,
  // whereas regular compositing gives better
  // contrast against white backgrounds.
  ctx.globalCompositeOperation =
    isLight ? "source-over" : "screen";

  for (const bolt of lightningBolts) {
    const points = [];

    const segments = 12;
    const angularLength = bolt.length / radius;

    const cursorAngle = Math.atan2(
      pointer.y,
      pointer.x
    );

    const proximity = Math.abs(
      Math.atan2(
        Math.sin(bolt.angle - cursorAngle),
        Math.cos(bolt.angle - cursorAngle)
      )
    );

    const mouseBoost =
      pointer.inside
        ? Math.exp(-proximity * proximity * 4) * 1.5
        : 0;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;

      // Arc traces a section of the sphere's border.
      const angle =
        bolt.angle +
        t * angularLength * bolt.direction;

      // Lightning jumps slightly outside the circle,
      // then returns to the rim.
      const envelope = Math.sin(t * Math.PI);

      const jitter =
        Math.sin(
          i * 17.7 + bolt.seed
        ) * 0.5 +
        Math.sin(
          i * 31.3 + bolt.seed * 0.7
        ) * 0.5;

      const outward =
        envelope *
        (
          radius * (0.035 + mouseBoost * 0.018) +
          jitter * radius * 0.014
        );

      const rr = radius + outward;

      points.push({
        x: cx + Math.cos(angle) * rr,
        y: cy + Math.sin(angle) * rr
      });
    }

    const alpha = Math.max(0, bolt.life);

    function strokeBolt(strokeColor, lineWidth, blur) {
      ctx.beginPath();

      points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = isLight
        ? `rgba(109,40,217,${alpha * 0.45})`
        : `rgba(242,91,208,${alpha})`;
      ctx.shadowBlur = blur;
      ctx.stroke();
    }

    // Outer electrical illumination
    strokeBolt(
      isLight
        ? `rgba(124,58,237,${alpha * 0.15})`
        : `rgba(242,91,208,${alpha * 0.25})`,
      bolt.width * 6,
      isLight ? 7 : 18
    );

    // Saturated middle lightning
    strokeBolt(
      isLight
        ? `rgba(91,33,182,${alpha * 0.8})`
        : `rgba(255,95,218,${alpha * 0.95})`,
      bolt.width * 2.2,
      isLight ? 3 : 9
    );

    // Thin, bright electrical core
    strokeBolt(
      isLight
        ? `rgba(76,29,149,${alpha})`
        : `rgba(255,240,252,${alpha})`,
      Math.max(0.6, bolt.width * 0.65),
      2
    );
  }

  ctx.restore();
}


/* ==========================================
   THE TISA — RESPONSIVE THEME LOGOS
========================================== */

(function () {
  const root = document.documentElement;

  function updateBrandLogos() {
    const isLight = root.dataset.theme === "light";

    const logoPath = isLight
      ? "assets/tisa-logo-light.svg"
      : "assets/tisa-logo-dark.svg";

    document.querySelectorAll("[data-theme-logo]")
      .forEach(img => {
        if (img.getAttribute("src") !== logoPath) {
          img.setAttribute("src", logoPath);
        }
      });
  }

  function initBrandLogos() {
    updateBrandLogos();

    const observer = new MutationObserver(
      updateBrandLogos
    );

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initBrandLogos,
      { once: true }
    );
  } else {
    initBrandLogos();
  }
})();


});
