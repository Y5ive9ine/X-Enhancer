// Initialize all event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Original like-retweet-comment functionality
    document.getElementById("like-retweet-comment").addEventListener("click", () => {
        const commentContent = document.getElementById("comment-content").value;

        if (commentContent) {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, (tabs) => {
                chrome.scripting.executeScript({
                    target: {
                        tabId: tabs[0].id
                    },
                    func: likeRetweetComment,
                    args: [commentContent],
                });
            });
        } else {
            alert("Please enter a comment before proceeding.");
        }
    });

    // New AI reply functionality
    const aiButton = document.querySelector('.ai-reply-button');
    aiButton.addEventListener('click', async () => {
        // Add click animation
        aiButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            aiButton.style.transform = 'translateY(-1px)';
        }, 100);

        // Here we'll add AI reply generation functionality later
        console.log('AI reply button clicked');
    });
});

// Function to like, retweet, and comment on the post
function likeRetweetComment(commentContent) {
    // 1. Like the post
    const likeButton = document.querySelector('[aria-label*="Like"]');
    if (likeButton) {
        likeButton.click();
        console.log("Post liked!");
    } else {
        console.warn("Like button not found.");
    }

    // 2. Retweet the post
    const retweetButton = document.querySelector('[aria-label*="Repost"]');
    if (retweetButton) {
        retweetButton.click();
        setTimeout(() => {
            const confirmRetweet = document.querySelector('[data-testid="retweetConfirm"]');
            if (confirmRetweet) {
                confirmRetweet.click();
                console.log("Post retweeted!");
            } else {
                console.warn("Retweet confirmation button not found.");
            }
        }, 500);
    } else {
        console.warn("Retweet button not found.");
    }

    // 3. Add a comment
    const commentBox = document.querySelector('[data-testid="reply"]');
    if (commentBox) {
        commentBox.click();
        setTimeout(() => {
            const commentButton = document.querySelector('[data-testid="tweetButton"]');
            const ariaButton = document.querySelector('[class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr"]'); 
            if (ariaButton) {
                ariaButton.innerText = commentContent;
        
                const event = new Event('input', { bubbles: true });
                ariaButton.dispatchEvent(event);
        
                setTimeout(() => {
                    if (commentButton) {
                        commentButton.click(); 
                        console.log("Comment posted!");
                    } else {
                        console.warn("Comment button not found.");
                    }
                }, 700); 
            } else {
                console.warn("Comment input box not found.");
            }
        }, 500);
    } else {
        console.warn("Comment box not found.");
    }
}