let counterState = 0;

// Load the counter from chrome.storage.local when the service worker starts
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["counter"], (result) => {
    if (result.counter !== undefined) {
      counterState = result.counter;
    }
  });
});

// Helper function to check if a tab has the content script already injected
function checkContentScriptInjected(tabId, callback) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      func: () => !!window.myCounterExtensionInjected, // This variable is set when the content script is injected
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

// Listen for incoming messages from content scripts or iframes
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_COUNTER") {
    sendResponse({ counter: counterState });
  }

  if (message.type === "INCREMENT_COUNTER") {
    // Update the counter state
    counterState++;

    // Save the updated state to chrome.storage.local
    chrome.storage.local.set({ counter: counterState }, () => {
      console.log("Counter state saved to local storage:", counterState);
    });

    // Query all open tabs and only send updates to tabs with content script already injected
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        const url = tab.url || "";

        // Skip restricted URLs
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
            console.log(`Sending message to tab ${tab.id} with URL ${url}`);
            // Send the message to the tab with the content script
            chrome.tabs.sendMessage(
              tab.id,
              { type: "COUNTER_UPDATED", counter: counterState },
              (response) => {
                if (chrome.runtime.lastError) {
                  console.error(
                    `Error sending message to tab ${tab.id} with URL ${url}: ${chrome.runtime.lastError.message}`
                  );
                } else if (response && response.success) {
                  console.log(
                    `Message successfully received by tab ${tab.id} with URL ${url}`
                  );
                } else {
                  console.warn(`Unexpected response from tab ${tab.id}`);
                }
              }
            );
          }
        });
      });
    });

    sendResponse({ counter: counterState });
  }
});
