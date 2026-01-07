import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'didanyonereadmycoverletter.com';
const COUNTER_KEY = 'global_counter';
const VISITED_PREFIX = 'visited:';

/**
 * Get the current global counter value
 */
export async function getCount() {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id: COUNTER_KEY }
    }));

    return result.Item?.count || 0;
  } catch (error) {
    console.error('Error getting count:', error);
    return 0;
  }
}

/**
 * Check if a visitor ID has been seen before
 */
export async function hasVisited(visitorId) {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id: `${VISITED_PREFIX}${visitorId}` }
    }));

    return !!result.Item;
  } catch (error) {
    console.error('Error checking visited status:', error);
    return false;
  }
}

/**
 * Mark a visitor ID as having visited
 */
export async function markVisited(visitorId) {
  try {
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        id: `${VISITED_PREFIX}${visitorId}`,
        timestamp: new Date().toISOString(),
        visited: true
      }
    }));
    return true;
  } catch (error) {
    console.error('Error marking visited:', error);
    return false;
  }
}

/**
 * Increment the global counter and return new value
 */
export async function incrementCounter() {
  try {
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
  } catch (error) {
    console.error('Error incrementing counter:', error);
    throw error;
  }
}
