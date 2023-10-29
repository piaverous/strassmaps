import { createSlice } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { getTitleCaseStationName } from "../utils";

const initialState = {
  allTramLines: null,
  foundStations: [],
  foundStationsMap: {},
  foundStationsByLine: {
    A: {
      type: "FeatureCollection",
      features: [],
    },
    B: {
      type: "FeatureCollection",
      features: [],
    },
    C: {
      type: "FeatureCollection",
      features: [],
    },
    D: {
      type: "FeatureCollection",
      features: [],
    },
    E: {
      type: "FeatureCollection",
      features: [],
    },
    F: {
      type: "FeatureCollection",
      features: [],
    },
  },
  existingStationsByLine: {
    A: {
      type: "FeatureCollection",
      features: [],
    },
    B: {
      type: "FeatureCollection",
      features: [],
    },
    C: {
      type: "FeatureCollection",
      features: [],
    },
    D: {
      type: "FeatureCollection",
      features: [],
    },
    E: {
      type: "FeatureCollection",
      features: [],
    },
    F: {
      type: "FeatureCollection",
      features: [],
    },
  },
  existingStations: [],
};

export const gameState = createSlice({
  name: "gameState",
  initialState,
  reducers: {
    findStation: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes.
      // Also, no return statement is required from these functions.
      action.payload.forEach((station) => {
        const label = station.properties.label;
        const name = station.properties.texte;
        state.foundStations.push(station);
        if (
          !state.foundStationsByLine[label].features.some(
            (s) => s.properties.label === label && s.properties.texte === name
          )
        ) {
          state.foundStationsByLine[label].features.push(station);
        }

        if (state.foundStationsMap.hasOwnProperty(name)) {
          if (!state.foundStationsMap[name].includes(label)) {
            state.foundStationsMap[name].push(label);
          }
        } else {
          state.foundStationsMap[name] = [label];
        }
        state.foundStationsMap[name] = state.foundStationsMap[name].sort();
      });
    },
    declareTramLines: (state, action) => {
      state.allTramLines = action.payload;
    },
    declareTramStations: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes.
      // Also, no return statement is required from these functions.
      const result = {};
      action.payload.features.forEach((s) => {
        const lineLabels = s.properties.ligne_s.split("-");
        const titleCaseStationName = getTitleCaseStationName(
          s.properties.texte
        );
        s.properties.titleCaseStationName = titleCaseStationName;
        lineLabels.forEach((label) => {
          const station = JSON.parse(JSON.stringify(s)); // Required for deepcopy
          station.properties.label = label;
          if (result.hasOwnProperty(label)) {
            result[label].features.push(station);
          } else {
            result[label] = {
              type: "FeatureCollection",
              features: [station],
            };
          }
        });
      });
      state.existingStationsByLine = result;
      for (let key in result) {
        state.existingStations.push(...result[key].features);
      }
    },
    resetGame: (state) => {
      storage.removeItem("persist:root");
      return {
        ...initialState,
        existingStations: state.existingStations,
        existingStationsByLine: state.existingStationsByLine,
        allTramLines: state.allTramLines,
      };
    },
  },
});

// Action creators are generated for each case reducer function
export const { findStation, declareTramLines, declareTramStations, resetGame } =
  gameState.actions;

export default gameState.reducer;
