import { Route } from "../models/RouteModel";
import { Scheduled } from "../models/ScheduledModel";
import { Stop } from "../models/StopModel";
import { Trip } from "../models/TripModel";
import { fetchRoutes, fetchServices, fetchStops, fetchStopTimes, fetchTrips } from "./fetch";

export function getStopByCode(stopCode: string){
    if(!stopCode)return undefined;
    return fetchStops()
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
            return undefined;
        })
    
}

function getServicesForToday(){
    const monthToNumber = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    return fetchServices()
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

function getTripsForToday(){
    return fetchTrips()
        .then(parsedTrips => {
            parsedTrips.data.shift();
            return getServicesForToday()
                .then(services => {
                    const serviceSet = new Set(services);
                    return parsedTrips.data.filter(trip => serviceSet.has(trip[2]))
                })
        })
}

function getTripsByIds(tripIds: string[]){
    return fetchTrips()
        .then(parsedTrips => {
            const tripIdsSet = new Set(tripIds);
            const routeIds: string[] = [];
            parsedTrips.data.shift();
            const trips = parsedTrips.data.filter(trip => tripIdsSet.has(trip[0]));
            trips.forEach(trip => {
                routeIds.push(trip[1]);
            })
            return fetchRoutes()
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
                    trips.forEach(trip => {
                        newTrips.push(new Trip(trip[0], routeMap.get(trip[1])));
                    })
                    return newTrips;
                })
        })
}

export function getRouteStopTimes(stopCode: string){
    return getTripsForToday()
        .then(tripsToday => {
            console.log("Got todays trips!");
            return fetchStopTimes()
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
                        if((tripsTodayIdSet.has(entry[0])) && (String(entry[3]).includes(stopCode))){
                            todaysTripsToStop.push(entry[0]);
                            filteredStopTimes.push(entry);
                        }
                    }
                    return getTripsByIds(todaysTripsToStop)
                        .then(trips => {
                            for(var i in filteredStopTimes){
                                schedule.push(new Scheduled(trips[i], filteredStopTimes[i][1], stopCode));
                            }
                            return schedule;
                        })
                })
        })
        
}
