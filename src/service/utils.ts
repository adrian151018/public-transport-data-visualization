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
            parsedStops.data.shift();
            parsedStops.data.pop();
            console.log("Starting search for stop " + stopCode);
            for(var stop of parsedStops.data){
                if(stop[1] === stopCode){
                    console.log("found stop " + stopCode);
                    return new Stop(stop[0], stop[1], stop[2], stop[4], stop[5]);
                }
            }
            console.log("cannot find stop " + stopCode);
            return undefined;
        })
    
}

function getServicesForToday(zipFile: JSZip){
    const monthToNumber = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    return loadServices(zipFile)
        .then(parsedServices => {
            const todaysServices: string[] = [];
            const time = new Date();
            const today = 
                time.getFullYear().toString() 
                + monthToNumber[time.getMonth()]
                + time.getDate().toString();
            parsedServices.data.shift();
            for(var service of parsedServices.data){
                if(service[1] === today)todaysServices.push(service[0]);
            }
            return todaysServices;
        }
    )
}

function getTripsForToday(zipFile: JSZip){
    return loadTrips(zipFile)
        .then(parsedTrips => {
            parsedTrips.data.shift();
            return getServicesForToday(zipFile)
                .then(services => {
                    const serviceSet = new Set(services);
                    return parsedTrips.data.filter(trip => serviceSet.has(trip[2]))
                })
        })
}

function getTripsByIds(zipFile: JSZip, tripIds: string[]){
    return loadTrips(zipFile)
        .then(parsedTrips => {
            const routeIds: (string | undefined)[]= [];
            const trips: Map<string, string> = new Map();
            parsedTrips.data.shift();
            parsedTrips.data.forEach(trip =>{
                trips.set(trip[0], trip[1]);
            })
            const tripsSet = new Set(trips.keys());
            tripIds.forEach(id => {
                if(tripsSet.has(id))routeIds.push(trips.get(id));
            })
            return loadRoutes(zipFile)
                .then(parsedRoutes => {
                    const routeIdsSet = new Set(routeIds);
                    const newTrips: Trip[] = [];
                    const routeMap: Map<string, Route> = new Map();
                    parsedRoutes.data.shift();
                    for(var i in parsedRoutes.data){
                        if(routeIdsSet.has(parsedRoutes.data[i][0])){
                            const newRoute = new Route(parsedRoutes.data[i][0], parsedRoutes.data[i][2], parsedRoutes.data[i][3]);
                            routeMap.set(parsedRoutes.data[i][0], newRoute);
                        }
                    }
                    tripIds.forEach(trip => {
                        newTrips.push(new Trip(trip, routeMap.get(trips.get(trip))));
                    })
                    return newTrips;
                })
        })
}

export function getRouteStopTimes(zipFile: JSZip, stopCode: string){
    return getTripsForToday(zipFile)
        .then(tripsToday => {
            console.log("Got todays trips!");
            return loadStopTimes(zipFile)
                .then(parsedStopTimes => {
                    console.log("got stop times");
                    const tripsTodayIdSet = new Set();
                    const todaysTripsToStop: string[] = []
                    const filteredStopTimes: unknown[] = [];
                    const schedule: Scheduled[] = [];
                    
                    tripsToday.forEach(trip => {
                        tripsTodayIdSet.add(trip[0]);
                    })
                    parsedStopTimes.data.shift();
                    for(var entry of parsedStopTimes.data){
                        if((tripsTodayIdSet.has(entry[0])) && (String(entry[3]).replace(/\D/g, "") === stopCode)){
                            todaysTripsToStop.push(entry[0]);
                            filteredStopTimes.push(entry);
                        }
                    }
                    return getTripsByIds(zipFile, todaysTripsToStop)
                        .then(trips => {
                            for(var i in filteredStopTimes){
                                schedule.push(new Scheduled(trips[i], filteredStopTimes[i][1], stopCode));
                            }
                            return schedule;
                        })
                })
        })
        
}
