// API Configuration
// Replace this with your API Gateway URL after deployment
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://qs75rwn118.execute-api.us-east-1.amazonaws.com/prod';

// Export for use in other scripts
window.API_CONFIG = {
  baseUrl: API_BASE_URL
};
