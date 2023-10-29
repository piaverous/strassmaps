import * as React from "react";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { sanitizeStationName } from "./utils.js";
import Map from "./components/Map.js";
import ScoreHeader from "./components/ScoreHeader.js";
import ScoreBoard from "./components/ScoreBoard.js";
import "./App.css";
import { findStation } from "./reducers/gameState.js";

function getStationIfExists(existingStations, stationName) {
  console.log({ search: stationName });
  const result = existingStations.filter(
    (station) =>
      sanitizeStationName(station.properties.texte) ===
      sanitizeStationName(stationName)
  );
  if (result.length > 0) {
    return result;
  }
  return null;
}

function wasStationAlreadyFound(foundStationsByLine, stationName) {
  const allFoundStations = [];
  for (let key in foundStationsByLine) {
    allFoundStations.push(...foundStationsByLine[key].features);
  }
  const result = allFoundStations.filter(
    (station) =>
      sanitizeStationName(station.properties.texte) ===
      sanitizeStationName(stationName)
  );
  if (result.length > 0) {
    return true;
  }
  return false;
}

function App() {
  const [stationInput, setStationInput] = useState("");
  const [shakingInput, setshakingInput] = useState(false);
  const [percentFoundTotal, setPercentFoundTotal] = useState(0);
  const [percentFoundPerLine, setPercentFoundPerLine] = useState({
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
  });

  const [viewNotification, setViewNotification] = useState(false);

  const foundStationsByLine = useSelector((state) => state.foundStationsByLine);
  const foundStationsMap = useSelector((state) => state.foundStationsMap);
  const existingStations = useSelector((state) => state.existingStations);
  const existingStationsByLine = useSelector(
    (state) => state.existingStationsByLine
  );
  const dispatch = useDispatch();

  useEffect(() => {
    let totalFound = 0;
    let totalExisting = 0;
    const percentPerLineBuffer = { ...percentFoundPerLine };

    Object.keys(existingStationsByLine)
      .sort()
      .forEach((key) => {
        const amountFound = foundStationsByLine[key]
          ? foundStationsByLine[key].features.length
          : 0;
        totalFound += amountFound;
        totalExisting += existingStationsByLine[key].features.length;

        const percentFound =
          (amountFound * 100) / existingStationsByLine[key].features.length;
        percentPerLineBuffer[key] = percentFound;
      });
    if (totalExisting > 0) {
      const newTotal = (totalFound * 100) / totalExisting;
      if (percentFoundTotal !== newTotal) {
        setPercentFoundPerLine(percentPerLineBuffer);
        setPercentFoundTotal(newTotal);
      }
    }
  }, [
    foundStationsByLine,
    existingStationsByLine,
    percentFoundTotal,
    percentFoundPerLine,
  ]);

  function handleSubmit(e) {
    e.preventDefault();

    const results = {};
    const formData = new FormData(e.target);

    formData.forEach((value, key) => (results[key] = value));

    if (wasStationAlreadyFound(foundStationsByLine, results.stationInput)) {
      console.log("ALREADY FOUND STATION " + results.stationInput);
      setViewNotification(true);
      setTimeout(() => {
        setViewNotification(false);
      }, 2000);
    } else {
      const searchResult = getStationIfExists(
        existingStations,
        results.stationInput
      );
      if (searchResult) {
        console.log("GG FOUND STATION " + results.stationInput);
        dispatch(findStation(searchResult));
        setStationInput("");
      } else {
        console.log("INVALID STATION " + results.stationInput);
        setshakingInput(true);
        setTimeout(() => setshakingInput(false), 700);
      }
    }
  }

  return (
    <div className="columns is-gapless">
      <div className="column floating-ancestor">
        <Map />
        <form className="floating-container" onSubmit={handleSubmit}>
          <div className="floating box is-hidden-desktop mobile-score-board">
            <ScoreHeader
              percentFoundTotal={percentFoundTotal}
              percentFoundPerLine={percentFoundPerLine}
            />
          </div>
          <input
            type="text"
            name="stationInput"
            placeholder="Station"
            value={stationInput || ""}
            onChange={(e) => setStationInput(e.target.value)}
            className={`floating ${shakingInput ? "shake" : null}`}
          />
          <div
            className={`notification ${viewNotification ? "shown" : "hidden"}`}
          >
            <span>Déjà trouvé !</span>
          </div>
        </form>
      </div>
      <div className="column is-3 is-hidden-mobile">
        <ScoreHeader
          percentFoundTotal={percentFoundTotal}
          percentFoundPerLine={percentFoundPerLine}
        />
        <hr />
        <ScoreBoard foundStationsMap={foundStationsMap} />
      </div>
    </div>
  );
}

export default App;
