const AI_API_URL = "https://api.aimlapi.com/chat/completions";
const AI_API_KEY = "a17c5dc5c8d94e9a8784c34c255517e0";
// 模拟点击操作以发布推文
function postTweet(tweetText) {

  const tweetButton = document.querySelector('button[data-testid="tweetButtonInline"]');
  const inputBox = document.querySelector('div[class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr"]');

  if (inputBox && tweetButton) {
    inputBox.innerHTML = '';
    const spanWrapper = document.createElement('span');
    spanWrapper.setAttribute('data-offset-key', inputBox.getAttribute('data-offset-key'));
    const textNode = document.createElement('span');
    textNode.setAttribute('data-text', 'true');
    textNode.textContent = tweetText;
    spanWrapper.appendChild(textNode);
    inputBox.appendChild(spanWrapper);
    const inputEvent = new Event('input', { bubbles: true });
    inputBox.dispatchEvent(inputEvent);
    tweetButton.removeAttribute('disabled');
    tweetButton.setAttribute('aria-disabled', 'false');

    // 模拟点击发布推文按钮
    setTimeout(() => {
      tweetButton.click();
    }, 500);

    console.log("Tweet posted successfully by simulating user action.");
  } else {
    console.error("Tweet input box or tweet button not found.");
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in background.js:", message);

  if (message.action === "generateAndPostTweet") {
    // 获取当前激活的标签页
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        console.error("No active tab found.");
        sendResponse({ success: false, error: "No active tab found." });
        return;
      }

      const activeTab = tabs[0]; // 当前激活的标签页
      const tabId = activeTab.id;

      // 生成推文内容
      (async () => {
        try {
          console.log("Starting AI API request...");
          const prompt = message.prompt;

          // AI API 请求体
          const payload = {
            model: "gpt-4o",
            messages: [
              { role: "user", content: `Create a short tweet about ${prompt}` }
            ],
            max_tokens: 512,
            stream: false
          };

          // 调用 AI API 生成推文
          const response = await fetch(AI_API_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${AI_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });

          console.log("AI API response status:", response.status);

          if (!response.ok) {
            throw new Error(`AI API request failed with status: ${response.status}`);
          }

          const data = await response.json();
          console.log("AI API response data:", data);

          if (data.choices && data.choices.length > 0) {
            const tweetContent = data.choices[0].message.content.trim();
            console.log("Generated tweet content:", tweetContent);

            // 注入脚本到当前标签页
            chrome.scripting.executeScript(
              {
                target: { tabId },
                func: postTweet,
                args: [tweetContent]
              },
              () => {
                if (chrome.runtime.lastError) {
                  console.error("Error executing script:", chrome.runtime.lastError.message);
                  sendResponse({ success: false, error: chrome.runtime.lastError.message });
                } else {
                  console.log("Script executed successfully.");
                  sendResponse({ success: true, content: tweetContent, message: "Tweet posted successfully." });
                }
              }
            );
          } else {
            throw new Error("AI API response is missing 'choices' or it is empty.");
          }
        } catch (error) {
          console.error("Error occurred:", error);
          sendResponse({ success: false, error: error.message });
        }
      })();

      return true; // 保持消息通道打开
    });

    return true; // 保持消息通道打开
  }
});
