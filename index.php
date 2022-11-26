<?php
session_start(); // Création de la session
//$_SESSION['prenom'] = 'Jean-Pierre'; // Sauvegarde dans la session créée de la variable "prenom"
?>

<html>

<head>
  <title></title>
  <meta content="">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <script src="https://cdn.jsdelivr.net/npm/ace-builds@1.12.3/src-noconflict/ace.min.js"></script>
  <link rel="stylesheet" type="text/css" href="style.css">
  <script src="js/jquery-1.11.0.min.js" type="text/javascript"></script>

</head>

<body>
  <div class="toolbar">
  Tikzzz: Tikz diagram online editor <span><img id="imgStatus" height=32px /></span>
    <span style="left:50%">
      <button id="buttonDownload" onclick="download()">❤️ Download</button>
      <button id="buttonModeSelection" class="active" onclick="modeselection()">✋ Select</button>
      <button id="buttonModeDraw" onclick="modedraw()">✎ Draw</button>
</span>
  </div>
  <div>
    <div id="code"></div>
    <canvas id="canvas" width=800 height=600 />

  </div>


  <script src="js/gui.js" type="text/javascript"></script>
  <script src="js/main.js" type="text/javascript"></script>

</body>

</html>