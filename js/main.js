
const GRIDSPACING = 0.5;
let isaskedcompiling = false;
let compiletimer = null;


/**
 * viewport (i.e. the portion of the plane of the tikz picture)
 */
class Viewport {
	static MAXCOORDDEFAULT = 10;

	/**
	 * 
	 * @param {*} tikzCode
	 * @description udpate the viewport from the tikzCode 
	 */
	update(tikzCode) {
		const points = getPointsFromTikz(tikzCode);

		this.xmin = -Viewport.MAXCOORDDEFAULT;
		this.xmax = Viewport.MAXCOORDDEFAULT;
		this.ymin = -Viewport.MAXCOORDDEFAULT;
		this.ymax = Viewport.MAXCOORDDEFAULT;

		for (const point of points) {
			this.xmin = Math.min(point.x, this.xmin);
			this.xmax = Math.max(point.x, this.xmax);
			this.ymin = Math.min(point.y, this.ymin);
			this.ymax = Math.max(point.y, this.ymax);
		}

		const smallScale = 1.2;
		const maxcoord = Math.max(Math.abs(this.xmin), Math.abs(this.ymin), Math.abs(this.xmax), Math.abs(this.ymax));
		this.xmin = -maxcoord * smallScale;
		this.ymin = -maxcoord * smallScale;
		this.xmax = maxcoord * smallScale;
		this.ymax = maxcoord * smallScale;
	}

	get maxcoord() { return this.xmax };
	get boundedBoxHalfSize() { return canvas.width / 2; }
	get scaleratio() { return this.boundedBoxHalfSize / this.maxcoord };

	getCoordinatesFromPixelCoordinates(p) {
		return { x: ((p.x - this.boundedBoxHalfSize) / this.scaleratio), y: -((p.y - this.boundedBoxHalfSize) / this.scaleratio) };
	}

}


let viewport = new Viewport();



/**
 * 
 * @param {*} code 
 * @returns the code + extra tikz code with empty nodes for calibrating the canvas
 */
function getTikzCodeWithBoundingBox(code) {
	viewport.update(code);

	const i = code.indexOf('\\end{tikzpicture}');
	if (i < 0)
		return code;
	else {
		code = code.substring(0, i);
		code += `\\node at (${viewport.xmin}, ${viewport.ymin}) {};\n\\node at (${viewport.xmax}, ${viewport.ymax}) {};\n` + '\\end{tikzpicture}';
		return code;
	}
}


/**
 * 
 * @returns a new fresh tikz label
 */
function getTikzcodeNewLabel() {
	const code = getCode();
	for (let i = 0; i < 5000; i++) {
		const id = "v" + i;
		if (code.indexOf("(" + id + ")") == -1)
			return id;
	}
	return "v42";
}



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


let points = new Array();


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
		compiletimer = setTimeout(function () { compile(); points = getPointsFromTikz(getCode()); draw(); }, durationWait);
	}
}


function whenmodified() { askForCompilation(1000); }
function whenmodifiedquick() { askForCompilation(0); }


/**
 * 
 * @param {*} code tikz code
 * @returns an array containing the list of points, i.e. coordinates that appear in the tikz code
 * Each point is {x, y, posbegin, posend, name} where (x, y) are the coordinates, posbegin, posend are the index positions in the tikz
 * code
 * name = the name of the corresponding node if there is one
 */
function getPointsFromTikz(code) {
	const points = new Array();
	let counter = 0;
	let name = undefined;
	let iname = undefined;
	let iend = undefined;

	console.log("getPointsFromTikz");
	let i = 0;
	while (i >= 0) {
		i = code.indexOf("(", i);

		if (i >= 0) {
			const icomma = code.indexOf(",", i);
			iend = code.indexOf(")", i);


			const n1 = code.substring(i + 1, icomma);
			const n2 = code.substring(icomma + 1, iend);

			if ((i < iend) && ((iend < icomma) || (icomma < i))) {
				iname = i;
				name = code.substring(i + 1, iend);
				console.log(name);
			}
			if ((i < icomma) && (icomma < iend) && (parseFloat(n1) != NaN) && (parseFloat(n2) != NaN)) {
				if (name != undefined) {
					if (!((i - (iname + name.length) < 10) && code.substring(iname + name.length, i).indexOf("at") >= 0))
						name = undefined;
				}

				points.push({ x: parseFloat(n1), y: parseFloat(n2), posbegin: i, posend: iend, name: name });
			}
		}

		i = iend;

		counter++;

		if (counter > 100)
			return points;

	}
	return points;
}









function draw() {

	/**
	 * 
	 * @param {*} ctx
	 * @description draw a grid 
	 */
	function drawGrid(ctx) {
		ctx.beginPath();
		ctx.strokeStyle = "#DDDDDD";
		ctx.lineWidth = 0.8 / viewport.scaleratio;

		function toGridSpacing(a) { return Math.floor(a * 2) / 2; }

		const gridspacingDisplayed = toGridSpacing((viewport.maxcoord) / 10);
		for (let ix = -viewport.maxcoord; ix < viewport.maxcoord; ix += gridspacingDisplayed) {
			ctx.moveTo(ix * gridspacingDisplayed, -viewport.maxcoord);
			ctx.lineTo(ix * gridspacingDisplayed, viewport.maxcoord);
			ctx.moveTo(-viewport.maxcoord, ix * gridspacingDisplayed);
			ctx.lineTo(viewport.maxcoord, ix * gridspacingDisplayed);
		}
		ctx.stroke();
	}

	function drawPoint(ctx, point) {
		var crosssize = 5 / viewport.scaleratio;
		ctx.beginPath();
		ctx.moveTo(point.x - crosssize, point.y - crosssize);
		ctx.lineTo(point.x + crosssize, point.y + crosssize);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(point.x - crosssize, point.y + crosssize);
		ctx.lineTo(point.x + crosssize, point.y - crosssize);
		ctx.stroke();
	}

	function drawLines(ctx, polylinePoints) {
		ctx.beginPath();
		ctx.strokeStyle = "#888888";
		ctx.lineWidth = 1 / viewport.scaleratio;
		ctx.moveTo(polylinePoints[0].x, polylinePoints[0].y);
		for (let i = 1; i < polylinePoints.length; i++)
			ctx.lineTo(polylinePoints[i].x, polylinePoints[i].y);

		ctx.stroke();
	}

	//console.log("draw"); 
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");

	try {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.save();
		ctx.translate(viewport.boundedBoxHalfSize, viewport.boundedBoxHalfSize);
		ctx.scale(viewport.scaleratio, -viewport.scaleratio);

		drawGrid(ctx);

		ctx.strokeStyle = "#FF0000";

		for (const point of points) {
			if (pointCurrent == point && mouseInteraction != MOUSEINTERATION_MOVEPOINT)
				ctx.lineWidth = 5 / viewport.scaleratio;
			else
				ctx.lineWidth = 1 / viewport.scaleratio;
			drawPoint(ctx, point);

		}

		if (mouseInteraction == MOUSEINTERATION_MOVEPOINT) {
			if (pointMoving != null) {
				ctx.strokeStyle = "#FF0000";
				ctx.lineWidth = 5 / viewport.scaleratio;
				drawPoint(ctx, pointMoving);
			}
		}
		else if (mouseInteraction == MOUSEINTERATION_DRAW) {
			drawLines(ctx, mouseInteractionDrawPoints);
		}

		ctx.restore();
		ctx.save();
		ctx.translate(viewport.boundedBoxHalfSize, viewport.boundedBoxHalfSize);
		// /!\ we can not make ctx.scale(scaleratio, -scaleratio); because the text would be vertically mirrored
		ctx.scale(viewport.scaleratio, viewport.scaleratio);

		ctx.lineWidth = 1 / viewport.scaleratio;
		if (pointCurrent != null) {
			if (pointCurrent.name != undefined) {
				ctx.font = "0.9px Arial";
				ctx.fillStyle = "#FF0000";
				ctx.fillText(pointCurrent.name, pointCurrent.x + 0.5, -pointCurrent.y + 0.5);
				console.log(pointCurrent.name);
			}
		}

		ctx.restore();
	}
	catch (e) {
		console.log("ERROR when drawing the image");
		console.log(e)
	}
}



/*getCoordinatesFromPixelCoordinates({x: 300, y: 300})
 * */
function getCoordinatesFromPixelCoordinatesGrid(p) {
	const pp = viewport.getCoordinatesFromPixelCoordinates(p);
	return {
		x: Math.round((pp.x) / GRIDSPACING) * GRIDSPACING,
		y: Math.round((pp.y) / GRIDSPACING) * GRIDSPACING
	};
}


const MOUSEINTERATION_NONE = 0;
const MOUSEINTERATION_MOVEPOINT = 1;
const MOUSEINTERATION_SELECT = 2;
const MOUSEINTERATION_DRAW = 3;

let mouseButtonDown = false;
let mouseInteraction = 0;

let mouseInteractionDrawPoint1 = undefined;
let mouseInteractionDrawPoints = undefined;

function distance(point, x, y) { return Math.sqrt((point.x - x) * (point.x - x) + (point.y - y) * (point.y - y)); }


function getPointUnderCursor(x, y) {
	let pointCurrent = null;
	let d = viewport.boundedBoxHalfSize * 0.005;

	for (const point of points) {
		if (distance(point, x, y) <= d) {
			d = distance(point, x, y);
			pointCurrent = point;
		}
	}
	return pointCurrent;
}



let pointCurrent = undefined;
let pointMoving;



/**
 * 
 * @param {*} canvas 
 * @param {*} evt 
 * @returns the point in the canvas zone (in pixels)
 */
function getMousePos(canvas, evt) {
	const rect = canvas.getBoundingClientRect();
	return {
		x: (evt.clientX - rect.left) * 800 / rect.width,
		y: (evt.clientY - rect.top) * 800 / rect.height
	};
}


$(document).ready(function () {
	const canvas = document.getElementById("canvas");

	canvas.onmousedown = function (e) {
		mouseButtonDown = true;
		var pos = getCoordinatesFromPixelCoordinatesGrid(getMousePos(canvas, e));
		pointCurrent = getPointUnderCursor(pos.x, pos.y);


		if (guiMode == MODE_DRAW) {
			mouseInteraction = MOUSEINTERATION_DRAW;

			if (pointCurrent != null)
				mouseInteractionDrawPoint1 = pointCurrent;
			else
				mouseInteractionDrawPoint1 = pos;
			mouseInteractionDrawPoints = new Array();
			mouseInteractionDrawPoints.push(mouseInteractionDrawPoint1);
		}
		else {
			if (pointCurrent != null) {
				tikzcodeCoordinatesSelect(pointCurrent);
				mouseInteraction = MOUSEINTERATION_MOVEPOINT;
				pointMoving = pointCurrent;
			}
			else
				mouseInteraction = MOUSEINTERATION_SELECT;
		}



		draw();

	}

	canvas.onmousemove = function (e) {
		var pos = getCoordinatesFromPixelCoordinatesGrid(getMousePos(canvas, e));
		var x = pos.x;
		var y = pos.y;

		if (!mouseButtonDown) {

			var newpointCurrent = getPointUnderCursor(pos.x, pos.y);

			if (newpointCurrent != pointCurrent) {
				pointCurrent = newpointCurrent;
				draw();
			}
		}
		else {
			if (mouseInteraction == MOUSEINTERATION_MOVEPOINT) {
				if (pointCurrent == null)
					return;

				pointMoving = pos;
				draw();

			}
			else if (mouseInteraction == MOUSEINTERATION_DRAW) {
				pos = viewport.getCoordinatesFromPixelCoordinates(getMousePos(canvas, e));
				mouseInteractionDrawPoints.push(pos);
				draw();
			}
		}

	}

	canvas.onmouseup = function (e) {
		mouseButtonDown = false;
		var pos = getCoordinatesFromPixelCoordinatesGrid(getMousePos(canvas, e));
		var x = pos.x;
		var y = pos.y;


		if ((mouseInteraction == MOUSEINTERATION_MOVEPOINT) && (pointCurrent != null)) {
			if (pos.x != pointCurrent.x || pos.y != pointCurrent.y) {
				tikzcodeSelectionReplaceCoordinates(pos);
				pointCurrent = null;
				whenmodifiedquick();
			}
		}
		else if (mouseInteraction == MOUSEINTERATION_DRAW) {
			var pointAlreadyHere = getPointUnderCursor(pos.x, pos.y);
			if ((pointAlreadyHere == null) && (distance(mouseInteractionDrawPoint1, pos.x, pos.y) <= 0.5)) {
				tikzcodeAddLine('\\node (' + getTikzcodeNewLabel() + ') at ' + getTikzcodeFromPoint(mouseInteractionDrawPoint1) + " {};");
				whenmodifiedquick();
			}
			else {
				if (pointAlreadyHere == null)
					pointAlreadyHere = pos;
				var edgeStyle = "";

				if (mouseInteractionDrawPoint1.name != undefined && mouseInteractionDrawPoint1.name == pointAlreadyHere.name) {
					var middlePoint = mouseInteractionDrawPoints[Math.floor(mouseInteractionDrawPoints.length / 2)];

					if ((middlePoint.x - mouseInteractionDrawPoint1.x) >= 0 && (Math.abs(middlePoint.x - mouseInteractionDrawPoint1.x) >= Math.abs((middlePoint.y - mouseInteractionDrawPoint1.y))))
						edgeStyle = "[loop right]";

					if ((middlePoint.x - mouseInteractionDrawPoint1.x) < 0 && (Math.abs(middlePoint.x - mouseInteractionDrawPoint1.x) >= Math.abs((middlePoint.y - mouseInteractionDrawPoint1.y))))
						edgeStyle = "[loop left]";

					if ((middlePoint.y - mouseInteractionDrawPoint1.y) >= 0 && (Math.abs(middlePoint.x - mouseInteractionDrawPoint1.x) <= Math.abs((middlePoint.y - mouseInteractionDrawPoint1.y))))
						edgeStyle = "[loop above]";

					if ((middlePoint.y - mouseInteractionDrawPoint1.y) < 0 && (Math.abs(middlePoint.x - mouseInteractionDrawPoint1.x) <= Math.abs((middlePoint.y - mouseInteractionDrawPoint1.y))))
						edgeStyle = "[loop below]";

				}


				tikzcodeAddLine('\\draw ' + getTikzcodeFromPoint(mouseInteractionDrawPoint1) + ' edge' + edgeStyle + ' ' + getTikzcodeFromPoint(pointAlreadyHere) + ';');
				whenmodifiedquick();
			}

		}
		mouseInteraction = MOUSEINTERATION_NONE;
	}

	canvas.ondblclick = function (e) {
		var pos = getCoordinatesFromPixelCoordinatesGrid(getMousePos(canvas, e));

		if (pointCurrent == null) {
			tikzcodeAddLine('\\node (' + getTikzcodeNewLabel() + ') at ' + getTikzcodeFromCoordinates(pos) + ' {};');
			whenmodified();
		}
		else {
			editor.focus();

		}
	}
	whenmodified();
}
);

/*
function selectBracket() {
	var i = $('#code')[0].selectionStart;
	var code = getCode();

	var posbegin = code.indexOf('[', i - 30);
	var posend = code.indexOf(']', i);

	$('#code')[0].selectionStart = posbegin;
	$('#code')[0].selectionEnd = posend + 1;
}*/


function tikzcodeCoordinatesSelect(point) {
	editor.selection.setRange({
		start: editor.session.doc.indexToPosition(point.posbegin),
		end: editor.session.doc.indexToPosition(point.posend + 1)
	})
}

function tikzcodeAddLine(line) {
	const currentLine = editor.session.getLine(editor.selection.getRange().start.row);
	if (currentLine.trim() != "")
		line = "\n   " + line;
	editorInsert(line);
	return
	let code = getCode();
	const i = code.indexOf('\\end{tikzpicture}');
	if (i < 0)
		code = code + "\n" + line;
	else {
		code = code.substring(0, i) + '\n' + line + '\n' + '\\end{tikzpicture}';
	}
	setCode(code);
}


function editorInsert(str) {
	const r = editor.selection.getRange();
	editor.session.replace(r, str);
}


function formatToAvoidUglyNumber(x) {
	if (x == x.toFixed(0))
		return x;
	else if (x == x.toFixed(1))
		return x.toFixed(1);
	else
		return x.toFixed(2);
}




function getTikzcodeFromPoint(point) {
	if (point.name != undefined)
		return "(" + point.name + ")";
	else
		return getTikzcodeFromCoordinates(point);
}


function getTikzcodeFromCoordinates(point) {
	return "(" + formatToAvoidUglyNumber(point.x) + ", " + formatToAvoidUglyNumber(point.y) + ")";
}


function tikzcodeSelectionReplaceCoordinates(point) {
	replaceIt(getTikzcodeFromCoordinates(point));
}
