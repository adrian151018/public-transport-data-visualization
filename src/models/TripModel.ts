import type { Route } from "./RouteModel";

export class Trip{
    tripId: string;
    route: Route;

    constructor(id: string, route: Route){
        this.tripId = id;
        this.route = route;
    }
}