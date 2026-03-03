export class Stop{
    stopId: string;
    stopCode: string;
    stopName: string;
    stopLat: number;
    stopLon: number;

    constructor(id: string, code: string, name: string, latitude: number, longitude: number){
        this.stopId = id;
        this.stopCode = code;
        this.stopName = name;
        this.stopLat = latitude;
        this.stopLon = longitude;
    }
}
