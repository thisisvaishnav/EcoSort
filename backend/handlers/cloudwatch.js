/**
 * EcoSort Heroes - CloudWatch Observability Helper
 * Sends custom telemetry, latency, sorting metrics, and alarms to Amazon CloudWatch.
 */

const { CloudWatchClient, PutMetricDataCommand } = require("@aws-sdk/client-cloudwatch");

const cwRegion = process.env.AWS_REGION || "us-east-1";
let cwClient = null;

function getClient() {
  if (!cwClient) {
    cwClient = new CloudWatchClient({ region: cwRegion });
  }
  return cwClient;
}

const NAMESPACE = "EcoSortHeroes/Telemetry";

/**
 * Record custom metrics to Amazon CloudWatch
 * @param {string} metricName - Name of the metric (e.g., ItemsSorted, Accuracy, LatencyMs)
 * @param {number} value - Metric value
 * @param {string} unit - StandardUnit (Count, Milliseconds, Percent)
 * @param {Array<{Name: string, Value: string}>} dimensions - Dimensions for slicing
 */
async function recordMetric(metricName, value, unit = "Count", dimensions = []) {
  // Always emit structured CloudWatch Embedded Metric Format (EMF) to stdout
  const emfPayload = {
    _aws: {
      Timestamp: Date.now(),
      CloudWatchMetrics: [
        {
          Namespace: NAMESPACE,
          Dimensions: [dimensions.map((d) => d.Name)],
          Metrics: [{ Name: metricName, Unit: unit }],
        },
      ],
    },
    [metricName]: value,
    ...dimensions.reduce((acc, cur) => ({ ...acc, [cur.Name]: cur.Value }), {}),
  };

  // Structured log for CloudWatch Logs Insights
  console.log(JSON.stringify(emfPayload));

  // If running in production with AWS credentials, also dispatch via CloudWatch PutMetricData
  if (process.env.ENABLE_CLOUDWATCH_PUT === "true" || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    try {
      const client = getClient();
      const command = new PutMetricDataCommand({
        Namespace: NAMESPACE,
        MetricData: [
          {
            MetricName: metricName,
            Value: value,
            Unit: unit,
            Timestamp: new Date(),
            Dimensions: dimensions,
          },
        ],
      });
      await client.send(command);
    } catch (err) {
      // Non-blocking: log metric dispatch warning without interrupting main flow
      console.warn(`[CloudWatch Metric Notice] Could not put metric ${metricName}:`, err.message);
    }
  }
}

/**
 * Track an item sorting event
 */
async function trackSortEvent({ category, isCorrect, levelId = "1" }) {
  await Promise.all([
    recordMetric("ItemSortAttempts", 1, "Count", [
      { Name: "Category", Value: category },
      { Name: "Level", Value: String(levelId) },
    ]),
    recordMetric(isCorrect ? "CorrectSorts" : "IncorrectSorts", 1, "Count", [
      { Name: "Category", Value: category },
      { Name: "Level", Value: String(levelId) },
    ]),
  ]);
}

/**
 * Track AI mascot invocation
 */
async function trackMascotInvocation({ durationMs, success = true, model = "Bedrock-Claude-3" }) {
  await Promise.all([
    recordMetric("MascotInvocations", 1, "Count", [
      { Name: "Model", Value: model },
      { Name: "Success", Value: String(success) },
    ]),
    recordMetric("MascotLatency", durationMs, "Milliseconds", [
      { Name: "Model", Value: model },
    ]),
  ]);
}

module.exports = {
  recordMetric,
  trackSortEvent,
  trackMascotInvocation,
  NAMESPACE,
};
