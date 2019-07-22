<!DOCTYPE html>
<html>
<head>
</head>
<body>
  <?php
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
  ?>
  <canvas id = "imagedrawer" height="500" width="500"></canvas>
  <!-- Our JavaScript -->
  <script src="https://colinparsons.me/swellcut/recurrent.js"></script>
  <script src="https://colinparsons.me/swellcut/neat.js"></script>
  <script src="https://colinparsons.me/swellcut/neat.graph.js"></script>
  <script src="https://colinparsons.me/swellcut/netart-edited.js"></script>
  <script type="text/javascript">
    var fs = require("fs");
    var functioning_shirt_mask_uri = fs.readFileSync("https://colinparsons.me/swellcut/functioning_shirt_mask_uri.txt");

    <?php
      echo sprintf("var genomeJSON = %s;", $_POST['genome-data']);
    ?>
    var genome = new N.Genome(genomeJSON);
    genome.roundWeights();

    var thumbSize = 500;
    var thumb = NetArt.genGenomeImage(genome, thumbSize, thumbSize);

    var canvas = document.getElementById('imagedrawer');
    var ctx = canvas.getContext('2d');

    var img = new Image;
    img.src = functioning_shirt_mask_uri;
    ctx.putImageData(thumb.getCanvasImage(ctx), 0, 0);
    ctx.drawImage(img, 0, 0);

    window.location.href = "http://ec2-54-209-152-17.compute-1.amazonaws.com/designemailer.php?img=".(canvas.toDataURL());
  </script>
</body>
</html>
