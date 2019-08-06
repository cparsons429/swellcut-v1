<?php
  // setup db access
  $host = 'localhost';
  $user = 'phpaccess';
  $pass = '49daysin7weeks=7^2';
  $db = 'SAVED_GENOMES';
  $mysqli = new mysqli($host, $user, $pass, $db);

  // get genome data from db
  $stmt = $mysqli->prepare("SELECT genome_data FROM genome_values WHERE id=?");
  $stmt->bind_param("i", intval($_POST['genome_id']);
  $stmt->execute();
  $stmt->bind_result($g_data);
  $stmt->fetch();
  $stmt->close();

  // return genome data
  if ($g_data == "") {
    return "undef";
  }
  return $g_data;
?>
