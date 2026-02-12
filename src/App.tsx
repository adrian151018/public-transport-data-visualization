import { useState } from 'react'
import './App.css'
import { Map } from './Map.tsx'
import { searchStops } from './service/stop.ts';

function App() {
  const [searchOption, setSearchOption] = useState("... ");
  const [input, setInput] = useState("");
  const [searchLat, setSearchLat] = useState<number | undefined>();
  const [searchLon, setSearchLon] = useState<number | undefined>();

  return (
    <div>
      <div>
        <button onClick={() => setSearchOption("stops")}>Stops</button>
      </div>
      <div>
        <label htmlFor="search">Search for {searchOption}: </label>
        <input type="text" id="search" placeholder='Search...' value={input} onChange={(code) => {
            if(code.target.value){
              searchStops(code.target.value)
                .then((coords) => {
                  setSearchLat(coords ? Number(coords[0]) : undefined);
                  setSearchLon(coords ? Number(coords[1]) : undefined);
                })
            }
            else{
              setSearchLat(undefined);
              setSearchLon(undefined);
            }
            setInput(code.target.value);
          }
        }/>
      </div>
      <div id="map">
        <Map stopLat={searchLat} stopLon={searchLon}/>
      </div>
    </div>
  )
}

export default App
