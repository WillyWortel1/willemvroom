import * as pdfjs from "/pdfjs/pdf.min.mjs";
pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
for (const box of document.querySelectorAll(".pdfview[data-src]")) {
  const st = box.querySelector(".pdf-status");
  try {
    const doc = await pdfjs.getDocument(box.dataset.src).promise;
    if (st) st.remove();
    const pages = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const vp = page.getViewport({ scale: 1 });
      const c = document.createElement("canvas");
      c.style.aspectRatio = vp.width + " / " + vp.height;
      c.setAttribute("aria-label", "Pagina " + i);
      box.appendChild(c);
      pages.push({ page, vp, c, w: 0 });
    }
    const draw = async (p) => {
      const w = box.clientWidth; if (!w || p.w === w || p.busy) return;
      p.busy = true; p.w = w;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const v = p.page.getViewport({ scale: (w / p.vp.width) * dpr });
      const off = document.createElement("canvas");
      off.width = Math.floor(v.width); off.height = Math.floor(v.height);
      await p.page.render({ canvasContext: off.getContext("2d"), viewport: v }).promise;
      p.c.width = off.width; p.c.height = off.height;
      p.c.getContext("2d").drawImage(off, 0, 0);
      off.width = off.height = 0; p.busy = false;
    };
    const vis = new Set();
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const p = pages.find((x) => x.c === e.target);
      if (e.isIntersecting) { vis.add(p); draw(p); } else vis.delete(p);
    }), { rootMargin: "1200px 0px" });
    pages.forEach((p) => io.observe(p.c));
    let t; addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => vis.forEach(draw), 250); });
  } catch (e) { if (st) st.textContent = box.dataset.err || "PDF kon niet worden geladen."; }
}
