import { describe, it, expect } from 'vitest';
import { apiService } from '../src/services/api';

describe('Analytics & Observability Service', () => {
  it('fetches observability telemetry with expected AWS metrics structure', async () => {
    const metrics = await apiService.getObservabilityMetrics();

    expect(metrics).toBeDefined();
    expect(metrics.namespace).toBe('EcoSortHeroes/Telemetry');
    expect(metrics.status).toBe('HEALTHY');

    // Lambda telemetry
    expect(metrics.lambdaMetrics).toBeDefined();
    expect(typeof metrics.lambdaMetrics.invocations24h).toBe('number');
    expect(typeof metrics.lambdaMetrics.avgLatencyMs).toBe('number');
    expect(typeof metrics.lambdaMetrics.errorRatePercent).toBe('number');

    // DynamoDB telemetry
    expect(metrics.dynamoDbMetrics).toBeDefined();
    expect(metrics.dynamoDbMetrics.tableStatus).toBe('ACTIVE');
    expect(metrics.dynamoDbMetrics.billingMode).toContain('On-Demand');

    // CloudWatch alarms
    expect(Array.isArray(metrics.cloudWatchAlarms)).toBe(true);
    expect(metrics.cloudWatchAlarms.length).toBeGreaterThanOrEqual(1);
    expect(metrics.cloudWatchAlarms[0].status).toBe('OK');
  });

  it('fetches teacher report statistics from DynamoDB aggregation', async () => {
    const report = await apiService.getTeacherReport('grade-3a');

    expect(report).toBeDefined();
    expect(report.classId).toBe('grade-3a');
    expect(report.studentCount).toBeGreaterThan(0);
    expect(report.avgAccuracy).toBeGreaterThan(0);
    expect(report.categoryErrors).toHaveProperty('hazardous');
  });
});
