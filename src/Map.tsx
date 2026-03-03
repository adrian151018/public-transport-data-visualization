import { MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import type { Stop } from "./models/StopModel";
import { Scheduled } from "./models/ScheduledModel";

function AddMarker({stop, schedule}: {stop?: Stop, schedule?: Scheduled[]}) {
  if(!stop)return null;
  schedule?.sort((entry1, entry2) => entry1.arrivalTime.localeCompare(entry2.arrivalTime))
  schedule?.forEach(scheduled => {
    if(Number(scheduled.arrivalTime.replaceAll(":", "")) > 240000){
      const oldArrival = Number(scheduled.arrivalTime.replaceAll(":", ""));
      const newArrival = (oldArrival - 240000);
      if(newArrival < 100000){
        let parts = [];
        let temp = "0" + newArrival.toString();
        parts.push(temp.slice(0, 2));
        parts.push(temp.slice(2, 4));
        parts.push(temp.slice(4, 6));
        scheduled.arrivalTime = parts[0] + ":" + parts[1] + ":" + parts[2];
      }
      else {
        scheduled.arrivalTime = 
          newArrival.toString().slice(0, 2) + ":" +
          newArrival.toString().slice(2, 4) + ":" +
          newArrival.toString().slice(4, 6);
      }
    }
  })
  const day = new Date();
  const now = Number(((day.getHours() === 0) ? "24" : String(day.getHours())) + String(day.getMinutes()) + "00");
  const next = [];
  let mappedBuses = undefined;
  let busesUL = undefined;
  if(schedule?.length){
    let buses = 0;
    for(let i = 0; i < schedule?.length; i++){
      if(Number(schedule[i].arrivalTime.replace(/:/g, "")) > now){
        next.push(schedule[i]);
        buses++;
      }   
      if(buses === 5)break;
    }
    mappedBuses = next.map(bus => <li>{bus.trip.route.routeShort + " at " + bus.arrivalTime}</li>)
    busesUL = <ul>{mappedBuses}</ul>;
  }

  return (
    <Marker position={[stop.stopLat, stop.stopLon]}>
      <Popup>
        ({stop.stopCode}) {stop.stopName}
        <br/>
        <br/>
        Coming next five: 
        <br/>
        {!schedule?.length ? "NO SCHEDULED BUSES" : ""}
        {(next.length != 0) && busesUL}
      </Popup>
    </Marker>
  );
}

function AddStops({stops}: {stops: Map<Stop, Scheduled[]>}){
  const allStops = Array.from(stops.keys()).map(key => {
    return <AddMarker stop={key} schedule={stops.get(key)}></AddMarker>
  })

  return (
    allStops
  );
}

export function Map({stop, schedule, stops}: {stop?: Stop, schedule: Scheduled[], stops?: Map<Stop, Scheduled[]>}) {

  return (
    <MapContainer center={[42.69, 23.32]} zoom={12} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {(stops && !stop) ? <AddStops stops={stops}></AddStops> : undefined}
      {stop ? <AddMarker stop={stop} schedule={schedule}></AddMarker> : undefined}
      
    </MapContainer>
  );
}