(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = t => t.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* 1. Navbar: transparente a sólido */
  const nav = $("#navbar");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 80);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* 2. Menú móvil (accesible, cierra con Escape) */
  const toggle = $("#menu-toggle"), mobile = $("#mobile-menu");
  const setMenu = open => {
    mobile.classList.toggle("open", open);
    mobile.setAttribute("aria-hidden", !open);
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    toggle.innerHTML = `<i class="fas fa-${open ? "times" : "bars"}"></i>`;
    document.body.classList.toggle("no-scroll", open);
  };
  toggle.addEventListener("click", () => setMenu(!mobile.classList.contains("open")));
  $$("a", mobile).forEach(a => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", e => e.key === "Escape" && setMenu(false));

  /* 3. Carta tipo libro: portada, índice, páginas con imagen referencial y contraportada */
  const tabs = $("#tabs"), panels = $("#panels"), prev = $("#prev"), next = $("#next"), count = $("#pagina"), bar = $("#progreso");
  const COVER = "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=900&q=75";
  const isStar = n => ESTRELLA.includes(n);
  const itemHTML = ([n, p, note]) => `<div class="item${isStar(n) ? " item--star" : ""}"><div><h4>${isStar(n) ? '<i class="fas fa-star star" title="Plato estrella"></i>' : ""}${esc(n)}</h4>${note ? `<p>${esc(note)}</p>` : ""}</div><span class="leader"></span><span class="price">S/ ${p.toFixed(2)}</span></div>`;
  const fig = (src, alt, cap) => `<figure class="spread__img"><img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" onerror="this.parentNode.classList.add('noimg');this.remove()"><figcaption>${cap}</figcaption></figure>`;

  const spreads = [{ type: "cover" }, { type: "toc" }], first = {};
  MENU.forEach((cat, ci) => {
    const parts = Math.ceil(cat.items.length / 7), per = Math.ceil(cat.items.length / parts);
    first[ci] = spreads.length;
    for (let k = 0; k < parts; k++) spreads.push({ type: "page", cat, ci, k, parts, items: cat.items.slice(k * per, (k + 1) * per) });
  });
  spreads.push({ type: "end" });
  MENU.forEach((cat, ci) => tabs.insertAdjacentHTML("beforeend", `<button class="tab" data-i="${first[ci]}">${esc(cat.title)}</button>`));

  const render = s => {
    if (s.type === "cover") return `<article class="spread cover">${fig(COVER, "Pepe Cangrejo", "<span>Cocina marina peruana</span><strong>Pepe Cangrejo</strong>")}
      <div class="spread__list center-page"><i class="fas fa-anchor emblem"></i><span class="eyebrow">Ancón · Lima</span><h3 class="book-title">La Carta</h3><div class="orn">◆</div>
      <p class="lead">Tradición y sabor del mar, plato por plato.</p><button class="btn btn--solid" data-go="1">Abrir la carta</button></div></article>`;
    if (s.type === "toc") return `<article class="spread">${fig(MENU[0].img, "Pulpa de cangrejo", "<span>Contenido</span><strong>Índice</strong>")}
      <div class="spread__list"><h3 class="tag">Índice</h3><ol class="toc">${MENU.map((c, ci) => `<li><button data-go="${first[ci]}"><span class="toc__n">${String(ci + 1).padStart(2, "0")}</span><span class="toc__t">${esc(c.title)}</span><span class="leader"></span><span class="toc__p">${first[ci] + 1}</span></button></li>`).join("")}</ol>
      <p class="spread__note"><i class="fas fa-star star"></i> Plato estrella de la casa</p></div></article>`;
    if (s.type === "end") return `<article class="spread cover">${fig(COVER, "Pepe Cangrejo", "<span>Gracias por visitarnos</span><strong>Pepe Cangrejo</strong>")}
      <div class="spread__list center-page"><i class="fas fa-heart emblem"></i><h3 class="book-title">¡Buen provecho!</h3><div class="orn">◆</div>
      <p class="lead">Reserva tu mesa o haz tu pedido por WhatsApp.</p>
      <a class="btn btn--solid" target="_blank" rel="noopener" href="https://wa.me/${CONFIG.phone}?text=Hola%20Pepe%20Cangrejo,%20quisiera%20hacer%20un%20pedido"><i class="fab fa-whatsapp"></i> Pedir por WhatsApp</a>
      <p class="spread__note">Lun - Dom · ${CONFIG.open}:00 AM - ${CONFIG.close - 12}:00 PM</p></div></article>`;
    const c = s.cat;
    return `<article class="spread">${fig(c.img, "Imagen referencial de " + c.title, `<span>Nº ${String(s.ci + 1).padStart(2, "0")}</span><strong>${esc(c.title)}</strong>${s.parts > 1 ? `<em>Parte ${s.k + 1} de ${s.parts}</em>` : ""}`)}
      <div class="spread__list"><h3 class="tag">${esc(c.title)}</h3><p class="sub">${esc(c.sub || "")}</p><div class="spread__items">${s.items.map(itemHTML).join("")}</div><p class="spread__note">Imagen referencial</p></div></article>`;
  };

  let cur = -1;
  const show = (i, dir = 1) => {
    i = Math.max(0, Math.min(spreads.length - 1, i));
    if (i === cur) return;
    const s = spreads[i];
    panels.innerHTML = render(s);
    panels.firstElementChild.classList.add(dir > 0 ? "turn-next" : "turn-prev");
    cur = i;
    $$(".tab", tabs).forEach(b => { const on = s.ci !== undefined && +b.dataset.i === first[s.ci]; b.classList.toggle("on", on); b.setAttribute("aria-current", on); });
    count.textContent = `Página ${i + 1} de ${spreads.length} · ${s.type === "cover" ? "Portada" : s.type === "toc" ? "Índice" : s.type === "end" ? "Última página" : s.cat.title}`;
    bar.style.width = ((i + 1) / spreads.length * 100) + "%";
    prev.disabled = i === 0; next.disabled = i === spreads.length - 1;
  };
  const go = t => show(t, t >= cur ? 1 : -1);
  $$(".tab", tabs).forEach(b => b.addEventListener("click", () => go(+b.dataset.i)));
  panels.addEventListener("click", e => { const g = e.target.closest("[data-go]"); if (g) go(+g.dataset.go); });
  prev.addEventListener("click", () => show(cur - 1, -1));
  next.addEventListener("click", () => show(cur + 1, 1));
  panels.addEventListener("keydown", e => { if (e.key === "ArrowRight") show(cur + 1, 1); if (e.key === "ArrowLeft") show(cur - 1, -1); });
  let x0 = null;
  panels.addEventListener("touchstart", e => x0 = e.touches[0].clientX, { passive: true });
  panels.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });
  show(0);

  /* 4. Scroll reveal (se anima una sola vez) */
  const io = new IntersectionObserver((entries, o) => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("active"); o.unobserve(e.target); }
  }), { threshold: 0.15 });
  $$(".reveal").forEach(el => io.observe(el));

  /* 5. Enlace activo según la sección visible */
  const links = $$('.nav__links a');
  const spy = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle("current", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach(s => spy.observe(s));

  /* 6. Año automático en el footer */
  $("#year").textContent = new Date().getFullYear();
})();
