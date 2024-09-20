// src/components/Counter.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCounter, increment, decrement, clear } from "../store/counterSlice";
/*global chrome*/
const Counter = () => {
  const dispatch = useDispatch();
  const counter = useSelector((state) => state.counter.value); // Get the counter from Redux

  // Load the initial counter value from chrome.storage.local
  useEffect(() => {
    chrome.storage.local.get(["counter"], (result) => {
      if (result && result.counter !== undefined) {
        dispatch(setCounter(result.counter)); // Initialize Redux state with stored counter
      } else {
        console.error(
          "Initial counter value missing from chrome.storage:",
          result
        );
      }
    });

    // Listen for `COUNTER_UPDATED` messages from the background script
    chrome.runtime.onMessage.addListener((message) => {
      if (
        message &&
        message.type === "COUNTER_UPDATED" &&
        message.counter !== undefined
      ) {
        dispatch(setCounter(message.counter)); // Sync Redux state with broadcasted counter
      } else if (message.type !== "GET_COUNTER") {
        console.warn("Ignoring unrelated message:", message); // Ignore other messages
      }
    });
  }, [dispatch]);

  // Sync Redux counter to storage and broadcast
  const syncCounterToStorage = (newCounterValue) => {
    chrome.storage.local.set({ counter: newCounterValue }, () => {
      chrome.runtime.sendMessage({
        type: "COUNTER_UPDATED",
        counter: newCounterValue,
      });
    });
  };

  // Handle the Increment Button Click
  const handleIncrement = () => {
    dispatch(increment()); // Dispatch the increment action
    syncCounterToStorage(counter + 1); // Sync new state to storage and broadcast
  };

  // Handle the Decrement Button Click
  const handleDecrement = () => {
    dispatch(decrement()); // Dispatch the decrement action
    syncCounterToStorage(counter - 1); // Sync new state to storage and broadcast
  };

  // Handle the Clear Button Click
  const handleClear = () => {
    dispatch(clear()); // Dispatch the clear action
    syncCounterToStorage(0); // Sync the reset state to storage and broadcast
  };

  return (
    <div className="Counter">
      <h1>Counter: {counter}</h1>
      <button onClick={handleIncrement}>Increase</button>
      <button onClick={handleDecrement}>Decrease</button>
      <button onClick={handleClear}>Clear</button>
    </div>
  );
};

export default Counter;
