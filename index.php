<?php
session_start(); // Création de la session
//$_SESSION['prenom'] = 'Jean-Pierre'; // Sauvegarde dans la session créée de la variable "prenom"
?>

<html>
  <head>
    <title></title>
    <meta content="">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="style.css">
     <script src="js/jquery-1.11.0.min.js" type="text/javascript"></script>
    <script src="js/main.js" type="text/javascript"></script>
    <script src="js/gui.js" type="text/javascript"></script>
  </head>
  <body>
  
  <h1>Tikzzz: Tikz diagram online editor</h1>
  <table>
  
  <tr>
  <td>
  
  
  <img id="imgStatus" height=32px/></br>
  <textarea autofocus id="code" rows= 40 cols=50 onkeydown="whenmodified()">
  \begin{tikzpicture}
       \tikzstyle{etat} = [draw, fill=white];
	\node[etat, initial left, initial text={}, text width=3cm] (a) at (0, 0) {$\mathsf{a}$ : attente d'une pièce de monnaie };
	\node[etat, text width=2.3cm] (s)  at (0, -2) {$\mathsf{s}$ : selection d'une boisson };
	\node[etat] (c1)  at (-4, -2) {$\mathsf{e}$ : eau minérale };
	\node[etat] (c2)  at (4, -2) {$\mathsf{j}$ : jus d'orange };
	\draw[->] (a) edge[loop above] (a);
	\draw[->] (s) edge[loop below] (s);
	\draw[->] (a) -- (s);
	\draw[->] (s) -- (c1);
	\draw[->] (s) -- (c2);
	\draw[->] (c1) edge[bend right=-10] (a);
	\draw[->] (c2) edge[bend right=10] (a);
   \end{tikzpicture}
  </textarea>
  
  
  
  </td>
  
  <td>
<button id="buttonDownload" onclick="download()"><img height=32px src="download.png"/>Download</button>
<button id="buttonModeSelection" class="active" onclick="modeselection()"><img height=32px src="cursor.svg"/>Select</button>
<button id="buttonModeDraw" onclick="modedraw()"><img src="pen.jpg"/>Draw</button></br>
  <canvas id="canvas" width=800 height=600/>
  </td>
  
  </tr>
  
  
  
  </table> 
  
  
  
  
  </body>
</html>
