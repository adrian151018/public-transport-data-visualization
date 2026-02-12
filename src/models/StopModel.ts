export class Stop{
    stopId: string;
    stopCode: string;
    stopName: string;
    stopLat: string;
    stopLon: string;

    constructor(id: string, code: string, name: string, latitude: string, longitude: string){
        this.stopId = id;
        this.stopCode = code;
        this.stopName = name;
        this.stopLat = latitude;
        this.stopLon = longitude;
    }
}
