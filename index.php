<?php
session_start(); // Création de la session
//$_SESSION['prenom'] = 'Jean-Pierre'; // Sauvegarde dans la session créée de la variable "prenom"
?>

<html>

<head>
  <title></title>
  <meta content="">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <script src="https://cdn.jsdelivr.net/npm/ace-builds@1.12.3/src-noconflict/ace.js"></script>
  <link rel="stylesheet" type="text/css" href="style.css">
  <script src="js/jquery-1.11.0.min.js" type="text/javascript"></script>

</head>

<body>
  <div class="toolbar">
    Tikzzz: Tikz diagram online editor
    <span style="left:50%">
      <img id="imgStatus" title="status of the compilation" height=16px />
      <button id="buttonDownload" onclick="download()">❤️ Download</button>
      <button id="buttonModeSelection" class="active" onclick="modeselection()">✋ Select</button>
      <button id="buttonModeDraw" onclick="modedraw()">✎ Draw</button>
    </span>
    <div id="toolbarInsert"></div>
  </div>
  <div>
    <div id="code"></div>
    <div id="output">
      <img id="outputimg"></img>
      <canvas id="canvas" width=800 height=800 />
    </div>
  </div>


  <script type="text/javascript" src="dist/bundle.js"></script>
</body>

</html>