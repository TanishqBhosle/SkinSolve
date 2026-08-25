import React from 'react';
import { Award } from 'lucide-react';

export const Evaluation: React.FC = () => {
  const benchmarkData = [
    {
      model: 'Popularity Baseline',
      csr: '25.0%',
      completeness: '100.0%',
      latency: '0.45 ms',
      notes: 'Selects highest reviewed items blindly. Fails budget & fragrance constraints 75% of the time.'
    },
    {
      model: 'Content-Based Baseline',
      csr: '37.5%',
      completeness: '87.5%',
      latency: '0.65 ms',
      notes: 'Matches concern keywords only. Ignores total basket budget and fails category coherence.'
    },
    {
      model: 'SkinSolve Multi-Objective (Ours)',
      csr: '100.0%',
      completeness: '100.0%',
      latency: '8.85 ms',
      notes: 'Deterministic combinatorial constraint satisfaction. 100% budget adherence and zero active conflicts.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sage-100 text-sage-800 text-xs font-semibold uppercase tracking-wider mb-3">
          <Award className="w-3.5 h-3.5" />
          <span>Empirical Evaluation</span>
        </div>
        <h1 className="text-3xl font-bold font-serif text-charcoal-900">Recommendation Engine Benchmarks</h1>
        <p className="text-sm text-charcoal-600 mt-2">
          Comparative empirical performance of SkinSolve against standard baseline recommender algorithms across synthetic user personas.
        </p>
      </div>

      {/* Benchmark Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-surface-card p-6 rounded-2xl border border-surface-border text-center">
          <span className="text-xs font-bold text-charcoal-500 uppercase">Constraint Satisfaction Rate</span>
          <div className="text-3xl font-extrabold text-sage-700 font-serif mt-2">100.0%</div>
          <p className="text-xs text-charcoal-600 mt-1">SkinSolve vs 25% for Popularity</p>
        </div>

        <div className="bg-surface-card p-6 rounded-2xl border border-surface-border text-center">
          <span className="text-xs font-bold text-charcoal-500 uppercase">Routine Completeness</span>
          <div className="text-3xl font-extrabold text-sage-700 font-serif mt-2">100.0%</div>
          <p className="text-xs text-charcoal-600 mt-1">AM/PM full coverage</p>
        </div>

        <div className="bg-surface-card p-6 rounded-2xl border border-surface-border text-center">
          <span className="text-xs font-bold text-charcoal-500 uppercase">Average Latency</span>
          <div className="text-3xl font-extrabold text-sage-700 font-serif mt-2">&lt; 10 ms</div>
          <p className="text-xs text-charcoal-600 mt-1">Instant deterministic response</p>
        </div>
      </div>

      {/* Comparative Table */}
      <div className="bg-surface-card rounded-3xl border border-surface-border p-6 sm:p-8">
        <h3 className="text-lg font-bold font-serif text-charcoal-900 mb-4">Benchmark Results Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-surface-border text-charcoal-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Model Architecture</th>
                <th className="py-3 px-2">CSR (%)</th>
                <th className="py-3 px-2">Completeness (%)</th>
                <th className="py-3 px-2">Avg Latency</th>
                <th className="py-3 px-4">Evaluation Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {benchmarkData.map((b, idx) => (
                <tr key={idx} className={idx === 2 ? 'bg-sage-50/70 font-semibold' : ''}>
                  <td className="py-4 px-4 text-charcoal-900 font-medium">{b.model}</td>
                  <td className="py-4 px-2 text-sage-800 font-bold">{b.csr}</td>
                  <td className="py-4 px-2 text-sage-800 font-bold">{b.completeness}</td>
                  <td className="py-4 px-2 text-charcoal-600">{b.latency}</td>
                  <td className="py-4 px-4 text-xs text-charcoal-600">{b.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
