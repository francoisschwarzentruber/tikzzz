import { TikzCode } from "./code.js";




export class Handles {
    static points = new Array();

    static get handles() {
        return Handles.points;
    }

    static update() {
        Handles.points = getPointsFromTikz();
    }





}


/**
 * 
 * @param {*} code tikz code
 * @returns an array containing the list of points, i.e. coordinates that appear in the tikz code
 * Each point is {x, y, posbegin, posend, name} where (x, y) are the coordinates, posbegin, posend are the index positions in the tikz
 * code
 * name = the name of the corresponding node if there is one
 */
function getPointsFromTikz() {
    const code = TikzCode.getCode();
    const codeSelectionRange = TikzCode.getSelectionRange();
    const points = new Array();
    let counter = 0;
    let name = undefined;
    let iname = undefined;
    let iend = undefined;

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
            }
            if ((i < icomma) && (icomma < iend) && (parseFloat(n1) != NaN) && (parseFloat(n2) != NaN)) {
                if (name != undefined) {
                    if (!((i - (iname + name.length) < 10) && code.substring(iname + name.length, i).indexOf("at") >= 0))
                        name = undefined;
                }

                const selected = (codeSelectionRange.start <= i) && (iend <= codeSelectionRange.end);
                points.push(new HandleCoordinate({ selected, x: parseFloat(n1), y: parseFloat(n2), posbegin: i, posend: iend, name: name }));
            }
        }

        i = iend;

        counter++;

        if (counter > 100)
            return points;

    }
    return points;
}






/**
 * a point (cross) in the tikzpicture
 */
export class HandleCoordinate {
    /**
     * 
     * @param {*} data with fields x, y, posbegin, posend, name
     * x, y are the coordinates in the tikzpicture
     * posbegin, posend are the index positions in the tikz code (they are integers)
     * name = the name of the corresponding node if there is one
     */
    constructor(data) {
        this.data = data;
        this.x = this.data.x;
        this.y = this.data.y;
        this.name = this.data.name;
        this.posbegin = this.data.posbegin;
        this.posend = this.data.posend;
        this.selected = this.data.selected;
    }


    /**
     * 
     * @description replace the coordinates in the tikz code by the current position written inthe point
     */
    validate() {
        const newCoordTikzCode = TikzCode.getTikzcodeFromCoordinates(this);
        const lastposend = this.posend;
        TikzCode.setSelectionRange(this.posbegin, this.posend + 1);
        TikzCode.replaceSelection(newCoordTikzCode);
        this.posend = this.posbegin + newCoordTikzCode.length-1;

        for (const point of Handles.handles) {
            if (point.posbegin > lastposend) {
                point.posbegin += this.posend - lastposend;
                point.posend += this.posend - lastposend;
            }
        }
    }

}

