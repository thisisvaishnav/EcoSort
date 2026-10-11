/**
 * EcoSort Heroes - Amazon Polly Voice Synthesis Lambda
 * Converts mascot dialogue and tips into lifelike child-friendly neural speech.
 */

const { PollyClient, SynthesizeSpeechCommand } = require("@aws-sdk/client-polly");
const { recordMetric } = require("./cloudwatch");

const polly = new PollyClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

exports.handler = async (event) => {
  const startTime = Date.now();
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const text = (body.text || "").trim();
    // Default to 'Kevin' (child neural voice) or 'Justin' (boy neural voice)
    const voiceId = body.voiceId || process.env.POLLY_VOICE_ID || "Kevin";

    if (!text) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Text parameter is required." }),
      };
    }

    // Maximum 300 characters to keep responses snappy and cost-effective
    const sanitizedText = text.substring(0, 300);

    const command = new SynthesizeSpeechCommand({
      Engine: "neural",
      OutputFormat: "mp3",
      Text: sanitizedText,
      VoiceId: voiceId,
    });

    const pollyResponse = await polly.send(command);
    const audioBytes = await pollyResponse.AudioStream.transformToByteArray();
    const base64Audio = Buffer.from(audioBytes).toString("base64");

    // CloudWatch Observability metrics
    await Promise.all([
      recordMetric("PollySpeechSyntheses", 1, "Count", [{ Name: "VoiceId", Value: voiceId }]),
      recordMetric("PollyLatency", Date.now() - startTime, "Milliseconds", [{ Name: "VoiceId", Value: voiceId }]),
      recordMetric("SynthesizedTextLength", sanitizedText.length, "Count", [{ Name: "VoiceId", Value: voiceId }]),
    ]);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        voiceId,
        audio: `data:audio/mp3;base64,${base64Audio}`,
      }),
    };
  } catch (error) {
    console.error("Polly synthesis error:", error);
    await recordMetric("PollyErrors", 1, "Count");
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: error.message || "Failed to synthesize speech",
      }),
    };
  }
};
