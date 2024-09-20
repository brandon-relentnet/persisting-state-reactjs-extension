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
  },
});

export const { setCounter } = counterSlice.actions;

export default counterSlice.reducer;
