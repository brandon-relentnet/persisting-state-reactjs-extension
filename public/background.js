let counterState = 0;

// Load the counter from chrome.storage.local when the service worker starts
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["counter"], (result) => {
    if (result.counter !== undefined) {
      counterState = result.counter;
    }
  });
});

// Helper function to check if a tab has the content script injected
function checkContentScriptInjected(tabId, callback) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      func: () => !!window.myCounterExtensionInjected, // This flag is set in the content script
    },
    (results) => {
      if (results && results[0] && results[0].result) {
        callback(true); // Content script is already injected
      } else {
        callback(false); // Content script is not injected
      }
    }
  );
}

// Listen for incoming messages from content scripts or React app
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_COUNTER") {
    // Send the current counter state in response to GET_COUNTER
    sendResponse({ counter: counterState });
  }

  if (message.type === "INCREMENT_COUNTER") {
    // Increment the counter state
    counterState++;

    // Save the updated counter state to chrome.storage.local
    chrome.storage.local.set({ counter: counterState }, () => {
      console.log("Counter state saved to local storage:", counterState);
    });

    // Query all open tabs and send updates only to tabs with the content script injected
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        const url = tab.url || "";

        // Skip restricted URLs (chrome://, file://, etc.)
        if (
          url.startsWith("chrome://") ||
          url.startsWith("file://") ||
          url.startsWith("https://chrome.google.com")
        ) {
          console.log(`Skipping restricted tab ${tab.id} with URL ${url}`);
          return;
        }

        // Check if the content script is injected
        checkContentScriptInjected(tab.id, (isInjected) => {
          if (isInjected) {
            // Send COUNTER_UPDATED to tabs with the content script injected
            chrome.tabs.sendMessage(
              tab.id,
              { type: "COUNTER_UPDATED", counter: counterState },
              (response) => {
                if (chrome.runtime.lastError) {
                  console.error(
                    `Error sending message to tab ${tab.id} with URL ${url}: ${chrome.runtime.lastError.message}`
                  );
                } else {
                  console.log(`Message successfully sent to tab ${tab.id}`);
                }
              }
            );
          } else {
            console.log(
              `Content script not injected in tab ${tab.id}, skipping...`
            );
          }
        });
      });
    });

    sendResponse({ counter: counterState });
  }

  return true; // Keeps the message port open for async tasks
});
