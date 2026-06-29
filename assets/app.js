/* ============================================================
   IRON//FORGE — shared logic
   Product catalog, image fallbacks, cart toast, boot intro.
   Frontend only — no backend required.
   ============================================================ */

/* ---- Product catalog --------------------------------------
   Images live in /products as product1.jpg ... product10.jpg
   (the loader also auto-tries .png / .jpeg / .webp, and shows
   a neon placeholder if the file isn't there yet).
   Edit names / specs / prices freely.
------------------------------------------------------------ */
const PRODUCTS = [
  { id: 1,  name: "Hex Bolt M8 // Titan-X",    cat: "bolts",   spec: "M8 × 50mm · Grade 12.9 · Zinc-plated alloy steel", price: 0.45, unit: "/ unit", badge: "hot",  badgeText: "Best Seller" },
  { id: 2,  name: "Hex Nut M8 // CoreLock",    cat: "nuts",    spec: "M8 · DIN 934 · Hardened steel · Anti-vibration",   price: 0.18, unit: "/ unit", badge: "new",  badgeText: "New" },
  { id: 3,  name: "Socket Cap Screw M6",       cat: "bolts",   spec: "M6 × 30mm · Allen drive · Black oxide finish",     price: 0.32, unit: "/ unit", badge: "",     badgeText: "" },
  { id: 4,  name: "Wing Nut M10 // FlightGrip",cat: "nuts",    spec: "M10 · Tool-free tighten · Galvanized",            price: 0.55, unit: "/ unit", badge: "",     badgeText: "" },
  { id: 5,  name: "Carriage Bolt M12",         cat: "bolts",   spec: "M12 × 80mm · Dome head · Hot-dip galvanized",     price: 0.95, unit: "/ unit", badge: "hot",  badgeText: "Pro Pick" },
  { id: 6,  name: "Lock Washer Set // 200pc",  cat: "washers", spec: "Split + flat · M4–M12 · Stainless 304 kit",      price: 8.90, unit: "/ kit",  badge: "new",  badgeText: "Kit" },
  { id: 7,  name: "Anchor Bolt M16 // Bedrock",cat: "bolts",   spec: "M16 × 150mm · Concrete sleeve anchor · HDG",      price: 2.40, unit: "/ unit", badge: "",     badgeText: "" },
  { id: 8,  name: "Flange Nut M8 // SpreadX",   cat: "nuts",    spec: "M8 · Serrated flange · No washer needed",         price: 0.22, unit: "/ unit", badge: "",     badgeText: "" },
  { id: 9,  name: "Threaded Rod 1m // M10",     cat: "rods",    spec: "M10 × 1000mm · Full thread · Zinc steel",        price: 3.75, unit: "/ rod",  badge: "",     badgeText: "" },
  { id: 10, name: "Master Bolt Kit // 1000pc",  cat: "kits",    spec: "Assorted bolts·nuts·washers · Sorted case",       price: 29.0, unit: "/ case", badge: "hot",  badgeText: "Mega Kit" },
];

const CURRENCY = "$"; // change to your local currency symbol if you like

/* ---- Image loader with fallback chain --------------------- */
const IMG_EXTS = ["jpg", "png", "jpeg", "webp", "JPG", "PNG"];

function neonPlaceholder(p) {
  // Inline SVG used when product{N}.* doesn't exist yet.
  const svg = `
  <svg class="ph" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${p.name}">
    <defs>
      <radialGradient id="g${p.id}" cx="50%" cy="40%" r="70%">
        <stop offset="0%" stop-color="#161235"/><stop offset="100%" stop-color="#06040f"/>
      </radialGradient>
    </defs>
    <rect width="400" height="400" fill="url(#g${p.id})"/>
    <g stroke="#00f0ff" stroke-opacity="0.12" stroke-width="1">
      ${[80,160,240,320].map(v=>`<line x1="${v}" y1="0" x2="${v}" y2="400"/><line x1="0" y1="${v}" x2="400" y2="${v}"/>`).join("")}
    </g>
    <!-- hex bolt glyph -->
    <g transform="translate(200,170)">
      <polygon points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30" fill="none" stroke="#00f0ff" stroke-width="6" opacity="0.9"/>
      <polygon points="0,-34 30,-17 30,17 0,34 -30,17 -30,-17" fill="none" stroke="#ff2bd6" stroke-width="5"/>
      <circle r="10" fill="#00ff9c"/>
    </g>
    <text x="200" y="300" fill="#6f8aa0" font-family="monospace" font-size="20" text-anchor="middle" letter-spacing="3">IMG_${String(p.id).padStart(2,"0")}</text>
    <text x="200" y="330" fill="#00f0ff" font-family="monospace" font-size="13" text-anchor="middle" letter-spacing="2">DROP PHOTO IN /products</text>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

function loadProductImage(img, p) {
  let i = 0;
  img.onerror = () => {
    i++;
    if (i < IMG_EXTS.length) {
      img.src = `products/product${p.id}.${IMG_EXTS[i]}`;
    } else {
      img.onerror = null;
      img.src = neonPlaceholder(p);
    }
  };
  img.src = `products/product${p.id}.${IMG_EXTS[0]}`;
}

/* ---- Render product cards --------------------------------- */
function productCard(p) {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.cat = p.cat;
  const badge = p.badge
    ? `<span class="badge ${p.badge}">${p.badgeText}</span>` : "";
  card.innerHTML = `
    <div class="imgwrap">
      ${badge}
      <img alt="${p.name}">
    </div>
    <div class="body">
      <div class="cat">${p.cat}</div>
      <h3>${p.name}</h3>
      <div class="spec">${p.spec}</div>
      <div class="row">
        <div class="price">${CURRENCY}${p.price.toFixed(2)} <small>${p.unit}</small></div>
        <button class="add" data-name="${p.name}">+ Add</button>
      </div>
    </div>`;
  loadProductImage(card.querySelector("img"), p);
  card.querySelector(".add").addEventListener("click", e => addToCart(e.target.dataset.name));
  attachTilt(card);
  return card;
}

function renderProducts(targetId, limit) {
  const host = document.getElementById(targetId);
  if (!host) return;
  const list = limit ? PRODUCTS.slice(0, limit) : PRODUCTS;
  list.forEach(p => host.appendChild(productCard(p)));
}

/* ---- Filter chips ----------------------------------------- */
function initFilters() {
  const chips = document.querySelectorAll(".chip");
  if (!chips.length) return;
  chips.forEach(chip => chip.addEventListener("click", () => {
    chips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    const f = chip.dataset.filter;
    document.querySelectorAll(".card").forEach(card => {
      const show = f === "all" || card.dataset.cat === f;
      card.style.display = show ? "" : "none";
    });
  }));
}

/* ---- Fake cart (no backend) ------------------------------- */
let cartCount = 0;
function addToCart(name) {
  cartCount++;
  toast(`ADDED // ${name}`);
  const c = document.getElementById("cartCount");
  if (c) c.textContent = cartCount;
}
function toast(msg) {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; document.body.appendChild(wrap); }
  const t = document.createElement("div");
  t.className = "toast"; t.textContent = "> " + msg;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}

/* ---- Subtle 3D tilt on hover (skipped on touch devices) --- */
const SUPPORTS_HOVER = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
function attachTilt(el) {
  if (!SUPPORTS_HOVER) return; // avoid stuck transforms on phones/tablets
  const max = 6;
  el.addEventListener("mousemove", e => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `translateY(-6px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`;
  });
  el.addEventListener("mouseleave", () => { el.style.transform = ""; });
}

/* ---- Mobile hamburger nav --------------------------------- */
function initNav() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;
  const setOpen = open => {
    links.classList.toggle("open", open);
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  };
  toggle.addEventListener("click", () => setOpen(!links.classList.contains("open")));
  // Close the menu after tapping a link.
  links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setOpen(false)));
  // Close when resizing back up to desktop.
  window.addEventListener("resize", () => { if (window.innerWidth > 760) setOpen(false); });
}

/* ---- Animated stat counters ------------------------------- */
function initCounters() {
  const nums = document.querySelectorAll(".num[data-to]");
  if (!nums.length) return;
  const run = el => {
    const to = parseFloat(el.dataset.to);
    const suffix = el.dataset.suffix || "";
    const dur = 1400; const start = performance.now();
    const step = now => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = to * eased;
      el.textContent = (to % 1 === 0 ? Math.round(val) : val.toFixed(1)).toLocaleString() + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
  }, { threshold: 0.4 });
  nums.forEach(n => io.observe(n));
}

/* ---- Boot intro overlay ----------------------------------- */
function initBoot() {
  const boot = document.getElementById("boot");
  if (!boot) return;
  // Only show the intro once per browser session.
  if (sessionStorage.getItem("ironforge_booted")) { boot.remove(); return; }
  const lines = boot.querySelectorAll(".line");
  let d = 250;
  lines.forEach((ln, idx) => {
    setTimeout(() => ln.classList.add("show"), d);
    d += 360 + (idx === lines.length - 1 ? 200 : 0);
  });
  setTimeout(() => {
    boot.classList.add("hide");
    sessionStorage.setItem("ironforge_booted", "1");
    setTimeout(() => boot.remove(), 600);
  }, d + 500);
}

/* ---- Boot it all ------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initBoot();
  initCounters();
  initFilters();
});
