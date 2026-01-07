import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { uniqueNamesGenerator, adjectives, animals, NumberDictionary } from 'unique-names-generator';
import { getCount, hasVisited, markVisited, incrementCounter } from './lib/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Number dictionary for unique IDs
const numberDictionary = NumberDictionary.generate({ min: 1, max: 999 });

/**
 * API: Track visitor and increment counter if new
 * GET /api/visit?id=happy-penguin-42
 */
app.get('/api/visit', async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing id parameter' });
  }

  try {
    // Check if this ID has visited before
    const alreadyVisited = await hasVisited(id);

    let count;
    if (!alreadyVisited) {
      // Mark as visited and increment counter
      await markVisited(id);
      count = await incrementCounter();
    } else {
      // Just return current count
      count = await getCount();
    }

    return res.json({
      count,
      newVisit: !alreadyVisited,
      id
    });
  } catch (error) {
    console.error('Visit tracking error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * API: Generate new unique ID with funny word combination
 * GET /api/generate
 */
app.get('/api/generate', (req, res) => {
  const uniqueId = uniqueNamesGenerator({
    dictionaries: [adjectives, animals, numberDictionary],
    separator: '-',
    length: 3,
    style: 'lowerCase'
  });

  // Generate shareable URL
  const protocol = req.protocol;
  const host = req.get('host');
  const shareUrl = `${protocol}://${host}?id=${uniqueId}`;

  return res.json({
    id: uniqueId,
    url: shareUrl
  });
});

/**
 * API: Get current visitor count
 * GET /api/count
 */
app.get('/api/count', async (req, res) => {
  try {
    const count = await getCount();
    return res.json({ count });
  } catch (error) {
    console.error('Count retrieval error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Health check endpoint
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}`);
});
