function gui_compilesuccess() {
      imgStatus.src = 'ok.png';
}



function gui_compiling() {
      imgStatus.src = 'running.gif';
}


function gui_wait() {
      imgStatus.src = 'wait.jpg';
}


function gui_error() {
      imgStatus.src = 'error.png';
}




function download() {
      compile(true, function () { window.open(lastSVGfile); });
}




const MODE_SELECTION = 0;
const MODE_DRAW = 1;

let guiMode = MODE_SELECTION;


function modeselection() {
      guiMode = MODE_SELECTION;
      buttonModeSelection.classList.add('active');
      buttonModeDraw.classList.remove('active');
      canvas.style.cursor = "default";
}




function modedraw() {
      guiMode = MODE_DRAW;
      buttonModeSelection.classList.remove('active');
      buttonModeDraw.classList.add('active');
      canvas.style.cursor = "crosshair";
}

const editor = ace.edit("code");
//editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");



function getCode() {
      return editor.getValue();
}


function setCode(code) {
      editor.setValue(code);
}


editor.commands.on('afterExec', () => whenmodified());
