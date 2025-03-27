import { whenmodified } from "./compile.js";




export class TikzCode {


    static getCode() { return editor.getValue(); }
    static setCode(code) { editor.setValue(code); }

    static replaceIt(newtxt) { editor.session.replace(editor.selection.getRange(), newtxt); }


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

        function isCurrentLineEmpty() {
            return getCurrentLineTrimedContent() == "";
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


    static selectionReplaceCoordinates(point) {
        TikzCode.replaceIt(TikzCode.getTikzcodeFromCoordinates(point));
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
TikzCode.replaceIt("\\begin{tikzpicture}\n   \n\\end{tikzpicture}")
editor.gotoLine(2, 4);
editor.commands.on('afterExec', () => whenmodified());


addInsertionButton("node", "\\node (A) at (1, 1) {text};")
addInsertionButton("edge", "\\draw (A) edge (B);")
addInsertionButton("loop", "\\draw (A) edge[loop, loop right] (A);")
addInsertionButton("rectangle", "\\draw (1, 1) rectangle (2, 2);")
addInsertionButton("ellipse", "\\draw (1, 1) ellipse (2cm and 1cm);")
addInsertionButton("curve", "\\draw plot [smooth cycle] coordinates {(0, 0) (1, 0) (2, 2)};")









