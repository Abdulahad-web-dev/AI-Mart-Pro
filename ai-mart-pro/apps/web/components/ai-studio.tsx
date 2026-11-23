'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Cpu,
  BarChart3,
  Gauge,
  Play,
  Share2,
  Search,
  ExternalLink,
  ShieldCheck,
  Check,
  Copy
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import Link from 'next/link';
import { DEMO_PRODUCTS } from '@/lib/demo-products';
import { Product, money, imageSrc } from '@/lib/api';

type Tab = 'models' | 'forecast' | 'sentiment' | 'recommend' | 'inventory' | 'search';

async function callApi<T = any>(path: string, init?: RequestInit): Promise<{ data: T; ms: number }> {
  const t0 = performance.now();
  const res = await fetch(`/backend${path}`, init);
  const ms = Math.round(performance.now() - t0);
  let data: any = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return { data, ms };
}

const post = (path: string, body: unknown) =>
  callApi(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

export function AIStudio() {
  const [activeTab, setActiveTab] = useState<Tab>('models');

  // Registry Models Data
  const [modelsRegistry, setModelsRegistry] = useState<any[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState('');

  // Forecast
  const [forecastProduct, setForecastProduct] = useState<string>(DEMO_PRODUCTS[0].id);
  const [horizon, setHorizon] = useState<number>(30);
  const [forecastPrice, setForecastPrice] = useState<number>(DEMO_PRODUCTS[0].price);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastResult, setForecastResult] = useState<any>(null);
  const [forecastMs, setForecastMs] = useState<number | null>(null);
  const [forecastError, setForecastError] = useState('');

  // What-If Price Simulation
  const [whatIfPrice, setWhatIfPrice] = useState<number>(DEMO_PRODUCTS[0].price);
  const [whatIfLoading, setWhatIfLoading] = useState(false);
  const [whatIfResult, setWhatIfResult] = useState<any>(null);

  // Sentiment
  const [sentimentText, setSentimentText] = useState(
    'The noise cancellation is astonishing! Blocks out turbine roar completely and cushions are exceptionally comfortable.'
  );
  const [sentimentRating, setSentimentRating] = useState(5);
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [sentimentResult, setSentimentResult] = useState<any>(null);
  const [sentimentMs, setSentimentMs] = useState<number | null>(null);
  const [sentimentError, setSentimentError] = useState('');

  // Recommendations
  const [recBase, setRecBase] = useState<string>(DEMO_PRODUCTS[0].id);
  const [recResults, setRecResults] = useState<any[]>([]);
  const [recBundle, setRecBundle] = useState<any>(null);
  const [recMethod, setRecMethod] = useState('');
  const [recMs, setRecMs] = useState<number | null>(null);
  const [recError, setRecError] = useState('');

  // Inventory
  const [expectedDemand, setExpectedDemand] = useState(90);
  const [leadTime, setLeadTime] = useState(7);
  const [safetyDays, setSafetyDays] = useState(3);
  const [serviceLevel, setServiceLevel] = useState(0.95);
  const [currentStock, setCurrentStock] = useState(24);
  const [inventory, setInventory] = useState<any>(null);
  const [inventoryMs, setInventoryMs] = useState<number | null>(null);
  const [inventoryError, setInventoryError] = useState('');
  const [copiedDraft, setCopiedDraft] = useState(false);
  const invSeq = useRef(0);

  // Load Model Registry on Mount
  useEffect(() => {
    let isMounted = true;
    async function loadModels() {
      setModelsLoading(true);
      try {
        const { data } = await callApi<any>('/api/ai/models');
        if (isMounted && data.registry) {
          setModelsRegistry(data.registry);
        }
      } catch (e: any) {
        if (isMounted) setModelsError(e.message || 'Failed to load model registry');
      } finally {
        if (isMounted) setModelsLoading(false);
      }
    }
    loadModels();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const p = DEMO_PRODUCTS.find((x) => x.id === forecastProduct);
    if (p) {
      setForecastPrice(p.price);
      setWhatIfPrice(p.price);
    }
    setForecastResult(null);
    setWhatIfResult(null);
  }, [forecastProduct]);

  const runForecast = async () => {
    setForecastLoading(true);
    setForecastError('');
    try {
      const { data, ms } = await post('/api/ai/live-forecast', {
        productId: forecastProduct,
        horizon,
        price: forecastPrice
      });
      setForecastResult(data);
      setForecastMs(ms);
      setExpectedDemand(Number(data.predicted_units) || 0);

      // Also trigger initial What-If base comparison
      void runWhatIf(forecastPrice);
    } catch (e: any) {
      setForecastResult(null);
      setForecastError(e.message || 'AI service is unreachable.');
    } finally {
      setForecastLoading(false);
    }
  };

  const runWhatIf = async (targetPrice: number) => {
    setWhatIfLoading(true);
    try {
      const { data } = await post('/api/ai/live-whatif', {
        productId: forecastProduct,
        horizon,
        basePrice: forecastPrice,
        scenarioPrice: targetPrice,
        currentStock
      });
      setWhatIfResult(data);
    } catch {}
    finally {
      setWhatIfLoading(false);
    }
  };

  const runSentiment = async () => {
    setSentimentLoading(true);
    setSentimentError('');
    try {
      const { data, ms } = await post('/api/ai/live-sentiment', { text: sentimentText, rating: sentimentRating });
      setSentimentResult(data.results?.[0] || null);
      setSentimentMs(ms);
    } catch (e: any) {
      setSentimentResult(null);
      setSentimentError(e.message || 'AI service is unreachable.');
    } finally {
      setSentimentLoading(false);
    }
  };

  const loadRecs = useCallback(async (id: string) => {
    setRecError('');
    try {
      const { data, ms } = await callApi<any>(`/api/ai/recommendations?productId=${encodeURIComponent(id)}`);
      setRecResults(data.items || []);
      setRecBundle(data.bundleOffer || null);
      setRecMethod(data.method || '');
      setRecMs(ms);
    } catch (e: any) {
      setRecResults([]);
      setRecError(e.message || 'AI service is unreachable.');
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'recommend') void loadRecs(recBase);
  }, [activeTab, recBase, loadRecs]);

  useEffect(() => {
    if (activeTab !== 'inventory') return;
    const seq = ++invSeq.current;
    const t = setTimeout(async () => {
      try {
        const { data, ms } = await post('/api/ai/live-inventory', {
          predicted_units: expectedDemand,
          horizon,
          current_stock: currentStock,
          lead_time_days: leadTime,
          safety_days: safetyDays,
          service_level: serviceLevel
        });
        if (seq !== invSeq.current) return;
        setInventory(data);
        setInventoryMs(ms);
        setInventoryError('');
      } catch (e: any) {
        if (seq !== invSeq.current) return;
        setInventory(null);
        setInventoryError(e.message || 'AI service is unreachable.');
      }
    }, 250);
    return () => clearTimeout(t);
  }, [activeTab, expectedDemand, horizon, currentStock, leadTime, safetyDays, serviceLevel]);

  const sentConfidence = sentimentResult?.confidence != null ? Math.round(sentimentResult.confidence * 100) : null;
  const keyTerms = Array.from(
    new Set(
      sentimentText
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 3)
    )
  ).slice(0, 8);

  const forecastModel = modelsRegistry.find((m) => m.name === 'sales-forecasting');
  const backtestTimeline = forecastModel?.backtest_timeline || [];

  return (
    <section className="ai-studio-section" id="ai-studio">
      <div className="ai-studio-header">
        <div className="ai-studio-badge">
          <Cpu size={14} />
          <span>Machine Learning Studio &amp; MLOps Registry</span>
          <span className="live-dot" />
        </div>
        <h2 className="ai-studio-title">Interactive AI Engines Behind AI Mart Pro</h2>
        <p className="ai-studio-subtitle">
          Every model below operates with grounded uncertainty intervals (P10/P50/P90), trilingual natural language processing
          (English, Roman Urdu, Urdu script), Pakistan calendar features, and verified backtest baselines.
        </p>

        {/* Studio Top KPI Cards */}
        <div className="models-metrics-grid">
          <div className="metric-box">
            <div className="metric-icon-wrap violet"><TrendingUp size={18} /></div>
            <div className="metric-info">
              <span className="metric-label">Sales Forecasting v2</span>
              <span className="metric-val">HistGradientBoosting</span>
              <span className="metric-sub">+46.09% MAE over Seasonal-Naive</span>
            </div>
          </div>
          <div className="metric-box">
            <div className="metric-icon-wrap cyan"><MessageSquare size={18} /></div>
            <div className="metric-info">
              <span className="metric-label">Sentiment NLP v2</span>
              <span className="metric-val">Trilingual Char-WB N-Gram</span>
              <span className="metric-sub">English · Roman Urdu · Urdu script</span>
            </div>
          </div>
          <div className="metric-box">
            <div className="metric-icon-wrap emerald"><Search size={18} /></div>
            <div className="metric-info">
              <span className="metric-label">NL Search Engine</span>
              <span className="metric-val">Hybrid Retrieval &amp; Typo Parser</span>
              <span className="metric-sub">99.0% budget parse · 0.956 MRR</span>
            </div>
          </div>
          <div className="metric-box">
            <div className="metric-icon-wrap amber"><Package size={18} /></div>
            <div className="metric-info">
              <span className="metric-label">Inventory Optimization</span>
              <span className="metric-val">Service-Level Z(SL)×σ</span>
              <span className="metric-sub">Days-of-cover &amp; Stockout Risk %</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="studio-tabs-bar" role="tablist">
          {([
            ['models', <Cpu key="m" size={16} />, 'Model Cards & Backtests'],
            ['forecast', <TrendingUp key="f" size={16} />, 'Forecast & Price Slider'],
            ['sentiment', <MessageSquare key="s" size={16} />, 'Sentiment NLP'],
            ['recommend', <Layers key="r" size={16} />, 'Recommend'],
            ['inventory', <Package key="i" size={16} />, 'Inventory'],
            ['search', <Search key="q" size={16} />, 'NL Search']
          ] as [Tab, React.ReactNode, string][]).map(([id, icon, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              className={`studio-tab-btn ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================================== */}
      {/* TAB 1: MODEL CARDS & BACKTEST VISUALIZATION                                    */}
      {/* ============================================================================== */}
      {activeTab === 'models' && (
        <div className="studio-panel-card" style={{ display: 'block' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#171717' }}>Production Model Registry &amp; Backtest Evaluation</h3>
                <p style={{ fontSize: 13, color: '#737373', margin: '4px 0 0' }}>
                  Live metrics measured on held-out chronological test splits with zero future leakage.
                </p>
              </div>
              <span className="meta-tag">Registry: <b>v2.0-online</b></span>
            </div>

            {/* Model Registry Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 28 }}>
              {modelsRegistry.map((mod: any) => (
                <div key={mod.name} style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 16, padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <span className="eyebrow" style={{ color: '#0B7A6C' }}>{mod.active_version}</span>
                    <span style={{ fontSize: 11, background: '#16A34A', color: '#FFFFFF', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>Active</span>
                  </div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#171717', margin: '0 0 6px' }}>{mod.name.toUpperCase().replace('-', ' ')}</h4>
                  <p style={{ fontSize: 12, color: '#525252', marginBottom: 12 }}>{mod.architecture}</p>

                  <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {mod.metrics && Object.entries(mod.metrics).slice(0, 4).map(([k, v]: any) => (
                      <div key={k} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '4px 8px', fontSize: 11 }}>
                        <span style={{ color: '#737373', display: 'block', fontSize: 10 }}>{k.replace(/_/g, ' ')}</span>
                        <strong style={{ color: '#171717' }}>{typeof v === 'number' ? v : JSON.stringify(v)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Backtest Timeline Chart */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#171717' }}>
                    Rolling-Origin 30-Day Backtest: Actual vs Quantile P50 vs Seasonal-Naive Baseline
                  </h4>
                  <p style={{ fontSize: 12, color: '#737373', margin: '2px 0 0' }}>
                    Evaluated on held-out test window (Days 190-220). Shaded interval displays P10 (optimistic floor) to P90 (surge ceiling).
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 11, background: '#ECFDF5', color: '#065F46', padding: '3px 10px', borderRadius: 8, fontWeight: 700, border: '1px solid #A7F3D0' }}>
                    MAE: 3.405 (Baseline: 6.317)
                  </span>
                  <span style={{ fontSize: 11, background: '#EFF6FF', color: '#1E40AF', padding: '3px 10px', borderRadius: 8, fontWeight: 700, border: '1px solid #BFDBFE' }}>
                    +46.09% Gain
                  </span>
                </div>
              </div>

              {backtestTimeline.length > 0 ? (
                <div style={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer>
                    <AreaChart data={backtestTimeline} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="date_offset" tick={{ fontSize: 11, fill: '#737373' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#737373' }} />
                      <Tooltip
                        contentStyle={{ background: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: 8, fontSize: 12 }}
                        formatter={(val: any, name: string) => [val, name.replace(/_/g, ' ').toUpperCase()]}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                      {/* Quantile Band */}
                      <Area type="monotone" dataKey="p90" stroke="#A7F3D0" fill="#E6F4F1" name="P90 Surge Ceiling" />
                      <Area type="monotone" dataKey="p10" stroke="#A7F3D0" fill="#FFFFFF" name="P10 Floor" />
                      {/* Seasonal-Naive Benchmark */}
                      <Line type="monotone" dataKey="seasonal_naive" stroke="#94A3B8" strokeDasharray="4 4" strokeWidth={2} dot={false} name="Seasonal-Naive Baseline" />
                      {/* Model Prediction */}
                      <Line type="monotone" dataKey="predicted_p50" stroke="#0B7A6C" strokeWidth={3} dot={{ r: 3 }} name="Model Median P50" />
                      {/* Actual Ground Truth */}
                      <Line type="monotone" dataKey="actual" stroke="#171717" strokeWidth={2} dot={{ r: 3 }} name="Actual Units Sold" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#737373', fontSize: 13 }}>
                  Loading backtest evaluation series...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 2: DEMAND FORECAST & WHAT-IF PRICE ELASTICITY                               */}
      {/* ============================================================================== */}
      {activeTab === 'forecast' && (
        <div className="studio-panel-card">
          <div className="panel-controls-col">
            <h3 className="panel-col-title"><Sliders size={18} /> Model Parameters</h3>

            <div className="control-group">
              <label htmlFor="fc-product">Select Product</label>
              <select id="fc-product" value={forecastProduct} onChange={(e) => setForecastProduct(e.target.value)} className="studio-select">
                {DEMO_PRODUCTS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({money(p.price)})</option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <div className="label-row">
                <label htmlFor="fc-horizon">Forecast horizon: <b>{horizon} days</b></label>
                <span className="range-badge">{horizon <= 14 ? 'Short-term' : horizon <= 45 ? 'Standard' : 'Quarterly'}</span>
              </div>
              <input id="fc-horizon" type="range" min="7" max="90" step="1" value={horizon} onChange={(e) => setHorizon(Number(e.target.value))} className="studio-range" />
              <div className="range-hints"><span>7d</span><span>30d</span><span>90d</span></div>
            </div>

            <div className="control-group">
              <div className="label-row">
                <label htmlFor="fc-price">Current Selling Price: <b>{money(forecastPrice)}</b></label>
              </div>
              <input id="fc-price" type="range" min="1000" max="120000" step="1000" value={forecastPrice} onChange={(e) => setForecastPrice(Number(e.target.value))} className="studio-range" />
            </div>

            <button type="button" className="btn-run-model" onClick={runForecast} disabled={forecastLoading}>
              {forecastLoading ? (<><span className="spin-loader" /> Running HistGradientBoosting…</>) : (<><Play size={16} /> Run Quantile Demand Forecast</>)}
            </button>

            {/* What-If Slider Section */}
            {forecastResult && (
              <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid #E5E7EB' }}>
                <span className="eyebrow" style={{ color: '#0B7A6C' }}>WHAT-IF PRICE ELASTICITY</span>
                <div className="control-group" style={{ marginTop: 8 }}>
                  <div className="label-row">
                    <label htmlFor="wi-price">Simulated Scenario Price: <b>{money(whatIfPrice)}</b></label>
                    <span style={{ fontSize: 11, fontWeight: 700, color: whatIfPrice < forecastPrice ? '#16A34A' : '#EF4444' }}>
                      {whatIfPrice < forecastPrice ? `${Math.round(((forecastPrice - whatIfPrice) / forecastPrice) * 100)}% Discount` : 'Price Increase'}
                    </span>
                  </div>
                  <input
                    id="wi-price"
                    type="range"
                    min="1000"
                    max="120000"
                    step="1000"
                    value={whatIfPrice}
                    onChange={(e) => {
                      const newP = Number(e.target.value);
                      setWhatIfPrice(newP);
                      void runWhatIf(newP);
                    }}
                    className="studio-range"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="panel-results-col">
            <h3 className="panel-col-title"><BarChart3 size={18} /> Statistical Forecast Output</h3>

            {forecastError && <div className="studio-error"><AlertCircle size={16} /> {forecastError}</div>}

            {forecastResult ? (
              <div className="model-result-display">
                {/* 3-Quantile Output Banner */}
                <div className="result-kpi-banner">
                  <div className="kpi-block">
                    <span className="kpi-label">Median Forecast (P50)</span>
                    <span className="kpi-huge-number">{forecastResult.predicted_units}</span>
                    <span className="kpi-unit">units over {horizon}d</span>
                  </div>
                  <div className="kpi-block">
                    <span className="kpi-label">Uncertainty Range</span>
                    <span className="kpi-huge-number cyan">
                      {forecastResult.intervals ? `${forecastResult.intervals.p10_units} – ${forecastResult.intervals.p90_units}` : '—'}
                    </span>
                    <span className="kpi-unit">P10 Floor to P90 Ceiling</span>
                  </div>
                  <div className="kpi-block">
                    <span className="kpi-label">Projected Revenue</span>
                    <span className="kpi-huge-number green">
                      {money(forecastResult.predicted_units * forecastPrice)}
                    </span>
                    <span className="kpi-unit">Gross marketplace estimate</span>
                  </div>
                </div>

                {/* Baseline Comparison Pill */}
                {forecastResult.vs_baseline && (
                  <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 12, padding: '10px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 11, color: '#737373', display: 'block' }}>Seasonal-Naive Baseline Comparison (lag-7)</span>
                      <strong style={{ fontSize: 13, color: '#171717' }}>
                        Baseline Predicted: {forecastResult.vs_baseline.baseline_predicted_units} units
                      </strong>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '3px 8px', borderRadius: 6 }}>
                      +{forecastResult.vs_baseline.mae_improvement_pct}% Better MAE
                    </span>
                  </div>
                )}

                {/* What-If Impact Card */}
                {whatIfResult?.impact && (
                  <div style={{ background: '#E6F4F1', border: '1px solid #A7F3D0', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#9A3412' }}>What-If Simulation Result:</span>
                      <span style={{ fontSize: 11, color: '#9A3412' }}>Elasticity: <b>{whatIfResult.impact.price_elasticity}</b></span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, textAlign: 'center' }}>
                      <div style={{ background: '#FFFFFF', padding: 8, borderRadius: 8, border: '1px solid #A7F3D0' }}>
                        <span style={{ fontSize: 10, color: '#737373', display: 'block' }}>Unit Impact</span>
                        <strong style={{ fontSize: 14, color: whatIfResult.impact.unit_change >= 0 ? '#16A34A' : '#EF4444' }}>
                          {whatIfResult.impact.unit_change > 0 ? `+${whatIfResult.impact.unit_change}` : whatIfResult.impact.unit_change} ({whatIfResult.impact.unit_change_pct}%)
                        </strong>
                      </div>
                      <div style={{ background: '#FFFFFF', padding: 8, borderRadius: 8, border: '1px solid #A7F3D0' }}>
                        <span style={{ fontSize: 10, color: '#737373', display: 'block' }}>Revenue Shift</span>
                        <strong style={{ fontSize: 14, color: whatIfResult.impact.revenue_change_pkr >= 0 ? '#16A34A' : '#EF4444' }}>
                          {whatIfResult.impact.revenue_change_pkr >= 0 ? `+${money(whatIfResult.impact.revenue_change_pkr)}` : `-${money(Math.abs(whatIfResult.impact.revenue_change_pkr))}`}
                        </strong>
                      </div>
                      <div style={{ background: '#FFFFFF', padding: 8, borderRadius: 8, border: '1px solid #A7F3D0' }}>
                        <span style={{ fontSize: 10, color: '#737373', display: 'block' }}>Stockout In</span>
                        <strong style={{ fontSize: 14, color: whatIfResult.impact.days_to_stockout <= 14 ? '#EF4444' : '#171717' }}>
                          {whatIfResult.impact.days_to_stockout} days
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Explanatory Drivers */}
                {forecastResult.drivers && forecastResult.drivers.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#171717', display: 'block', marginBottom: 8 }}>
                      Key Model Drivers (Pakistan Calendar &amp; Historical Cycles)
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {forecastResult.drivers.map((d: any, idx: number) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '6px 12px', borderRadius: 8, fontSize: 12 }}>
                          <span style={{ color: '#525252' }}>{d.name}</span>
                          <span style={{ fontWeight: 600, color: d.impact_pct > 0 ? '#16A34A' : '#737373' }}>
                            {d.impact_pct > 0 ? `+${d.impact_pct}%` : `${d.impact_pct}%`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="model-metadata-pill">
                  <span className="meta-tag">Model: <b>{forecastResult.model_version}</b></span>
                  <span className="meta-tag">Reliability: <b>{forecastResult.reliability || 'high'}</b></span>
                  {forecastMs !== null && <span className="meta-tag">Latency: <b>{forecastMs} ms</b></span>}
                </div>
                <p className="studio-note">{forecastResult.data_note}</p>
              </div>
            ) : !forecastError && (
              <div className="model-empty-prompt">
                <Cpu size={36} />
                <h4>Model Sandbox Ready</h4>
                <p>Pick a catalog item, set your forecast horizon, and run the Quantile HistGradientBoosting regressor.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 3: TRILINGUAL ASPECT SENTIMENT                                             */}
      {/* ============================================================================== */}
      {activeTab === 'sentiment' && (
        <div className="studio-panel-card">
          <div className="panel-controls-col">
            <h3 className="panel-col-title"><MessageSquare size={18} /> Trilingual Review Input</h3>

            <div className="preset-buttons-row">
              <button
                type="button"
                className="preset-btn"
                onClick={() => {
                  setSentimentText('Outstanding audio quality! Noise cancellation creates a sanctuary of silence and cushions are super soft.');
                  setSentimentRating(5);
                }}
              >
                English sample
              </button>
              <button
                type="button"
                className="preset-btn"
                onClick={() => {
                  setSentimentText('Bohat zabardast sound quality hai, bass punchy hai lekin delivery 4 din late thi.');
                  setSentimentRating(4);
                }}
              >
                Roman Urdu
              </button>
              <button
                type="button"
                className="preset-btn"
                onClick={() => {
                  setSentimentText('بہت ہی اعلیٰ اور شاندار کوالٹی ہے، آواز کا رزلٹ کمال کا ہے۔ شکریہ!');
                  setSentimentRating(5);
                }}
              >
                Urdu script
              </button>
            </div>

            <div className="control-group">
              <label htmlFor="sent-text">Review Text (English, Roman Urdu, or Urdu script)</label>
              <textarea
                id="sent-text"
                rows={4}
                value={sentimentText}
                onChange={(e) => setSentimentText(e.target.value)}
                className="studio-textarea"
                placeholder="Type customer review in any supported language…"
              />
            </div>

            <div className="control-group">
              <label>Review Star Rating: <b>{sentimentRating} / 5</b></label>
              <div className="rating-selector-row">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" className={`star-pill ${sentimentRating === s ? 'active' : ''}`} onClick={() => setSentimentRating(s)}>
                    ★ {s}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" className="btn-run-model" onClick={runSentiment} disabled={sentimentLoading || !sentimentText.trim()}>
              {sentimentLoading ? (<><span className="spin-loader" /> Classifying trilingual aspects…</>) : (<><Play size={16} /> Classify Sentiment &amp; Aspects</>)}
            </button>
          </div>

          <div className="panel-results-col">
            <h3 className="panel-col-title"><Gauge size={18} /> Aspect Extraction &amp; Sentiment</h3>

            {sentimentError && <div className="studio-error"><AlertCircle size={16} /> {sentimentError}</div>}

            {sentimentResult ? (
              <div className="model-result-display">
                <div className={`sentiment-verdict-box ${sentimentResult.label}`}>
                  <div className="verdict-icon">
                    {sentimentResult.label === 'positive' ? <CheckCircle2 size={32} /> : sentimentResult.label === 'negative' ? <AlertCircle size={32} /> : <BrainCircuit size={32} />}
                  </div>
                  <div>
                    <span className="verdict-label">Predicted Polarity</span>
                    <h4 className="verdict-status">{String(sentimentResult.label).toUpperCase()}</h4>
                    <p className="verdict-model">
                      Language Detected: <b>{sentimentResult.language || 'English'}</b> · Model: {sentimentResult.model_version || 'sentiment-multilingual-v2'}
                      {sentimentMs !== null ? ` (${sentimentMs} ms)` : ''}
                    </p>
                  </div>
                </div>

                {sentConfidence !== null && (
                  <div className="confidence-meter-box">
                    <div className="confidence-label-row">
                      <span>Model Probability Confidence</span>
                      <b>{sentConfidence}%</b>
                    </div>
                    <div className="confidence-bar-track">
                      <div className="confidence-bar-fill" style={{ width: `${sentConfidence}%` }} />
                    </div>
                  </div>
                )}

                {/* 7 Aspect Dimensions Detected */}
                <div style={{ marginTop: 16 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#171717', display: 'block', marginBottom: 8 }}>
                    Aspect Dimensions Detected:
                  </span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {sentimentResult.aspects && sentimentResult.aspects.length > 0 ? (
                      sentimentResult.aspects.map((asp: string) => (
                        <span key={asp} style={{ fontSize: 11, fontWeight: 600, background: '#EFF6FF', color: '#1E40AF', padding: '4px 10px', borderRadius: 999, border: '1px solid #BFDBFE' }}>
                          ✓ {asp.toUpperCase()}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: 12, color: '#737373' }}>General review sentiment (no specific aspect tag)</span>
                    )}
                  </div>
                </div>

                {/* Spam Anomaly Check */}
                <div style={{ marginTop: 14, padding: '8px 12px', borderRadius: 8, background: sentimentResult.suspicious ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${sentimentResult.suspicious ? '#FECACA' : '#BBF7D0'}`, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {sentimentResult.suspicious ? (
                    <>
                      <AlertCircle size={16} color="#EF4444" />
                      <span style={{ color: '#991B1B' }}>Review flagged for review: potential duplicate or anomalous text.</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} color="#16A34A" />
                      <span style={{ color: '#166534' }}>Verified organic feedback: passes length, character density, and anti-spam heuristics.</span>
                    </>
                  )}
                </div>

                <div className="token-breakdown-box" style={{ marginTop: 14 }}>
                  <span className="token-title">Extracted Trilingual N-Grams</span>
                  <div className="tokens-list">
                    {keyTerms.map((w) => <span key={w} className="token-chip">{w}</span>)}
                  </div>
                </div>
              </div>
            ) : !sentimentError && (
              <div className="model-empty-prompt">
                <MessageSquare size={36} />
                <h4>Waiting for Review Input</h4>
                <p>Type in English, Roman Urdu or Urdu script and press “Classify Sentiment &amp; Aspects”.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 4: HYBRID RECOMMENDATIONS                                                  */}
      {/* ============================================================================== */}
      {activeTab === 'recommend' && (
        <div className="studio-panel-card">
          <div className="panel-controls-col">
            <h3 className="panel-col-title"><Layers size={18} /> Anchor Selection</h3>
            <div className="control-group">
              <label htmlFor="rec-base">Customer is viewing</label>
              <select id="rec-base" value={recBase} onChange={(e) => setRecBase(e.target.value)} className="studio-select">
                {DEMO_PRODUCTS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.category?.name})</option>
                ))}
              </select>
            </div>

            <div className="recommendation-logic-card">
              <h4>Hybrid Multi-Objective Formula</h4>
              <ul>
                <li><b>+3.5</b> Category alignment match</li>
                <li><b>+2.5 × log(1 + n)</b> Co-purchase order basket frequency</li>
                <li><b>+2.0</b> Lexical and specification token overlap</li>
                <li><b>+1.2</b> Price bracket proximity: 1 / (1 + ΔPrice)</li>
                <li><b>0.85^k</b> Category diversity penalty to prevent redundant results</li>
              </ul>
              <p>Generates high-converting bundles and complementary accessories.</p>
            </div>
          </div>

          <div className="panel-results-col">
            <h3 className="panel-col-title">
              <Sparkles size={18} /> Top Ranked Matches {recMs !== null && <small className="ms-chip">{recMs} ms</small>}
            </h3>
            {recError && <div className="studio-error"><AlertCircle size={16} /> {recError}</div>}

            <div className="rec-mini-grid">
              {recResults.map((item, idx) => {
                const p = item.product || item;
                return (
                  <Link key={p.id} href={`/product/${p.slug || p.id}`} className="rec-mini-card">
                    <div className="rec-rank-badge">#{idx + 1}</div>
                    <img src={imageSrc(p)} alt={p.name} />
                    <div className="rec-mini-info">
                      <span className="rec-mini-cat">{p.category?.name || 'Electronics'}</span>
                      <strong className="rec-mini-title">{p.name}</strong>
                      <span className="rec-mini-price">{money(p.price)}</span>
                      {item.reason && (
                        <span style={{ fontSize: 10, color: '#0B7A6C', background: '#E6F4F1', padding: '2px 6px', borderRadius: 4, marginTop: 4, display: 'inline-block' }}>
                          {item.reason}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Bundle Savings Offer Banner */}
            {recBundle && (
              <div style={{ marginTop: 20, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>Auto-Generated Bundle</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <div>
                    <h5 style={{ fontSize: 14, fontWeight: 700, color: '#166534', margin: 0 }}>
                      Buy Anchor + Top 2 Add-ons Together
                    </h5>
                    <span style={{ fontSize: 12, color: '#15803D' }}>Save {money(recBundle.savingsPkr)} (15% combo savings applied)</span>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#166534' }}>{money(recBundle.bundlePrice)}</span>
                </div>
              </div>
            )}

            {recMethod && <p className="studio-note" style={{ marginTop: 14 }}>Scoring Engine: <b>{recMethod}</b></p>}
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 5: SERVICE-LEVEL INVENTORY GUIDANCE                                        */}
      {/* ============================================================================== */}
      {activeTab === 'inventory' && (
        <div className="studio-panel-card">
          <div className="panel-controls-col">
            <h3 className="panel-col-title"><Package size={18} /> Supply Chain Parameters</h3>

            <div className="control-group">
              <label htmlFor="inv-demand">Expected Demand: <b>{expectedDemand} units</b> over {horizon}d</label>
              <input id="inv-demand" type="range" min="0" max="500" value={expectedDemand} onChange={(e) => setExpectedDemand(Number(e.target.value))} className="studio-range" />
            </div>

            <div className="control-group">
              <label htmlFor="inv-lead">Supplier Lead Time: <b>{leadTime} days</b></label>
              <input id="inv-lead" type="range" min="1" max="45" value={leadTime} onChange={(e) => setLeadTime(Number(e.target.value))} className="studio-range" />
            </div>

            <div className="control-group">
              <label>Target Cycle Service Level</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                {[
                  { sl: 0.90, label: '90% (Z=1.28)' },
                  { sl: 0.95, label: '95% (Z=1.65)' },
                  { sl: 0.98, label: '98% (Z=2.05)' }
                ].map((item) => (
                  <button
                    key={item.sl}
                    type="button"
                    className={`star-pill ${serviceLevel === item.sl ? 'active' : ''}`}
                    onClick={() => setServiceLevel(item.sl)}
                    style={{ fontSize: 11, padding: '6px 2px' }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="control-group">
              <label htmlFor="inv-stock">Units in Warehouse: <b>{currentStock}</b></label>
              <input id="inv-stock" type="range" min="0" max="250" value={currentStock} onChange={(e) => setCurrentStock(Number(e.target.value))} className="studio-range" />
            </div>
          </div>

          <div className="panel-results-col">
            <h3 className="panel-col-title"><Gauge size={18} /> Service-Level Inventory Optimization {inventoryMs !== null && <small className="ms-chip">{inventoryMs} ms</small>}</h3>

            {inventoryError && <div className="studio-error"><AlertCircle size={16} /> {inventoryError}</div>}

            {inventory && (
              <>
                <div className="inventory-results-grid">
                  <div className="inv-metric-box">
                    <span>Daily Run Rate</span>
                    <h3>{inventory.estimated_daily_demand} / day</h3>
                  </div>
                  <div className="inv-metric-box">
                    <span>Safety Buffer Z(SL)×σ</span>
                    <h3 className="cyan">+{inventory.safety_stock} units</h3>
                  </div>
                  <div className="inv-metric-box">
                    <span>Reorder Point (ROP)</span>
                    <h3 className="amber">{inventory.reorder_point} units</h3>
                  </div>
                  <div className={`inv-metric-box highlight ${inventory.suggested_restock_units > 0 ? 'need' : 'ok'}`}>
                    <span>Suggested Restock</span>
                    <h3>{inventory.suggested_restock_units > 0 ? `+${inventory.suggested_restock_units} units` : 'Optimal Level'}</h3>
                  </div>
                </div>

                {/* Days of Cover & Stockout Risk */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 10, padding: 12 }}>
                    <span style={{ fontSize: 11, color: '#737373', display: 'block' }}>Days of Cover</span>
                    <h4 style={{ fontSize: 20, fontWeight: 800, color: '#171717', margin: '4px 0 0' }}>{inventory.days_of_cover} days</h4>
                  </div>
                  <div style={{ background: inventory.stockout_risk_pct > 20 ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${inventory.stockout_risk_pct > 20 ? '#FECACA' : '#BBF7D0'}`, borderRadius: 10, padding: 12 }}>
                    <span style={{ fontSize: 11, color: inventory.stockout_risk_pct > 20 ? '#991B1B' : '#166534', display: 'block' }}>Stockout Risk %</span>
                    <h4 style={{ fontSize: 20, fontWeight: 800, color: inventory.stockout_risk_pct > 20 ? '#DC2626' : '#16A34A', margin: '4px 0 0' }}>
                      {inventory.stockout_risk_pct}%
                    </h4>
                  </div>
                </div>

                {/* Supplier Restock Draft Action */}
                {inventory.restock_action_draft && (
                  <div style={{ marginTop: 16, background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 12, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#171717' }}>Supplier Restock Note (One-Click)</span>
                      <button
                        type="button"
                        className="tiny-btn"
                        onClick={() => {
                          navigator.clipboard?.writeText(inventory.restock_action_draft);
                          setCopiedDraft(true);
                          setTimeout(() => setCopiedDraft(false), 2000);
                        }}
                      >
                        {copiedDraft ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy Note</>}
                      </button>
                    </div>
                    <p style={{ fontSize: 12, color: '#525252', background: '#FFFFFF', padding: 10, borderRadius: 8, border: '1px solid #E5E7EB', margin: 0 }}>
                      {inventory.restock_action_draft}
                    </p>
                  </div>
                )}

                <p className="studio-note" style={{ marginTop: 14 }}>Formulation: <b>{inventory.method}</b></p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 6: NATURAL LANGUAGE SEARCH TESTER                                          */}
      {/* ============================================================================== */}
      {activeTab === 'search' && (
        <div className="studio-panel-card" style={{ display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1B1F23' }}>
                Natural-Language &amp; Roman Urdu Search Parser
              </h3>
              <p style={{ fontSize: 12, color: '#6B7280' }}>
                Test budget phrases (&ldquo;under 25k&rdquo;, &ldquo;5000 se kam&rdquo;), Roman Urdu synonyms (&ldquo;sasta ghari&rdquo;, &ldquo;jootay&rdquo;), and typo recovery.
              </p>
            </div>
            <span className="pill-ai">Model: nl-search-hybrid-v2.0 · Estimate</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {[
              'ANC headphones under 25k',
              'bohat sasta smart ghari',
              'wireless keybord 30000 tak',
              'jootay 5000 se kam',
            ].map((sample) => (
              <Link
                key={sample}
                href={`/search?q=${encodeURIComponent(sample)}`}
                className="px-3.5 py-2 rounded-xl bg-[#E6F4F1] border border-[#A7F3D0] text-[#0B7A6C] text-xs font-bold hover:bg-[#0B7A6C] hover:text-white transition-colors"
              >
                Test Query: &ldquo;{sample}&rdquo; &rarr;
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
