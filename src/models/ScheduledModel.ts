import type { Trip } from "./TripModel";

export class Scheduled{
    trip: Trip;
    arrivalTime: string;
    stopId: string;

    constructor(trip: Trip, arrival: string, stop: string){
        this.trip = trip;
        this.arrivalTime = arrival;
        this.stopId = stop;
    }
}