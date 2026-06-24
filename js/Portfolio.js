// portfolio.js
document.addEventListener("DOMContentLoaded", () => {
  
  /* ==========================================
   動画の遅延読み込み＆再生管理（スマホ軽量化・ガタつき防止対策）
  ========================================== */
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;

      if (entry.isIntersecting) {
        // 画面に入ったら動画ファイルを読み込んで再生
        if (video.dataset.src && !video.src) {
          video.src = video.dataset.src;
          video.load();
        }
        video.play().catch(() => {});
      } else {
        // 画面から消えたら再生を止め、通信を解放
        video.pause();
        if (video.src) {
          video.removeAttribute("src");
          video.load();
        }
      }
    });
  }, { 
    threshold: 0.05, // 画面に少しでも触れたら反応
    rootMargin: "300px 0px 300px 0px" // 上下300pxの猶予を持たせて、ガタつきを完全に防止
  });

  const galleryContainer = document.getElementById("galleryContainer");
  const thumbnailContainer = document.getElementById("thumbnailContainer");
  const toggleBtn = document.getElementById("toggleView");
  const horizontalGallery = document.getElementById("horizontalGallery");
  const thumbnailGallery = document.getElementById("thumbnailGallery");

  const modal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");
  const modalVideo = document.getElementById("modalVideo");
  const modalClose = document.getElementById("modalClose");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  // Google Analytics イベント
  document.getElementById("link-concept")?.addEventListener("click", () => { gtag('event', 'click_concept'); });
  document.getElementById("link-career")?.addEventListener("click", () => { gtag('event', 'click_career'); });
  document.getElementById("link-portfolio")?.addEventListener("click", () => { gtag('event', 'click_portfolio'); });

  let itemsMasterList = [];
  let currentIndex = 0;

  /* ==========================================
   慣性スクロール（PC用）
  ========================================== */
  let galleryPos = 0;
  let galleryVelocity = 0;
  const friction = 0.94;
  const speed = 0.0010;
  let isAnimating = false;

  function smoothLoop() {
    if (!isAnimating) return;
    galleryVelocity *= friction;
    galleryPos += galleryVelocity * 120;

    const maxX = galleryContainer.scrollWidth - galleryContainer.clientWidth;
    galleryPos = Math.max(0, Math.min(maxX, galleryPos));
    galleryContainer.scrollLeft = galleryPos;

    if (Math.abs(galleryVelocity) < 0.01) {
      isAnimating = false;
      return;
    }
    requestAnimationFrame(smoothLoop);
  }

  document.addEventListener("wheel", (e) => {
    if (window.innerWidth <= 768) return;
    const rect = galleryContainer.getBoundingClientRect();
    const inGallery = rect.top < window.innerHeight && rect.bottom > 0;

    if (inGallery) {
      e.preventDefault();
      galleryVelocity += e.deltaY * speed;
      if (!isAnimating) {
        isAnimating = true;
        requestAnimationFrame(smoothLoop);
      }
    }
  }, { passive: false });

  /* ==========================================
   モーダル処理
  ========================================== */
  function bindGalleryClick(element, indexInMaster) {
    element.onclick = () => {
      currentIndex = indexInMaster;
      openModal(currentIndex);
      gtag('event', 'open_modal', { image_index: currentIndex, content_type: element.tagName });
    };
  }

  function openModal(i) {
    const elData = itemsMasterList[i];
    if (!elData) return;

    modal.classList.add("show");
    modalImage.classList.remove("show");
    modalVideo.classList.remove("show");

    if (elData.tagName === "IMG") {
      modalImage.src = elData.fullSrc;
      modalImage.classList.add("show");
      modalVideo.pause();
    } else {
      modalVideo.src = elData.fullSrc;
      modalVideo.classList.add("show");
      modalVideo.play();
    }
  }

  function closeModal() {
    modal.classList.remove("show");
    modalVideo.pause();
    modalImage.removeAttribute("src");
    modalVideo.removeAttribute("src");
    gtag('event', 'close_modal');
  }

  function changeModalImage(dir) {
    const max = itemsMasterList.length;
    if (max === 0) return;
    currentIndex = (currentIndex + dir + max) % max;
    openModal(currentIndex);
  }

  modalClose.onclick = closeModal;
  modal.onclick = e => { if (e.target === modal) closeModal(); };
  prevBtn.onclick = e => { e.stopPropagation(); changeModalImage(-1); gtag('event', 'modal_prev'); };
  nextBtn.onclick = e => { e.stopPropagation(); changeModalImage(1); gtag('event', 'modal_next'); };

  document.addEventListener("keydown", e => {
    if (!modal.classList.contains("show")) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") changeModalImage(-1);
    if (e.key === "ArrowRight") changeModalImage(1);
  });

  /* ==========================================
   img.html 読み込み＆分割遅延表示（Lazy Load）
  ========================================== */
  fetch('/img.html')
    .then(res => res.text())
    .then(data => {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = data;

      let items = Array.from(tempDiv.querySelectorAll("img, video"));

      // シャッフル
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }

      // 事前処理：動画のsrcをdataset.srcに退避、かつマスターリストを作成
      items.forEach((el, index) => {
        let fullSrc = el.dataset.full || el.src;
        if (el.tagName === "VIDEO" && el.src) {
          el.dataset.src = el.src;
          fullSrc = el.src;
          el.removeAttribute("src");
        }
        
        itemsMasterList.push({
          tagName: el.tagName,
          fullSrc: fullSrc
        });
      });

      const INITIAL_LOAD = 24;
      let horizontalLoadedCount = 0;
      let thumbnailLoadedCount = 0;

      // --- 横スクロール（Horizontal）用追加関数 ---
      function loadMoreHorizontal() {
        if (horizontalLoadedCount >= items.length) return;

        const fragment = document.createDocumentFragment();
        const slice = items.slice(horizontalLoadedCount, horizontalLoadedCount + INITIAL_LOAD);

        slice.forEach((el, localIdx) => {
          const globalIdx = horizontalLoadedCount + localIdx;
          const horizontalClone = el.cloneNode(true);
          horizontalClone.classList.add("gallery-image");
          horizontalClone.decoding = "async";

          if (horizontalClone.tagName === "VIDEO") {
            // 【重要：高さ固定】srcがなくてもサイズを維持させ、ガタつきを防ぐ
            horizontalClone.style.aspectRatio = "16 / 9"; 
            horizontalClone.preload = "none";
            horizontalClone.autoplay = false;
            horizontalClone.muted = true;
            horizontalClone.loop = true;
            horizontalClone.playsInline = true;
            videoObserver.observe(horizontalClone);
          } else {
            horizontalClone.loading = "lazy";
          }

          bindGalleryClick(horizontalClone, globalIdx);
          fragment.appendChild(horizontalClone);
        });

        galleryContainer.appendChild(fragment);
        horizontalLoadedCount += slice.length;
      }

      // --- グリッド（Thumbnail）用追加関数 ---
      function loadMoreThumbnail() {
        if (!thumbnailContainer || thumbnailLoadedCount >= items.length) return;

        const fragment = document.createDocumentFragment();
        const slice = items.slice(thumbnailLoadedCount, thumbnailLoadedCount + INITIAL_LOAD);

        slice.forEach((el, localIdx) => {
          const globalIdx = thumbnailLoadedCount + localIdx;
          const thumbClone = el.cloneNode(true);
          thumbClone.classList.add("thumb-image");
          thumbClone.decoding = "async";

          if (thumbClone.tagName === "VIDEO") {
            // 【重要：高さ固定】動画読み込み前後でのサイズ変化を無くす
            thumbClone.style.aspectRatio = "1 / 1"; // グリッドの形状（正方形なら1/1、元の動画比率なら16/9等に変更してください）
            thumbClone.style.objectFit = "cover";
            thumbClone.preload = "none";
            thumbClone.autoplay = false;
            thumbClone.muted = true;
            thumbClone.loop = true;
            thumbClone.playsInline = true;
            videoObserver.observe(thumbClone);
          } else {
            thumbClone.loading = "lazy";
          }

          bindGalleryClick(thumbClone, globalIdx);
          fragment.appendChild(thumbClone);
        });

        thumbnailContainer.appendChild(fragment);
        thumbnailLoadedCount += slice.length;
      }

      // 初回分の描画
      loadMoreHorizontal();
      loadMoreThumbnail();

      // 初期状態で画面の高さが足りなければ追加する関数
      function checkAndFillThumbnail() {
        if (!thumbnailGallery.classList.contains("hidden")) {
          while (
            thumbnailLoadedCount < items.length && 
            window.innerHeight + 300 >= document.documentElement.scrollHeight
          ) {
            loadMoreThumbnail();
          }
        }
      }

      setTimeout(checkAndFillThumbnail, 100);

      /* ==========================================
       表示切替
      ========================================== */
      toggleBtn.addEventListener("click", () => {
        horizontalGallery.classList.toggle("hidden");
        thumbnailGallery.classList.toggle("hidden");

        const squareContainer = document.getElementById("squareContainer");
        squareContainer.classList.toggle("two-by-two");
        squareContainer.classList.toggle("one-row");

        gtag('event', 'toggle_gallery_view');
        setTimeout(checkAndFillThumbnail, 50);
      });

      // 横スクロール時の追加読み込み
      galleryContainer.addEventListener("scroll", () => {
        if (galleryContainer.scrollLeft + galleryContainer.clientWidth > galleryContainer.scrollWidth - 600) {
          loadMoreHorizontal();
        }
      });

      // 縦スクロール時の追加読み込み
      window.addEventListener("scroll", () => {
        if (
          window.innerHeight + window.scrollY >= 
          document.documentElement.scrollHeight - 800
        ) {
          loadMoreThumbnail();
        }
      });

    })
    .catch(err => {
      console.error("img.html 読み込み失敗:", err);
      if (galleryContainer) {

        galleryContainer.innerHTML = "<p>Portfolioの読み込みに失敗しました。</p>";
      }
    });
});


/* ================= 動画自動再生 ================= */

document.getElementById("link-contact")?.addEventListener("click", () => {
  gtag('event', 'click_contact');
});

document.querySelector(".instagram-link")?.addEventListener("click", () => {
  gtag('event', 'click_instagram');
});

document.querySelector(".composition")?.addEventListener("click", () => {
  gtag('event', 'download_composition');
});

document.querySelector(".composition-portfolio")?.addEventListener("click", () => {
  gtag('event', 'download_composition');
});