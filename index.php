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

</head>

<body>
  <div class="toolbar">
    Tikzzz: Tikz diagram online editor
    <span style="left:50%">
      <img id="imgStatus" title="status of the compilation" height=16px />
      
      <button id="buttonModeSelection" class="active">✋ Select</button>
      <button id="buttonModeDraw">✎ Draw</button>
    </span>
  
    <div id="toolbarInsert"></div>
    <button id="buttonDownload">❤️ Download</button>
  </div>
  <div>
    <div id="code"></div>
    <div id="output">
      <img id="outputimg"></img>
      <canvas id="canvas" width=800 height=800 />
    </div>
  </div>


  <script type="module" src="js/main.js"></script>
</body>

</html>