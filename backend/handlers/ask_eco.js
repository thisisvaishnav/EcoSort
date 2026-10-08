/**
 * EcoSort Heroes - Ask Eco (Amazon Bedrock Mascot Lambda)
 * Answers children's waste sorting questions with safe, short, ASD-STE100 child-friendly explanations.
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const question = body.question || "";

    if (!question.trim()) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Question is required." }),
      };
    }

    // Safety guardrails & child-friendly prompt adhering to ASD-STE100 guidelines
    const prompt = `You are Eco, a friendly recycling mascot for children aged 5 to 10.
Rules:
- Answer which bin the item belongs in: Green (wet/food), Blue (clean dry recycling: paper, plastic, cans), Red (hazardous: batteries, medicine), Orange (e-waste), or Brown (reuse: jars, clothes).
- Use simple words and active voice.
- Limit response to at most two short sentences (under 20 words total).
- Be positive and encouraging.
- Never discuss anything unrelated to waste sorting, recycling, and nature.

Child asks: "${question.substring(0, 150)}"
Eco's short answer:`;

    let reply = "";

    try {
      // Invoke Amazon Bedrock (Claude 3 Haiku or Titan Express)
      const input = {
        modelId: "anthropic.claude-3-haiku-20240307-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 100,
          messages: [{ role: "user", content: prompt }],
        }),
      };

      const command = new InvokeModelCommand(input);
      const response = await bedrock.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      reply = responseBody.content?.[0]?.text?.trim() || "";
    } catch (bedrockErr) {
      console.warn("Bedrock unavailable or unconfigured, using rule-based fallback:", bedrockErr.message);

      // Fast fallback for local/offline testing
      const q = question.toLowerCase();
      if (q.includes("pizza") || q.includes("box")) {
        reply = "Greasy pizza boxes go in the green bin for wet waste. Clean boxes go in blue!";
      } else if (q.includes("battery") || q.includes("chemical")) {
        reply = "Put batteries in the red bin. They have chemicals that hurt nature.";
      } else if (q.includes("phone") || q.includes("charger") || q.includes("wire")) {
        reply = "Old electronics go in the orange e-waste bin. We can reuse their metals!";
      } else if (q.includes("apple") || q.includes("food") || q.includes("banana")) {
        reply = "Food scraps go in the green bin. They make rich compost for plants!";
      } else {
        reply = "Clean paper, cardboard, and plastic bottles go in the blue recycling bin!";
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ answer: reply }),
    };
  } catch (error) {
    console.error("Ask Eco error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        answer: "Throw clean paper and plastic in the blue bin, and food scraps in the green bin!",
      }),
    };
  }
};
