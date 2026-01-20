// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const visitorId = urlParams.get('id');

// DOM elements
const countElement = document.getElementById('count');
const statusElement = document.getElementById('status');

/**
 * Track visitor if ID is present in URL
 */
async function trackVisit() {
  if (!visitorId) {
    // No ID, just fetch current count
    await fetchCount();
    return;
  }

  try {
    const response = await fetch(`${window.API_CONFIG.baseUrl}/visit?id=${encodeURIComponent(visitorId)}`);
    const data = await response.json();

    if (response.ok) {
      countElement.textContent = data.count;

      if (data.newVisit) {
        statusElement.textContent = `Welcome, ${visitorId}! You're visitor #${data.count}`;
        statusElement.className = 'status new-visitor';
      } else {
        statusElement.textContent = `Welcome back, ${visitorId}! You've already been counted.`;
        statusElement.className = 'status returning';
      }
    } else {
      statusElement.textContent = data.error || 'Error tracking visit';
      statusElement.className = 'status';
    }
  } catch (error) {
    console.error('Error tracking visit:', error);
    statusElement.textContent = 'Error connecting to server';
    statusElement.className = 'status';
  }
}

/**
 * Fetch current count without tracking
 */
async function fetchCount() {
  try {
    const response = await fetch(`${window.API_CONFIG.baseUrl}/count`);
    const data = await response.json();

    if (response.ok) {
      countElement.textContent = data.count;
    }
  } catch (error) {
    console.error('Error fetching count:', error);
  }
}

// Initialize - track visit or fetch count
trackVisit();
