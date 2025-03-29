import { getTikzCodeWithBoundingBox, viewport } from "./drawing.js";
import { TikzCode } from "./code.js";
import { Handles } from "./point.js";


function gui_compilesuccess() { imgStatus.src = 'ok.png'; imgStatus.title = "Everything is ok" }
function gui_compiling() { imgStatus.src = 'running.gif'; imgStatus.title = "compiling..." }
function gui_wait() { imgStatus.src = 'wait.jpg'; imgStatus.title = "Wait..." }
function gui_error(msg) { imgStatus.src = 'error.png'; imgStatus.title = msg }

let lastSVGfile = undefined;
async function download() {
	await compile(true);
	window.open(lastSVGfile);
}

document.getElementById("buttonDownload").onclick = download;


let isaskedcompiling = false;
let compiletimer = null;



/**
 * 
 * @param {*} trueiffinalversiontodownload, if true we really compile the good image for downloading
 * if false or undefined, we compile an image to be overlapped with the GUI
 * @description compile the tikz code in the editor and display it in the GUI (or prepare it for downloading)
 */
async function compile(trueiffinalversiontodownload) {
	isaskedcompiling = false;
	gui_compiling();
	console.log("compile");

	/*const msg = checkCode();
	if (msg != true) {
		gui_error(msg);
		isaskedcompiling = false;
		return;
	}*/

	const phpcompileURL = "tikz.php";   //"http://127.0.0.1/servertikzzz/tikz.php"; //"tikz.php";

	if (trueiffinalversiontodownload == undefined)
		trueiffinalversiontodownload = false;

	const code = trueiffinalversiontodownload ? TikzCode.getCode() : getTikzCodeWithBoundingBox(TikzCode.getCode());

	const formData = new FormData();
	formData.append('code', code);
	formData.append('trueiffinalversiontodownload', trueiffinalversiontodownload);

	const query = await fetch(phpcompileURL, {
		method: "POST",
		body: formData
	});

	if (query.ok) {
		const response = await query.text();

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
			};
			lastSVGfile = svgFileName; //ugly
			img.onerror = function () { gui_error("impossible to retrieve the SVG image from the server"); }
		}
		else {
			const img = document.getElementById("outputimg");//new Image();
			img.src = svgFileName;
			img.onload = function () {
				gui_compilesuccess();
				viewport.draw();
			};
			img.onerror = function () { gui_error("impossible to retrieve the SVG image from the server"); }
		}

	}
	else {

		gui_error("there is an error: ", query.result, query.statut, query.error);
		console.log("there is an error: ", query.result, query.statut, query.error);
	}

}





/**
 * 
 * @param {*} durationWait 
 * @description ask to compile the image. The compilation will start in durationWait. meanwhile, it is possible that 
 * the code is modified again... thus, we will cancel the compilation query
 * and wait for the new modification that will be incorporated
 */
function askForCompilation(durationWait) {
	gui_wait();
	console.log("whenmodified");
	if (!isaskedcompiling) {
		isaskedcompiling = true;
		if (compiletimer != null)
			clearTimeout(compiletimer);
		compiletimer = setTimeout(function () { compile(); Handles.update(); viewport.draw(); }, durationWait);
	}
}


export function whenmodified() { askForCompilation(1000); }
export function whenmodifiedquick() { askForCompilation(0); }
