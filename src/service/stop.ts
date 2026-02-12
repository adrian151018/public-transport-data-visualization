import { Stop } from '../models/StopModel.js'
import JSZip from 'jszip'
import Papa from'papaparse'

export function getStops(): Promise<Stop[]>{
    const zip = new JSZip()
    return fetch('https://gtfs.sofiatraffic.bg/api/v1/static')
        .then(response => response.arrayBuffer())
        .then(buffer => zip.loadAsync(buffer))
        .then(loaded => loaded.file('stops.txt').async('string'))
        .then(content => Papa.parse(content))
        .then(parsed => {
            const stops: Stop[] = [];
            parsed.data.shift();
            for(var stop of parsed.data){
                stops.push(new Stop(stop[0], stop[1], stop[2], stop[4], stop[5]));
            }
            return stops;
        }
    )
}

export async function searchStops(stopCode: string){
    const stops = await getStops();
    for(var stop of stops){
        if(stop.stopCode === stopCode){
            return stop;
        }
    }
    return undefined;
}
