import * as React from "react";
import { useState, useEffect } from "react";
import MapGL, { Source, Layer } from "react-map-gl";
import { useDispatch } from "react-redux";
import { declareStations } from "./gameState.js";
import { getTramLineColor, getTitleCaseStationName } from "./utils";

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
  const id = `${lineLabel}-stations-names`;
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
  return (
    <Source type="geojson" data={data} key={id}>
      <Layer {...dotStyle} />
      {colored && <Layer {...titleStyle} />}
    </Source>
  );
}

const MAPBOX_TOKEN =
  "pk.eyJ1IjoicGlhdmVyb3VzIiwiYSI6ImNsbzdsa2djejA2dnYya3FnYWFkM2h5ZWQifQ.oFxL-z0ccUqhlFuy8BseAg"; // Set your mapbox token here

function Map() {
  const [allTramLines, setAllTramLines] = useState(null);
  const [allTramStations, setAllTramStations] = useState(null);
  const [allTramLinesLayer, setAllTramLinesLayer] = useState(null);
  const [allTramStationsLayer, setAllTramStationsLayer] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    fetch(
      "https://data.strasbourg.eu/api/explore/v2.1/catalog/datasets/lignes_tram/exports/geojson"
    )
      .then((resp) => resp.json())
      .then((json) => setAllTramLines(json))
      .catch((err) => console.error("Could not load tram lines", err));
  }, []);

  useEffect(() => {
    fetch(
      "https://data.strasbourg.eu/api/explore/v2.1/catalog/datasets/stations_tram/exports/geojson"
    )
      .then((resp) => resp.json())
      .then((json) => {
        const result = {};
        const allStationNames = [];
        json.features.forEach((station) => {
          const lineLabel = station.properties.ligne_s;
          const titleCaseStationName = getTitleCaseStationName(
            station.properties.texte
          );
          allStationNames.push(titleCaseStationName.toUpperCase());
          station.properties.titleCaseStationName = titleCaseStationName;
          if (result.hasOwnProperty(lineLabel)) {
            result[lineLabel].features.push(station);
          } else {
            result[lineLabel] = {
              type: "FeatureCollection",
              features: [station],
            };
          }
        });
        dispatch(declareStations(allStationNames));
        return result;
      })
      .then((json) => setAllTramStations(json))
      .catch((err) => console.error("Could not load tram stations", err));
  }, [dispatch]);

  useEffect(() => {
    if (allTramLines) {
      const layers = [];
      allTramLines.features.forEach((line) => {
        const lineLabel = line.properties.ligne;
        layers.push(TramLine(line, lineLabel));
      });
      setAllTramLinesLayer(layers);
    }
  }, [allTramLines]);

  useEffect(() => {
    if (allTramStations) {
      const layers = [];
      Object.keys(allTramStations).forEach((lineLabel) => {
        const stations = allTramStations[lineLabel];
        layers.push(TramLineStations(stations, lineLabel));
      });
      setAllTramStationsLayer(layers);
    }
  }, [allTramStations]);

  return (
    <MapGL
      initialViewState={{
        latitude: 48.5819,
        longitude: 7.751,
        zoom: 11.5,
      }}
      style={{ width: "75vw", height: "100vh" }}
      mapStyle="mapbox://styles/piaverous/clo8vhi9700yt01r2cimt0fcj"
      mapboxAccessToken={MAPBOX_TOKEN}
    >
      {allTramLinesLayer}
      {allTramStationsLayer}
    </MapGL>
  );
}

export default Map;
