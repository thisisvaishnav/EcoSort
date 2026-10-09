import React, { useEffect, useState } from 'react';
import { TeacherReportStats } from '../../types/game';
import { apiService } from '../../services/api';
import { ALL_BINS } from '../../data/bins';
import { GAME_ITEMS } from '../../data/items';
import { BarChart3, Users, Award, AlertCircle, ArrowUpRight, CheckCircle2, RefreshCw, Printer } from 'lucide-react';

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

  const handlePrint = () => {
    window.print();
  };

  if (loading || !report) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-slate-900 border-t-amber-400 rounded-full mx-auto mb-4" />
        <p className="font-fun font-bold text-slate-700">Loading learning report from DynamoDB...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b-2 border-slate-900 pb-6">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-200 text-emerald-950 border border-slate-900 text-[10px] font-black uppercase tracking-wider mb-1">
            AWS DynamoDB Powered Analytics
          </span>
          <h1 className="font-fun text-3xl font-black text-slate-950">Teacher & Parent Learning Report</h1>
          <p className="text-sm text-slate-600 font-medium">
            Real classroom evidence measuring waste sorting accuracy and conceptual retention.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchReport}
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

      {/* Child Privacy & Data Governance note */}
      <div className="bg-emerald-50 border-2 border-slate-900 rounded-2xl p-4 text-xs text-slate-800 font-medium leading-relaxed shadow-retro-sm">
        🔒 <strong className="font-black text-slate-950">Child Privacy Compliance:</strong> In accordance with COPPA and global school safety guidelines, this system stores only pseudonymous nicknames, level completion records, and waste categorization error statistics. No names, personal emails, photos, or geographic data are collected or persisted.
      </div>
    </div>
  );
};
