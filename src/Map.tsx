import { MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import type { Stop } from "./models/StopModel";
import type { Scheduled } from "./models/ScheduledModel";

function AddMarker({stop, schedule}: {stop?: Stop, schedule?: Scheduled[]}) {
  if(!stop)return null;
  schedule?.sort((entry1, entry2) => entry1.arrivalTime.localeCompare(entry2.arrivalTime))

  return (
    <Marker position={[Number(stop.stopLat), Number(stop.stopLon)]}>
      <Popup>
        ({stop.stopCode}) {stop.stopName}
        <br/>
        <br/>
        Coming next five: 
        <br/>
        {schedule && schedule[0].trip.route.routeShort + " at " + schedule[0].arrivalTime}<br/>
        {schedule && schedule[1].trip.route.routeShort + " at " + schedule[1].arrivalTime}<br/>
        {schedule && schedule[2].trip.route.routeShort + " at " + schedule[2].arrivalTime}<br/>
        {schedule && schedule[3].trip.route.routeShort + " at " + schedule[3].arrivalTime}<br/>
        {schedule && schedule[4].trip.route.routeShort + " at " + schedule[4].arrivalTime}
      </Popup>
    </Marker>
  );
}

export function Map({stop, schedule}: {stop?: Stop, schedule?: Scheduled[]}) {
  
  
  return (
    <MapContainer center={[42.69, 23.32]} zoom={12} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AddMarker stop={stop} schedule={schedule}></AddMarker> 
    </MapContainer>
  );
}