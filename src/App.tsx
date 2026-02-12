import { useState } from 'react'
import './App.css'
import { Map } from './Map.tsx'
import { searchStops } from './service/stop.ts';
import { Stop } from './models/StopModel.ts';

function App() {
  const [searchOption, setSearchOption] = useState("... ");
  const [input, setInput] = useState("");
  const [singleStop, setSingleStop] = useState<Stop | undefined>(new Stop("", "", "", "", ""));

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
                .then((stop) => {
                  setSingleStop(stop ? stop : undefined);
                })
            }
            else{
              setSingleStop(undefined);
            }
            setInput(code.target.value);
          }
        }/>
      </div>
      <div id="map">
        <Map stop={singleStop}/>
      </div>
    </div>
  )
}

export default App
