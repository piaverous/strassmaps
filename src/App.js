import * as React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./App.css";
import Map from "./components/Map.js";
import ScoreBoard from "./components/ScoreBoard.js";
import ScoreHeader from "./components/ScoreHeader.js";
import { findStation, resetGame } from "./reducers/gameState.js";
import { sanitizeStationName } from "./utils.js";

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
  const initialPercentPerLine = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
  };
  const [dropdownActive, setDropdownActive] = useState(false);
  const [stationInput, setStationInput] = useState("");
  const [shakingInput, setshakingInput] = useState(false);
  const [percentFoundTotal, setPercentFoundTotal] = useState(0);
  const [percentFoundPerLine, setPercentFoundPerLine] = useState(
    initialPercentPerLine
  );

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
    } else {
      setPercentFoundPerLine(initialPercentPerLine);
      setPercentFoundTotal(0);
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
          <div className="input-container floating">
            <input
              type="text"
              name="stationInput"
              placeholder="Station"
              value={stationInput || ""}
              onChange={(e) => setStationInput(e.target.value)}
              className={`floating input is-rounded ${
                shakingInput ? "shake" : null
              }`}
            />
            <div
              className={`dropdown is-right ${
                dropdownActive ? "is-active" : ""
              }`}
            >
              <div className="dropdown-trigger">
                <span
                  className="button is-rounded"
                  aria-haspopup="true"
                  aria-controls="dropdown-menu"
                  onClick={() => setDropdownActive(!dropdownActive)}
                >
                  <span
                    className="icon is-small"
                    style={{
                      color: "#999",
                      transition: "all 0.2s linear",
                      transform: dropdownActive ? "rotate(90deg)" : "rotate(0)",
                    }}
                  >
                    <i className="fas fa-ellipsis-v" aria-hidden="true"></i>
                  </span>
                </span>
              </div>
              <div className="dropdown-menu" id="dropdown-menu" role="menu">
                <div className="dropdown-content">
                  <a
                    href="#"
                    className="dropdown-item"
                    onClick={() => {
                      dispatch(resetGame());
                      setDropdownActive(false);
                    }}
                  >
                    Recommencer
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`notification is-success has-text-centered ${
              viewNotification ? "shown" : "hidden"
            }`}
            id="found-notification"
          >
            Déjà trouvé !
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
