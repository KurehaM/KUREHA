<?php
$to = "XXXXXXXXXXXXXXXXXX.co.jp";
$subject = "お問い合わせフォームより";

$name = htmlspecialchars($_POST["name"], ENT_QUOTES);
$email = htmlspecialchars($_POST["email"], ENT_QUOTES);
$area = htmlspecialchars($_POST["area"], ENT_QUOTES);
$title = htmlspecialchars($_POST["title"], ENT_QUOTES);
$message = htmlspecialchars($_POST["message"], ENT_QUOTES);

// reCAPTCHA 検証
$secret = "あなたのシークレットキー";
$response = $_POST["g-recaptcha-response"];
$verify = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=$secret&response=$response");
$captchaSuccess = json_decode($verify);

if ($captchaSuccess->success != true) {
    die("スパム検出：reCAPTCHAエラー");
}

$body = <<<EOT
名前: $name
メール: $email
計画エリア: $area
タイトル: $title
お問い合わせ内容:
$message
EOT;

$headers = "From: $email";

if (mail($to, $subject, $body, $headers)) {
  echo "送信が完了しました。";
} else {
  echo "送信に失敗しました。";
}
?>