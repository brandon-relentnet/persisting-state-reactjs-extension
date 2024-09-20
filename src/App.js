import React, { useEffect, useState } from "react";

function App() {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    // Listen for counter updates from the content script
    const handleMessage = (event) => {
      if (event.data && event.data.type === "COUNTER_UPDATED") {
        setCounter(event.data.counter);
      }
    };

    window.addEventListener("message", handleMessage);

    // Clean up the event listener
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const incrementCounter = () => {
    console.log("Increment button clicked");
    window.parent.postMessage({ type: "INCREMENT_COUNTER" }, "*");
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === "COUNTER_UPDATED") {
        console.log(
          "Received counter update from content script:",
          event.data.counter
        );
        setCounter(event.data.counter);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div className="App">
      <h1>Shared Counter: {counter}</h1>
      <button onClick={incrementCounter}>Increment Counter</button>
    </div>
  );
}

export default App;
