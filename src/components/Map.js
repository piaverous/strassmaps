import * as React from "react";
import { useEffect, useState } from "react";
import MapGL, { Layer, Source } from "react-map-gl";
import { useDispatch, useSelector } from "react-redux";

import {
  declareTramLines,
  declareTramStations,
} from "../reducers/gameState.js";
import { dynamicSort, getTramLineColor } from "../utils.js";

function TramLine(data, lineLabel) {
  const id = data.properties.ligne;
  const style = {
    id,
    type: "line",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": getTramLineColor(lineLabel),
      "line-width": ["interpolate", ["linear"], ["zoom"], 8, 1, 17, 4],
    },
  };
  return (
    <Source type="geojson" data={data} key={id}>
      <Layer {...style} />
    </Source>
  );
}

function TramLineStations(data, lineLabel, colored) {
  const id = `${lineLabel}-stations-names-${colored ? "co" : "bw"}`;
  const coloredStyle = {
    id: `${lineLabel}-stations`,
    type: "circle",
    paint: {
      "circle-color": getTramLineColor(lineLabel),
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 3, 17, 8],
    },
  };
  const bwStyle = {
    id: `${lineLabel}-stations-bw`,
    type: "circle",
    paint: {
      "circle-color": "#eee",
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 2, 17, 4],
      "circle-stroke-color": "#666",
      "circle-stroke-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10,
        0.5,
        17,
        1,
      ],
    },
  };
  const titleStyle = {
    id,
    type: "symbol",
    layout: {
      "text-field": ["get", "titleCaseStationName"],
      "text-offset": [0, 0],
      "text-anchor": "top",
      "text-size": 14,
    },
  };
  const dotStyle = colored ? coloredStyle : bwStyle;
  const points = {
    ...data,
    features: data.features.filter((point) => {
      const ligne = point.properties.ligne_s;
      return ligne[ligne.length - 1] === point.properties.label;
    }),
  };
  return (
    <Source type="geojson" data={points} key={id}>
      <Layer {...dotStyle} />
      {colored && <Layer {...titleStyle} />}
    </Source>
  );
}

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

function Map() {
  const [allTramLinesLayer, setAllTramLinesLayer] = useState(null);
  const [allTramStationsLayer, setAllTramStationsLayer] = useState(null);
  const [foundTramStationsLayer, setFoundTramStationsLayer] = useState(null);

  const foundStationsByLine = useSelector((state) => state.foundStationsByLine);
  const allTramLines = useSelector((state) => state.allTramLines);
  const existingStations = useSelector((state) => state.existingStations);
  const existingStationsByLine = useSelector(
    (state) => state.existingStationsByLine
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (!allTramLines) {
      fetch(
        "https://data.strasbourg.eu/api/explore/v2.1/catalog/datasets/lignes_tram/exports/geojson"
      )
        .then((resp) => resp.json())
        .then((json) => dispatch(declareTramLines(json)))
        .catch((err) => console.error("Could not load tram lines", err));
    }
  }, [dispatch, allTramLines]);

  useEffect(() => {
    if (existingStations.length === 0) {
      fetch(
        "https://data.strasbourg.eu/api/explore/v2.1/catalog/datasets/stations_tram/exports/geojson"
      )
        .then((resp) => resp.json())
        .then((json) => dispatch(declareTramStations(json)))
        .catch((err) => console.error("Could not load tram stations", err));
    }
  }, [dispatch, existingStations]);

  useEffect(() => {
    if (allTramLines) {
      const layers = [];
      const tramLinesToSort = [...allTramLines.features];
      tramLinesToSort.sort(dynamicSort("ligne")).forEach((line) => {
        const lineLabel = line.properties.ligne;
        layers.push(TramLine(line, lineLabel));
      });
      setAllTramLinesLayer(layers);
    }
  }, [allTramLines]);

  useEffect(() => {
    if (existingStationsByLine) {
      const layers = [];
      Object.keys(existingStationsByLine).forEach((lineLabel) => {
        const stations = existingStationsByLine[lineLabel];
        layers.push(TramLineStations(stations, lineLabel, false));
      });
      setAllTramStationsLayer(layers);
    }
  }, [existingStationsByLine]);

  useEffect(() => {
    if (foundStationsByLine) {
      const layers = [];
      Object.keys(foundStationsByLine).forEach((lineLabel) => {
        const stations = foundStationsByLine[lineLabel];
        if (stations.features.length > 0) {
          layers.push(TramLineStations(stations, lineLabel, true));
        }
      });
      setFoundTramStationsLayer(layers);
    }
  }, [foundStationsByLine]);

  return (
    <MapGL
      initialViewState={{
        latitude: 48.5819,
        longitude: 7.751,
        zoom: 11.5,
      }}
      style={{ width: "100%", height: "100vh" }}
      mapStyle="mapbox://styles/piaverous/clo8vhi9700yt01r2cimt0fcj"
      mapboxAccessToken={MAPBOX_TOKEN}
    >
      {allTramLinesLayer}
      {allTramStationsLayer}
      {foundTramStationsLayer}
    </MapGL>
  );
}

export default Map;
