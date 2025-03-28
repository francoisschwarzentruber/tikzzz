import { whenmodified } from "./compile.js";
import { Handles } from "./point.js";
import { viewport } from "./drawing.js";


/**
 * This class is a static class that represents the tikz code in the editor.
 */
export class TikzCode {

    /**
     * 
     * @returns the tikz code in the editor
     */
    static getCode() { return editor.getValue(); }


    /**
     * 
     * @param {*} code
     * @description set the tikz code in the editor 
     */
    static setCode(code) { editor.setValue(code); }


    /**
     * 
     * @param {*} newtxt
     * @description replace the current selection by newtxt 
     */
    static replaceSelection(newtxt) { editor.session.replace(editor.selection.getRange(), newtxt); }


    /**
     * 
     * @returns the current selection range in the editor {start, end} where start and end are the index positions in the tikz code
     */
    static getSelectionRange() {
        const range = editor.selection.getRange();
        return {
            start: editor.session.doc.positionToIndex(range.start),
            end: editor.session.doc.positionToIndex(range.end)
        }
    }


    static setSelectionRange(startIndex, endIndex) {
        const start = editor.session.doc.indexToPosition(startIndex);
        const end = editor.session.doc.indexToPosition(endIndex);
        editor.selection.setRange({ start, end });

    }

    /**
     * 
     * @param {*} point a handle
     * @description select the portion of the text, e.g. "(1, 4)", that corresponds to the coordinates of the handle in the editor
     */
    static coordinatesSelect(point) {
        editor.selection.setRange({
            start: editor.session.doc.indexToPosition(point.posbegin),
            end: editor.session.doc.indexToPosition(point.posend + 1)
        })
    }



    /**
     * 
     * @param {*} line 
     * @description adds the line near the cursor in the tikzcode editor
     */
    static addLine(line) {
        function editorInsert(str) {
            const r = editor.selection.getRange();
            const row = r.end.row + 1;
            editor.gotoLine(row, +Infinity);
            editor.session.replace(r, str);
            editor.gotoLine(row + 1, +Infinity);
        }

        function getCurrentLineTrimedContent() {
            const currentLine = editor.session.getLine(editor.selection.getRange().end.row);
            return currentLine.trim()
        }

        editor.execCommand("gotolineend");

        const currentLine = getCurrentLineTrimedContent();

        if (currentLine == "\\end{tikzpicture}") {
            editor.gotoLine(editor.selection.getRange().end.row - 1);
            editor.execCommand("gotolineend");
        }
        if (currentLine != "")
            line = "\n   " + line;
        editorInsert(line);
    }





    /**
         * 
         * @returns a new fresh tikz label
         */
    static getNewLabel() {
        const code = TikzCode.getCode();
        for (let i = 0; i < 5000; i++) {
            const id = "v" + i;
            if (code.indexOf("(" + id + ")") == -1)
                return id;
        }
        return "v42";
    }




    /**
     * TO BE MOVED IN HANDLE,  but not possible because raw points when we move a point, Or should be as a static method there
     * @param {*} point 
     * @returns 
     */
    static getTikzcodeFromCoordinates(point) {
        function formatToAvoidUglyNumber(x) {
            if (x == x.toFixed(0))
                return x;
            else if (x == x.toFixed(1))
                return x.toFixed(1);
            else
                return x.toFixed(2);
        }
        return "(" + formatToAvoidUglyNumber(point.x) + ", " + formatToAvoidUglyNumber(point.y) + ")";
    }



}




/**
 * 
 * @param {*} caption e.g. "node" (the name of what to insert)
 * @param {*} code the corresponding tikz code to insert
 * @description create a button in the toolbar to insert the corresponding tikz code
 */
function addInsertionButton(caption, code) {
    const b = document.createElement("button");
    b.innerHTML = caption;
    b.onclick = () => { TikzCode.addLine(code); whenmodified(); editor.focus() };
    b.title = "Insert " + code;
    toolbarInsert.appendChild(b);
}


/* initialization */
const editor = ace.edit("code");
editor.getSession().setUseWorker(false);
editor.getSession().setMode("ace/mode/latex");
TikzCode.replaceSelection("\\begin{tikzpicture}\n   \n\\end{tikzpicture}")
editor.gotoLine(2, 4);
editor.commands.on('afterExec', () => whenmodified());




function onSelectionChangeViaMouseOrKeyboard() {
    console.log("changeselection");
    Handles.update();
    viewport.draw();
}
editor.on('mousemove', onSelectionChangeViaMouseOrKeyboard);
//https://groups.google.com/g/ace-discuss/c/IgDAOH2XHTg

addInsertionButton("node", "\\node (A) at (1, 1) {text};")
addInsertionButton("edge", "\\draw (A) edge (B);")
addInsertionButton("loop", "\\draw (A) edge[loop, loop right] (A);")
addInsertionButton("rectangle", "\\draw (1, 1) rectangle (2, 2);")
addInsertionButton("ellipse", "\\draw (1, 1) ellipse (2cm and 1cm);")
addInsertionButton("curve", "\\draw) plot [smooth cycle] coordinates {(0, 0) (1, 0) (2, 2)};")









