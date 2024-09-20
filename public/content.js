(function () {
  // Set a flag to indicate the content script is injected
  window.myCounterExtensionInjected = true;

  // Check if the iframe already exists
  if (document.getElementById("my-counter-iframe")) {
    return; // If the iframe is already there, don't create a new one
  }

  // Create and inject the iframe
  const iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("index.html");
  iframe.style.position = "fixed";
  iframe.style.bottom = "10px";
  iframe.style.right = "10px";
  iframe.style.width = "300px";
  iframe.style.height = "200px";
  iframe.style.zIndex = "9999";
  iframe.style.border = "1px solid black";
  iframe.id = "my-counter-iframe";
  document.body.appendChild(iframe);

  // Listen for `COUNTER_UPDATED` messages from the background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (
      message &&
      message.type === "COUNTER_UPDATED" &&
      message.counter !== undefined
    ) {
      iframe.contentWindow.postMessage(
        { type: "COUNTER_UPDATED", counter: message.counter },
        "*"
      );
      sendResponse({ success: true });
    } else {
      console.warn("Ignoring unrelated message:", message);
      sendResponse({ success: false });
    }
    return true;
  });

  // Request the current counter state from the background script when the iframe loads
  iframe.onload = () => {
    chrome.runtime.sendMessage({ type: "GET_COUNTER" }, (response) => {
      if (response && response.counter !== undefined) {
        iframe.contentWindow.postMessage(
          { type: "COUNTER_UPDATED", counter: response.counter },
          "*"
        );
      }
    });
  };
})();
