/* Comportamiento general del sitio: cabecera, menú móvil, estado "abierto ahora",
   WhatsApp, reservas, mapa y animaciones. Los datos del negocio están en js/config.js. */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const C = typeof CONFIG !== "undefined" ? CONFIG : null;
  const pad = n => String(n).padStart(2, "0");

  /* ---------- Utilidades de hora (siempre en la zona horaria del restaurante) ---------- */
  const limaNow = () => {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
      timeZone: C.tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date()).map(x => [x.type, x.value]));
    return { date: `${p.year}-${p.month}-${p.day}`, minutes: +p.hour * 60 + +p.minute };
  };
  const time12 = m => { const h = Math.floor(m / 60); return `${((h + 11) % 12) + 1}:${pad(m % 60)} ${h < 12 ? "AM" : "PM"}`; };
  const addDays = (iso, n) => { const [y, m, d] = iso.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); };

  /* ---------- 1. WhatsApp y teléfono desde config.js ---------- */
  if (C) {
    $$("[data-wa]").forEach(a => {
      const msg = a.dataset.wa;
      a.href = `https://wa.me/${C.phone}` + (msg ? `?text=${encodeURIComponent(msg)}` : "");
    });
    if (C.phoneLabel) $$("[data-phone]").forEach(el => { el.textContent = C.phoneLabel; });
  }

  /* ---------- 2. Estado: abierto / cierra pronto / cerrado ---------- */
  if (C) {
    const updateStatus = () => {
      const m = limaNow().minutes, open = C.open * 60, close = C.close * 60;
      let cls = "", text;
      if (m >= open && m < close) {
        const soon = close - m <= 60;
        cls = soon ? "is-soon" : "is-open";
        text = `${soon ? "Cierra pronto" : "Abierto ahora"} · hasta las ${time12(close)}`;
      } else {
        text = `Cerrado ahora · abrimos ${m < open ? "hoy" : "mañana"} a las ${time12(open)}`;
      }
      $$(".status").forEach(el => {
        el.classList.remove("is-open", "is-soon");
        if (cls) el.classList.add(cls);
        const t = $(".status__text", el);
        if (t) t.textContent = text;
      });
    };
    updateStatus();
    setInterval(updateStatus, 60000);
  }

  /* ---------- 3. Scroll: cabecera, barra de progreso, barra móvil y botón "arriba" ---------- */
  const header = $("#header"), progress = $("#progress"), dock = $("#dock"), toTop = $("#to-top");
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
      if (header) header.classList.toggle("is-scrolled", y > 40 || header.classList.contains("header--solid"));
      if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      if (dock) dock.classList.toggle("is-visible", y > 480);
      if (toTop) toTop.hidden = y < 900;
      ticking = false;
    });
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }));

  /* ---------- 4. Menú móvil (accesible: foco atrapado, Escape, resto de la página inactiva) ---------- */
  const burger = $("#burger"), drawer = $("#drawer");
  if (burger && drawer) {
    const behind = $$("main, footer, #dock, .fab, #to-top");
    const setMenu = (open, returnFocus = false) => {
      drawer.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", open);
      burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      behind.forEach(el => { el.inert = open; });
      if (open) requestAnimationFrame(() => { const first = $("a", drawer); if (first) first.focus(); });
      else if (returnFocus) burger.focus();
    };
    burger.addEventListener("click", () => setMenu(!drawer.classList.contains("is-open"), true));
    $$("a", drawer).forEach(a => a.addEventListener("click", () => setMenu(false)));
    matchMedia("(min-width: 1024px)").addEventListener("change", e => { if (e.matches) setMenu(false); });
    document.addEventListener("keydown", e => {
      if (!drawer.classList.contains("is-open")) return;
      if (e.key === "Escape") { setMenu(false, true); return; }
      if (e.key !== "Tab") return;
      const f = [...$$("#header a, #header button"), ...$$("a[href], button", drawer)].filter(el => el.getClientRects().length);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- 5. Aparición al hacer scroll (una sola vez; luego se limpia la clase) ---------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, o) => entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add("is-in");
      o.unobserve(el);
      const delay = (parseFloat(getComputedStyle(el).getPropertyValue("--d")) || 0) * 90;
      setTimeout(() => el.classList.remove("reveal", "is-in"), 1100 + delay);
    }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add("is-in"));
  }

  /* ---------- 6. Enlace activo según la sección visible ---------- */
  const links = $$(".nav a");
  if (links.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => {
        const on = a.getAttribute("href") === "#" + en.target.id;
        a.classList.toggle("is-current", on);
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
    }), { rootMargin: "-45% 0px -50% 0px" });
    ["inicio", "nosotros", "estrella", "carta", "reservas", "contacto"].forEach(id => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- 7. Reservas → mensaje de WhatsApp ---------- */
  const form = $("#reserva-form");
  if (form && C) {
    const f = form.elements, msg = $("#reserva-msg");

    // Horas disponibles según el día: dentro del horario y, si es hoy, con anticipación mínima
    const slotsFor = iso => {
      const now = limaNow(), out = [];
      const first = C.open * 60, last = C.close * 60 - C.lastBookingBeforeClose;
      for (let m = first; m <= last; m += C.slotMinutes) {
        if (iso !== now.date || m >= now.minutes + C.minLeadMinutes) out.push(m);
      }
      return out;
    };
    const fillSlots = () => {
      const keep = f.hora.value, slots = slotsFor(f.fecha.value);
      f.hora.innerHTML = slots.length
        ? slots.map(m => `<option value="${time12(m)}">${time12(m)}</option>`).join("")
        : '<option value="">Sin horarios disponibles hoy: elige otra fecha</option>';
      if (!slots.length) return;
      const wanted = [...f.hora.options].find(o => o.value === keep) || [...f.hora.options].find(o => o.value === "1:00 PM");
      if (wanted) f.hora.value = wanted.value;
    };

    const today = limaNow().date;
    f.fecha.min = today;
    f.fecha.max = addDays(today, C.bookDaysAhead);
    f.fecha.value = slotsFor(today).length ? today : addDays(today, 1);
    fillSlots();
    f.fecha.addEventListener("change", fillSlots);

    form.addEventListener("submit", e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const d = Object.fromEntries(new FormData(form));
      const [y, m, dd] = d.fecha.split("-").map(Number);
      let fecha = new Intl.DateTimeFormat("es-PE", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, dd)));
      fecha = fecha.charAt(0).toUpperCase() + fecha.slice(1);
      const nombre = d.nombre.trim(), notas = d.notas.trim();
      const text = `Hola ${C.name}, quisiera reservar una mesa:\n• Nombre: ${nombre}\n• Personas: ${d.personas}\n• Fecha: ${fecha}\n• Hora: ${d.hora}` + (notas ? `\n• Comentarios: ${notas}` : "");
      const url = `https://wa.me/${C.phone}?text=${encodeURIComponent(text)}`;
      const w = window.open(url, "_blank");
      if (w) w.opener = null;
      msg.hidden = false;
      msg.innerHTML = `Listo, <strong>${esc(nombre)}</strong>: te llevamos a WhatsApp con tu reserva. Si no se abrió, <a href="${esc(url)}" target="_blank" rel="noopener">pulsa aquí</a>. Tu mesa queda confirmada cuando te respondamos en ese chat.`;
    });
  }

  /* ---------- 8. Mapa: se carga solo si el visitante lo pide (más rápido y más privado) ---------- */
  const mapBtn = $("#map-load"), stage = $("#map-stage");
  if (mapBtn && stage) {
    mapBtn.addEventListener("click", () => {
      const frame = document.createElement("iframe");
      frame.title = "Mapa de Pepe Cangrejo en Ancón";
      frame.loading = "lazy";
      frame.allowFullscreen = true;
      frame.referrerPolicy = "no-referrer-when-downgrade";
      frame.src = stage.dataset.src;
      stage.replaceChildren(frame);
    });
  }

  /* ---------- 9. Año automático en el pie ---------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
