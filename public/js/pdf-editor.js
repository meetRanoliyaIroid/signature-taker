document.addEventListener("DOMContentLoaded", function () {
  const filename = document.getElementById("pdf-filename").value;
  const pdfViewer = document.getElementById("pdf-viewer");
  const PDF_SCALE = 1.5;

  let selectedSignatureData = null;
  let placedSignatures = []; // { id, pageIndex, element, x, y, width, height, signatureData }
  let placementCounter = 0;
  let pageCanvases = [];

  // --- Load and render PDF ---
  async function loadPdf() {
    pdfViewer.innerHTML = "";
    const loadingTask = pdfjsLib.getDocument(`/uploads/${filename}`);
    const pdf = await loadingTask.promise;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: PDF_SCALE });

      const wrapper = document.createElement("div");
      wrapper.className = "pdf-page-wrapper";
      wrapper.dataset.pageIndex = i - 1;
      wrapper.style.width = viewport.width + "px";
      wrapper.style.height = viewport.height + "px";

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      wrapper.appendChild(canvas);

      // Page number label
      const label = document.createElement("div");
      label.style.cssText =
        "text-align:center;padding:4px;color:#fff;font-size:12px;";
      label.textContent = `Page ${i} of ${pdf.numPages}`;

      pdfViewer.appendChild(wrapper);
      pdfViewer.appendChild(label);
      pageCanvases.push({ canvas, wrapper, viewport });

      const ctx = canvas.getContext("2d");
      await page.render({ canvasContext: ctx, viewport }).promise;

      // Click on page to place signature
      wrapper.addEventListener("click", function (e) {
        if (!selectedSignatureData) {
          toastr.info("Select a signature from the panel first");
          return;
        }
        if (e.target.closest(".placed-signature")) return;

        const rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const pageIndex = parseInt(wrapper.dataset.pageIndex);

        placeSignature(pageIndex, x, y, wrapper);
      });
    }
  }

  // --- Signature panel selection ---
  document.querySelectorAll(".sig-item").forEach((item) => {
    item.addEventListener("click", function () {
      document
        .querySelectorAll(".sig-item")
        .forEach((el) => el.classList.remove("selected"));
      item.classList.add("selected");
      selectedSignatureData = item.dataset.signatureData;
    });
  });

  // --- Place signature on page ---
  function placeSignature(pageIndex, clickX, clickY, wrapper) {
    const sigWidth = 150;
    const sigHeight = 60;
    const x = clickX - sigWidth / 2;
    const y = clickY - sigHeight / 2;

    const id = ++placementCounter;

    const el = document.createElement("div");
    el.className = "placed-signature";
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.width = sigWidth + "px";
    el.style.height = sigHeight + "px";

    const img = document.createElement("img");
    img.src = selectedSignatureData;
    el.appendChild(img);

    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.innerHTML = "×";
    removeBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      el.remove();
      placedSignatures = placedSignatures.filter((p) => p.id !== id);
    });
    el.appendChild(removeBtn);

    // Resize handle
    const resizeHandle = document.createElement("div");
    resizeHandle.className = "resize-handle";
    el.appendChild(resizeHandle);

    wrapper.appendChild(el);

    const placement = {
      id,
      pageIndex,
      element: el,
      signatureData: selectedSignatureData,
    };
    placedSignatures.push(placement);

    makeDraggable(el, wrapper);
    makeResizable(el, resizeHandle, wrapper);
  }

  // --- Drag logic ---
  function makeDraggable(el, container) {
    let isDragging = false;
    let startX, startY, origLeft, origTop;

    el.addEventListener("mousedown", function (e) {
      if (e.target.closest(".resize-handle") || e.target.closest(".remove-btn"))
        return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      origLeft = parseInt(el.style.left);
      origTop = parseInt(el.style.top);
      e.preventDefault();
    });

    document.addEventListener("mousemove", function (e) {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newLeft = origLeft + dx;
      let newTop = origTop + dy;

      // Clamp within container
      const maxLeft = container.offsetWidth - el.offsetWidth;
      const maxTop = container.offsetHeight - el.offsetHeight;
      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));

      el.style.left = newLeft + "px";
      el.style.top = newTop + "px";
    });

    document.addEventListener("mouseup", function () {
      isDragging = false;
    });
  }

  // --- Resize logic ---
  function makeResizable(el, handle, container) {
    let isResizing = false;
    let startX, startY, origWidth, origHeight;

    handle.addEventListener("mousedown", function (e) {
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      origWidth = el.offsetWidth;
      origHeight = el.offsetHeight;
      e.stopPropagation();
      e.preventDefault();
    });

    document.addEventListener("mousemove", function (e) {
      if (!isResizing) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const newWidth = Math.max(50, origWidth + dx);
      const newHeight = Math.max(25, origHeight + dy);

      el.style.width = newWidth + "px";
      el.style.height = newHeight + "px";
    });

    document.addEventListener("mouseup", function () {
      isResizing = false;
    });
  }

  // --- Generate PDF ---
  document
    .getElementById("generate-btn")
    .addEventListener("click", async function () {
      if (placedSignatures.length === 0) {
        toastr.error("Place at least one signature on the PDF");
        return;
      }

      const btn = this;
      btn.disabled = true;
      btn.textContent = "Generating...";

      const placements = placedSignatures.map((p) => {
        const el = p.element;
        const leftPx = parseFloat(el.style.left);
        const topPx = parseFloat(el.style.top);
        const widthPx = el.offsetWidth;
        const heightPx = el.offsetHeight;

        return {
          pageIndex: p.pageIndex,
          x: leftPx / PDF_SCALE,
          y: topPx / PDF_SCALE,
          width: widthPx / PDF_SCALE,
          height: heightPx / PDF_SCALE,
          signatureData: p.signatureData,
        };
      });

      try {
        const response = await fetch("/pdf/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename, placements }),
        });

        const result = await response.json();

        if (result.success) {
          toastr.success(result.message);
          // Download the generated PDF
          const link = document.createElement("a");
          link.href = result.data.url;
          link.download = result.data.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          toastr.error(result.message);
        }
      } catch (err) {
        toastr.error("Failed to generate PDF");
      }

      btn.disabled = false;
      btn.textContent = "Save & Generate PDF";
    });

  // --- Init ---
  loadPdf().catch((err) => {
    pdfViewer.innerHTML =
      '<div class="text-white">Failed to load PDF. Please try again.</div>';
    console.error(err);
  });
});
