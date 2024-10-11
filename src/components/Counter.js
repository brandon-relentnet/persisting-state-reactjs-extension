// src/components/Counter.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCounter, increment, decrement, clear } from "../store/counterSlice";
/*global chrome*/

const Counter = () => {
  const dispatch = useDispatch();
  const { value: counter } = useSelector((state) => state.counter); // Destructure selector state

  // Load the initial counter value from chrome.storage.local
  useEffect(() => {
    chrome.storage.local.get(["counter"], (result) => {
      if (
        result &&
        result.counter !== undefined &&
        result.counter !== counter
      ) {
        dispatch(setCounter(result.counter)); // Only update if value differs
      }
    });

    const messageListener = (message) => {
      if (
        message?.type === "COUNTER_UPDATED" &&
        message.counter !== undefined
      ) {
        if (message.counter !== counter) {
          dispatch(setCounter(message.counter)); // Sync only if counter differs
        }
      } else if (message.type !== "GET_COUNTER") {
        console.warn("Ignoring unrelated message:", message); // Ignore other messages
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // Cleanup listener on component unmount to prevent memory leaks
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [dispatch, counter]);

  // Debounced storage sync function to avoid excessive writes
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
    const newCounter = counter + 1;
    dispatch(increment()); // Dispatch the increment action
    syncCounterToStorage(newCounter); // Sync new state to storage and broadcast
  };

  // Handle the Decrement Button Click
  const handleDecrement = () => {
    const newCounter = counter - 1;
    dispatch(decrement()); // Dispatch the decrement action
    syncCounterToStorage(newCounter); // Sync new state to storage and broadcast
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
