import React, { useEffect, useState } from 'react';
import { TeacherReportStats, ObservabilityMetrics } from '../../types/game';
import { apiService } from '../../services/api';
import { ALL_BINS } from '../../data/bins';
import { GAME_ITEMS } from '../../data/items';
import {
  BarChart3,
  Users,
  Award,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  RefreshCw,
  Printer,
  Activity,
  Server,
  Database,
  Cpu,
  Radio,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'report' | 'observability'>('report');
  const [report, setReport] = useState<TeacherReportStats | null>(null);
  const [telemetry, setTelemetry] = useState<ObservabilityMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [reportData, telemetryData] = await Promise.all([
      apiService.getTeacherReport(),
      apiService.getObservabilityMetrics(),
    ]);
    setReport(reportData);
    setTelemetry(telemetryData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !report) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-slate-900 border-t-amber-400 rounded-full mx-auto mb-4" />
        <p className="font-fun font-bold text-slate-700">Loading learning report and AWS CloudWatch metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b-2 border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-200 text-emerald-950 border border-slate-900 text-[10px] font-black uppercase tracking-wider">
              AWS DynamoDB &amp; CloudWatch
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-cyan-100 text-cyan-900 border border-slate-900 text-[10px] font-black uppercase tracking-wider">
              <Radio className="w-3 h-3 text-cyan-600 animate-pulse" />
              Live Observability
            </span>
          </div>
          <h1 className="font-fun text-3xl font-black text-slate-950">Analytics &amp; Observability Portal</h1>
          <p className="text-sm text-slate-600 font-medium">
            Classroom learning telemetry and real-time AWS serverless operational health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation Tab Pills */}
          <div className="flex items-center bg-slate-200/80 p-1 border-2 border-slate-900 rounded-2xl">
            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-fun font-black transition-all ${
                activeTab === 'report'
                  ? 'bg-amber-300 text-slate-950 border border-slate-900 shadow-retro-sm'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Learning Report</span>
            </button>
            <button
              onClick={() => setActiveTab('observability')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-fun font-black transition-all ${
                activeTab === 'observability'
                  ? 'bg-emerald-300 text-slate-950 border border-slate-900 shadow-retro-sm'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>CloudWatch Metrics</span>
            </button>
          </div>

          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border-2 border-slate-900 rounded-xl text-xs font-fun font-black text-slate-950 shadow-retro-sm transition-all active:translate-x-[1px] active:translate-y-[1px]"
          >
            <RefreshCw className="w-3.5 h-3.5 stroke-slate-950" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-300 hover:bg-amber-400 border-2 border-slate-900 rounded-xl text-xs font-fun font-black text-slate-950 shadow-retro-sm transition-all active:translate-x-[1px] active:translate-y-[1px]"
          >
            <Printer className="w-3.5 h-3.5 stroke-slate-950" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* ── Tab 1: Classroom Learning Report ── */}
      {activeTab === 'report' && (
        <>
          {/* Primary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-100 border-2 border-slate-900 rounded-2xl p-4 shadow-retro-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-700 font-black uppercase tracking-wider">Active Learners</span>
                <Users className="w-5 h-5 text-blue-700 stroke-slate-950" />
              </div>
              <span className="font-fun text-2xl font-black text-slate-950">{report.studentCount} Students</span>
              <p className="text-[11px] font-bold text-slate-600 mt-1">Guest and Cognito registered</p>
            </div>

            <div className="bg-emerald-100 border-2 border-slate-900 rounded-2xl p-4 shadow-retro-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-700 font-black uppercase tracking-wider">Average Accuracy</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-700 stroke-slate-950" />
              </div>
              <span className="font-fun text-2xl font-black text-emerald-900">{report.avgAccuracy}%</span>
              <p className="text-[11px] font-bold text-slate-600 mt-1">Across all 5 learning levels</p>
            </div>

            <div className="bg-amber-200 border-2 border-slate-900 rounded-2xl p-4 shadow-retro-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-700 font-black uppercase tracking-wider">Pre vs Post Gain</span>
                <ArrowUpRight className="w-5 h-5 text-amber-800 stroke-slate-950" />
              </div>
              <span className="font-fun text-2xl font-black text-slate-950">
                {report.evaluation.learningDelta}
              </span>
              <p className="text-[11px] font-bold text-slate-700 mt-1">
                From {report.evaluation.preTestAccuracy} to {report.evaluation.postTestAccuracy}
              </p>
            </div>

            <div className="bg-purple-100 border-2 border-slate-900 rounded-2xl p-4 shadow-retro-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-700 font-black uppercase tracking-wider">Avg Class Score</span>
                <Award className="w-5 h-5 text-purple-700 stroke-slate-950" />
              </div>
              <span className="font-fun text-2xl font-black text-purple-950">{report.avgScore} PTS</span>
              <p className="text-[11px] font-bold text-slate-600 mt-1">Clean energy milestones achieved</p>
            </div>
          </div>

          {/* Accuracy By Waste Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-retro">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-emerald-200 border border-slate-900 rounded-xl">
                  <BarChart3 className="w-5 h-5 stroke-slate-950" />
                </div>
                <h3 className="font-fun text-xl font-black text-slate-950">Mistakes by Waste Category</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium mb-5">
                Categories with higher counts indicate concepts that benefit from classroom discussion.
              </p>

              <div className="space-y-4">
                {Object.entries(report.categoryErrors).map(([catKey, errorCount]) => {
                  const bin = ALL_BINS[catKey as keyof typeof ALL_BINS];
                  const maxErr = Math.max(...Object.values(report.categoryErrors), 1);
                  const percentage = Math.round((errorCount / maxErr) * 100);

                  return (
                    <div key={catKey} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800">
                          {bin?.label || catKey} ({bin?.sublabel || ''})
                        </span>
                        <span className="text-slate-600">{errorCount} errors</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 border border-slate-900 rounded-full overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full border border-slate-900 transition-all duration-500 ${
                            errorCount > 10 ? 'bg-rose-400' : 'bg-amber-300'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Items Needing Practice */}
            <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 shadow-retro">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-amber-200 border border-slate-900 rounded-xl">
                  <AlertCircle className="w-5 h-5 stroke-slate-950" />
                </div>
                <h3 className="font-fun text-xl font-black text-slate-950">Items That Need Practice</h3>
              </div>
              <p className="text-xs text-slate-600 font-medium mb-5">
                The adaptive spawner automatically presents these items more frequently to learners.
              </p>

              <div className="space-y-3">
                {report.topMistakes.map((m) => {
                  const item = GAME_ITEMS.find((i) => i.id === m.itemId);
                  const bin = item ? ALL_BINS[item.bin] : null;

                  return (
                    <div
                      key={m.itemId}
                      className="bg-slate-50 border-2 border-slate-900 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-retro-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl drop-shadow-sm">{item?.icon || '📦'}</span>
                        <div>
                          <p className="font-fun font-black text-slate-950 text-sm">{item?.name || m.itemId}</p>
                          <p className="text-[11px] font-bold text-slate-600">
                            Correct bin: <span className="text-emerald-700">{bin?.label}</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-fun font-black bg-rose-200 text-rose-950 border border-slate-900 px-2.5 py-1 rounded-xl">
                        {m.count} misses
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Tab 2: AWS CloudWatch Observability & Telemetry ── */}
      {activeTab === 'observability' && telemetry && (
        <div className="space-y-6">
          {/* CloudWatch Telemetry Banner */}
          <div className="bg-slate-900 text-white border-2 border-slate-900 rounded-3xl p-6 shadow-retro">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 border border-amber-300 flex items-center justify-center text-slate-950">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-fun text-xl font-black">Amazon CloudWatch Telemetry</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
                      {telemetry.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    Namespace: <code className="text-amber-300">{telemetry.namespace}</code> &bull; Uptime: {telemetry.uptime}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 font-mono text-slate-300">
                  Last Sync: {new Date(telemetry.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* CloudWatch Alarm Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
              {telemetry.cloudWatchAlarms.map((alarm) => (
                <div
                  key={alarm.alarmName}
                  className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-200">{alarm.alarmName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{alarm.threshold}</p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-md bg-emerald-400/20 text-emerald-400 border border-emerald-500/40">
                    {alarm.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Observability Operational Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Lambda Compute Observability */}
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-retro-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-slate-700 font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-amber-600" />
                  AWS Lambda
                </span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded text-[10px] font-black border border-slate-900">
                  Node.js 20.x
                </span>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Invocations (24h)</span>
                  <span className="font-fun font-black text-slate-950">{telemetry.lambdaMetrics.invocations24h.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Average Latency</span>
                  <span className="font-fun font-black text-emerald-600">{telemetry.lambdaMetrics.avgLatencyMs} ms</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">p95 Latency</span>
                  <span className="font-fun font-black text-slate-950">{telemetry.lambdaMetrics.p95LatencyMs} ms</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Error Rate</span>
                  <span className="font-fun font-black text-emerald-600">{telemetry.lambdaMetrics.errorRatePercent}%</span>
                </div>
              </div>
            </div>

            {/* DynamoDB Database Observability */}
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-retro-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-slate-700 font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-blue-600" />
                  Amazon DynamoDB
                </span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded text-[10px] font-black border border-slate-900">
                  Active
                </span>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Billing Mode</span>
                  <span className="font-fun font-black text-slate-950 text-[11px]">On-Demand</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Stored Records</span>
                  <span className="font-fun font-black text-slate-950">{telemetry.dynamoDbMetrics.itemCount} items</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Read Capacity Units</span>
                  <span className="font-fun font-black text-blue-600">{telemetry.dynamoDbMetrics.consumedReadUnits} RCU</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Write Capacity Units</span>
                  <span className="font-fun font-black text-blue-600">{telemetry.dynamoDbMetrics.consumedWriteUnits} WCU</span>
                </div>
              </div>
            </div>

            {/* Bedrock & Polly AI Observability */}
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 shadow-retro-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-slate-700 font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-purple-600" />
                  Bedrock &amp; Polly AI
                </span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-900 rounded text-[10px] font-black border border-slate-900">
                  GenAI
                </span>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Bedrock Mascot Calls</span>
                  <span className="font-fun font-black text-slate-950">{telemetry.aiMascotMetrics.bedrockInvocations}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Bedrock Avg Latency</span>
                  <span className="font-fun font-black text-purple-600">{telemetry.aiMascotMetrics.avgBedrockLatencyMs} ms</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Polly Speech Syntheses</span>
                  <span className="font-fun font-black text-slate-950">{telemetry.aiMascotMetrics.pollySyntheses}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Polly Avg Latency</span>
                  <span className="font-fun font-black text-purple-600">{telemetry.aiMascotMetrics.avgPollyLatencyMs} ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Child Privacy & Data Governance note */}
      <div className="bg-emerald-50 border-2 border-slate-900 rounded-2xl p-4 text-xs text-slate-800 font-medium leading-relaxed shadow-retro-sm">
        🔒 <strong className="font-black text-slate-950">Child Privacy Compliance:</strong> In accordance with COPPA and global school safety guidelines, this system stores only pseudonymous nicknames, level completion records, and waste categorization error statistics. No names, personal emails, photos, or geographic data are collected or persisted.
      </div>
    </div>
  );
};

