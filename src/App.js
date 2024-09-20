import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { increment, setCounter } from "./store/counterSlice";
/*global chrome*/
const App = () => {
  const dispatch = useDispatch();
  const counter = useSelector((state) => state.counter.value);

 useEffect(() => {
   // Sync Redux state with chrome.storage.local
   chrome.storage.local.get(["counter"], (result) => {
     if (result && result.counter !== undefined) {
       dispatch(setCounter(result.counter));
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
       dispatch(setCounter(message.counter));
     }
     // No need to handle GET_COUNTER or INCREMENT_COUNTER messages
   });
 }, [dispatch]);

 // Handle the Increment Button Click
 const handleIncrement = () => {
   // Send only to the background script, not globally
   chrome.runtime.sendMessage({ type: "INCREMENT_COUNTER" });
 };


  return (
    <div className="App">
      <h1>Counter: {counter}</h1>
      <button onClick={handleIncrement}>Increment Counter</button>
    </div>
  );
};

export default App;
