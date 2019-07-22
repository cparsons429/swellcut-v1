<?php
  // gotta do this because composer is being a pain, so we need to specify the correct namespaces
  use PHPMailer\PHPMailer\PHPMailer;
  use PHPMailer\PHPMailer\Exception;
  use PHPMailer\PHPMailer\SMTP;

  require 'phpmailer/phpmailer/src/Exception.php';
  require 'phpmailer/phpmailer/src/PHPMailer.php';
  require 'phpmailer/phpmailer/src/SMTP.php';

  // mailing the genome image
  // setup PHPMailer
  $mail = new PHPMailer;

  $mail->IsSMTP();
  $mail->Host = 'email-smtp.us-east-1.amazonaws.com';
  $mail->Port = 587;
  $mail->SMTPAuth = true;
  $mail->Username = 'AKIARL3JIGA4LJAOG67R';
  $mail->Password = 'BOvboI8P6VdtMWmw6NUfeMwVFvZNwPv93R0DFVl9CCEJ';
  $mail->SMTPSecure = 'tls';

  // mail genome image to user
  $mail->From = 'cparsons@swellcut.com';
  $mail->FromName = 'Colin Parsons';
  $mail->AddAddress($_POST['email']);
  $mail->Subject = 'Here\'s your saved design!';
  $mail->Body = "Hi,\r\n\r\nYour saved design is attached to this email. Thanks for using Swellcut!\r\n\r\n-Colin";
  $mail->addStringAttachment($_GET['img'], 'SwellcutDesign.png');

  $mail->Send();
?>
