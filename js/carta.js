/* La Carta: pestañas por categoría, navegación anterior/siguiente, buscador,
   precios de los platos estrella y datos estructurados (JSON-LD) para Google.
   Todo sale de js/menu-data.js: edita allí los platos y precios. */
(() => {
  "use strict";
  const panel = document.getElementById("panel");
  if (!panel || typeof MENU === "undefined") return;

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fold = t => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); // sin tildes ni mayúsculas
  const peso = n => "S/ " + (Number.isInteger(n) ? n : n.toFixed(2));
  const isStar = name => typeof ESTRELLA !== "undefined" && ESTRELLA.includes(name);
  const smooth = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

  const tabsEl = $("#tabs"), app = $("#carta-app");
  const prevBtn = $("#prev"), nextBtn = $("#next"), countEl = $("#pager-count"), barEl = $("#pager-bar");
  const results = $("#resultados"), none = $("#sin-resultados");
  const input = $("#buscar"), clearBtn = $("#buscar-limpiar"), statusEl = $("#buscar-estado");
  const total = MENU.length;
  let cur = -1;

  /* ---------- Imágenes: si vienen de Unsplash se piden en varios tamaños ---------- */
  const imgAttrs = url => {
    try {
      const u = new URL(url, location.href);
      if (u.hostname !== "images.unsplash.com") return `src="${esc(url)}"`;
      const at = w => { const v = new URL(u); v.searchParams.set("w", w); return v.toString(); };
      const srcset = [480, 900, 1300].map(w => `${at(w)} ${w}w`).join(", ");
      return `src="${esc(at(900))}" srcset="${esc(srcset)}" sizes="(min-width: 900px) 42vw, 92vw"`;
    } catch { return `src="${esc(url)}"`; }
  };

  /* ---------- Resaltado de la búsqueda (ignora tildes) ---------- */
  const highlight = (text, q) => {
    if (!q) return esc(text);
    const chars = [...text], folded = chars.map(fold);
    if (folded.some(f => f.length !== 1)) return esc(text);
    const hay = folded.join(""), out = [];
    let from = 0, at;
    while ((at = hay.indexOf(q, from)) !== -1) {
      out.push(esc(chars.slice(from, at).join("")), `<mark>${esc(chars.slice(at, at + q.length).join(""))}</mark>`);
      from = at + q.length;
    }
    out.push(esc(chars.slice(from).join("")));
    return out.join("");
  };

  /* ---------- Un plato ---------- */
  const row = ([name, price, note], q = "") => {
    const star = isStar(name);
    return `<li class="row${star ? " row--star" : ""}"><div class="row__main"><span class="row__name">${star ? '<svg class="i i--star" aria-hidden="true"><use href="#i-star"/></svg><span class="sr-only">Plato estrella: </span>' : ""}${highlight(name, q)}</span>${note ? `<span class="row__note">${highlight(note, q)}</span>` : ""}</div><span class="row__dots" aria-hidden="true"></span><span class="row__price"><span aria-hidden="true">${peso(price)}</span><span class="sr-only">${price} soles</span></span></li>`;
  };

  /* ---------- Una categoría ---------- */
  const panelHTML = (cat, i, dir) => {
    const no = String(i + 1).padStart(2, "0");
    const hasStar = cat.items.some(it => isStar(it[0]));
    const media = cat.img
      ? `<figure class="spread__media"><div class="spread__frame"><img ${imgAttrs(cat.img)} alt="Imagen referencial de ${esc(cat.title)}" width="900" height="600" loading="lazy" decoding="async"></div></figure>`
      : "";
    return `<article class="spread${cat.img ? "" : " spread--noimg"}" data-dir="${dir > 0 ? "next" : "prev"}">${media}<div class="spread__body"><p class="spread__no">Nº ${no}</p><h3 class="spread__title">${esc(cat.title)}</h3>${cat.sub ? `<p class="spread__sub">${esc(cat.sub)}</p>` : ""}<ul class="rows">${cat.items.map(it => row(it)).join("")}</ul><p class="spread__foot"><span>${cat.img ? "Fotografía referencial" : ""}</span>${hasStar ? '<span><svg class="i i--star" aria-hidden="true"><use href="#i-star"/></svg>Plato estrella de la casa</span>' : ""}</p></div></article>`;
  };

  /* ---------- Pestañas ---------- */
  MENU.forEach((cat, i) => tabsEl.insertAdjacentHTML("beforeend",
    `<button class="tab" type="button" role="tab" id="tab-${esc(cat.id)}" aria-controls="panel" aria-selected="false" tabindex="-1" data-i="${i}">${esc(cat.title)}</button>`));
  const tabBtns = $$(".tab", tabsEl);

  const centerTab = btn => tabsEl.scrollTo({ left: btn.offsetLeft - (tabsEl.clientWidth - btn.offsetWidth) / 2, behavior: smooth });

  // Si el título de la categoría quedó tapado por el menú fijo, sube hasta él
  const ensureVisible = () => {
    const header = $("#header"), tabs = $(".tabs", app);
    const stuck = tabs && getComputedStyle(tabs).position === "sticky";   // en escritorio no es fija
    const limit = (header ? header.offsetHeight : 0) + (stuck ? tabs.offsetHeight : 0) + 12;
    const top = panel.getBoundingClientRect().top;
    if (top < limit) scrollTo({ top: scrollY + top - limit, behavior: smooth });
  };

  const show = (i, dir = 1, scroll = true) => {
    i = Math.max(0, Math.min(total - 1, i));
    if (i === cur) return;
    cur = i;
    panel.innerHTML = panelHTML(MENU[i], i, dir);
    panel.setAttribute("aria-labelledby", tabBtns[i].id);
    tabBtns.forEach((b, k) => { const on = k === i; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; });
    centerTab(tabBtns[i]);

    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === total - 1;
    const pl = i > 0 ? MENU[i - 1].title : "Anterior", nl = i < total - 1 ? MENU[i + 1].title : "Siguiente";
    $(".pager__label", prevBtn).textContent = pl;
    $(".pager__label", nextBtn).textContent = nl;
    prevBtn.setAttribute("aria-label", i > 0 ? `Categoría anterior: ${pl}` : "Categoría anterior");
    nextBtn.setAttribute("aria-label", i < total - 1 ? `Categoría siguiente: ${nl}` : "Categoría siguiente");
    countEl.textContent = `${i + 1} de ${total}`;
    barEl.style.width = ((i + 1) / total * 100) + "%";
    if (scroll) ensureVisible();
  };
  const go = i => show(i, i > cur ? 1 : -1);

  tabsEl.addEventListener("click", e => { const b = e.target.closest(".tab"); if (b) go(+b.dataset.i); });
  tabsEl.addEventListener("keydown", e => {   // flechas, Inicio y Fin (patrón ARIA de pestañas)
    let i;
    if (e.key === "ArrowRight") i = (cur + 1) % total;
    else if (e.key === "ArrowLeft") i = (cur - 1 + total) % total;
    else if (e.key === "Home") i = 0;
    else if (e.key === "End") i = total - 1;
    else return;
    e.preventDefault(); go(i); tabBtns[i].focus();
  });
  prevBtn.addEventListener("click", () => go(cur - 1));
  nextBtn.addEventListener("click", () => go(cur + 1));

  // Deslizar con el dedo para cambiar de categoría
  let sx = null, sy = null;
  panel.addEventListener("touchstart", e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  panel.addEventListener("touchend", e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    sx = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6) go(cur + (dx < 0 ? 1 : -1));
  });

  // Si una foto no carga, queda el fondo con el patrón de cangrejos
  panel.addEventListener("error", e => { if (e.target.tagName === "IMG") e.target.remove(); }, true);

  show(0, 1, false);

  /* ---------- Buscador ---------- */
  const search = raw => {
    const q = fold(raw.trim());
    clearBtn.hidden = !raw;
    if (!q) {
      app.hidden = false; results.hidden = true; none.hidden = true;
      results.innerHTML = ""; statusEl.textContent = "";
      return;
    }
    let count = 0, html = "";
    MENU.forEach(cat => {
      const hits = cat.items.filter(it => fold(`${it[0]} ${it[2]} ${cat.title}`).includes(q));
      if (!hits.length) return;
      count += hits.length;
      html += `<section class="results__group"><h3 class="results__title">${esc(cat.title)}</h3><ul class="rows">${hits.map(it => row(it, q)).join("")}</ul></section>`;
    });
    app.hidden = true;
    results.innerHTML = html;
    results.hidden = !count;
    none.hidden = count > 0;
    statusEl.textContent = count ? `${count} ${count === 1 ? "plato encontrado" : "platos encontrados"}` : "Sin resultados";
  };
  input.addEventListener("input", () => search(input.value));
  input.addEventListener("keydown", e => { if (e.key === "Escape" && input.value) { input.value = ""; search(""); } });
  clearBtn.addEventListener("click", () => { input.value = ""; search(""); input.focus(); });

  /* ---------- Platos estrella: el precio se lee de la carta (una sola fuente) ---------- */
  const findDish = name => { for (const c of MENU) for (const it of c.items) if (it[0] === name) return it; };
  $$("[data-dish]").forEach(card => {
    const it = findDish(card.dataset.dish), out = $(".dish__price", card);
    if (it && out) out.textContent = peso(it[1]);
  });

  /* ---------- Datos estructurados: añade la carta completa al JSON-LD del restaurante ---------- */
  try {
    const ld = $$('script[type="application/ld+json"]').find(s => s.textContent.includes('"Restaurant"'));
    if (ld) {
      const data = JSON.parse(ld.textContent);
      data.hasMenu = {
        "@type": "Menu", name: "Carta de Pepe Cangrejo", inLanguage: "es-PE",
        hasMenuSection: MENU.map(c => ({
          "@type": "MenuSection", name: c.title, ...(c.sub ? { description: c.sub } : {}),
          hasMenuItem: c.items.map(([n, p, note]) => ({
            "@type": "MenuItem", name: n, ...(note ? { description: note } : {}),
            offers: { "@type": "Offer", price: String(p), priceCurrency: "PEN" }
          }))
        }))
      };
      ld.textContent = JSON.stringify(data);
    }
  } catch { /* si falla, la web sigue funcionando igual */ }
})();
