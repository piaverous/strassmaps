import { createSlice } from "@reduxjs/toolkit";

export const gameState = createSlice({
  name: "gameState",
  initialState: {
    foundStations: [],
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
  },
  reducers: {
    findStation: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes.
      // Also, no return statement is required from these functions.
      action.payload.forEach((station) => {
        const label = station.properties.label;
        state.foundStations.push(station);
        console.log({ station, label });
        if (
          !state.foundStationsByLine[label].features.some(
            (s) =>
              s.properties.label === label &&
              s.properties.texte === station.properties.texte
          )
        ) {
          console.log("adding next");
          state.foundStationsByLine[label].features.push(station);
        }
      });
    },
    declareStations: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes.
      // Also, no return statement is required from these functions.
      state.existingStationsByLine = action.payload;
      for (let key in action.payload) {
        state.existingStations.push(...action.payload[key].features);
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const { findStation, declareStations } = gameState.actions;

export default gameState.reducer;
