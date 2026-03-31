document.addEventListener("DOMContentLoaded", () => {
const lang = new URLSearchParams(window.location.search).get("lang") || document.documentElement.lang || "ja";  document.documentElement.lang = lang;

  const topPagePath = {
    ja: "/Top.html",
    en: "/en/Top.html",
    fr: "/fr/Top.html"
  };

  const mainPagePath = {
    ja: "/KUREHA.html",
    en: "/en/KUREHA.html",
    fr: "/fr/KUREHA.html"
  };

  const texts = {
    ja: { concept: "Concept", career: "Career", portfolio: "Portfolio", contact: "Contact", instagram: "Instagram" },
    en: { concept: "Concept", career: "Career", portfolio: "Portfolio", contact: "Contact", instagram: "Instagram" },
    fr: { concept: "Concept", career: "Carrière", portfolio: "Portfolio", contact: "Contact", instagram: "Instagram" }
  };

  // テキスト表示
  const t = texts[lang];
  const conceptEl = document.querySelector("#link-concept");
  const careerEl = document.querySelector("#link-career");
  const portfolioEl = document.querySelector("#link-portfolio");
  const contactEl = document.querySelector("#link-contact");

  if (conceptEl) conceptEl.textContent = t.concept;
  if (careerEl) careerEl.textContent = t.career;
  if (portfolioEl) portfolioEl.textContent = t.portfolio;
  if (contactEl) contactEl.textContent = t.contact;

  // メニューリンク更新
  const updateLink = (id, hash) => {
    const el = document.getElementById(id);
    if (el) el.href = `${mainPagePath[lang]}${hash}`;
  };

  updateLink("link-concept", "#concept");
  updateLink("link-career", "#career");
  updateLink("link-contact", "#contact");

  if (portfolioEl) portfolioEl.href = `/Portfolio.html?lang=${lang}`;

  // Top.htmlへのロゴリンクを言語別に変更
  const logoLink = document.querySelector(".side-menu-img")?.parentElement;
  if (logoLink) {
    logoLink.href = topPagePath[lang];
  }

  // 言語切替ボタンのhref調整
  document.querySelectorAll(".lang-Btn").forEach((btn) => {
    const href = btn.getAttribute("href");
    if (!href) return;
    const newLang = href.split("/")[1] || "ja";
    btn.setAttribute("href", `${href}?lang=${newLang}`);
  });

  // Top.html 以外のリンクにlangを追加する関数
  function addLangParam(href) {
    if (!href) return "/Top.html?lang=ja";
    if (href.includes("Top.html")) return topPagePath[lang];
    const url = new URL(href, window.location.origin);
    url.searchParams.set("lang", lang);
    return url.toString();
  }

  // ハンバーガーメニュー制御
  const hamburger = document.getElementById("hamburger");
  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("overlay");

  const closeMenu = () => {
    hamburger?.classList.remove("active");
    sideMenu?.classList.remove("active");
    overlay?.classList.remove("active");
  };

  hamburger?.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    sideMenu.classList.toggle("active");
    overlay.classList.toggle("active");
  });

  overlay?.addEventListener("click", closeMenu);
 document.addEventListener("click", (e) => {
  const isClickInsideMenu = sideMenu?.contains(e.target);
  const isClickInsideHamburger = hamburger?.contains(e.target);
  const isClickOnLink = e.target.closest("a");

  if (isClickInsideMenu && !isClickOnLink) {
    // sideMenu内だが、リンク以外ならメニューを閉じる
    closeMenu();
  } else if (!isClickInsideMenu && !isClickInsideHamburger) {
    // sideMenuでもhamburgerでもないなら閉じる
    closeMenu();
  }
});

  sideMenu?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#" || href.startsWith("#")) {
        closeMenu();
        return;
      }
      e.preventDefault();
      window.location.href = addLangParam(href);
    });
  });

  // スクロールでアニメーション消す
  window.addEventListener("scroll", () => {
    document.querySelectorAll(".line, .scroll-text").forEach(el => {
      el.classList.toggle("fade-out", window.scrollY > window.innerHeight * 0.3);
    });
  });

  // 内容確認画面・フォーム処理
  const checkbox = document.getElementById("agreeCheck");
  const confirmButton = document.querySelector("#confirmBtn button");
  checkbox?.addEventListener("change", () => {
    confirmButton.disabled = !checkbox.checked;
  });

  const form = document.getElementById("contactForm");
  const thanksMessage = document.getElementById("thanksMessage");
  const submitBtn = document.getElementById("submitBtn");

  function getLabelText(key) {
    const labels = {
      company: { ja: "会社名", en: "Company Name", fr: "Nom de l’entreprise" },
      name: { ja: "名前", en: "Name", fr: "Nom" },
      email: { ja: "メールアドレス", en: "Email Address", fr: "Adresse e-mail" },
      phone: { ja: "電話番号", en: "Phone Number", fr: "Numéro de téléphone" },
      jobtype: { ja: "仕事内容", en: "Type of Work", fr: "Type de travail" },
      onsite: { ja: "現場予定場所", en: "Work Location", fr: "Lieu prévu" },
      subject: { ja: "お問い合わせタイトル", en: "Subject", fr: "Objet" },
      message: { ja: "お問い合わせ内容", en: "Message", fr: "Contenu du message" }
    };
    return (labels[key] && labels[key][lang]) || key;
  }

  function showConfirmation() {
    const table = document.getElementById("confirmTable");
    table.innerHTML = "";
    const formData = new FormData(form);
    formData.forEach((value, key) => {
      const row = document.createElement("tr");
      const th = document.createElement("th");
      th.textContent = getLabelText(key);
      const td = document.createElement("td");
      td.textContent = value;
      row.appendChild(th);
      row.appendChild(td);
      table.appendChild(row);
    });

 document.querySelectorAll("#contactForm .form-group").forEach(el => {
  el.style.display = "none";
});

    document.getElementById("concept")?.classList.add("hidden-on-confirm");
    document.getElementById("career")?.classList.add("hidden-on-confirm");
    document.getElementById("concept").style.display = "none";
    document.getElementById("career").style.display = "none";
    document.getElementById("policyBox").style.display = "none";
    document.querySelector(".policy-agree").style.display = "none";
    document.querySelector(".confirm-btn").style.display = "none";
    document.getElementById("confirmation").style.display = "block";
    // document.querySelector(".bot-fix").style.display = "none";
  }

function goBack() {

  document.querySelectorAll("#contactForm .form-group").forEach(el => {
    el.style.display = "block";
  });
    document.getElementById("confirmation").style.display = "none";
    document.getElementById("concept").style.display = "block";
    document.getElementById("career").style.display = "block";
    document.getElementById("policyBox").style.display = "block";
    document.querySelector(".policy-agree").style.display = "block";
    document.querySelector(".confirm-btn").style.display = "block";
    document.getElementById("concept")?.classList.remove("hidden-on-confirm");
    document.getElementById("career")?.classList.remove("hidden-on-confirm");

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = lang === "en" ? "Submit" : lang === "fr" ? "Envoyer" : "送信";
    }
  }

  const confirmBtn = document.querySelector(".confirm-btn");
  confirmBtn?.addEventListener("click", () => {
    if (form.checkValidity()) {
      showConfirmation();
    } else {
      form.reportValidity();
    }
  });


submitBtn?.addEventListener("click", async (e) => {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent =
    lang === "en" ? "Sending..." :
    lang === "fr" ? "Envoi en cours..." :
    "送信中...";

  const googleFormURL =
    "https://docs.google.com/forms/d/e/1FAIpQLSe7iwNuFW7n85vMt_LL9mSw5ZxnGMbw496keNgQh5KhMXYf9w/formResponse";

  const formData = new FormData();
  formData.append("entry.549184934", form.company.value);
  formData.append("entry.241630450", form.name.value);
  formData.append("entry.1348806247", form.email.value);
  formData.append("entry.1938954068", form.phone.value);
  formData.append("entry.1133594855", form.jobtype.value);
  formData.append("entry.1106166738", form.onsite.value);
  formData.append("entry.1901396001", form.subject.value);
  formData.append("entry.319458182", form.message.value);

  formData.append("entry.1031529061", lang);

  try {
    await fetch(googleFormURL, {
      method: "POST",
      mode: "no-cors",
      body: formData
    });

    const thxPagePath = {
      ja: "/thx.html",
      en: "/en/thx.html",
      fr: "/fr/thx.html"
    };

    window.location.href = thxPagePath[lang];

  } catch (error) {
    alert({
      ja: "送信に失敗しました。時間をおいて再度お試しください。",
      en: "Failed to send. Please try again later.",
      fr: "Échec de l'envoi. Veuillez réessayer plus tard."
    }[lang]);

    submitBtn.disabled = false;
    submitBtn.textContent =
      lang === "en" ? "Submit" :
      lang === "fr" ? "Envoyer" :
      "送信";
  }
});

  // goBack関数をグローバルにも出す（HTMLから呼び出し可能に）
  window.goBack = goBack;
// ーーーーーーーーーーーーーーーーーーーーーーーーーー


//  ===============================
// 右クリック禁止
// =============================== 

document.addEventListener("contextmenu", function(e){
  e.preventDefault();
});


//===============================
//ドラッグ保存禁止
//=============================== 

document.addEventListener("dragstart", function(e){
  if(e.target.tagName==="IMG" || e.target.tagName==="VIDEO"){
    e.preventDefault();
  }
});


//===============================
//コピー禁止
//===============================

document.addEventListener("copy", function(e){
  e.preventDefault();
});


// ===============================
//キーボードショートカット禁止
//=============================== 

document.addEventListener("keydown", function(e){

  if(
    e.key==="F12" ||
    e.key==="PrintScreen" ||

    (e.ctrlKey && e.key==="s") ||
    (e.ctrlKey && e.key==="u") ||
    (e.ctrlKey && e.key==="c") ||
    (e.ctrlKey && e.key==="a") ||
    (e.ctrlKey && e.key==="p") ||

    (e.ctrlKey && e.shiftKey && e.key==="I") ||
    (e.ctrlKey && e.shiftKey && e.key==="J") ||
    (e.ctrlKey && e.shiftKey && e.key==="C")

  ){
    e.preventDefault();
    return false;
  }

});


// ===============================
//PrintScreen対策
//=============================== */

document.addEventListener("keyup", function(e){

  if(e.key === "PrintScreen"){

    navigator.clipboard.writeText("");

    alert("Screenshots are not permitted on this portfolio.");

  }

});


//===============================
//DevTools検知
//==============================

setInterval(function(){

  const widthThreshold = window.outerWidth - window.innerWidth > 160;
  const heightThreshold = window.outerHeight - window.innerHeight > 160;

  if(widthThreshold || heightThreshold){

    document.body.innerHTML="";

    alert("Developer tools are not allowed.");

  }

},1000);


//===============================
//画像URL直アクセス防止
//=============================== //

document.querySelectorAll("img").forEach(img=>{

  img.addEventListener("contextmenu",e=>e.preventDefault());

});


// ===============================
//動画ダウンロード防止
//============================== 

document.querySelectorAll("video").forEach(video=>{

  video.controlsList="nodownload";

  video.disablePictureInPicture=true;

});


///===============================
//テキスト選択禁止
//============================== 

document.body.style.userSelect="none";
});