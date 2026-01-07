// DOM elements
const generateBtn = document.getElementById('generateBtn');
const generatedLinkDiv = document.getElementById('generatedLink');
const linkInput = document.getElementById('linkInput');
const copyBtn = document.getElementById('copyBtn');

/**
 * Generate new unique link
 */
async function generateLink() {
  try {
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';

    const response = await fetch(`${window.API_CONFIG.baseUrl}/generate`);
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
