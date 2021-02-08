function gui_compilesuccess()
{
	$('#imgStatus').attr('src', 'ok.png');
}



function gui_compiling()
{
	$('#imgStatus').attr('src', 'running.gif');
}


function gui_wait()
{
	$('#imgStatus').attr('src', 'wait.jpg');
}


function gui_error()
{
	$('#imgStatus').attr('src', 'error.png');
}




function download()
{
     compile(true, function() {window.open(lastSVGfile);});
  
}




var MODE_SELECTION = 0;
var MODE_DRAW = 1;

var guiMode = MODE_SELECTION;


function modeselection()
{
      guiMode = MODE_SELECTION; 
      $('#buttonModeSelection').addClass('active');
      $('#buttonModeDraw').removeClass('active');
      $('#canvas').css( 'cursor', "default");
}




function modedraw()
{
      guiMode = MODE_DRAW; 
      $('#buttonModeSelection').removeClass('active');
      $('#buttonModeDraw').addClass('active');
      $('#canvas').css( 'cursor', "crosshair");
}