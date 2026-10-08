import React, { useEffect, useState } from 'react';
import { TeacherReportStats } from '../../types/game';
import { apiService } from '../../services/api';
import { ALL_BINS } from '../../data/bins';
import { GAME_ITEMS } from '../../data/items';
import { BarChart3, Users, Award, AlertCircle, ArrowUpRight, CheckCircle2, RefreshCw } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const [report, setReport] = useState<TeacherReportStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    const data = await apiService.getTeacherReport();
    setReport(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading || !report) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-slate-400">Loading learning report from DynamoDB...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate-700/80 pb-6">
        <div>
          <span className="text-xs font-semibold text-green-400 uppercase tracking-wider block">
            AWS DynamoDB Powered Analytics
          </span>
          <h1 className="font-fun text-3xl font-bold text-white">Teacher & Parent Learning Report</h1>
          <p className="text-sm text-slate-300">
            Real classroom evidence measuring waste sorting accuracy and conceptual retention.
          </p>
        </div>

        <button
          onClick={fetchReport}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Active Learners</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <span className="font-fun text-2xl font-bold text-white">{report.studentCount} Students</span>
          <p className="text-[11px] text-slate-400 mt-1">Guest and Cognito registered</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Average Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-fun text-2xl font-bold text-emerald-400">{report.avgAccuracy}%</span>
          <p className="text-[11px] text-slate-400 mt-1">Across all 5 learning levels</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Pre vs Post Gain</span>
            <ArrowUpRight className="w-4 h-4 text-yellow-400" />
          </div>
          <span className="font-fun text-2xl font-bold text-yellow-400">
            {report.evaluation.learningDelta}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">
            From {report.evaluation.preTestAccuracy} to {report.evaluation.postTestAccuracy}
          </p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Avg Class Score</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <span className="font-fun text-2xl font-bold text-purple-400">{report.avgScore} pts</span>
          <p className="text-[11px] text-slate-400 mt-1">Clean energy milestones achieved</p>
        </div>
      </div>

      {/* Accuracy By Waste Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-fun text-xl font-bold text-white">Mistakes by Waste Category</h3>
          </div>
          <p className="text-xs text-slate-400 mb-5">
            Categories with higher counts indicate concepts that benefit from classroom discussion.
          </p>

          <div className="space-y-4">
            {Object.entries(report.categoryErrors).map(([catKey, errorCount]) => {
              const bin = ALL_BINS[catKey as keyof typeof ALL_BINS];
              const maxErr = Math.max(...Object.values(report.categoryErrors), 1);
              const percentage = Math.round((errorCount / maxErr) * 100);

              return (
                <div key={catKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">
                      {bin?.label || catKey} ({bin?.sublabel || ''})
                    </span>
                    <span className="text-slate-400 font-semibold">{errorCount} errors</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        errorCount > 10 ? 'bg-rose-500' : 'bg-amber-500'
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
        <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h3 className="font-fun text-xl font-bold text-white">Items That Need Practice</h3>
          </div>
          <p className="text-xs text-slate-400 mb-5">
            The adaptive spawner automatically presents these items more frequently to learners.
          </p>

          <div className="space-y-3">
            {report.topMistakes.map((m) => {
              const item = GAME_ITEMS.find((i) => i.id === m.itemId);
              const bin = item ? ALL_BINS[item.bin] : null;

              return (
                <div
                  key={m.itemId}
                  className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item?.icon || '📦'}</span>
                    <div>
                      <p className="font-fun font-bold text-white text-sm">{item?.name || m.itemId}</p>
                      <p className="text-[11px] text-slate-400">
                        Correct bin: <span className="text-emerald-400 font-semibold">{bin?.label}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-fun font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-xl">
                    {m.count} misses
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Child Privacy & Data Governance note */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 leading-relaxed">
        🔒 <strong className="text-slate-300">Child Privacy Compliance:</strong> In accordance with COPPA and global school safety guidelines, this system stores only pseudonymous nicknames, level completion records, and waste categorization error statistics. No names, personal emails, photos, or geographic data are collected or persisted.
      </div>
    </div>
  );
};
