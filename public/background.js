let counterState = 0;

// Load the counter from chrome.storage.local when the service worker starts
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["counter"], (result) => {
    if (result.counter !== undefined) {
      counterState = result.counter;
    }
  });
});

// Listen for incoming messages from content scripts or iframes
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_COUNTER") {
    // Send the current counter state
    sendResponse({ counter: counterState });
  }

  if (message.type === "INCREMENT_COUNTER") {
    // Update the counter state
    counterState++;

    // Save the updated state to chrome.storage.local
    chrome.storage.local.set({ counter: counterState }, () => {
      console.log("Counter state saved to local storage:", counterState);
    });

    // Broadcast the updated state to all tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        // Inject the content script if necessary, then send the message
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            files: ["content.js"],
          },
          () => {
            // After ensuring content script is injected, send the message
            chrome.tabs.sendMessage(
              tab.id,
              { type: "COUNTER_UPDATED", counter: counterState },
              (response) => {
                if (chrome.runtime.lastError) {
                  console.error(
                    `Error sending message to tab ${tab.id}:`,
                    chrome.runtime.lastError.message
                  );
                }
              }
            );
          }
        );
      });
    });

    sendResponse({ counter: counterState });
  }
});
