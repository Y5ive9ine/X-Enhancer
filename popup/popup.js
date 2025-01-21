document.getElementById("generateTweetButton").addEventListener("click", () => {
    const prompt = document.getElementById("prompt").value;
  
    if (prompt.trim() === "") {
      alert("Please enter a prompt.");
      return;
    }
  
    chrome.runtime.sendMessage({
      action: "generateAndPostTweet",
      prompt: prompt
    }, response => {
      if (response.success) {
        alert("Tweet posted successfully!");
      } else {
        alert("Error: " + response.error);
      }
    });
  });
  
