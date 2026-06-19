document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("models-container");

  // =====================================
  // 言語判定
  // =====================================

  const path = window.location.pathname;
  let currentLang = "ja";
  if (path.includes("/en/")) {
    currentLang = "en";
  }
  if (path.includes("/fr/")) {
    currentLang = "fr";
  }

  // =====================================
  // HTML読込
  // =====================================
  const response = await fetch("/models_img_thum.html");
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const items = [...doc.querySelectorAll(".model-item")];

  // =====================================
  // シャッフル
  // =====================================

  items.sort(() => Math.random() - 0.5);

  // =====================================
  // 描画
  // =====================================

  items.forEach((item, index) => {
    const img = item.querySelector("img");
    const name = item.querySelector(".model-name");
    let link = item.getAttribute("href");
    if (currentLang === "en") {
      link = item.dataset.en;
    }
    if (currentLang === "fr") {
      link = item.dataset.fr;
    }
    const card = document.createElement("a");
    card.href = link;
    card.className = "model-card";
    card.innerHTML = `
      <div class="model-overlay"></div>
      <img
        src="${img.src}"
        alt="${img.alt}"
        loading="lazy"
      >
      <div class="model-name">
        ${name.textContent}
      </div>
    `;

    container.appendChild(card);

    // stagger animation
    setTimeout(() => {
      card.classList.add("show");
    }, 120 * index);

  });
  // =====================================
  // ZOOM SYSTEM
  // =====================================

  const viewport = document.getElementById("viewport");
  const wrapper = document.getElementById("canvasWrapper");
  const gallery = document.querySelector(".models-gallery");

  // target
  let targetX = 0;
  let targetY = 0;
  let targetScale = 1;

  // current
  let currentX = 0;
  let currentY = 0;
  let currentScale = 1;

  // inertia
  let velocityX = 0;
  let velocityY = 0;

  // cinematic drift
  let driftRotation = 0;
  let driftScale = 1;

  const scrollSpeed = 1.2;
  // =====================================
  // FIT WIDTH (100vw)
  // =====================================

  window.fitWidth = function (button) {

    targetScale = 1;

    const container = document.getElementById("models-container");

    container.classList.remove(
      "zoom-out-mobile",
      "zoom-in-mobile"
    );

    updateButtons(button);

    // ★重要：位置もリセットすると安定する
    targetX = 0;
    targetY = 0;
    currentX = 0;
    currentY = 0;
  };
  // =====================================
  // BUTTON ZOOM
  // =====================================
  window.setZoom = function (scale, button) {

    targetScale = scale;

    const container = document.getElementById("models-container");

    container.classList.remove(
      "zoom-out-mobile",
      "zoom-in-mobile"
    );

    if (scale === 0.8) {
      container.classList.add("zoom-out-mobile");
    }

    if (scale === 1.2) {
      container.classList.add("zoom-in-mobile");
    }

    updateButtons(button);
  };

  // =====================================
  // UI
  // =====================================

  function updatePercent() {
    document.getElementById(
      "percentageIndicator"
    ).textContent =
      Math.round(currentScale * 100) + "%";
  }

  function updateButtons(activeBtn) {
    document
      .querySelectorAll(".switch-button")
      .forEach(btn => {
        btn.classList.remove("active");
      });
    if (activeBtn) {
      activeBtn.classList.add("active");
    }

  }

  // =====================================
  // WHEEL
  // =====================================

  viewport.addEventListener("wheel", (e) => {
    e.preventDefault();

    // Shift + wheel → 横移動
    if (e.shiftKey) {
      const delta =
        Math.abs(e.deltaX) > 0
          ? e.deltaX
          : e.deltaY;

      targetX -= delta * scrollSpeed;
      velocityX += delta * 0.02;

    }

    // 通常 wheel → 縦移動
    else {

      targetY -= e.deltaY * scrollSpeed;
      velocityY += e.deltaY * 0.02;
    }

  }, { passive: false });
  // =====================================
  // SMOOTH LOOP
  // =====================================

  function animate() {

    // ---------------------------------
    // gallery size
    // ---------------------------------

    const galleryWidth =
      gallery.offsetWidth * currentScale;

    const galleryHeight =
      gallery.offsetHeight * currentScale;

    // ---------------------------------
    // viewport size
    // ---------------------------------

    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;

    // ---------------------------------
    // limit
    // ---------------------------------

    const maxX =
      Math.max(0, (galleryWidth - viewWidth) / 2);

    const maxY =
      Math.max(0, (galleryHeight - viewHeight) / 2);

    // clamp
    targetX = gsap.utils.clamp(
      -maxX,
      maxX,
      targetX
    );

    targetY = gsap.utils.clamp(
      -maxY,
      maxY,
      targetY
    );

    // ---------------------------------
    // position lerp
    // ---------------------------------
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    // ---------------------------------
    // scale lerp
    // ---------------------------------

    currentScale +=
      (targetScale - currentScale) * 0.05;
    // =====================================
    // INERTIA
    // =====================================

    velocityX *= 0.92;
    velocityY *= 0.92;

    // subtle cinematic movement

    driftRotation = 0;

    driftScale +=
      (
        (1 + Math.abs(velocityY) * 0.0008)
        - driftScale
      ) * 0.05;
    // ---------------------------------
    // apply
    // ---------------------------------

    gsap.set(wrapper, {

      x: -(gallery.offsetWidth / 2) + currentX,
      y: -(gallery.offsetHeight / 2) + currentY,
      scale: currentScale * driftScale,
      rotation: driftRotation,
      transformOrigin: "center center",
      force3D: true

    });
    // =====================================
    // IMAGE PARALLAX
    // =====================================

    const cards = document.querySelectorAll(".model-card");
    cards.forEach(card => {
      const img = card.querySelector("img");
      const rect = card.getBoundingClientRect();
      // 画面中央基準
      const centerOffset =
        rect.top + rect.height / 2 - window.innerHeight / 2
      // 強さ（小さいほど弱い）
      const parallaxY = centerOffset * -0.04;
      const hoverScale =
        card.matches(":hover") ? 1.08 : 1;
      gsap.to(img, {
        y: parallaxY,
        scale: hoverScale,
        duration: 1.2,
        ease: "power3.out",
        overwrite: true
      });

    });


    updatePercent();
    requestAnimationFrame(animate);

  }

  animate();

  // =====================================
  // RESIZE
  // =====================================

  window.addEventListener("resize", () => {
    targetX = currentX;
    targetY = currentY;

  });


});