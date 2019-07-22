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

  $mail->IsSMTP();  // TODO: update all these SMTP details
  $mail->Host = 'email-smtp.us-east-1.amazonaws.com';
  $mail->Port = 587;
  $mail->SMTPAuth = true;
  $mail->Username = 'AKIAJWD4TF2I2WR6ZLTQ';
  $mail->Password = 'AoU60gYiP1RRZSSVfTc5pqlyzMEYPP+L7HovsbZhO7f/';
  $mail->SMTPSecure = 'tls';

  // mail genome image to user
  $mail->From = 'cparsons@swellcut.com';
  $mail->FromName = 'Colin Parsons';
  $mail->AddAddress($_POST['email']);
  $mail->Subject = 'Here\'s your saved design!';
  $mail->Body = "Hi,\r\n\r\nYour saved design is attached to this email. Thanks for using Swellcut!\r\n\r\nEnjoy,\r\n\r\nColin";
  $mail->addAttachment('/tmp/image.jpg', 'new.jpg');  // TODO: convert image to png and send

  $mail->Send();
?>
