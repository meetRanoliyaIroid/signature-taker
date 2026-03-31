document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("signature-canvas");
  if (!canvas) return;

  const signaturePad = new SignaturePad(canvas, {
    backgroundColor: "rgb(255, 255, 255)",
    penColor: "rgb(0, 0, 0)",
  });

  // Handle canvas resize for HiDPI displays
  function resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
    signaturePad.clear();
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Clear button
  document.getElementById("clear-btn").addEventListener("click", function () {
    signaturePad.clear();
  });

  // Undo button
  document.getElementById("undo-btn").addEventListener("click", function () {
    const data = signaturePad.toData();
    if (data.length) {
      data.pop();
      signaturePad.fromData(data);
    }
  });

  // Save button
  document.getElementById("save-btn").addEventListener("click", async function () {
    if (signaturePad.isEmpty()) {
      toastr.error("Please draw your signature first");
      return;
    }

    const signerName = document.getElementById("signer-name").value.trim();
    if (!signerName) {
      toastr.error("Please enter your name");
      return;
    }

    const signatureData = signaturePad.toDataURL("image/png");

    try {
      const response = await fetch("/signatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signer_name: signerName,
          signer_email: document.getElementById("signer-email").value.trim(),
          signature_data: signatureData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toastr.success(result.message);
        signaturePad.clear();
        document.getElementById("signer-name").value = "";
        document.getElementById("signer-email").value = "";
      } else {
        toastr.error(result.message);
      }
    } catch (error) {
      toastr.error("Failed to save signature. Please try again.");
    }
  });
});
