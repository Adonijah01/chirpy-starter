class CustomCounter {
    constructor() {
        this.counterElement = document.getElementById('custom-counter');
        if (!this.counterElement) return;
        
        this.postPath = window.location.pathname;
        this.counterKey = `hit_${this.postPath}`;
        this.repoOwner = 'adonijah01';
        this.repoName = 'myblog-hits';
        this.filePath = 'hits.json';
        this.initializeCounter();
    }

    async initializeCounter() {
        try {
            console.log('Initializing counter for:', this.postPath);
            // First try to get the count from GitHub
            const count = await this.getCountFromGitHub();
            console.log('Current count from GitHub:', count);
            
            if (count !== null) {
                this.updateDisplay(count);
                await this.incrementAndSave(count);
            } else {
                console.log('No count found, starting with 1');
                this.updateDisplay(1);
                await this.saveToGitHub(1);
            }
        } catch (error) {
            console.error('Error initializing counter:', error);
            this.fallbackToLocalStorage();
        }
    }

    async getCountFromGitHub() {
        try {
            // Use raw.githubusercontent.com for public access
            const url = `https://raw.githubusercontent.com/${this.repoOwner}/${this.repoName}/main/${this.filePath}`;
            console.log('Fetching from:', url);
            
            const response = await fetch(url);
            if (response.ok) {
                const content = await response.json();
                console.log('GitHub content:', content);
                // If this is a new post, it won't be in the hits object yet
                return content.hits[this.postPath] || 0;
            }
            console.log('Failed to fetch from GitHub:', response.status);
            return null;
        } catch (error) {
            console.error('Error getting count from GitHub:', error);
            return null;
        }
    }

    async saveToGitHub(count) {
        try {
            // Get the current file content
            const url = `https://raw.githubusercontent.com/${this.repoOwner}/${this.repoName}/main/${this.filePath}`;
            const response = await fetch(url);
            let content;
            
            if (response.ok) {
                content = await response.json();
            } else {
                content = { hits: {} };
            }
            
            // Ensure hits object exists
            if (!content.hits) {
                content.hits = {};
            }
            
            // Update the content
            content.hits[this.postPath] = count;
            
            // Trigger GitHub Action
            await this.triggerGitHubAction(count);
            
            console.log('Successfully saved count:', count);
        } catch (error) {
            console.error('Error saving to GitHub:', error);
            this.fallbackToLocalStorage();
        }
    }

    async triggerGitHubAction(count) {
        try {
            const response = await fetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/dispatches`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    event_type: 'update_hits',
                    client_payload: {
                        post_path: this.postPath,
                        count: count
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to trigger GitHub Action: ${response.status} ${response.statusText}`);
            }
            
            console.log('Successfully triggered GitHub Action');
        } catch (error) {
            console.error('Error triggering GitHub Action:', error);
            throw error;
        }
    }

    async incrementAndSave(currentCount) {
        const newCount = currentCount + 1;
        this.updateDisplay(newCount);
        await this.saveToGitHub(newCount);
    }

    fallbackToLocalStorage() {
        console.log('Falling back to localStorage');
        let count = parseInt(localStorage.getItem(this.counterKey) || '0');
        count++;
        localStorage.setItem(this.counterKey, count.toString());
        this.updateDisplay(count);
    }

    updateDisplay(count) {
        console.log('Updating display with count:', count);
        this.counterElement.textContent = count.toLocaleString();
    }
}

// Initialize the counter when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CustomCounter();
}); 