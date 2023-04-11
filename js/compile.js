import { getTikzCodeWithBoundingBox, draw, setPoints } from "./drawing";
import { getCode, getPointsFromTikz } from "./code";


function gui_compilesuccess() { imgStatus.src = 'ok.png'; }
function gui_compiling() { imgStatus.src = 'running.gif'; }
function gui_wait() { imgStatus.src = 'wait.jpg'; }
function gui_error() { imgStatus.src = 'error.png'; }

function download() { compile(true, function () { window.open(lastSVGfile); }); }



let isaskedcompiling = false;
let compiletimer = null;



/**
 * 
 * @param {*} trueiffinalversiontodownload 
 * @param {*} callBackIfSuccess 
 */
function compile(trueiffinalversiontodownload, callBackIfSuccess) {
	gui_compiling();
	console.log("compile");

	const phpcompileURL = "tikz.php";   //"http://127.0.0.1/servertikzzz/tikz.php"; //"tikz.php";

	if (trueiffinalversiontodownload == undefined)
		trueiffinalversiontodownload = false;

	const code = trueiffinalversiontodownload ? getCode() : getTikzCodeWithBoundingBox(getCode());

	$.ajax({
		type: "POST",
		async: true,
		url: phpcompileURL,
		data: { code: code, trueiffinalversiontodownload: trueiffinalversiontodownload },

		success: function (response, statut) {
			if (response != "") {
				console.log("success with the message: " + response);
				isaskedcompiling = false;
			}
			const d = new Date();

			const lines = response.split("\n");
			const svgFileName = lines[lines.length - 1] + ".svg?" + d.getTime();

			if (trueiffinalversiontodownload) {
				const img = new Image();
				img.src = svgFileName;
				img.onload = function () {
					gui_compilesuccess();
					callBackIfSuccess();
				};
				img.onerror = function () { gui_error(); }
			}
			else {
				const img = document.getElementById("outputimg");//new Image();
				img.src = svgFileName;
				img.onload = function () {
					gui_compilesuccess();
					draw();
				};
				img.onerror = function () { gui_error(); }
			}
		},

		error: function (result, statut, error) {
			gui_error();
			console.log("there is an error: ", result, statut, error);
		}

	});
}





/**
 * 
 * @param {*} durationWait 
 * @description ask to compile the image. The compilation will start in durationWait. meanwhile, it is possible that 
 * the code is modified again... thus, we will cancel the compilation and wait for the new modification that will
 * be incorporated
 */
function askForCompilation(durationWait) {
	gui_wait();
	console.log("whenmodified");
	if (!isaskedcompiling) {
		isaskedcompiling = true;
		if (compiletimer != null)
			clearTimeout(compiletimer);
		compiletimer = setTimeout(function () { compile(); setPoints(getPointsFromTikz(getCode())); draw(); }, durationWait);
	}
}


export function whenmodified() { askForCompilation(1000); }
export function whenmodifiedquick() { askForCompilation(0); }