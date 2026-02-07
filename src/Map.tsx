import { MapContainer, Marker, Popup, TileLayer} from "react-leaflet";

export default function Map() {
  return (
    <MapContainer center={[42.69, 23.32]} zoom={12} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[42.69, 23.32]}>
        <Popup>
          This is a popup
        </Popup>
      </Marker>
    </MapContainer>
  );
}