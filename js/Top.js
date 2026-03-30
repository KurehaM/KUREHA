document.addEventListener("DOMContentLoaded", () => {
  const videoBg = document.querySelector(".video-background");
  const langSelector = document.getElementById("langSelector");
  const kureha = document.getElementById("kureha");
  const overlay = document.querySelector(".overlay");
  const whiteFade = document.querySelector(".white-fade");
  const urlParams = new URLSearchParams(window.location.search);
  const selectedLang = urlParams.get("lang");

  // 初期状態
  langSelector.style.display = "none";
  kureha.style.display = "none";
  overlay.style.opacity = 0;

  // 背景動画フェードイン（1秒）
  requestAnimationFrame(() => {
    videoBg.style.opacity = 1;
    overlay.style.transition = "opacity 1s ease";
    overlay.style.opacity = 1;
  });

  // 言語ボタン表示処理
  setTimeout(() => {
    langSelector.style.display = "flex";
    langSelector.classList.add("fade-in");

    if (selectedLang) {
      const preselected = document.querySelector(`#langSelector button[data-lang="${selectedLang}"]`);
      if (preselected) preselected.classList.add("selected-lang");

      setTimeout(() => {
        langSelector.style.display = "none";
        kureha.style.display = "block";
        kureha.classList.add("fade-in");
      }, 2000);
    }
  }, 1000); // 動画フェードイン後 1秒で言語ボタン表示

  // 言語ボタンクリック処理
  const langButtons = document.querySelectorAll("#langSelector button");
  langButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      langButtons.forEach(b => b.classList.remove("selected-lang"));
      btn.classList.add("selected-lang");

      langSelector.style.display = "none";
      kureha.style.display = "block";
      kureha.classList.add("fade-in");

      kureha.onclick = () => {
        whiteFade.classList.add("fade-in");
        setTimeout(() => {
          const path = lang === "ja" ? "/KUREHA.html?lang=ja" : `/${lang}/KUREHA.html?lang=${lang}`;
          window.location.href = path;
        }, 1500);
      };
    });
  });

  // lang指定でアクセスした場合の Kurehaロゴクリック
  kureha.addEventListener("click", () => {
    if (!selectedLang) return;
    whiteFade.classList.add("fade-in");
    setTimeout(() => {
      const path = selectedLang === "ja" ? "/KUREHA.html?lang=ja" : `/${selectedLang}/KUREHA.html?lang=${selectedLang}`;
      window.location.href = path;
    }, 2500);
  });
});