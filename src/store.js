import { configureStore } from "@reduxjs/toolkit";
import gameStateReducer from "./gameState";

export default configureStore({
  reducer: {
    gameState: gameStateReducer,
  },
});
