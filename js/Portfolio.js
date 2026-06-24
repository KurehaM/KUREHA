// portfolio.js
document.addEventListener("DOMContentLoaded", () => {
    const videoObserver = new IntersectionObserver((entries)=>{

  entries.forEach(entry=>{

    const video = entry.target;

    if(entry.isIntersecting){

      video.play().catch(()=>{});

    }else{

      video.pause();

    }

  });

},{threshold:0.3});

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
  document.getElementById("link-concept")?.addEventListener("click", () => {
  gtag('event', 'click_concept');
});

document.getElementById("link-career")?.addEventListener("click", () => {
  gtag('event', 'click_career');
});

document.getElementById("link-portfolio")?.addEventListener("click", () => {
  gtag('event', 'click_portfolio');
});

  let itemsList = [];
  let currentIndex = 0;
/* ==========================================
 スクロール
========================================== */
let galleryPos = 0;
let galleryVelocity = 0;

const friction = 0.94;
const speed = 0.0010;

let isAnimating = false;

function smoothLoop(){

  if(!isAnimating) return;

  galleryVelocity *= friction;
  galleryPos += galleryVelocity * 120;

  const maxX =
    galleryContainer.scrollWidth -
    galleryContainer.clientWidth;

  galleryPos = Math.max(0, Math.min(maxX, galleryPos));
  galleryContainer.scrollLeft = galleryPos;

  if(Math.abs(galleryVelocity) < 0.01){
    isAnimating = false;
    return;
  }

  requestAnimationFrame(smoothLoop);
}

document.addEventListener("wheel",(e)=>{

  if (window.innerWidth <= 768) return;

  const rect = galleryContainer.getBoundingClientRect();
  const inGallery =
    rect.top < window.innerHeight &&
    rect.bottom > 0;

  if (inGallery){

    e.preventDefault();

    galleryVelocity += e.deltaY * speed;

    if(!isAnimating){
      isAnimating = true;
      requestAnimationFrame(smoothLoop);
    }

  }

},{ passive:false });
// galleryContainer.addEventListener("wheel", function(e) {

//   if (window.innerWidth > 768) {

//     const rect = galleryContainer.getBoundingClientRect();
//     const isInside = rect.top < window.innerHeight && rect.bottom > 0;

//     if (!isInside) return;

//     e.preventDefault();
//     galleryContainer.scrollLeft += e.deltaY * 1.2;
//   }

// }, { passive: false });
  /* ================= モーダル ================= */

  function bindGalleryClick() {
    itemsList = [
  ...new Map(
    [...galleryContainer.children, ...thumbnailContainer.children]
      .map(el => [(el.dataset.full || el.src), el])
  ).values()
];

    itemsList.forEach((el, idx) => {
     el.onclick = () => {
  currentIndex = idx;
  openModal(idx);

  gtag('event', 'open_modal', {
    image_index: idx,
    content_type: el.tagName
  });
};
    });
  }

  function openModal(i) {
  const el = itemsList[i];
  modal.classList.add("show");

  modalImage.classList.remove("show");
  modalVideo.classList.remove("show");

  if (el.tagName === "IMG") {

    modalImage.src = el.dataset.full || el.src;
    modalImage.classList.add("show");
    modalVideo.pause();

  } else {

    modalVideo.src = el.dataset.full || el.src;
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
    const max = itemsList.length;
    currentIndex = (currentIndex + dir + max) % max;
    openModal(currentIndex);
  }

  modalClose.onclick = closeModal;
  modal.onclick = e => { if (e.target === modal) closeModal(); };
prevBtn.onclick = e => {
  e.stopPropagation();
  changeModalImage(-1);
  gtag('event', 'modal_prev');
};

nextBtn.onclick = e => {
  e.stopPropagation();
  changeModalImage(1);
  gtag('event', 'modal_next');
};

  document.addEventListener("keydown", e => {
    if (!modal.classList.contains("show")) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") changeModalImage(-1);
    if (e.key === "ArrowRight") changeModalImage(1);
  });

  /* ================= 表示切替 ================= */

  toggleBtn.addEventListener("click", () => {
  horizontalGallery.classList.toggle("hidden");
  thumbnailGallery.classList.toggle("hidden");

  const squareContainer = document.getElementById("squareContainer");
  squareContainer.classList.toggle("two-by-two");
  squareContainer.classList.toggle("one-row");

  gtag('event', 'toggle_gallery_view');
});

/* ================= img.html 読み込み ================= */

fetch('/img.html')
  .then(res => res.text())
  .then(data => {

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = data;

    let items = Array.from(tempDiv.querySelectorAll("img, video"));

/* ===============================
シャッフル
=============================== */

    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }

/* ===============================
共通：Lazy Load（遅延読み込み）処理
=============================== */

    const INITIAL_LOAD = 24; // 1回に読み込む件数
    let horizontalLoadedCount = 0;
    let thumbnailLoadedCount = 0;

    // --- 横スクロール（Horizontal）用の読み込み関数 ---
    function loadMoreHorizontal(items) {
      if (horizontalLoadedCount >= items.length) return;

      const fragment = document.createDocumentFragment();
      const slice = items.slice(horizontalLoadedCount, horizontalLoadedCount + INITIAL_LOAD);

      slice.forEach(el => {
        const horizontalClone = el.cloneNode(true);
        horizontalClone.classList.add("gallery-image");
        horizontalClone.decoding = "async";

        if (horizontalClone.tagName === "VIDEO") {
          horizontalClone.preload = "metadata";
          horizontalClone.autoplay = true;
          horizontalClone.muted = true;
          horizontalClone.loop = true;
          horizontalClone.playsInline = true;
          videoObserver.observe(horizontalClone); // 画面に入ったら再生
        } else {
          horizontalClone.loading = "lazy";
        }

        fragment.appendChild(horizontalClone);
      });

      galleryContainer.appendChild(fragment);
      horizontalLoadedCount += slice.length;
    }

    // --- グリッド（Thumbnail）用の読み込み関数 ★新設 ---
    function loadMoreThumbnail(items) {
      if (!thumbnailContainer || thumbnailLoadedCount >= items.length) return;

      const fragment = document.createDocumentFragment();
      const slice = items.slice(thumbnailLoadedCount, thumbnailLoadedCount + INITIAL_LOAD);

      slice.forEach(el => {
        const thumbClone = el.cloneNode(true);
        thumbClone.classList.add("thumb-image");
        thumbClone.decoding = "async";

        if (thumbClone.tagName === "VIDEO") {
          thumbClone.preload = "metadata";
          thumbClone.autoplay = true;
          thumbClone.muted = true;
          thumbClone.loop = true;
          thumbClone.playsInline = true;
          videoObserver.observe(thumbClone); // 画面に入ったら再生
        } else {
          thumbClone.loading = "lazy";
        }

        fragment.appendChild(thumbClone);
      });

      thumbnailContainer.appendChild(fragment);
      thumbnailLoadedCount += slice.length;
      
      // クリックイベントを再バインド
      bindGalleryClick();
    }

    // 初回読み込み（まずは最初の24件だけ描写）
    loadMoreHorizontal(items);
    loadMoreThumbnail(items);

/* ===============================
スクロール連動による追加読み込み
=============================== */

    // 1. 横スクロール側のLazy Load
    galleryContainer.addEventListener("scroll", () => {
      if (
        galleryContainer.scrollLeft +
        galleryContainer.clientWidth >
        galleryContainer.scrollWidth - 600
      ) {
        loadMoreHorizontal(items);
      }
    });

    // 2. サムネイル（画面全体スクロール）側のLazy Load ★新設
    window.addEventListener("scroll", () => {
      // 画面最下部から400px手前に来たら次の24件を読み込む
      if (
        window.innerHeight + window.scrollY >= 
        document.documentElement.scrollHeight - 400
      ) {
        loadMoreThumbnail(items);
      }
    });

    // 初回のクリックバインド
    bindGalleryClick();

  })
.catch(err => {
  console.error("img.html 読み込み失敗:", err);
  galleryContainer.innerHTML = "<p>Portfolioの読み込みに失敗しました。</p>";
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