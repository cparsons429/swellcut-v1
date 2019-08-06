<?php
  // setup db access
  $host = 'localhost';
  $user = 'phpaccess';
  $pass = '49daysin7weeks=7^2';
  $db = 'SAVED_GENOMES';
  $mysqli = new mysqli($host, $user, $pass, $db);

  // get min and max ids in emailed genomes
  $stmt = $mysqli->prepare("SELECT MIN(id) FROM emailed_genomes");
  $stmt->execute();
  $stmt->bind_result($min);
  $stmt->fetch();
  $stmt->close();
  $min_id = intval($min);

  $stmt = $mysqli->prepare("SELECT MAX(id) FROM emailed_genomes");
  $stmt->execute();
  $stmt->bind_result($max);
  $stmt->fetch();
  $stmt->close();
  $max_id = intval($max);

  // randomly select num_img emails from the database, and get the id of the emailed genome from each of these emails
  // this means that, if a given genome is emailed more often, it is more likely to be selected

  // first, create a list of num_img randomly selected email ids
  $num_images = intval($_POST['num_img']);
  $e_ids = array();
  for ($i = 0; $i < $num_images; $i++) {
    $e_ids[$i] = rand($min_id, $max_id);
  }

  // now, for each email id:
  // (1) get the id of the genome sent in the email with that email id
  // (2) get the data of the genome with that genome id
  // (3) concatenate this genome data in a string, with ";" as a separator
  // IDEA we allow duplicate genomes to be selected, something that we may want to fix in the future
  $return_data = "";

  for ($i = 0; $i < $num_images; $i++) {
    // (1)
    $stmt = $mysqli->prepare("SELECT genome_id FROM emailed_genomes WHERE id=?");
    $stmt->bind_param("i", $e_ids[$i]);
    $stmt->execute();
    $stmt->bind_result($g_id);
    $stmt->fetch();
    $stmt->close();

    // (2)
    $stmt = $mysqli->prepare("SELECT genome_data FROM genome_values WHERE id=?");
    $stmt->bind_param("i", intval($g_id));
    $stmt->execute();
    $stmt->bind_result($g_data);
    $stmt->fetch();
    $stmt->close();

    // (3)
    $return_data += $g_data + ";";
  }

  // return genome data
  return $return_data;
?>
