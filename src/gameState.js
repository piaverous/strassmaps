import { createSlice } from "@reduxjs/toolkit";

export const gameState = createSlice({
  name: "gameState",
  initialState: {
    foundStations: [],
    existingStations: [],
  },
  reducers: {
    findStation: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes.
      // Also, no return statement is required from these functions.
      state.foundStations.push(action.payload);
    },
    declareStations: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes.
      // Also, no return statement is required from these functions.
      action.payload.forEach((station) => {
        const name = station.toUpperCase();
        if (!state.existingStations.includes(name)) {
          state.existingStations.push(name);
        }
      });
      console.log({ action });
    },
  },
});

// Action creators are generated for each case reducer function
export const { findStation, declareStations } = gameState.actions;

export default gameState.reducer;
