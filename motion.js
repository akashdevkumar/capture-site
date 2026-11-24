// Page motion with Motion (https://motion.dev), pinned to 14.10.1.
// Everything here is decoration: without it (no script, Reduce Motion, or the CDN unreachable) the page shows in full.
const root = document.documentElement;
const reveal = () => document.querySelectorAll("[data-reveal]").forEach((el) => { el.style.opacity = "1"; });

// If Motion has not loaded in 2.5 s, show everything as it is.
const fallback = setTimeout(() => { root.classList.remove("motion"); reveal(); }, 2500);

if (root.classList.contains("motion")) {
  try {
    const { animate, inView, scroll, stagger } = await import("https://cdn.jsdelivr.net/npm/motion@14.10.1/+esm");
    clearTimeout(fallback);

    // Hero: the words rise in one after another, then the bar floats up with a soft spring.
    const heroWords = document.querySelectorAll(".hero__content [data-reveal]");
    animate(heroWords, { opacity: [0, 1], y: [24, 0] }, { duration: 0.8, delay: stagger(0.12), ease: [0.16, 1, 0.3, 1] });
    const bar = document.querySelector(".hero__bar");
    if (bar) animate(bar, { opacity: [0, 1], y: [60, 0], scale: [0.96, 1] }, { type: "spring", stiffness: 90, damping: 16, delay: 0.45 });

    // Everything else rises in once, as it scrolls into view.
    document.querySelectorAll("main [data-reveal]").forEach((el) => {
      inView(el, () => {
        animate(el, { opacity: [0, 1], y: [28, 0] }, { duration: 0.7, ease: [0.16, 1, 0.3, 1] });
      }, { margin: "0px 0px -10% 0px" });
    });

    // The six frames arrive in order, like the recording playing.
    const frames = document.querySelector(".frames");
    if (frames) {
      frames.querySelectorAll("li").forEach((li) => { li.style.opacity = "0"; });
      inView(frames, () => {
        animate(frames.querySelectorAll("li"), { opacity: [0, 1], scale: [0.94, 1] }, { duration: 0.5, delay: stagger(0.11, { startDelay: 0.2 }), ease: [0.16, 1, 0.3, 1] });
      }, { margin: "0px 0px -15% 0px" });
    }

    // The valley drifts as the hero scrolls away: each layer sinks a little, the far ranges most, so they
    // seem slowest and furthest. Moving down (never up) keeps every layer's lower edge out of sight.
    const art = document.querySelector(".hero__art");
    const response = await fetch("images/landscape.svg");
    if (art && response.ok) {
      art.innerHTML = await response.text();
      const hero = document.querySelector(".hero");
      const drift = { "#layer-far": 160, "#layer-mid": 120, "#layer-lake": 90, "#layer-near": 70, "#layer-meadow": 40 };
      for (const [selector, distance] of Object.entries(drift)) {
        const layer = art.querySelector(selector);
        if (layer) scroll(animate(layer, { y: [0, distance] }, { ease: "linear" }), { target: hero, offset: ["start start", "end start"] });
      }
    }
  } catch (error) {
    console.warn("Motion did not load; showing the page without animation.", error);
    clearTimeout(fallback);
    root.classList.remove("motion");
    reveal();
  }
}
