import type JSZip from "jszip";
import { Route } from "../models/RouteModel";
import { Scheduled } from "../models/ScheduledModel";
import { Stop } from "../models/StopModel";
import { Trip } from "../models/TripModel";
import { loadRoutes, loadServices, loadStops, loadStopTimes, loadTrips } from "./fetch";

export function getStopByCode(zipFile: JSZip, stopCode: string){
    if(!stopCode)return undefined;
    return loadStops(zipFile)
        .then(parsedStops => {
            parsedStops.data.pop();
            for(var stop of parsedStops.data){
                if(stop["stop_code"] === stopCode){
                    return new Stop(stop["stop_id"], stop["stop_code"], stop["stop_name"], Number(stop["stop_lat"]), Number(stop["stop_lon"]));
                }
            }
            return undefined;
        })
}

async function getServicesForToday(zipFile: JSZip, servicesFile: Papa.ParseResult<unknown> | undefined = undefined){
    const monthToNumber = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    const parsedServices = servicesFile ? servicesFile : await loadServices(zipFile);
    const todaysServices: string[] = [];
    const time = new Date();
    const day = (time.getDate() > 9) ? time.getDate().toString() : ("0" + time.getDate().toString());
    const today = 
        time.getFullYear().toString() 
        + monthToNumber[time.getMonth()]
        + day;
    for(var service of parsedServices.data){
        if(service["date"] === today)todaysServices.push(service["service_id"]);
    }
    return todaysServices;
}

async function getTripsForToday(zipFile: JSZip, tripsFile: Papa.ParseResult<unknown> | undefined = undefined, servicesFile: Papa.ParseResult<unknown> | undefined = undefined){
    const parsedTrips = tripsFile ? tripsFile : await loadTrips(zipFile);
    return getServicesForToday(zipFile, servicesFile)
        .then(services => {
            const serviceSet = new Set(services);
            return parsedTrips.data.filter(trip => serviceSet.has(trip["service_id"]));
        })
}

async function getTripsByIds(zipFile: JSZip, tripsFile: Papa.ParseResult<unknown> | undefined = undefined, routesFile: Papa.ParseResult<unknown> | undefined = undefined, tripIds: string[]){
        const parsedTrips = tripsFile ? tripsFile : await loadTrips(zipFile);
        const routeIds: (string | undefined)[]= [];
        const trips: Map<string, string> = new Map();
        parsedTrips.data.forEach(trip => {
            trips.set(trip["trip_id"], trip["route_id"]);            
        })
        const tripsSet = new Set(tripIds);
        parsedTrips.data.forEach(id => {
            if(tripsSet.has(id["trip_id"]))routeIds.push(trips.get(id["trip_id"]));            
        })
        const parsedRoutes = routesFile ? routesFile : await loadRoutes(zipFile);
        const routeIdsSet = new Set(routeIds);
        const newTrips: Trip[] = [];
        const routeMap: Map<string, Route> = new Map();
        parsedRoutes.data.forEach(route => {
            if(routeIdsSet.has(route["route_id"])){
                routeMap.set(route["route_id"], new Route(route["route_id"], route["route_short_name"], route["route_long_name"]));                        
            }
        })
        tripIds.forEach(trip => {
            const route = trips.get(trip);
            const routeobj = routeMap.get(route);
            newTrips.push(new Trip(trip, routeobj));                    
        })
        return newTrips;
}

export function getStopSchedule(zipFile: JSZip, stopCode: string, tripsFile: Papa.ParseResult<unknown> | undefined = undefined, servicesFile: Papa.ParseResult<unknown> | undefined = undefined, routesFile: Papa.ParseResult<unknown> | undefined = undefined, stopTimesFile: Papa.ParseResult<unknown> | undefined = undefined){
    return getTripsForToday(zipFile, tripsFile, servicesFile)
        .then(async tripsToday => {
            const parsedStopTimes = stopTimesFile ? stopTimesFile : await loadStopTimes(zipFile);
                    const tripsTodayIdSet = new Set();
                    const todaysTripsToStop: string[] = []
                    const filteredStopTimes: unknown[] = [];
                    const schedule: Scheduled[] = [];
                    
                    tripsToday.forEach(trip => {
                        tripsTodayIdSet.add(trip["trip_id"]);
                    })
                    for(var entry of parsedStopTimes.data){
                        if((tripsTodayIdSet.has(entry["trip_id"])) && (String(entry["stop_id"]).replace(/\D/g, "") === stopCode)){
                            todaysTripsToStop.push(entry["trip_id"]);
                            filteredStopTimes.push(entry);
                        }
                    }
                    return getTripsByIds(zipFile, tripsFile, routesFile, todaysTripsToStop)
                        .then(trips => {
                            for(var i in filteredStopTimes){
                                schedule.push(new Scheduled(trips[i], filteredStopTimes[i]["arrival_time"], stopCode));
                            }
                            return schedule;
                        })
        })
        
}

export async function getAllStopsSchedules(zipFile: JSZip){
    const parsedStopTimes = await loadStopTimes(zipFile);
    const parsedTrips = await loadTrips(zipFile);
    const parsedRoutes = await loadRoutes(zipFile);
    const tripsToday = await getTripsForToday(zipFile, parsedTrips);
    const stopMap: Map<Stop, Scheduled[]> = new Map();

    return loadStops(zipFile)
        .then(async parsedStops => {
            const stopsSet = new Set();
            const stopPromises = parsedStops.data.map(stop => {
                if(
                    stop["stop_code"] && !stopsSet.has(stop["stop_code"]) && 
                    (
                        (stop["location_type"] === "0") || (stop["location_type"] === "1")
                    )
                ){
                    stopsSet.add(stop["stop_code"])
                    const tripsTodayIdSet = new Set();
                    const todaysTripsToStop: string[] = []
                    const filteredStopTimes: unknown[] = [];
                    const schedule: Scheduled[] = [];
                    
                    tripsToday.forEach(trip => {
                        tripsTodayIdSet.add(trip["trip_id"]);
                    })
                    for(var entry of parsedStopTimes.data){
                        if(
                            (tripsTodayIdSet.has(entry["trip_id"])) && 
                            (String(entry["stop_id"]).replace(/\D/g, "") === stop["stop_code"])
                        ){
                            todaysTripsToStop.push(entry["trip_id"]);
                            filteredStopTimes.push(entry);
                        }
                    }
                    return getTripsByIds(zipFile, parsedTrips, parsedRoutes, todaysTripsToStop)
                        .then(trips => {
                            for(var i in filteredStopTimes){
                                schedule.push(
                                    new Scheduled(trips[i], 
                                    filteredStopTimes[i]["arrival_time"], 
                                    stop["stop_code"])
                                );
                            }
                            return schedule;
                        })
                        .then(schedule => {
                            const stop1 = new Stop(
                                stop["stop_id"], 
                                stop["stop_code"], 
                                stop["stop_name"], 
                                Number(stop["stop_lat"]), 
                                Number(stop["stop_lon"])
                            );
                            stopMap.set(stop1, schedule);
                        })
                }
            })
            await Promise.all(stopPromises);
            return stopMap;
        })
}

