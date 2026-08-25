import React, { useEffect, useState } from 'react';
import { getProductCatalog, getEvidenceBase } from '../services/api';
import { Sparkles, FlaskConical } from 'lucide-react';

export const Catalog: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prods, evis] = await Promise.all([getProductCatalog(), getEvidenceBase()]);
        setProducts(prods);
        setEvidence(evis);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = ['All', 'Cleanser', 'Treatment', 'Moisturizer', 'Sunscreen', 'Exfoliant', 'Toner'];

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <Sparkles className="w-8 h-8 text-sage-700 animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-charcoal-600">Loading catalog...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl font-bold font-serif text-charcoal-900">Curated Skincare & Evidence Catalog</h1>
        <p className="text-sm text-charcoal-600 mt-2">
          Explore the scientifically-indexed products and dermatological clinical evidence dataset powering SkinSolve.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-sage-700 text-white shadow-sm'
                : 'bg-surface-card border border-surface-border text-charcoal-600 hover:bg-sage-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {filteredProducts.map((p) => (
          <div key={p.product_id} className="bg-surface-card rounded-2xl border border-surface-border p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-sage-700 uppercase tracking-wider text-[10px]">{p.category}</span>
                <span className="font-bold text-charcoal-900 font-serif">₹{p.price}</span>
              </div>
              <h3 className="font-bold text-charcoal-900 text-sm">{p.name}</h3>
              <span className="text-xs text-charcoal-500 block mb-2">{p.brand}</span>
              <p className="text-xs text-charcoal-600 line-clamp-2 mb-4">{p.description}</p>

              <div className="flex flex-wrap gap-1 mb-3">
                {String(p.concerns).split(',').map((c, i) => (
                  <span key={i} className="text-[10px] bg-sage-50 text-sage-800 px-2 py-0.5 rounded">
                    {c.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-surface-border flex items-center justify-between text-[11px] text-charcoal-500">
              <span>Rating: {p.rating} ★</span>
              <span>{p.fragrance_free ? '✓ Fragrance-Free' : 'Scented'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Clinical Evidence Section */}
      <div className="bg-surface-card rounded-3xl border border-surface-border p-8">
        <div className="flex items-center space-x-3 mb-6">
          <FlaskConical className="w-6 h-6 text-sage-700" />
          <h2 className="text-xl font-bold font-serif text-charcoal-900">Clinical Evidence Base</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evidence.map((evi) => (
            <div key={evi.evidence_id} className="p-4 rounded-xl bg-surface-muted/60 border border-surface-border">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-charcoal-900">{evi.ingredient_or_compound}</h4>
                <span className="text-[10px] font-semibold bg-sage-100 text-sage-800 px-2 py-0.5 rounded">
                  {evi.clinical_strength} ({evi.num_clinical_trials} Trials)
                </span>
              </div>
              <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">{evi.consensus_summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
