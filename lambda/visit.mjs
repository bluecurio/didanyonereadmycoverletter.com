import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'didanyonereadmycoverletter.com';
const COUNTER_KEY = 'global_counter';
const VISITED_PREFIX = 'visited:';

async function getCount() {
  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { id: COUNTER_KEY }
  }));
  return result.Item?.count || 0;
}

async function hasVisited(visitorId) {
  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { id: `${VISITED_PREFIX}${visitorId}` }
  }));
  return !!result.Item;
}

async function markVisited(visitorId) {
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      id: `${VISITED_PREFIX}${visitorId}`,
      timestamp: new Date().toISOString(),
      visited: true
    }
  }));
}

async function incrementCounter() {
  const result = await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { id: COUNTER_KEY },
    UpdateExpression: 'SET #count = if_not_exists(#count, :zero) + :inc',
    ExpressionAttributeNames: {
      '#count': 'count'
    },
    ExpressionAttributeValues: {
      ':inc': 1,
      ':zero': 0
    },
    ReturnValues: 'ALL_NEW'
  }));
  return result.Attributes.count;
}

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
    // Get ID from query string
    const id = event.queryStringParameters?.id;

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing id parameter' })
      };
    }

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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        count,
        newVisit: !alreadyVisited,
        id
      })
    };
  } catch (error) {
    console.error('Visit tracking error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
