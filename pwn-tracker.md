---
title: Pwn Tracker
date: 2024-03-19
layout: page
permalink: /pwn-tracker/
---

<div class="pwn-tracker-page">
  {% include cyber-tracker-content.html %}
</div>

<style>
.pwn-tracker-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.pwn-tracker-page .tracker-container {
  background: #f8f9fa;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

.pwn-tracker-page .stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.pwn-tracker-page .stat-card {
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.pwn-tracker-page .stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.pwn-tracker-page .stat-card img {
  height: 50px;
  margin-bottom: 1rem;
  transition: transform 0.3s ease;
}

.pwn-tracker-page .stat-card:hover img {
  transform: scale(1.1);
}

.pwn-tracker-page .stat-label {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.pwn-tracker-page .stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.pwn-tracker-page .motivation-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
}

.pwn-tracker-page .motivation-label {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.pwn-tracker-page .motivation-quote {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #34495e;
  font-style: italic;
}

@media (max-width: 768px) {
  .pwn-tracker-page {
    padding: 1rem;
  }
  
  .pwn-tracker-page .tracker-container {
    padding: 1rem;
  }
  
  .pwn-tracker-page .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .pwn-tracker-page .stat-card {
    padding: 1.5rem;
  }
}
</style>

<script>
// Motivational quotes
const quotes = [
  "The only truly secure system is one that is powered off, cast in a block of concrete and sealed in a lead-lined room with armed guards.",
  "Security is not a product, but a process.",
  "The best way to predict the future is to implement it yourself.",
  "In cybersecurity, the only constant is change.",
  "The more you know, the more you realize you don't know.",
  "Every system is hackable. The question is: how much time and resources will it take?",
  "The best defense is a good offense.",
  "Security is a journey, not a destination."
];

// Animate number counting with easing
function animateValue(element, start, end, duration) {
  let startTimestamp = null;
  const easeOutQuart = x => 1 - Math.pow(1 - x, 4);
  
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easedProgress = easeOutQuart(progress);
    const value = Math.floor(easedProgress * (end - start) + start);
    element.textContent = value;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Initialize the tracker
document.addEventListener('DOMContentLoaded', () => {
  // Set random quote with fade effect
  const quoteElement = document.getElementById('motivation-text');
  if (quoteElement) {
    quoteElement.style.opacity = '0';
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteElement.textContent = randomQuote;
    setTimeout(() => {
      quoteElement.style.transition = 'opacity 1s ease-in-out';
      quoteElement.style.opacity = '1';
    }, 500);
  }

  // Initialize counters with staggered animation
  const htbCount = document.getElementById('htb-count');
  const thmCount = document.getElementById('thm-count');
  const vulnhubCount = document.getElementById('vulnhub-count');
  
  if (htbCount && thmCount && vulnhubCount) {
    const htbValue = parseInt(htbCount.dataset.value) || 0;
    const thmValue = parseInt(thmCount.dataset.value) || 0;
    const vulnhubValue = parseInt(vulnhubCount.dataset.value) || 0;

    // Stagger the animations
    setTimeout(() => animateValue(htbCount, 0, htbValue, 2000), 0);
    setTimeout(() => animateValue(thmCount, 0, thmValue, 2000), 300);
    setTimeout(() => animateValue(vulnhubCount, 0, vulnhubValue, 2000), 600);
  }
});
</script> 