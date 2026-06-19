document.addEventListener("DOMContentLoaded", () => {
  const contactTarget = document.getElementById("common-contact");
  if (!contactTarget) return;

  const lang = contactTarget.getAttribute("data-lang") || "ja";

  // 言語関係なく、世界基準で最も尖って見える「CONTACT」で統一
  const config = {
    ja: { text: "CONTACT", url: "/ja/agency.html#agency-contact" },
    en: { text: "CONTACT", url: "/en/agency.html#agency-contact" },
    fr: { text: "CONTACT", url: "/fr/agency.html#agency-contact" },
  };

  const currentConfig = config[lang] || config["en"];

  // 極限まで無駄を削った、100%直線のみのミニマル・メールアイコン（SVG）
  const mailIconSvg = `
    <svg viewBox="0 0 24 24" xmlns="http://w3.org" stroke-linecap="square" stroke-linejoin="miter">
      <path d="M2 4h20v16H2Z"/>
      <path d="M2 4l10 9 10-9"/>
    </svg>
  `;

  const container = document.createElement("div");
  container.className = "fixed-contact-container";

  const contactBtn = document.createElement("a");
  contactBtn.href = currentConfig.url;
  contactBtn.className = "fixed-contact-btn";

  contactBtn.innerHTML = `${mailIconSvg}<span>${currentConfig.text}</span>`;

  container.appendChild(contactBtn);
  contactTarget.appendChild(container);
});
