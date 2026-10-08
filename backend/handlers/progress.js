/**
 * EcoSort Heroes - Progress Lambda Handler
 * Child privacy compliant: Only saves nickname, score, level results, and category stats.
 */

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.PROGRESS_TABLE || "EcoSortProgress";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

exports.saveProgress = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { userId, nickname, levelId, score, stars, accuracy, errors, unlockedCards } = body;

    if (!userId || levelId === undefined) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "userId and levelId are required" }),
      };
    }

    const item = {
      userId,
      levelId: Number(levelId),
      nickname: nickname || "EcoHero",
      score: score || 0,
      stars: stars || 1,
      accuracy: accuracy || 0,
      errors: errors || [],
      unlockedCards: unlockedCards || [],
      updatedAt: new Date().toISOString(),
    };

    await ddbDocClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, item }),
    };
  } catch (error) {
    console.error("Error saving progress:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Internal server error", error: error.message }),
    };
  }
};

exports.getProgress = async (event) => {
  try {
    const userId = event.pathParameters?.userId;
    if (!userId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "userId is required" }),
      };
    }

    const result = await ddbDocClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: {
          ":uid": userId,
        },
      })
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ items: result.Items || [] }),
    };
  } catch (error) {
    console.error("Error retrieving progress:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Internal server error", error: error.message }),
    };
  }
};
