import { useEffect, useState } from 'react'
import './App.css'
import { Map as WorldMap } from './Map.tsx'
import { getAllStopsSchedules, getStopSchedule, getStopByCode } from './service/utils.ts';
import { Stop } from './models/StopModel.ts';
import { Scheduled } from './models/ScheduledModel.ts';
import { fetchStatic } from './service/fetch.ts';
import JSZip from 'jszip';

function App() {
  const [searchOption, setSearchOption] = useState("... ");
  const [input, setInput] = useState("");
  const [singleStop, setSingleStop] = useState<Stop | undefined>(undefined);
  const [stopSchedule, setStopSchedule] = useState<Scheduled[]>([]);
  const [staticZip, setStaticZip] = useState<JSZip>(new JSZip());
  const [stops, setStops] = useState<Map<Stop, Scheduled[]>| undefined>(undefined);
  

  useEffect(() => {
    fetchStatic()
      .then(loadedZip => {
        setStaticZip(loadedZip);
      })
  }, []);

  return (
    <div>
      <div>
        <button onClick={() => setSearchOption("stops")}>Stops</button>
      </div>
      <div>
        <label htmlFor="stops">Show all stops</label>
        <input type="checkbox" id="stops" onChange={changed => {
          if(changed.target.checked){
            getAllStopsSchedules(staticZip)
              .then(all => {
                setStops(all);
                setSingleStop(undefined);
                setStopSchedule([]);
              })
          }
        }}
        />
      </div>
      <div>
        <label htmlFor="search">Search for {searchOption}: </label>
        <input type="text" id="search" placeholder='Search...' 
          value={input} 
          onChange={code => setInput(code.target.value)}
          onKeyDown={pressed => {
            if(pressed.key === "Enter" && input){
              if(searchOption === "stops"){  
                setStops(undefined);
                getStopByCode(staticZip, input)
                  .then(stop => {
                    setSingleStop(stop);
                    return stop;
                  })
                  .then(stop => {
                    if(stop){
                      getStopSchedule(staticZip, stop.stopCode)
                        .then(scheduled => {
                          setStopSchedule(scheduled);
                      })
                    }
                    else setStopSchedule([]);
                  })
                }
            }
            else setSingleStop(undefined);
          }}  
        />
      </div>
      <div id="map">
        <WorldMap stop={singleStop} schedule={stopSchedule} stops={stops}/>
      </div>
    </div>
  )
}

export default App
