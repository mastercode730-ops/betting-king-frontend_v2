'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

const FLOAT_ANIMS  = ['float-a', 'float-b', 'float-c'];
const FLOAT_DURS   = [4.2, 5.1, 6.4, 7.8, 5.6, 4.8, 6.9, 3.8, 7.2, 5.3];
const FLOAT_DELAYS = [0, 0.8, 1.6, 2.4, 0.4, 1.2, 2.0, 0.6, 1.8, 2.8];
const FLOAT_AMPS   = [10, 14, 18, 12, 16, 11, 15, 13, 17, 9];
const MONTH_NAMES  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const REFRESH_MS   = 15_000;

export default function HomePage() {
  const [games, setGames]           = useState([]);
  const [todayDate, setTodayDate]   = useState('');
  const [yesterdayDate, setYDate]   = useState('');
  const [searchQ, setSearchQ]       = useState('');
  const [clock, setClock]           = useState('');
  const [chartData, setChartData]   = useState(null);
  const [chartMonth, setChartMonth] = useState(() => String(new Date().getMonth() + 1).padStart(2,'0'));
  const [chartYear, setChartYear]   = useState(() => String(new Date().getFullYear()));
  const prevNums = useRef({});

  // Clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ' IST');
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch today results
  const loadResults = useCallback(async () => {
    try {
      const res = await fetch('/api/results/today');
      const json = await res.json();
      if (!json.success) return;
      setGames(json.data);
      setTodayDate(json.today_date);
      setYDate(json.yesterday_date);
    } catch (e) {
      console.warn('[SK] API error:', e.message);
    }
  }, []);

  useEffect(() => {
    loadResults();
    const id = setInterval(loadResults, REFRESH_MS);
    return () => clearInterval(id);
  }, [loadResults]);

  // Load chart
  const loadChart = useCallback(async (month, year) => {
    try {
      const res = await fetch(`/api/chart/monthly?month=${month}&year=${year}`);
      const json = await res.json();
      if (json.success) setChartData(json);
    } catch (e) {
      console.warn('[SK] Chart error:', e.message);
    }
  }, []);

  useEffect(() => { loadChart(chartMonth, chartYear); }, [loadChart, chartMonth, chartYear]);

  const filtered = searchQ
    ? games.filter(g => g.name.toLowerCase().includes(searchQ.toLowerCase()) || g.code.toLowerCase().includes(searchQ.toLowerCase()))
    : games;

  const heroes = games.filter(g => g.is_highlight && g.is_main).slice(0, 4);

  const fmt = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' });
  };

  const categories = [
    { key: 'LIVE', label: '🔴 LIVE — RECENT DRAWS',  cls: '' },
    { key: 'NEXT', label: '⏳ UPCOMING DRAWS',        cls: 'cat-next' },
    { key: 'REST', label: '✓  COMPLETED DRAWS',       cls: 'cat-rest' },
  ];

  // Chart navigation
  const goToMonth = (month, year) => {
    setChartMonth(month);
    setChartYear(year);
  };

  const mIdx = parseInt(chartMonth, 10) - 1;
  const prevMIdx = mIdx === 0 ? 11 : mIdx - 1;
  const prevYear = mIdx === 0 ? parseInt(chartYear) - 1 : parseInt(chartYear);
  const nextMIdx = mIdx === 11 ? 0 : mIdx + 1;
  const nextYear = mIdx === 11 ? parseInt(chartYear) + 1 : parseInt(chartYear);
  const todayDay = todayDate ? todayDate.split('-')[2] : '';

  return (
    <div id="wrapper">
      <div className="scanlines" aria-hidden="true" />

      {/* ── HEADER ── */}
      <header id="header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon" aria-hidden="true">♚</div>
            <div>
              <div className="brand-name">SATTA KING PRO</div>
              <div className="brand-sub">PROFESSIONAL LIVE RESULTS &amp; CHARTS</div>
            </div>
          </div>
          <div className="header-search">
            <input
              type="text"
              id="game-search-input"
              placeholder="Search game…"
              autoComplete="off"
              aria-label="Search games"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
            />
          </div>
          <div className="header-live-badge">
            <span className="live-dot" />
            LIVE&nbsp;·&nbsp;<time id="live-timestamp">{clock}</time>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main id="container">

        <div className="seo-strip" role="note">
          <h1 style={{ fontSize: 'inherit', fontWeight: 400, display: 'inline' }}>
            Satta King Pro — Daily Superfast Result 2026. Live Leak Numbers for Gali, Desawar, Ghaziabad &amp; Faridabad with Complete Monthly Chart Archive.
          </h1>
        </div>

        <div className="disclaimer-banner" role="note">
          <span className="disc-badge">DISCLAIMER</span>
          <span>Informational portal only — non-transactional. Users must comply with applicable local laws.</span>
        </div>

        {/* HERO GRID */}
        <div className="section-head">
          <span className="section-title">◉ LIVE DRAWS</span>
          <span className="section-meta">Real-time · Updates every 15s</span>
        </div>

        <div className="live-hero-section">
          <div className="live-hero-grid" id="hero-grid">
            {heroes.map((g, i) => {
              const isPending = g.today_number === 'XX' || g.today_number === '--';
              return (
                <div
                  key={g.code}
                  className="hero-card"
                  id={`hero-${g.code}`}
                  style={{
                    '--float-dur': `${FLOAT_DURS[i % FLOAT_DURS.length]}s`,
                    '--float-delay': `-${FLOAT_DELAYS[i % FLOAT_DELAYS.length]}s`,
                    '--float-amp': `${FLOAT_AMPS[i % FLOAT_AMPS.length]}px`,
                    animationName: FLOAT_ANIMS[i % FLOAT_ANIMS.length],
                  }}
                >
                  <div className="hero-game-name">{g.name}</div>
                  <span className={`hero-number ${isPending ? 'pending-hero' : ''}`}>
                    {isPending ? '??' : g.today_number}
                  </span>
                  <div className="hero-meta">
                    <span className="hero-time">DRAW: {g.draw_time}</span>
                    {isPending
                      ? <span className="hero-badge" style={{ background: 'rgba(255,230,0,0.15)', color: 'var(--neon-yellow)', border: '1px solid rgba(255,230,0,0.3)' }}>AWAITING</span>
                      : <span className="hero-badge">RESULT</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ALL RESULTS BOARD */}
        <div className="section-head" style={{ marginTop: 40 }}>
          <span className="section-title">▦ ALL REGIONS</span>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginLeft: 'auto' }}>
            <span className="section-meta" id="yesterday-label">↩ {fmt(yesterdayDate)}</span>
            <span className="section-meta" style={{ color: 'var(--neon-pink)' }} id="today-label">⬤ {fmt(todayDate)} (TODAY)</span>
          </div>
        </div>

        <div id="quick-board-container">
          {categories.map(cat => {
            const catGames = filtered.filter(g => g.category === cat.key);
            if (!catGames.length) return null;
            return (
              <div key={cat.key}>
                <div className={`cat-label ${cat.cls}`}>
                  <span className="cat-label-text">{cat.label}</span>
                </div>
                <div className="results-grid">
                  {catGames.map((g, idx) => {
                    const isPending  = g.today_number === 'XX' || g.today_number === '--';
                    const todayCls   = isPending ? 'pending' : `today${g.is_highlight ? ' is-highlight-num' : ''}`;
                    const isHighlight = g.is_highlight ? 'highlight' : '';
                    const catCard    = cat.key === 'NEXT' ? 'cat-next-card' : cat.key === 'REST' ? 'cat-rest-card' : '';
                    const dur        = FLOAT_DURS[idx % FLOAT_DURS.length];
                    const delay      = FLOAT_DELAYS[idx % FLOAT_DELAYS.length];
                    const amp        = FLOAT_AMPS[idx % FLOAT_AMPS.length];
                    const anim       = FLOAT_ANIMS[idx % FLOAT_ANIMS.length];
                    const chartHref  = `/${g.slug || g.code.toLowerCase()}/satta-result-chart/${g.code.toLowerCase()}/`;

                    return (
                      <div
                        key={g.code}
                        className={`game-card ${isHighlight} ${catCard}`}
                        id={`card-${g.code}`}
                        style={{
                          '--float-dur': `${dur}s`,
                          '--float-delay': `-${delay}s`,
                          '--float-amp': `${amp}px`,
                          animationName: anim,
                        }}
                      >
                        <div className="game-info">
                          <div className="game-title">{g.name}</div>
                          <div className="game-time">⏰ {g.draw_time}</div>
                          <Link href={chartHref} className="chart-link" id={`chart-link-${g.code}`}>
                            ◈ RECORD CHART →
                          </Link>
                        </div>
                        <div className="numbers-wrapper">
                          <div className="num-box">
                            <span className="num-label">YEST</span>
                            <span className="num-badge yesterday">{g.yesterday_number}</span>
                          </div>
                          <div className="num-box">
                            <span className="num-label">TODAY</span>
                            <span className={`num-badge ${todayCls}`} id={`num-${g.code}`}>
                              {g.today_number}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* MONTHLY CHART */}
        <div className="section-head" style={{ marginTop: 48 }}>
          <span className="section-title" id="chart-title">
            📊 {chartData ? `${MONTH_NAMES[parseInt(chartData.month,10)-1].toUpperCase()} ${chartData.year}` : 'CHART'}
          </span>
          <span className="section-meta" id="chart-subtitle">
            {chartData ? `${chartData.days_in_month} days · Combined chart` : 'Monthly result archive'}
          </span>
        </div>

        <div className="chart-wrapper">
          <table className="brutalist-table" id="monthly-table" aria-label="Monthly result chart">
            <thead>
              <tr>
                <th style={{ width: 60 }}>DAY</th>
                <th>DSWR</th>
                <th>FRBD</th>
                <th>GZBD</th>
                <th>GALI</th>
              </tr>
            </thead>
            <tbody id="mix-chart-tbody">
              {chartData?.rows?.map(r => {
                const isToday = r.day === todayDay;
                const cell = (val) => {
                  const hasNum  = val && val !== 'XX' && val !== '--';
                  return `${hasNum ? 'has-num' : ''} ${isToday ? 'today-row' : ''}`;
                };
                return (
                  <tr key={r.day}>
                    <td className="day-col">{r.day}</td>
                    <td className={`num-col ${cell(r.DS)}`}>{r.DS}</td>
                    <td className={`num-col ${cell(r.FB)}`}>{r.FB}</td>
                    <td className={`num-col ${cell(r.GB)}`}>{r.GB}</td>
                    <td className={`num-col ${cell(r.GL)}`}>{r.GL}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="month-nav">
            <button
              className="nav-btn"
              id="prev-month-link"
              onClick={() => goToMonth(String(prevMIdx + 1).padStart(2,'0'), String(prevYear))}
            >
              ← {MONTH_NAMES[prevMIdx]?.substring(0,3)} {prevYear}
            </button>
            <span style={{ fontFamily: 'var(--text-mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: 2 }} id="nav-current-month">
              {chartData ? `${MONTH_NAMES[mIdx]?.substring(0,3).toUpperCase()} ${chartData.year}` : ''}
            </span>
            <button
              className="nav-btn"
              id="next-month-link"
              onClick={() => goToMonth(String(nextMIdx + 1).padStart(2,'0'), String(nextYear))}
            >
              {MONTH_NAMES[nextMIdx]?.substring(0,3)} {nextYear} →
            </button>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer id="footer">
        <div className="form-card">
          <h3>Browse Archive — Select Month &amp; Year</h3>
          <div className="form-inline">
            <select
              id="month"
              aria-label="Select month"
              value={chartMonth}
              onChange={e => setChartMonth(e.target.value)}
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={String(i+1).padStart(2,'0')}>{m}</option>
              ))}
            </select>
            <select
              id="year"
              aria-label="Select year"
              value={chartYear}
              onChange={e => setChartYear(e.target.value)}
            >
              {[2026,2025,2024,2023,2022].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </footer>

      {/* FAB */}
      <div className="floating-bar">
        <button className="btn-fab fab-refresh" id="btn-refresh" onClick={() => window.location.reload()}>
          ↺ REFRESH
        </button>
      </div>
    </div>
  );
}
