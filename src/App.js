import * as React from "react";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { strNoAccent } from "./utils.js";
import Map from "./Map.js";
import "./App.css";
import { findStation } from "./gameState.js";
import { getTitleCaseStationName } from "./utils";

function App() {
  const [stationInput, setStationInput] = useState(null);
  const [shakingInput, setshakingInput] = useState(false);
  const [viewNotification, setViewNotification] = useState(false);

  const foundStations = useSelector((state) => state.gameState.foundStations);
  const existingStations = useSelector(
    (state) => state.gameState.existingStations
  );
  const dispatch = useDispatch();

  useEffect(() => {
    // console.log(stationInput);
  }, [stationInput]);

  function handleSubmit(e) {
    e.preventDefault();

    const results = {};
    const formData = new FormData(e.target);

    formData.forEach(
      (value, key) => (results[key] = strNoAccent(value).toUpperCase())
    );

    if (foundStations.includes(results.stationInput)) {
      console.log("ALREADY FOUND STATION " + results.stationInput);
      setViewNotification(true);
      setTimeout(() => {
        setViewNotification(false);
      }, 2000);
    } else {
      if (existingStations.includes(results.stationInput)) {
        console.log("GG FOUND STATION " + results.stationInput);
        dispatch(findStation(results.stationInput));
      } else {
        console.log("INVALID STATION " + results.stationInput);
        setshakingInput(true);
        setTimeout(() => setshakingInput(false), 700);
      }
    }
  }

  return (
    <div className="container">
      <div>
        <Map />
        <form className="floating" onSubmit={handleSubmit}>
          <input
            type="text"
            name="stationInput"
            placeholder="Station"
            value={stationInput || undefined}
            onChange={(e) => setStationInput(e.target.value)}
            className={shakingInput ? "shake" : null}
          />
          <div
            className={`notification ${viewNotification ? "shown" : "hidden"}`}
          >
            <span>Déjà trouvé !</span>
          </div>
        </form>
      </div>
      <div className="scoreboard">
        <ul>
          {foundStations.map((station) => (
            <li>{getTitleCaseStationName(station)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
