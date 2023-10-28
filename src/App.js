import * as React from "react";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getTramLineColor, strNoAccent } from "./utils.js";
import Map from "./Map.js";
import "./App.css";
import { findStation } from "./gameState.js";
import { getTitleCaseStationName } from "./utils";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

// problèmes :
// - accents (alt winmärick, hochschule/Läger)
// - espaces (le galet)
// - apostrophes peu flexibles

function getStationIfExists(existingStations, stationName) {
  console.log({ search: stationName });
  console.log({ existingStations });
  const result = existingStations.filter(
    (station) =>
      station.properties.texte.replaceAll("-", " ").replaceAll("'", "") ===
      stationName
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
    (station) => station.properties.texte === stationName
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
  const [percentFoundPerLine, setPercentFoundPerLine] = useState({});

  const [viewNotification, setViewNotification] = useState(false);

  const foundStationsByLine = useSelector(
    (state) => state.gameState.foundStationsByLine
  );
  const existingStations = useSelector(
    (state) => state.gameState.existingStations
  );
  const existingStationsByLine = useSelector(
    (state) => state.gameState.existingStationsByLine
  );
  const dispatch = useDispatch();

  useEffect(() => {
    let totalFound = 0;
    let totalExisting = 0;
    const percentPerLineBuffer = {};

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
    setPercentFoundPerLine(percentPerLineBuffer);
    setPercentFoundTotal(
      totalExisting > 0 ? (totalFound * 100) / totalExisting : 0
    );
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

    formData.forEach(
      (value, key) => (results[key] = strNoAccent(value).toUpperCase())
    );

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
    <div className="ctr">
      <div>
        <Map />
        <form className="floating" onSubmit={handleSubmit}>
          <input
            type="text"
            name="stationInput"
            placeholder="Station"
            value={stationInput}
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
      <div className="container p-4">
        <p>
          <span className="is-size-4">
            {percentFoundTotal % 1 === 0
              ? percentFoundTotal
              : percentFoundTotal.toPrecision(2)}{" "}
            %
          </span>{" "}
          des stations de tram trouvées
        </p>
        <progress class="progress" value={percentFoundTotal} max="100">
          {percentFoundTotal}%
        </progress>
        <div className="tile is-ancestor">
          <div className="tile is-parent ">
            {Object.keys(percentFoundPerLine).map((lineLabel) => {
              const percentFound = percentFoundPerLine[lineLabel];
              const color = getTramLineColor(lineLabel);
              return (
                <div className="tile is-child p-1 has-text-weight-bold	">
                  <CircularProgressbar
                    value={percentFound}
                    text={lineLabel}
                    background
                    styles={buildStyles({
                      textSize: "1.8rem",
                      textColor: "#fff",
                      pathColor: "#fff",
                      trailColor: color,
                      backgroundColor: color,
                    })}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <hr />
        {Object.keys(foundStationsByLine)
          .sort()
          .map((key) => (
            <div className="content">
              <h3>{key}</h3>
              <ul>
                {foundStationsByLine[key].features.map((station) => (
                  <li>{getTitleCaseStationName(station.properties.texte)}</li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;
