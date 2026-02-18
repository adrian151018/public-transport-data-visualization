import JSZip from 'jszip'
import Papa from 'papaparse';

function fetchStatic(filename: string){
    const zip = new JSZip();
    console.log("fetching static ");
    return fetch('https://gtfs.sofiatraffic.bg/api/v1/static')
        .then(response => {console.log(response.status + " response to arrbuff");return response.arrayBuffer();})
        .then(buffer => {console.log("loading zip");return zip.loadAsync(buffer);})
        .then(loaded => {console.log("loading file " + filename);return loaded.file(filename).async('string');})
        .then(content => {
            console.log("returning parsed content");
            return Papa.parse(content);
        })
}

export function fetchStops(){
    return fetchStatic("stops.txt");
}

export function fetchServices(){
    return fetchStatic("calendar_dates.txt");
}

export function fetchTrips(){
    return fetchStatic("trips.txt");
}

export function fetchRoutes(){
    return fetchStatic("routes.txt");
}

export function fetchStopTimes(){
    return fetchStatic("stop_times.txt");
}