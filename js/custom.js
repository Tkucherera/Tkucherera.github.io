(() => {
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const rotatingTitle = document.querySelector("[data-rotating-title]");
  const canvas = document.querySelector("[data-hero-canvas]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const titles = [
    "Former Lenovo HPC Engineer",
    "Master's Graduate",
    "Open Source Contributor",
    "AI Builder",
    "Researcher"
  ];

  if (!reduceMotion) {
    document.documentElement.classList.add("motion-ready");
  }

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  navToggle?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  });

  nav?.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      nav.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    }
  });

  if (rotatingTitle && !reduceMotion) {
    let index = 0;
    window.setInterval(() => {
      index = (index + 1) % titles.length;
      rotatingTitle.animate(
        [{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-6px)" }],
        { duration: 180, easing: "ease-out" }
      ).onfinish = () => {
        rotatingTitle.textContent = titles[index];
        rotatingTitle.animate(
          [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 220, easing: "ease-out" }
        );
      };
    }, 2300);
  }

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  if (!canvas || reduceMotion) {
    return;
  }

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) {
    return;
  }

  let width = 0;
  let height = 0;
  let points = [];
  let animationFrame = 0;
  const pointer = { x: 0, y: 0, active: false };

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.max(46, Math.min(105, Math.floor(width / 14)));
    points = Array.from({ length: count }, (_, index) => ({
      x: (index * 97) % width,
      y: (index * 53) % height,
      vx: ((index % 7) - 3) * 0.045,
      vy: (((index + 3) % 9) - 4) * 0.035,
      size: 1.2 + (index % 4) * 0.35
    }));
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "rgba(83, 214, 182, 0.74)";
    context.strokeStyle = "rgba(134, 168, 255, 0.15)";
    context.lineWidth = 1;

    points.forEach((point) => {
      point.x += point.vx;
      point.y += point.vy;

      if (pointer.active) {
        const dx = pointer.x - point.x;
        const dy = pointer.y - point.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 160) {
          point.x -= dx * 0.0009;
          point.y -= dy * 0.0009;
        }
      }

      if (point.x < -20) point.x = width + 20;
      if (point.x > width + 20) point.x = -20;
      if (point.y < -20) point.y = height + 20;
      if (point.y > height + 20) point.y = -20;

      context.beginPath();
      context.arc(point.x, point.y, point.size, 0, Math.PI * 2);
      context.fill();
    });

    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const distance = Math.hypot(dx, dy);
        if (distance < 125) {
          context.globalAlpha = 1 - distance / 125;
          context.beginPath();
          context.moveTo(points[i].x, points[i].y);
          context.lineTo(points[j].x, points[j].y);
          context.stroke();
        }
      }
    }

    context.globalAlpha = 1;
    animationFrame = window.requestAnimationFrame(draw);
  };

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
  }, { passive: true });
  window.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  resize();
  draw();

  window.addEventListener("pagehide", () => {
    window.cancelAnimationFrame(animationFrame);
  });
})();
