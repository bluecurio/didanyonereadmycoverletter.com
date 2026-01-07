import { uniqueNamesGenerator, adjectives, animals, NumberDictionary } from 'unique-names-generator';

const numberDictionary = NumberDictionary.generate({ min: 1, max: 999 });

export const handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const uniqueId = uniqueNamesGenerator({
      dictionaries: [adjectives, animals, numberDictionary],
      separator: '-',
      length: 3,
      style: 'lowerCase'
    });

    // Get the domain from the request or use environment variable
    const domain = process.env.WEBSITE_DOMAIN || event.headers.Host || event.headers.host;
    const protocol = event.headers['X-Forwarded-Proto'] || event.headers['x-forwarded-proto'] || 'https';
    const shareUrl = `${protocol}://${domain}?id=${uniqueId}`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: uniqueId,
        url: shareUrl
      })
    };
  } catch (error) {
    console.error('Generate error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
