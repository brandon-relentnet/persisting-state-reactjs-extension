// src/store/counterSlice.js
import { createSlice } from "@reduxjs/toolkit";

export const counterSlice = createSlice({
  name: "counter",
  initialState: {
    value: 0,
  },
  reducers: {
    setCounter: (state, action) => {
      state.value = action.payload;
    },
    increment: (state) => {
      state.value += 1;
    },
  },
});

export const { setCounter, increment } = counterSlice.actions;

export default counterSlice.reducer;
