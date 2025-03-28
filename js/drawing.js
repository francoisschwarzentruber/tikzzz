import { TikzCode } from "./code.js";
import { Handles } from "./point.js";
import { whenmodified, whenmodifiedquick } from "./compile.js";

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

document.getElementById("buttonModeSelection").onclick = modeselection;
document.getElementById("buttonModeDraw").onclick = modedraw;

const GRIDSPACING = 0.5;





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
        Handles.update();

        this.xmin = -Viewport.MAXCOORDDEFAULT;
        this.xmax = Viewport.MAXCOORDDEFAULT;
        this.ymin = -Viewport.MAXCOORDDEFAULT;
        this.ymax = Viewport.MAXCOORDDEFAULT;

        for (const point of Handles.handles) {
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



    /**
     * @param p {x, y} in pixels
     * @returns {x, y} in the TikZ coordinates
     */
    getCoordinatesFromPixelCoordinates(p) {
        return { x: ((p.x - this.boundedBoxHalfSize) / this.scaleratio), y: -((p.y - this.boundedBoxHalfSize) / this.scaleratio) };
    }




    /**
 * 
 * @param {*} x 
 * @param {*} y 
 * @returns the handle that is close to {x, y} or null if there is none
 */
    getPointUnderCursor(x, y) {
        let pointCurrent = null;
        let d = this.boundedBoxHalfSize * 0.005;

        for (const point of Handles.handles) {
            if (distance(point, x, y) <= d) {
                d = distance(point, x, y);
                pointCurrent = point;
            }
        }
        return pointCurrent;
    }


    draw() {

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


        /**
         * 
         * @param {*} ctx the context of the canvas, the context has been "transformed" so that it fits the coordinates of the tikz picture
         * @param {*} point in the Tikz coordinates
         * @description draw the point in the canvas (i.e. a cross)
         */
        function drawPoint(ctx, point) {
            ctx.strokeStyle = point.selected ? "#5555FF" : "#FF0000";
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

        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");

        try {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.save();
            ctx.translate(viewport.boundedBoxHalfSize, viewport.boundedBoxHalfSize);
            ctx.scale(viewport.scaleratio, -viewport.scaleratio);

            drawGrid(ctx);



            for (const point of Handles.handles) {
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


}


export let viewport = new Viewport();



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





let pointCurrent = undefined;
let pointMoving;



/**
 * 
 * @param {*} canvas 
 * @param {*} evt 
 * @returns the point in the canvas zone (in pixels)
 */
function getMousePosPixels(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) * 800 / rect.width,
        y: (evt.clientY - rect.top) * 800 / rect.height
    };
}





window.onload = () => {


    const canvas = document.getElementById("canvas");

    canvas.onmousedown = function (e) {
        mouseButtonDown = true;
        var pos = getCoordinatesFromPixelCoordinatesGrid(getMousePosPixels(canvas, e));
        pointCurrent = viewport.getPointUnderCursor(pos.x, pos.y);


        if (guiMode == MODE_DRAW) {
            mouseInteraction = MOUSEINTERATION_DRAW;

            if (pointCurrent != null)
                mouseInteractionDrawPoint1 = pointCurrent;
            else
                mouseInteractionDrawPoint1 = pos;
            mouseInteractionDrawPoints = new Array();
            mouseInteractionDrawPoints.push(mouseInteractionDrawPoint1);
        }
        else if (guiMode == MODE_SELECTION) {
            if (pointCurrent != null) {
                TikzCode.coordinatesSelect(pointCurrent);
                mouseInteraction = MOUSEINTERATION_MOVEPOINT;
                pointMoving = pointCurrent;
            }
            else
                mouseInteraction = MOUSEINTERATION_SELECT;
        }



        viewport.draw();

    }

    canvas.onmousemove = function (e) {
        var pos = getCoordinatesFromPixelCoordinatesGrid(getMousePosPixels(canvas, e));
        var x = pos.x;
        var y = pos.y;

        if (!mouseButtonDown) {

            var newpointCurrent = viewport.getPointUnderCursor(pos.x, pos.y);

            if (newpointCurrent != pointCurrent) {
                pointCurrent = newpointCurrent;
                viewport.draw();
            }
        }
        else {
            if (mouseInteraction == MOUSEINTERATION_MOVEPOINT) {
                if (pointCurrent == null)
                    return;

                pointMoving = pos;
                viewport.draw();

            }
            else if (mouseInteraction == MOUSEINTERATION_SELECT) {

            }
            else if (mouseInteraction == MOUSEINTERATION_DRAW) {
                pos = viewport.getCoordinatesFromPixelCoordinates(getMousePosPixels(canvas, e));
                mouseInteractionDrawPoints.push(pos);
                viewport.draw();
            }
        }

    }

    canvas.onmouseup = function (e) {
        mouseButtonDown = false;
        var pos = getCoordinatesFromPixelCoordinatesGrid(getMousePosPixels(canvas, e));
        var x = pos.x;
        var y = pos.y;


        if ((mouseInteraction == MOUSEINTERATION_MOVEPOINT) && (pointCurrent != null)) {
            if (pos.x != pointCurrent.x || pos.y != pointCurrent.y) {
                pointCurrent.apply(pos);

                pointCurrent = null;
                whenmodifiedquick();
            }
        }
        else if (mouseInteraction == MOUSEINTERATION_DRAW) {

            function getTikzcodeFromPoint(point) {
                if (point.name != undefined)
                    return "(" + point.name + ")";
                else
                    return TikzCode.getTikzcodeFromCoordinates(point);
            }

            var pointAlreadyHere = viewport.getPointUnderCursor(pos.x, pos.y);
            if ((pointAlreadyHere == null) && (distance(mouseInteractionDrawPoint1, pos.x, pos.y) <= 0.5)) {
                TikzCode.addLine('\\node (' + TikzCode.getNewLabel() + ') at ' + getTikzcodeFromPoint(mouseInteractionDrawPoint1) + " {};");
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


                TikzCode.addLine('\\draw ' + getTikzcodeFromPoint(mouseInteractionDrawPoint1) + ' edge' + edgeStyle + ' ' + getTikzcodeFromPoint(pointAlreadyHere) + ';');
                whenmodifiedquick();
            }

        }
        mouseInteraction = MOUSEINTERATION_NONE;
    }

    canvas.ondblclick = function (e) {
        var pos = getCoordinatesFromPixelCoordinatesGrid(getMousePosPixels(canvas, e));

        if (pointCurrent == null) {
            TikzCode.addLine('\\node (' + TikzCode.getNewLabel() + ') at ' + TikzCode.getTikzcodeFromCoordinates(pos) + ' {};');
            whenmodified();
        }
        else {
            editor.focus();

        }
    }
    whenmodified();
}








/**
 * 
 * @param {*} code 
 * @returns the code + extra tikz code with empty nodes for calibrating the canvas
 */
export function getTikzCodeWithBoundingBox(code) {
    viewport.update(code);

    const i = code.lastIndexOf('\\end{tikzpicture}');
    if (i < 0)
        return code;
    else {
        code = code.substring(0, i);
        code += `\\node at (${viewport.xmin}, ${viewport.ymin}) {};\n\\node at (${viewport.xmax}, ${viewport.ymax}) {};\n` + '\\end{tikzpicture}';
        return code;
    }
}
