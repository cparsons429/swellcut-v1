<?php
  // gotta do this because composer is being a pain, so we need to specify the correct namespaces
  use PHPMailer\PHPMailer\PHPMailer;
  use PHPMailer\PHPMailer\Exception;
  use PHPMailer\PHPMailer\SMTP;

  require 'PHPMailer-master/src/Exception.php';
  require 'PHPMailer-master/src/PHPMailer.php';
  require 'PHPMailer-master/src/SMTP.php';

  // save email and genome to our MariaDB SAVED_GENOMES database
  // setup db access
  $host = 'localhost';
  $user = 'phpaccess';
  $pass = '49daysin7weeks=7^2';
  $db = 'SAVED_GENOMES';
  $mysqli = new mysqli($host, $user, $pass, $db);

  // getting email id, and saving email if not already saved
  // if already saved, get email id from db
  $stmt = $mysqli->prepare("SELECT COUNT(*), id FROM emails WHERE email=?");
  $stmt->bind_param("s", $_POST['email']);
  $stmt->execute();
  $stmt->bind_result($count_str, $e_id_str);
  $stmt->fetch();
  $stmt->close();

  // if not already saved, save email, then get email id
  if (intval($count_str) == 0) {
    // save email
    $stmt = $mysqli->prepare("INSERT INTO emails (email) VALUES (?)");
    $stmt->bind_param("s", $_POST['email']);
    $stmt->execute();
    $stmt->close();

    // get email id
    $stmt = $mysqli->prepare("SELECT LAST_INSERT_ID()");
    $stmt->execute();
    $stmt->bind_result($e_id_str);
    $stmt->fetch();
    $stmt->close();
  }

  $e_id = intval($e_id_str);

  if (isset($_POST['genome-data'])) {
    // this is a new genome to save to the database
    // saving genome
    $stmt = $mysqli->prepare("INSERT INTO genome_values (creator_email_id, genome_data) VALUES (?, ?)");
    $stmt->bind_param("is", $e_id, $_POST['genome-data']);
    $stmt->execute();
    $stmt->close();

    // getting just-saved genome's id
    $stmt = $mysqli->prepare("SELECT LAST_INSERT_ID()");
    $stmt->execute();
    $stmt->bind_result($g_id_str);
    $stmt->fetch();
    $stmt->close();

    $g_id = intval($g_id_str);
  } else {
    // this is a genome that already exists in the database
    $g_id = intval($_POST['genome-id']);
  }

  // entering a record of the email sent into db
  $stmt = $mysqli->prepare("INSERT INTO emailed_genomes (receiver_email_id, genome_id) VALUES (?, ?)");
  $stmt->bind_param("ii", $e_id, $g_id);
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
