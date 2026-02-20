import { useEffect, useState } from 'react'
import './App.css'
import { Map } from './Map.tsx'
import { getRouteStopTimes, getStopByCode } from './service/utils.ts';
import { Stop } from './models/StopModel.ts';
import { Scheduled } from './models/ScheduledModel.ts';
import { fetchStatic } from './service/fetch.ts';
import JSZip from 'jszip';

function App() {
  const [searchOption, setSearchOption] = useState("... ");
  const [input, setInput] = useState("");
  const [singleStop, setSingleStop] = useState<Stop | undefined>(undefined);
  const [stopSchedule, setStopSchedule] = useState<Scheduled[] | undefined>(undefined);
  const [staticZip, setStaticZip] = useState<JSZip>(new JSZip());
  

  useEffect(() => {
    fetchStatic()
      .then(loadedZip => setStaticZip(loadedZip))
  }, []);

  return (
    <div>
      <div>
        <button onClick={() => setSearchOption("stops")}>Stops</button>
      </div>
      <div>
        <label htmlFor="search">Search for {searchOption}: </label>
        <input type="text" id="search" placeholder='Search...' 
          value={input} 
          onChange={code => setInput(code.target.value)}
          onKeyDown={pressed => {
            if(pressed.key === "Enter" && input){
              getStopByCode(staticZip, input)
                .then(stop => {
                  setSingleStop(stop);
                  return stop;
                })
                .then(stop => {
                  if(stop){
                    getRouteStopTimes(staticZip, stop.stopCode)
                      .then(scheduled => {
                        setStopSchedule(scheduled);
                    })
                  }
                  else setStopSchedule(undefined);
                })
            }
            else setSingleStop(undefined);
          }}  
        />
      </div>
      <div id="map">
        <Map stop={singleStop} schedule={stopSchedule}/>
      </div>
    </div>
  )
}

export default App
