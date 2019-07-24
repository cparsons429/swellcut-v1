<?php
  // gotta do this because composer is being a pain, so we need to specify the correct namespaces
  use PHPMailer\PHPMailer\PHPMailer;
  use PHPMailer\PHPMailer\Exception;
  use PHPMailer\PHPMailer\SMTP;

  require 'PHPMailer-master/src/Exception.php';
  require 'PHPMailer-master/src/PHPMailer.php';
  require 'PHPMailer-master/src/SMTP.php';

  // save email and genome to our MariaDB SAVED_GENOMES -> emailed_genomes table
  // setup db access
  $host = 'localhost';
  $user = 'phpaccess';
  $pass = '49daysin7weeks=7^2';
  $db = 'SAVED_GENOMES';
  $mysqli = new mysqli($host, $user, $pass, $db);

  // enter genome into db
  $stmt = $mysqli->prepare("INSERT INTO emailed_genomes (email, genome_data) VALUES (?, ?)");
  $stmt->bind_param("ss", $_POST['email'], $_POST['genome-data']);
  $stmt->execute();
  $stmt->close();
  $mysqli->close();

  // getting the image in the correct format
  $raw_img_str = $_POST['image-data'];
  $img_str = substr($raw_img_str, strpos($raw_img_str, ","));
  $filename = "SwellcutDesign.png";
  $encoding = "base64";
  $type = "image/png";

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
  $mail->addStringAttachment(base64_decode($img_str), $filename, $encoding, $type);
  $mail->Send();
?>
