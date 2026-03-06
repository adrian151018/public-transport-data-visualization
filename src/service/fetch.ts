import JSZip from 'jszip'
import Papa from 'papaparse';

export function fetchStatic(){
    const zip = new JSZip();
    return fetch('https://gtfs.sofiatraffic.bg/api/v1/static')
        .then(response => response.arrayBuffer())
        .then(buffer => zip.loadAsync(buffer))        
}

export function loadStops(zipFile: JSZip){
    return zipFile.file("stops.txt")?.async('string')
        .then(content => Papa.parse(content, {header: true}))        
}

export function loadServices(zipFile: JSZip){
    return zipFile.file("calendar_dates.txt")?.async('string')
        .then(content => Papa.parse(content, {header: true}))
}

export function loadTrips(zipFile: JSZip){
    return zipFile.file("trips.txt")?.async('string')
        .then(content => Papa.parse(content, {header: true}))
}

export function loadRoutes(zipFile: JSZip){
    return zipFile.file("routes.txt")?.async('string')
        .then(content => Papa.parse(content, {header: true}))
}

export function loadStopTimes(zipFile: JSZip){
    return zipFile.file("stop_times.txt")?.async('string')
        .then(content => Papa.parse(content, {header: true}))
}