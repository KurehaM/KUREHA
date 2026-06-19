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
サムネイル全部描画
=============================== */

const thumbFragment = document.createDocumentFragment();
items.forEach(el=>{

  const thumbClone = el.cloneNode(true);

  thumbClone.classList.add("thumb-image");

thumbClone.decoding = "async";
thumbClone.loading = "lazy";

  if(thumbClone.tagName==="VIDEO"){
    thumbClone.autoplay=true;
    thumbClone.muted=true;
    thumbClone.loop=true;
    thumbClone.playsInline=true;

    videoObserver.observe(thumbClone);
  }

  thumbFragment.appendChild(thumbClone);

});

thumbnailContainer.appendChild(thumbFragment);

/* ===============================
Horizontal Lazy Load
=============================== */

    const INITIAL_LOAD = 24;
    let loadedCount = 0;

    function loadMore(items){

      if(loadedCount >= items.length) return;

      const fragment = document.createDocumentFragment();

      const slice = items.slice(loadedCount, loadedCount + INITIAL_LOAD);

      slice.forEach(el => {

        const horizontalClone = el.cloneNode(true);

        if(horizontalClone.tagName === "VIDEO"){
          horizontalClone.autoplay = true;
          horizontalClone.muted = true;
          horizontalClone.loop = true;
          horizontalClone.playsInline = true;
        }

        horizontalClone.classList.add("gallery-image");

        if(horizontalClone.tagName === "VIDEO"){
          videoObserver.observe(horizontalClone);
        }

        fragment.appendChild(horizontalClone);

      });

      galleryContainer.appendChild(fragment);

      loadedCount += slice.length;

    }

    loadMore(items);

/* ===============================
スクロールLazy
=============================== */

    galleryContainer.addEventListener("scroll", () => {

      if(
        galleryContainer.scrollLeft +
        galleryContainer.clientWidth >
        galleryContainer.scrollWidth - 600
      ){
        loadMore(items);
      }

    });

    bindGalleryClick();

  })
.catch(err => {
  console.error("img.html 読み込み失敗:", err);
  galleryContainer.innerHTML = "<p>Portfolio loading failed.</p>";
});
/* ================= 動画自動再生 ================= */

});

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