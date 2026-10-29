(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const { phone, name, tz } = CONFIG;

  /* Número de WhatsApp centralizado en config.js */
  $$('a[href*="wa.me"]').forEach(a => a.href = a.href.replace("51957816255", phone));

  /* Estado "Abierto ahora" según hora de Lima */
  const hour = +new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: tz }).format(new Date());
  const isOpen = hour >= CONFIG.open && hour < CONFIG.close;
  $$(".status").forEach(el => {
    el.classList.toggle("is-open", isOpen);
    el.firstElementChild.textContent = isOpen ? `Abierto ahora · hasta las ${CONFIG.close - 12}:00 PM` : `Cerrado ahora · abrimos a las ${CONFIG.open}:00 AM`;
  });

  /* Reserva → mensaje de WhatsApp */
  const form = $("#reserva-form");
  form.fecha.min = new Date().toLocaleDateString("en-CA", { timeZone: tz });
  form.addEventListener("submit", e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const msg = `Hola ${name}, quisiera reservar una mesa:\n• Nombre: ${d.nombre}\n• Personas: ${d.personas}\n• Fecha: ${d.fecha}\n• Hora: ${d.hora}` + (d.notas ? `\n• Comentarios: ${d.notas}` : "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  });

  /* Buscador de la carta (ignora tildes y mayúsculas) */
  const norm = t => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const libro = $("#libro"), tabs = $("#tabs"), res = $("#resultados"), none = $("#sin-resultados");
  const row = ([n, p, note]) => `<div class="item"><div><h4>${n}</h4>${note ? `<p>${note}</p>` : ""}</div><span class="leader"></span><span class="price">S/ ${p.toFixed(2)}</span></div>`;
  $("#buscar").addEventListener("input", e => {
    const v = norm(e.target.value.trim());
    let total = 0, html = "";
    if (v) MENU.forEach(c => {
      const it = c.items.filter(i => norm(i[0] + " " + i[2]).includes(v));
      if (it.length) { total += it.length; html += `<section class="results__group"><h3 class="tag">${c.title}</h3><div class="spread__items">${it.map(row).join("")}</div></section>`; }
    });
    res.innerHTML = html;
    res.hidden = !v || !total; libro.hidden = !!v; tabs.hidden = !!v; none.hidden = !v || total > 0;
  });

  /* Botón volver arriba */
  const top = $("#top");
  addEventListener("scroll", () => top.hidden = scrollY < 700, { passive: true });
  top.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
})();
