document.addEventListener("DOMContentLoaded", () => {
  const preloader = document.querySelector(".preloader");
  const navbar = document.querySelector(".navbar");
  const backToTop = document.querySelector(".back-to-top");
  const counters = document.querySelectorAll("[data-counter]");
  const reveals = document.querySelectorAll(".reveal");
  const processTimelines = document.querySelectorAll(".process-timeline");
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const isHomePage = currentPage === "index.html";

  const initHomePreloader = () => {
    if (!preloader) return;

    const preloaderKey = "veeraGymPreloaderShown";

    /*
      sessionStorage lasts only for the current browser tab/session.
      The first time the Home page loads, we save this key after starting the
      animation. Any later navigation or refresh in the same session sees the
      key and removes the preloader immediately.
    */
    const hasPreloaderShown = (() => {
      try {
        return sessionStorage.getItem(preloaderKey) === "true";
      } catch (error) {
        return false;
      }
    })();

    if (!isHomePage || hasPreloaderShown) {
      preloader.remove();
      document.body.classList.remove("preloader-active");
      return;
    }

    try {
      sessionStorage.setItem(preloaderKey, "true");
    } catch (error) {
      // If storage is blocked, the preloader still runs normally for this load.
    }

    document.body.classList.add("preloader-active");

    const fireLayer = preloader.querySelector(".preloader-fire");
    const logo = preloader.querySelector(".preloader-logo");
    const barFill = preloader.querySelector(".preloader-bar-fill");
    const percent = preloader.querySelector(".preloader-percent");
    const particleCount = window.matchMedia("(max-width: 575.98px)").matches ? 24 : 42;

    if (fireLayer) {
      for (let i = 0; i < particleCount; i += 1) {
        const particle = document.createElement("span");
        particle.className = "fire-particle";
        particle.style.setProperty("--particle-size", `${Math.random() * 7 + 4}px`);
        fireLayer.appendChild(particle);
      }
    }

    const finishPreloader = () => {
      preloader.classList.add("is-complete");
      document.body.classList.remove("preloader-active");
      window.setTimeout(() => preloader.remove(), 700);
    };

    if (!window.gsap) {
      let start = 0;
      const duration = 2500;

      const tick = (time) => {
        if (!start) start = time;
        const progress = Math.min((time - start) / duration, 1);
        if (logo) logo.style.transform = `scale(${0.8 + progress * 0.2})`;
        if (barFill) barFill.style.transform = `scaleX(${progress})`;
        if (percent) percent.textContent = `${Math.round(progress * 100)}%`;
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          finishPreloader();
        }
      };

      requestAnimationFrame(tick);
      return;
    }

    const counter = { value: 0 };
    const timeline = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: finishPreloader
    });

    gsap.set(logo, {
      scale: 0.8,
      opacity: 0,
      filter: "drop-shadow(0 0 4px rgba(186, 0, 4, 0.35))"
    });

    gsap.set(barFill, { scaleX: 0 });

    gsap.utils.toArray(".fire-particle", preloader).forEach((particle, index) => {
      const driftX = gsap.utils.random(-180, 180);
      const driftY = gsap.utils.random(-185, -55);
      const delay = gsap.utils.random(0, 0.95);
      const duration = gsap.utils.random(1.15, 1.9);

      gsap.fromTo(
        particle,
        {
          x: gsap.utils.random(-90, 90),
          y: gsap.utils.random(42, 118),
          opacity: 0,
          scale: gsap.utils.random(0.45, 0.9)
        },
        {
          x: driftX,
          y: driftY,
          opacity: index % 5 === 0 ? 0.58 : 0.36,
          scale: gsap.utils.random(0.85, 1.55),
          duration,
          delay,
          repeat: -1,
          yoyo: false,
          ease: "sine.out",
          repeatRefresh: true
        }
      );
    });

    timeline
      .to(logo, {
        opacity: 1,
        scale: 1,
        filter: "drop-shadow(0 0 18px rgba(186, 0, 4, 0.84)) drop-shadow(0 0 42px rgba(186, 0, 4, 0.42))",
        duration: 2.05
      }, 0)
      .to(barFill, { scaleX: 1, duration: 2.5, ease: "none" }, 0)
      .to(counter, {
        value: 100,
        duration: 2.5,
        ease: "none",
        onUpdate: () => {
          if (percent) percent.textContent = `${Math.round(counter.value)}%`;
        }
      }, 0)
      .to(preloader, { opacity: 0, duration: 0.5, ease: "power2.inOut" }, 2.5);
  };

  initHomePreloader();

  const initCursorTrail = () => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const particles = [];
    const trailColor = "#ff1616";
    let width = 0;
    let height = 0;
    let mouseX = 0;
    let mouseY = 0;
    let lastX = 0;
    let lastY = 0;
    let hasMouse = false;

    canvas.className = "cursor-trail";
    document.body.appendChild(canvas);

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const addParticles = (x, y, amount = 5) => {
      for (let i = 0; i < amount; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2.3 + 0.4;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed - 0.7,
          vy: Math.sin(angle) * speed - 0.5,
          size: Math.random() * 2.8 + 1,
          life: Math.random() * 34 + 28,
          maxLife: 62,
          color: trailColor
        });
      }
    };

    window.addEventListener("mousemove", (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      if (!hasMouse) {
        lastX = mouseX;
        lastY = mouseY;
        hasMouse = true;
      }

      const distance = Math.hypot(mouseX - lastX, mouseY - lastY);
      const steps = Math.max(1, Math.min(8, Math.floor(distance / 10)));

      for (let i = 0; i < steps; i += 1) {
        const progress = i / steps;
        addParticles(
          lastX + (mouseX - lastX) * progress,
          lastY + (mouseY - lastY) * progress,
          3
        );
      }

      lastX = mouseX;
      lastY = mouseY;
    });

    window.addEventListener("resize", resize);
    resize();

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const particle = particles[i];
        particle.life -= 1;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.96;
        particle.vy *= 0.96;

        const opacity = Math.max(particle.life / particle.maxLife, 0);
        ctx.globalAlpha = opacity;
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 14;
        ctx.shadowColor = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * opacity, 0, Math.PI * 2);
        ctx.fill();

        if (particle.life <= 0) particles.splice(i, 1);
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      requestAnimationFrame(animate);
    };

    animate();
  };

  initCursorTrail();

  document.querySelectorAll(".navbar .nav-link, .footer a[data-page]").forEach((link) => {
    if (link.getAttribute("href") === currentPage) link.classList.add("active");
  });

  const onScroll = () => {
    const scrolled = window.scrollY > 70;
    navbar?.classList.toggle("scrolled", scrolled);
    backToTop?.classList.toggle("show", window.scrollY > 450);
  };

  window.addEventListener("scroll", onScroll);
  onScroll();

  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  reveals.forEach((el) => revealObserver.observe(el));

  const processObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("process-play");
        processObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.32 }
  );

  processTimelines.forEach((timeline) => processObserver.observe(timeline));

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const counter = entry.target;
        const target = Number(counter.dataset.counter);
        const duration = 1300;
        const start = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          counter.textContent = Math.floor(progress * target).toLocaleString();
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        counterObserver.unobserve(counter);
      });
    },
    { threshold: 0.7 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      document.querySelectorAll(".gallery-item").forEach((item) => {
        const show = filter === "all" || item.dataset.category === filter;
        item.style.display = show ? "" : "none";
      });
    });
  });

  document.querySelectorAll("[data-slider]").forEach((slider) => {
    const track = slider.querySelector(".testimonial-track");
    const slides = Array.from(slider.querySelectorAll(".testimonial-slide"));
    const prev = slider.querySelector("[data-slider-prev]");
    const next = slider.querySelector("[data-slider-next]");
    if (!track || slides.length === 0) return;

    let index = 0;
    let timer;
    let startX = 0;
    let deltaX = 0;
    let dragging = false;

    const visibleSlides = () => {
      if (window.innerWidth < 576) return 1;
      if (window.innerWidth < 992) return 2;
      return 3;
    };

    const maxIndex = () => Math.max(0, slides.length - visibleSlides());

    const updateSlider = () => {
      index = Math.min(Math.max(index, 0), maxIndex());
      const slideWidth = slides[0]?.getBoundingClientRect().width || 0;
      track.style.transform = `translate3d(-${slideWidth * index}px, 0, 0)`;
    };

    const goToNext = () => {
      index = index >= maxIndex() ? 0 : index + 1;
      updateSlider();
    };

    const goToPrev = () => {
      index = index <= 0 ? maxIndex() : index - 1;
      updateSlider();
    };

    const startAuto = () => {
      clearInterval(timer);
      timer = setInterval(goToNext, 3200);
    };

    const stopAuto = () => clearInterval(timer);

    next?.addEventListener("click", (event) => {
      event.stopPropagation();
      goToNext();
      startAuto();
    });

    prev?.addEventListener("click", (event) => {
      event.stopPropagation();
      goToPrev();
      startAuto();
    });

    slider.addEventListener("mouseenter", stopAuto);
    slider.addEventListener("mouseleave", startAuto);

    slider.addEventListener("pointerdown", (event) => {
      if (event.target.closest("[data-slider-prev], [data-slider-next]")) return;
      dragging = true;
      startX = event.clientX;
      deltaX = 0;
      stopAuto();
      slider.setPointerCapture?.(event.pointerId);
    });

    slider.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      deltaX = event.clientX - startX;
    });

    slider.addEventListener("pointerup", () => {
      if (!dragging) return;
      if (deltaX < -45) goToNext();
      if (deltaX > 45) goToPrev();
      dragging = false;
      startAuto();
    });

    slider.addEventListener("pointercancel", () => {
      dragging = false;
      startAuto();
    });

    window.addEventListener("resize", updateSlider);
    updateSlider();
    startAuto();
  });

  document.querySelectorAll(".newsletter").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector("input");
      if (!input.value.trim() || !input.checkValidity()) {
        input.classList.add("is-invalid");
        return;
      }
      input.classList.remove("is-invalid");
      input.value = "";
      alert("Thanks for subscribing!");
    });
  });

  const contactForm = document.querySelector("#contactForm");
  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = contactForm.querySelectorAll("input, textarea");
    let valid = true;

    fields.forEach((field) => {
      const value = field.value.trim();
      const phoneOk = field.name !== "phone" || /^[0-9+\-\s()]{7,16}$/.test(value);
      const fieldOk = value && field.checkValidity() && phoneOk;
      field.classList.toggle("is-invalid", !fieldOk);
      if (!fieldOk) valid = false;
    });

    if (!valid) return;

    alert("Message sent successfully. Our team will contact you soon.");
    contactForm.reset();
  });
});
