// index.js
document.addEventListener("DOMContentLoaded", () => {
  const lang =
    new URLSearchParams(window.location.search).get("lang") ||
    document.documentElement.lang ||
    "ja";
  document.documentElement.lang = lang;

  // スクロールでアニメーション消す
  window.addEventListener("scroll", () => {
    document.querySelectorAll(".line, .scroll-text").forEach((el) => {
      el.classList.toggle(
        "fade-out",
        window.scrollY > window.innerHeight * 0.3,
      );
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
      email: {
        ja: "メールアドレス",
        en: "Email Address",
        fr: "Adresse e-mail",
      },
      phone: { ja: "電話番号", en: "Phone Number", fr: "Numéro de téléphone" },
      jobtype: { ja: "仕事内容", en: "Type of Work", fr: "Type de travail" },
      onsite: { ja: "現場予定場所", en: "Work Location", fr: "Lieu prévu" },
      subject: { ja: "お問い合わせタイトル", en: "Subject", fr: "Objet" },
      message: {
        ja: "お問い合わせ内容",
        en: "Message",
        fr: "Contenu du message",
      },
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

    document.querySelectorAll("#contactForm .form-group").forEach((el) => {
      el.style.display = "none";
    });

    document
      .getElementById("agency-concept")
      ?.classList.add("hidden-on-confirm");
    document.getElementById("agency-concept").style.display = "none";
    document.getElementById("policyBox").style.display = "none";
    document.querySelector(".policy-agree").style.display = "none";
    document.querySelector(".confirm-btn").style.display = "none";
    document.getElementById("confirmation").style.display = "block";
    // document.querySelector(".bot-fix").style.display = "none";
  }

  function goBack() {
    document.querySelectorAll("#contactForm .form-group").forEach((el) => {
      el.style.display = "block";
    });
    document.getElementById("confirmation").style.display = "none";
    document.getElementById("agency-concept").style.display = "block";
    document.getElementById("policyBox").style.display = "block";
    document.querySelector(".policy-agree").style.display = "block";
    document.querySelector(".confirm-btn").style.display = "block";
    document
      .getElementById("confirmation")
      ?.classList.remove("hidden-on-confirm");

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent =
        lang === "en" ? "Submit" : lang === "fr" ? "Envoyer" : "送信";
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
      lang === "en"
        ? "Sending..."
        : lang === "fr"
          ? "Envoi en cours..."
          : "送信中...";

    // GoogleフォームURL
    const googleFormURL =
      "https://docs.google.com/forms/d/e/1FAIpQLSdSlrJ2jZyTme5b56beF-EoVml2Qdqy2cprM1IF1eCmliNTEA/formResponse";

    const formData = new FormData();
    formData.append("entry.1910537145", String(form.company.value));
    formData.append("entry.1242423353", String(form.name.value));
    formData.append("entry.1332481730", String(form.email.value));
    formData.append("entry.2104000093", String(form.phone.value));
    formData.append("entry.861753871", String(form.jobtype.value));
    formData.append("entry.1506127604", String(form.onsite.value));
    formData.append("entry.1594287664", String(form.subject.value));
    formData.append("entry.394413404", String(form.message.value));

    // 言語欄は必ず ja / en / fr 文字列を送る
    formData.append("entry.2022988492", String(lang));

    try {
      await fetch(googleFormURL, {
        method: "POST",
        mode: "no-cors", // 送信確認は Network タブで
        body: formData,
      });

      // 送信後サンクスページ
      const thxPagePath = {
        ja: "/ja/thx.html",
        en: "/en/thx.html",
        fr: "/fr/thx.html",
      };

      window.location.href = thxPagePath[lang];
    } catch (error) {
      alert(
        {
          ja: "送信に失敗しました。時間をおいて再度お試しください。",
          en: "Failed to send. Please try again later.",
          fr: "Échec de l'envoi. Veuillez réessayer plus tard.",
        }[lang],
      );

      submitBtn.disabled = false;
      submitBtn.textContent =
        lang === "en" ? "Submit" : lang === "fr" ? "Envoyer" : "送信";
    }
  });
  /* -------------------------------------------------------
    【追加箇所】標準のalertを自作のカスタムポップアップに置き換える制御
    ------------------------------------------------------- */

  document.addEventListener("DOMContentLoaded", () => {
    const customAlert = document.getElementById("customAlert");
    const customAlertMessage = document.getElementById("customAlertMessage");
    const closeAlertBtn = document.getElementById("closeAlertBtn");

    if (customAlert && customAlertMessage && closeAlertBtn) {
      // 既存のalert("文字列")が呼び出されたら、この関数が横取りして実行します
      window.alert = (message) => {
        customAlertMessage.innerHTML = message; // メッセージを設定
        customAlert.classList.add("is-show"); // CSSのフェードインを発火
      };

      // OKボタンをクリックしたときに閉じる処理
      closeAlertBtn.addEventListener("click", () => {
        customAlert.classList.remove("is-show"); // フェードアウト
      });
    }
  });
  // goBack関数をグローバルにも出す（HTMLから呼び出し可能に）
  window.goBack = goBack;

  // ーーーーーーーーーーーーーーーーーーーーーーーーーー

  //  ===============================
  // 右クリック禁止
  // ===============================

  // document.addEventListener("contextmenu", function(e){
  //   e.preventDefault();
  // });

  //===============================
  //ドラッグ保存禁止
  //===============================

  // document.addEventListener("dragstart", function(e){
  //   if(e.target.tagName==="IMG" || e.target.tagName==="VIDEO"){
  //     e.preventDefault();
  //   }
  // });

  //===============================
  //コピー禁止
  //===============================

  // document.addEventListener("copy", function(e){
  //   e.preventDefault();
  // });

  // ===============================
  //キーボードショートカット禁止
  //===============================

  // document.addEventListener("keydown", function(e){

  //   if(
  //     e.key==="F12" ||
  //     e.key==="PrintScreen" ||

  //     (e.ctrlKey && e.key==="s") ||
  //     (e.ctrlKey && e.key==="u") ||
  //     (e.ctrlKey && e.key==="c") ||
  //     (e.ctrlKey && e.key==="a") ||
  //     (e.ctrlKey && e.key==="p") ||

  //     (e.ctrlKey && e.shiftKey && e.key==="I") ||
  //     (e.ctrlKey && e.shiftKey && e.key==="J") ||
  //     (e.ctrlKey && e.shiftKey && e.key==="C")

  //   ){
  //     e.preventDefault();
  //     return false;
  //   }

  // });

  // ===============================
  //PrintScreen対策
  //===============================

  // document.addEventListener("keyup", function(e){

  //   if(e.key === "PrintScreen"){

  //     navigator.clipboard.writeText("");

  //     alert("Screenshots are not permitted on this portfolio.");

  //   }

  // });

  //===============================
  //DevTools検知
  //==============================

  // setInterval(function(){

  //   const widthThreshold = window.outerWidth - window.innerWidth > 160;
  //   const heightThreshold = window.outerHeight - window.innerHeight > 160;

  //   if(widthThreshold || heightThreshold){

  //     document.body.innerHTML="";

  //     alert("Developer tools are not allowed.");

  //   }

  // },1000);

  //===============================
  //画像URL直アクセス防止
  //===============================

  // document.querySelectorAll("img").forEach(img=>{

  //   img.addEventListener("contextmenu",e=>e.preventDefault());

  // });

  // ===============================
  //動画ダウンロード防止
  //==============================

  // document.querySelectorAll("video").forEach(video=>{

  //   video.controlsList="nodownload";

  //   video.disablePictureInPicture=true;

  // });

  ///===============================
  //テキスト選択禁止
  //==============================

  // document.body.style.userSelect="none";
});
