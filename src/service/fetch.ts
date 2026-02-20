import JSZip from 'jszip'
import Papa from 'papaparse';

export function fetchStatic(){
    const zip = new JSZip();
    console.log("fetching static ");
    return fetch('https://gtfs.sofiatraffic.bg/api/v1/static')
        .then(response => {console.log(response.status + " response to arrbuff");return response.arrayBuffer();})
        .then(buffer => {console.log("loading zip");return zip.loadAsync(buffer);})
        
}

export function loadStops(zipFile: JSZip){
    console.log("loading file " + "stops.txt");
    return zipFile.file("stops.txt").async('string')
        .then(content => {
            console.log("returning parsed content");
            return Papa.parse(content);
        })
        
}

export function loadServices(zipFile: JSZip){
    console.log("loading file " + "calendar_dates.txt");
    return zipFile.file("calendar_dates.txt").async('string')
        .then(content => {
            console.log("returning parsed content");
            return Papa.parse(content);
        })
}

export function loadTrips(zipFile: JSZip){
    console.log("loading file " + "trips.txt");
    return zipFile.file("trips.txt").async('string')
        .then(content => {
            console.log("returning parsed content");
            return Papa.parse(content);
        })
}

export function loadRoutes(zipFile: JSZip){
    console.log("loading file " + "routes.txt");
    return zipFile.file("routes.txt").async('string')
        .then(content => {
            console.log("returning parsed content");
            return Papa.parse(content);
        })
}

export function loadStopTimes(zipFile: JSZip){
    console.log("loading file " + "stop_times.txt");
    return zipFile.file("stop_times.txt").async('string')
        .then(content => {
            console.log("returning parsed content");
            return Papa.parse(content);
        })
}