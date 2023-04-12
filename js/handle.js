import { tikzcodeSelectionReplaceCoordinates } from "./code.js";

export class HandleCoordinate {
    constructor(data) {
        this.data = data;
        this.x = this.data.x;
        this.y = this.data.y;
        this.name = this.data.name;
        this.posbegin = this.data.posbegin;
        this.posend = this.data.posend;
    }


    apply(position) {
        tikzcodeSelectionReplaceCoordinates(position);
    }

}