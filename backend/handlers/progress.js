/**
 * EcoSort Heroes - Progress Lambda Handler
 * Child privacy compliant: Only saves nickname, score, level results, and category stats.
 */

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { recordMetric, trackSortEvent } = require("./cloudwatch");

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.PROGRESS_TABLE || "EcoSortProgress";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

exports.saveProgress = async (event) => {
  const startTime = Date.now();
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

    // Emit CloudWatch Observability Metrics
    await Promise.all([
      recordMetric("ProgressSaves", 1, "Count", [
        { Name: "Level", Value: String(levelId) },
      ]),
      recordMetric("PlayerAccuracy", accuracy || 0, "Percent", [
        { Name: "Level", Value: String(levelId) },
      ]),
      recordMetric("SaveProgressLatency", Date.now() - startTime, "Milliseconds", [
        { Name: "Level", Value: String(levelId) },
      ]),
    ]);

    // Record error events if any
    if (Array.isArray(errors) && errors.length > 0) {
      for (const err of errors) {
        if (err.bin) {
          await trackSortEvent({ category: err.bin, isCorrect: false, levelId });
        }
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, item }),
    };
  } catch (error) {
    console.error("Error saving progress:", error);
    await recordMetric("ProgressSaveErrors", 1, "Count");
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
