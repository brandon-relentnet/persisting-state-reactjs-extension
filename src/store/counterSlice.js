// src/store/counterSlice.js
import { createSlice } from "@reduxjs/toolkit";

export const counterSlice = createSlice({
  name: "counter",
  initialState: {
    value: 0, // Initial counter value
  },
  reducers: {
    setCounter: (state, action) => {
      state.value = action.payload;
    },
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    clear: (state) => {
      state.value = 0;
    },
  },
});

export const { setCounter, increment, decrement, clear } = counterSlice.actions;

export default counterSlice.reducer;
