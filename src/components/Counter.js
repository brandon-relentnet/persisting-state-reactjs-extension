// src/components/Counter.js
import React, { useEffect, useState } from "react";
/*global chrome*/
const Counter = () => {
  const [counter, setCounter] = useState(0);

  // Load the initial counter value from chrome.storage.local
  useEffect(() => {
    chrome.storage.local.get(["counter"], (result) => {
      if (result && result.counter !== undefined) {
        setCounter(result.counter);
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
        setCounter(message.counter); // Update the local state
      } else if (message.type !== "GET_COUNTER") {
        console.warn("Ignoring unrelated message:", message); // Only log unrelated messages
      }
    });
  }, []);

  // Update chrome.storage.local and broadcast the updated counter to all tabs
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
    setCounter(newCounter); // Update the local state first
    syncCounterToStorage(newCounter); // Push the updated value to storage and broadcast
  };

  // Handle the Decrement Button Click
  const handleDecrement = () => {
    const newCounter = counter - 1;
    setCounter(newCounter);
    syncCounterToStorage(newCounter);
  };

  // Handle the Clear Button Click
  const handleClear = () => {
    setCounter(0);
    syncCounterToStorage(0);
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
