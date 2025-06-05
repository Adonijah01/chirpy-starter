class HitCounter {
    constructor() {
        this.counterElement = document.getElementById('hit-counter');
        if (!this.counterElement) return;
        
        this.postUrl = window.location.pathname;
        this.storageKey = `hit_count_${this.postUrl}`;
        this.updateCounter();
    }

    updateCounter() {
        // Get current count from localStorage
        let count = parseInt(localStorage.getItem(this.storageKey) || '0');
        
        // Increment count
        count++;
        
        // Save to localStorage
        localStorage.setItem(this.storageKey, count.toString());
        
        // Update display
        this.counterElement.textContent = count;
    }
}

// Initialize the hit counter when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HitCounter();
}); 