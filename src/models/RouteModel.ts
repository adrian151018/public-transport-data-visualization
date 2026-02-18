export class Route{
    routeId: string;
    routeShort: string;
    routeLong: string;

    constructor(id: string, short: string, long: string){
        this.routeId = id;
        this.routeShort = short;
        this.routeLong = long;
    }
}