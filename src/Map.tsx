import { MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import type { Stop } from "./models/StopModel";

export function AddMarker({stop}: {stop?: Stop}) {
  if(!stop)return null;

  return (
    <Marker position={[Number(stop.stopLat), Number(stop.stopLon)]}>
      <Popup>
        ({stop.stopCode}) {stop.stopName}
      </Popup>
    </Marker>
  );
}

export function Map({stop}: {stop?: Stop}) {
  
  
  return (
    <MapContainer center={[42.69, 23.32]} zoom={12} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AddMarker stop={stop}></AddMarker> 
    </MapContainer>
  );
}