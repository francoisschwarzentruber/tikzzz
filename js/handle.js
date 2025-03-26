import { tikzcodeSelectionReplaceCoordinates } from "./code.js";


/**
 * a point (cross) in the tikzpicture
 */
export class HandleCoordinate {
    /**
     * 
     * @param {*} data with fields x, y, posbegin, posend, name
     * x, y are the coordinates in the tikzpicture
     * posbegin, posend are the index positions in the tikz code
     * name = the name of the corresponding node if there is one
     */
    constructor(data) {
        this.data = data;
        this.x = this.data.x;
        this.y = this.data.y;
        this.name = this.data.name;
        this.posbegin = this.data.posbegin;
        this.posend = this.data.posend;
    }


    /**
     * 
     * @param {*} position in the tikz coordinate system
     * @description replace the coordinates in the tikz code
     */
    apply(position) {
        tikzcodeSelectionReplaceCoordinates(position);
    }

}