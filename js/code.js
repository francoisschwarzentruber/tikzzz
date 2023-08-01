import { whenmodified, whenmodifiedquick } from "./compile.js";
import { HandleCoordinate } from "./handle.js";


const editor = ace.edit("code");
editor.getSession().setUseWorker(false);
editor.getSession().setMode("ace/mode/latex");
replaceIt("\\begin{tikzpicture}\n   \n\\end{tikzpicture}")
editor.gotoLine(2, 4);

export function getCode() { return editor.getValue(); }
export function setCode(code) { editor.setValue(code); }

editor.commands.on('afterExec', () => whenmodified());

function replaceIt(newtxt) { editor.session.replace(editor.selection.getRange(), newtxt); }


function addInsertionButton(caption, code) {
    const b = document.createElement("button");
    b.innerHTML = caption;
    b.onclick = () => { tikzcodeAddLine(code); whenmodified(); editor.focus() };
    b.title = "Insert " + code;
    toolbarInsert.appendChild(b);
}


addInsertionButton("node", "\\node (A) at (1, 1) {text};")
addInsertionButton("edge", "\\draw (A) edge (B);")
addInsertionButton("loop", "\\draw (A) edge[loop, loop right] (A);")
addInsertionButton("rectangle", "\\draw (1, 1) rectangle (2, 2);")
addInsertionButton("ellipse", "\\draw (1, 1) ellipse (2cm and 1cm);")
addInsertionButton("curve", "\\draw plot [smooth cycle] coordinates {(0, 0) (1, 0) (2, 2)};")




/**
 * 
 * @param {*} code tikz code
 * @returns an array containing the list of points, i.e. coordinates that appear in the tikz code
 * Each point is {x, y, posbegin, posend, name} where (x, y) are the coordinates, posbegin, posend are the index positions in the tikz
 * code
 * name = the name of the corresponding node if there is one
 */
export function getPointsFromTikz(code) {
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

                points.push(new HandleCoordinate({ x: parseFloat(n1), y: parseFloat(n2), posbegin: i, posend: iend, name: name }));
            }
        }

        i = iend;

        counter++;

        if (counter > 100)
            return points;

    }
    return points;
}






export function tikzcodeCoordinatesSelect(point) {
    editor.selection.setRange({
        start: editor.session.doc.indexToPosition(point.posbegin),
        end: editor.session.doc.indexToPosition(point.posend + 1)
    })
}

export function tikzcodeAddLine(line) {
    function editorInsert(str) {
        const r = editor.selection.getRange();
        const row = r.end.row+1;
        editor.gotoLine(row, +Infinity);
        editor.session.replace(r, str);
        editor.gotoLine(row+1, +Infinity);
    }

    function isCurrentLineEmpty() {
        const currentLine = editor.session.getLine(editor.selection.getRange().end.row);
        return currentLine.trim() == "";
    }
    editor.execCommand("gotolineend");

    if (!isCurrentLineEmpty())
        line = "\n   " + line;
    editorInsert(line);
}





/**
     * 
     * @returns a new fresh tikz label
     */
export function getTikzcodeNewLabel() {
    const code = getCode();
    for (let i = 0; i < 5000; i++) {
        const id = "v" + i;
        if (code.indexOf("(" + id + ")") == -1)
            return id;
    }
    return "v42";
}





export function getTikzcodeFromCoordinates(point) {
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


export function tikzcodeSelectionReplaceCoordinates(point) {
    replaceIt(getTikzcodeFromCoordinates(point));
}

/**
import antlr4 from 'antlr4';
import tikzLexer from "../grammar/tikzLexer";
import tikzParser from "../grammar/tikzParser";

export function checkCode() {
    try {
        getTree();
        return true;
    }
    catch (e) {
        return e.toString();
    }
}



function getTree() {
    const input = getCode();
    const chars = new antlr4.InputStream(input);
    const lexer = new tikzLexer(chars);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new tikzParser(tokens);
    parser.removeErrorListeners(); // supprime les écouteurs d'erreurs par défaut
    parser.addErrorListener({ // ajoute un nouvel écouteur d'erreur
        syntaxError: function (recognizer, offendingSymbol, line, column, msg, e) {
            throw new Error(`Tikz syntax error at line ${line}, column ${column}: ${msg}`);
        },
        reportAmbiguity: function (recognizer, offendingSymbol, line, column, msg, e) {
        },
        reportAttemptingFullContext: function (recognizer, offendingSymbol, line, column, msg, e) {
        }
    });
    parser.buildParseTrees = true;
    return parser.begin(); //begin is the name of the axiom in the grammar
}

window['getTree'] = getTree;

*/