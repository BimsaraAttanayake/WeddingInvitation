/* =========================================================
   Bimsara & Savindi — Wedding Invitation
   ========================================================= */
(() => {
  "use strict";

  /* ---------- Config ---------- */
  const WEDDING = {
    // 2 September 2027, start of day in Sri Lanka time (UTC+05:30)
    date: new Date("2027-09-02T00:00:00+05:30"),
    venue: "Seethawaka Regency, Avissawella, Sri Lanka",
    title: "Bimsara & Savindi's Wedding",
  };
  // Optional: put a WhatsApp number with country code (e.g. "94771234567")
  // and RSVPs will open as a pre-filled WhatsApp message to you.
  const WHATSAPP_NUMBER = "";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------- Scroll progress bar ---------- */
  const progress = document.createElement("div");
  progress.className = "progress";
  document.body.prepend(progress);

  /* ---------- Split hero names into letters ---------- */
  let letterIndex = 0;
  $$(".hero .name").forEach((el) => {
    const text = el.textContent.trim();
    el.setAttribute("aria-label", text);
    el.textContent = "";
    [...text].forEach((ch) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.setAttribute("aria-hidden", "true");
      s.style.setProperty("--i", letterIndex++);
      s.textContent = ch;
      el.appendChild(s);
    });
    letterIndex += 2;
  });

  /* ---------- Floating golden orbs in dark sections ---------- */
  $$(".section--dark").forEach((sec) => {
    const n = innerWidth < 700 ? 7 : 14;
    for (let i = 0; i < n; i++) {
      const o = document.createElement("span");
      o.className = "orb";
      const size = rand(10, 46);
      Object.assign(o.style, {
        width: size + "px", height: size + "px",
        left: rand(0, 100) + "%", top: rand(30, 100) + "%",
      });
      o.style.setProperty("--t", rand(9, 20) + "s");
      o.style.setProperty("--x", rand(-80, 80) + "px");
      o.style.setProperty("--y", rand(-260, -80) + "px");
      o.style.setProperty("--o", rand(.25, .7));
      o.style.animationDelay = rand(0, 10) + "s";
      sec.appendChild(o);
    }
  });

  /* =========================================================
     PARTICLE ENGINE — petals, sparkles, confetti
     ========================================================= */
  const canvas = $("#petals");
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, DPR = 1;
  const particles = [];
  const PETAL_COLORS = ["#f7d6d0", "#eab8ad", "#fff3df", "#f4e0a6", "#fbe9e4", "#e6c77f"];
  const CONFETTI_COLORS = ["#f4e0a6", "#d2a954", "#eab8ad", "#fff3df", "#1d6b5f", "#e06a7a", "#ffffff"];
  let petalsEnabled = false;

  function resize() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  addEventListener("resize", resize);
  resize();

  function spawnPetal(anywhere = false) {
    particles.push({
      type: "petal",
      x: rand(-50, W + 50), y: anywhere ? rand(-50, H) : rand(-80, -20),
      vx: rand(-.3, .5), vy: rand(.5, 1.4),
      s: rand(6, 13), rot: rand(0, Math.PI * 2), vr: rand(-.02, .02),
      flip: rand(0, Math.PI * 2), vf: rand(.02, .06),
      sway: rand(0, Math.PI * 2), swayAmp: rand(.3, .9),
      color: PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0],
      life: 1,
    });
  }

  function burst(x, y, count = 40, kind = "gold") {
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(2, kind === "confetti" ? 12 : 7);
      particles.push({
        type: kind === "confetti" ? "confetti" : "spark",
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (kind === "confetti" ? 4 : 1),
        s: kind === "confetti" ? rand(5, 10) : rand(2, 6),
        rot: rand(0, 6), vr: rand(-.3, .3), flip: rand(0, 6), vf: rand(.1, .3),
        color: kind === "confetti" ? CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0] : (Math.random() < .5 ? "#f4e0a6" : "#ffffff"),
        life: 1, decay: rand(.008, .02), grav: kind === "confetti" ? .22 : .06, drag: .985,
      });
    }
  }

  function trail(x, y) {
    particles.push({
      type: "spark", x: x + rand(-4, 4), y: y + rand(-4, 4),
      vx: rand(-.6, .6), vy: rand(-.2, 1), s: rand(2, 5), rot: rand(0, 6), vr: rand(-.1, .1),
      color: Math.random() < .6 ? "#f4e0a6" : "#ffffff", life: 1, decay: .03, grav: .02, drag: .96,
    });
  }

  function drawStar(s) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const r = i % 2 ? s * .25 : s;
      const a = (Math.PI / 4) * i;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
  }

  let last = 0;
  function frame(t) {
    requestAnimationFrame(frame);
    const dt = Math.min((t - last) / 16.67 || 1, 3);
    last = t;
    ctx.clearRect(0, 0, W, H);

    // ambient petals
    const petalCount = particles.reduce((n, p) => n + (p.type === "petal" ? 1 : 0), 0);
    const target = innerWidth < 700 ? 16 : 32;
    if (petalsEnabled && petalCount < target && Math.random() < .08 * dt) spawnPetal();

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (p.type === "petal") {
        p.sway += .02 * dt;
        p.x += (p.vx + Math.sin(p.sway) * p.swayAmp) * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt; p.flip += p.vf * dt;
        if (p.y > H + 40) { particles.splice(i, 1); continue; }
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.scale(Math.cos(p.flip), 1);
        ctx.globalAlpha = .85;
        ctx.fillStyle = p.color;
        ctx.shadowColor = "rgba(0,0,0,.15)"; ctx.shadowBlur = 4;
        const s = p.s;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.bezierCurveTo(s * .95, -s * .6, s * .7, s * .7, 0, s);
        ctx.bezierCurveTo(-s * .7, s * .7, -s * .95, -s * .6, 0, -s);
        ctx.fill();
        ctx.restore();
      } else {
        p.vx *= p.drag; p.vy = p.vy * p.drag + p.grav * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.life -= p.decay * dt;
        if (p.life <= 0 || p.y > H + 30) { particles.splice(i, 1); continue; }
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        if (p.type === "confetti") {
          p.flip += p.vf * dt;
          ctx.scale(1, Math.cos(p.flip));
          ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        } else {
          ctx.shadowColor = p.color; ctx.shadowBlur = 8;
          drawStar(p.s);
        }
        ctx.restore();
      }
    }
  }
  if (!reduced) requestAnimationFrame(frame);

  /* Cursor sparkle trail */
  if (finePointer && !reduced) {
    let lastTrail = 0;
    addEventListener("pointermove", (e) => {
      const now = performance.now();
      if (now - lastTrail > 28 && document.body.classList.contains("opened")) {
        trail(e.clientX, e.clientY);
        lastTrail = now;
      }
    });
  }
  /* Click sparkle */
  addEventListener("click", (e) => {
    if (!reduced && document.body.classList.contains("opened") && !e.target.closest("form")) burst(e.clientX, e.clientY, 14);
  });

  /* =========================================================
     ENVELOPE OPEN
     ========================================================= */
  const intro = $("#intro");
  const openBtn = $("#openBtn");
  const nav = $("#nav");
  let opened = false;

  function openInvitation() {
    if (opened) return;
    opened = true;
    const r = openBtn.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 60);
    intro.classList.add("open");

    setTimeout(() => {
      const l = $(".envelope__letter").getBoundingClientRect();
      burst(l.left + l.width / 2, l.top + l.height / 2, 80);
    }, 1100);

    setTimeout(() => {
      intro.classList.add("gone");
      document.body.classList.remove("locked");
      document.body.classList.add("opened");
      window.scrollTo(0, 0);
      petalsEnabled = true;
      for (let i = 0; i < 18; i++) spawnPetal(true);
      startReveals();
    }, 2300);

    setTimeout(() => { intro.style.display = "none"; }, 4300);
  }
  openBtn.addEventListener("click", openInvitation);
  $("#envelope").addEventListener("click", openInvitation);

  /* =========================================================
     SCROLL REVEAL (staggered)
     ========================================================= */
  function startReveals() {
    // stagger siblings within each section
    $$("section, header").forEach((sec) => {
      $$(".reveal", sec).forEach((el, i) => {
        el.style.transitionDelay = Math.min(i * 0.12, 0.9) + (sec.classList.contains("hero") ? 1.3 : 0) + "s";
      });
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          if (en.target.id === "calendar") en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: .15, rootMargin: "0px 0px -6% 0px" });
    $$(".reveal").forEach((el) => io.observe(el));
    // calendar days animate once the calendar enters
    const calIO = new IntersectionObserver((en) => {
      if (en[0].isIntersecting) { $("#calendar").classList.add("in"); calIO.disconnect(); }
    }, { threshold: .3 });
    calIO.observe($("#calendar"));
  }
  if (reduced) { document.body.classList.remove("locked"); intro.style.display = "none"; document.body.classList.add("opened"); startReveals(); }

  /* =========================================================
     MOBILE MENU
     ========================================================= */
  const menu = $("#menu");
  const toggle = $("#navToggle");
  $$("a", menu).forEach((a, i) => a.style.setProperty("--i", i));
  function setMenu(open) {
    menu.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.setAttribute("aria-hidden", String(!open));
  }
  toggle.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  matchMedia("(min-width: 721px)").addEventListener?.("change", (e) => { if (e.matches) setMenu(false); });

  /* =========================================================
     SCROLL EFFECTS — parallax, nav, progress
     ========================================================= */
  const heroBg = $(".hero__bg");
  const heroContent = $(".hero__content");
  let ticking = false;
  function onScroll() {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle("solid", y > 60);
    if (y < innerHeight * 1.2) {
      heroBg.style.transform = `translate3d(0, ${y * .35}px, 0)`;
      heroContent.style.transform = `translate3d(0, ${y * .18}px, 0)`;
      heroContent.style.opacity = Math.max(1 - y / (innerHeight * .8), 0);
    }
    ticking = false;
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  /* =========================================================
     COUNTDOWN (with flip on change)
     ========================================================= */
  const cd = { d: $("#cd-d"), h: $("#cd-h"), m: $("#cd-m"), s: $("#cd-s") };
  function setCd(el, val) {
    if (el.textContent !== val) {
      el.textContent = val;
      el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick");
    }
  }
  function updateCountdown() {
    let diff = WEDDING.date - new Date();
    if (diff <= 0) {
      $("#countdown .title").innerHTML = "We are <em>married!</em>";
      diff = 0;
    }
    const d = Math.floor(diff / 864e5);
    const h = Math.floor(diff / 36e5) % 24;
    const m = Math.floor(diff / 6e4) % 60;
    const s = Math.floor(diff / 1e3) % 60;
    setCd(cd.d, String(d).padStart(3, "0"));
    setCd(cd.h, String(h).padStart(2, "0"));
    setCd(cd.m, String(m).padStart(2, "0"));
    setCd(cd.s, String(s).padStart(2, "0"));
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* =========================================================
     CALENDAR — September 2027
     ========================================================= */
  (function buildCalendar() {
    const el = $("#calendar");
    const year = 2027, month = 8; // September
    const first = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    let html = `<div class="cal__head">September<small>2027</small></div><div class="cal__grid">`;
    ["S", "M", "T", "W", "T", "F", "S"].forEach((d) => (html += `<div class="cal__dow">${d}</div>`));
    for (let i = 0; i < first; i++) html += "<div></div>";
    for (let d = 1; d <= days; d++) {
      html += `<div class="cal__day${d === 2 ? " is-day" : ""}" style="--n:${d}">${d}</div>`;
    }
    html += "</div>";
    el.innerHTML = html;
  })();

  /* Add to calendar (.ics) */
  $("#addCal").addEventListener("click", () => {
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Bimsara & Savindi//Wedding//EN",
      "BEGIN:VEVENT",
      "UID:bimsara-savindi-wedding-20270902@invite",
      "DTSTAMP:20261017T000000Z",
      "DTSTART;VALUE=DATE:20270902",
      "DTEND;VALUE=DATE:20270903",
      `SUMMARY:${WEDDING.title}`,
      `LOCATION:${WEDDING.venue}`,
      "DESCRIPTION:Join us as we celebrate our wedding!",
      "BEGIN:VALARM", "TRIGGER:-P7D", "ACTION:DISPLAY", "DESCRIPTION:Wedding in one week!", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "Bimsara-Savindi-Wedding.ics";
    document.body.appendChild(a); a.click(); a.remove();
    const r = $("#addCal").getBoundingClientRect();
    burst(r.left + r.width / 2, r.top, 30);
  });

  /* =========================================================
     3D TILT on cards
     ========================================================= */
  if (finePointer && !reduced) {
    $$(".person, .datecard, .venue__info").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        if (!card.closest(".reveal.in")) return;
        card.classList.add("tilt-ready");
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(800px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.03)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  /* =========================================================
     RSVP
     ========================================================= */
  const form = $("#rsvpForm");
  const guestsField = $("#guestsField");
  $$('input[name="attend"]').forEach((r) =>
    r.addEventListener("change", () => guestsField.classList.toggle("hide", r.value === "no" && r.checked))
  );

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#guestName").value.trim();
    const err = $("#formError");
    if (!name) {
      err.hidden = false;
      err.style.animation = "none"; void err.offsetWidth; err.style.animation = "";
      $("#guestName").focus();
      return;
    }
    err.hidden = true;
    const attending = form.attend.value === "yes";
    const guests = $("#guestCount").value;
    const msg = $("#guestMsg").value.trim();

    // keep a local copy
    try {
      const all = JSON.parse(localStorage.getItem("rsvps") || "[]");
      all.push({ name, attending, guests: attending ? guests : 0, msg, at: new Date().toISOString() });
      localStorage.setItem("rsvps", JSON.stringify(all));
    } catch (_) { /* ignore */ }

    // optional WhatsApp hand-off
    if (WHATSAPP_NUMBER) {
      const text = `Hi! This is ${name}. ${attending ? `I'll be joining your wedding with ${guests} guest(s) 🎉` : "Sadly I can't make it, but I'll be thinking of you both 💛"}${msg ? `\n\n${msg}` : ""}`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    }

    form.hidden = true;
    const th = $("#thanks");
    $("#thanksTitle").textContent = attending ? `See you there, ${name.split(" ")[0]}!` : `We'll miss you, ${name.split(" ")[0]}`;
    $("#thanksText").textContent = attending
      ? "Your RSVP has been received. We can't wait to celebrate with you on 2nd September 2027 at Seethawaka Regency."
      : "Thank you for letting us know. You'll be in our hearts on our special day.";
    th.hidden = false;
    th.scrollIntoView({ behavior: "smooth", block: "center" });
    if (attending && !reduced) {
      const r = th.getBoundingClientRect();
      burst(r.left + r.width / 2, Math.max(r.top, 120), 140, "confetti");
      setTimeout(() => burst(innerWidth * .2, innerHeight * .6, 70, "confetti"), 300);
      setTimeout(() => burst(innerWidth * .8, innerHeight * .6, 70, "confetti"), 500);
    }
  });
})();
