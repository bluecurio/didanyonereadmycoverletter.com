// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const visitorId = urlParams.get('id');

// DOM elements
const countElement = document.getElementById('count');
const statusElement = document.getElementById('status');
const generateBtn = document.getElementById('generateBtn');
const generatedLinkDiv = document.getElementById('generatedLink');
const linkInput = document.getElementById('linkInput');
const copyBtn = document.getElementById('copyBtn');

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
    const response = await fetch(`/api/visit?id=${encodeURIComponent(visitorId)}`);
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
    const response = await fetch('/api/count');
    const data = await response.json();

    if (response.ok) {
      countElement.textContent = data.count;
    }
  } catch (error) {
    console.error('Error fetching count:', error);
  }
}

/**
 * Generate new unique link
 */
async function generateLink() {
  try {
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';

    const response = await fetch('/api/generate');
    const data = await response.json();

    if (response.ok) {
      linkInput.value = data.url;
      generatedLinkDiv.classList.remove('hidden');

      // Scroll to the generated link
      generatedLinkDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      alert('Failed to generate link: ' + (data.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error generating link:', error);
    alert('Failed to generate link. Please try again.');
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate New Link';
  }
}

/**
 * Copy link to clipboard
 */
async function copyLink() {
  try {
    linkInput.select();
    await navigator.clipboard.writeText(linkInput.value);

    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    copyBtn.style.background = '#28a745';

    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.background = '';
    }, 2000);
  } catch (error) {
    // Fallback for older browsers
    linkInput.select();
    document.execCommand('copy');

    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = 'Copy';
    }, 2000);
  }
}

// Event listeners
generateBtn.addEventListener('click', generateLink);
copyBtn.addEventListener('click', copyLink);

// Initialize - track visit or fetch count
trackVisit();
