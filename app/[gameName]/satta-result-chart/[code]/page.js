'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const FLOAT_ANIMS  = ['float-a','float-b','float-c'];
const FLOAT_DURS   = [4.2,5.1,6.4,7.8,5.6,4.8,6.9,3.8,7.2,5.3];
const FLOAT_DELAYS = [0,0.8,1.6,2.4,0.4,1.2,2.0,0.6,1.8,2.8];
const FLOAT_AMPS   = [10,14,18,12,16,11,15,13,17,9];

export default function GameChartPage() {
  const params = useParams();
  const gameCode = params.code?.toUpperCase();

  const currentYear = new Date().getFullYear();
  const [year, setYear]           = useState(String(currentYear));
  const [gameData, setGameData]   = useState(null);
  const [monthlyData, setMonthly] = useState(null);
  const [todayResults, setToday]  = useState([]);
  const [todayDate, setTDate]     = useState('');
  const [yesterdayDate, setYDate] = useState('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // Fetch chart data for this game + year
  const loadGameChart = useCallback(async (yr) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/chart/game/${gameCode}?year=${yr}`);
      const json = await res.json();
      if (!json.success) { setError('Game not found'); return; }
      setGameData(json.game);
      setMonthly(json.monthly_data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [gameCode]);

  // Fetch today's live results board (all games for this page)
  const loadToday = useCallback(async () => {
    try {
      const res = await fetch('/api/results/today');
      const json = await res.json();
      if (json.success) {
        setToday(json.data);
        setTDate(json.today_date);
        setYDate(json.yesterday_date);
      }
    } catch (e) {
      console.warn('[SK] today results error:', e.message);
    }
  }, []);

  useEffect(() => { loadGameChart(year); }, [loadGameChart, year]);
  useEffect(() => { loadToday(); const id = setInterval(loadToday, 15000); return () => clearInterval(id); }, [loadToday]);

  const fmt = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' });
  };

  const years = [2026, 2025, 2024, 2023, 2022];

  // Categories for the live board
  const categories = [
    { key: 'LIVE', label: '🔴 LIVE', cls: '' },
    { key: 'NEXT', label: '⏳ NEXT', cls: 'cat-next' },
    { key: 'REST', label: '✓ DONE', cls: 'cat-rest' },
  ];

  // Get today + yesterday's result for this specific game
  const thisGame = todayResults.find(g => g.code === gameCode);

  if (error) {
    return (
      <div id="wrapper" style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--text-mono)', color: 'var(--neon-pink)' }}>
        <div className="scanlines" aria-hidden="true" />
        <h1 style={{ fontFamily: 'var(--font-hero)', fontSize: 48, color: 'var(--neon-pink)', letterSpacing: 4 }}>
          GAME NOT FOUND
        </h1>
        <p style={{ color: 'var(--text-dim)', marginTop: 16 }}>Code: {gameCode}</p>
        <Link href="/" className="back-link" style={{ marginTop: 24, display: 'inline-flex' }}>
          ← BACK TO HOME
        </Link>
      </div>
    );
  }

  return (
    <div id="wrapper">
      <div className="scanlines" aria-hidden="true" />

      {/* ── HEADER ── */}
      <header id="header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon" aria-hidden="true">♚</div>
            <div>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <div className="brand-name">SATTA KING PRO</div>
                <div className="brand-sub">PROFESSIONAL LIVE RESULTS &amp; CHARTS</div>
              </Link>
            </div>
          </div>
          <div className="header-live-badge">
            <span className="live-dot" />
            <time>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
          </div>
        </div>
      </header>

      <main id="container">

        {/* Back button */}
        <Link href="/" className="back-link" id="back-to-home">
          ← BACK TO HOME
        </Link>

        {/* ── CHART PAGE HEADER ── */}
        <div className="chart-page-header">
          {loading ? (
            <>
              <h1 style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-hero)', fontSize: 36, letterSpacing: 3 }}>
                LOADING...
              </h1>
              <p>Fetching {gameCode} chart data…</p>
            </>
          ) : (
            <>
              <h1 id="chart-page-title">
                {gameData?.name} Satta Result Chart {year}
              </h1>
              <p id="chart-page-subtitle">
                Draw Time: {gameData?.draw_time} &nbsp;|&nbsp; Annual Record Chart {year} &nbsp;|&nbsp; Code: {gameCode}
              </p>
            </>
          )}
        </div>

        {/* ── HIGHLIGHTED: This game's today result ── */}
        {thisGame && (
          <div
            className="game-card highlight"
            style={{
              marginBottom: 24,
              '--float-dur': '5s',
              '--float-delay': '0s',
              '--float-amp': '8px',
              animationName: 'float-a',
              borderColor: 'rgba(0,255,136,0.4)',
            }}
            id={`featured-card-${gameCode}`}
          >
            <div className="game-info">
              <div className="game-title" style={{ fontSize: 16 }}>{thisGame.name} — TODAY&apos;S RESULT</div>
              <div className="game-time">⏰ {thisGame.draw_time}</div>
            </div>
            <div className="numbers-wrapper">
              <div className="num-box">
                <span className="num-label">YEST {fmt(yesterdayDate)}</span>
                <span className="num-badge yesterday" style={{ width: 64, height: 58, fontSize: 30 }}>
                  {thisGame.yesterday_number}
                </span>
              </div>
              <div className="num-box">
                <span className="num-label">TODAY {fmt(todayDate)}</span>
                <span
                  className={`num-badge ${thisGame.today_number === 'XX' || thisGame.today_number === '--' ? 'pending' : 'today is-highlight-num'}`}
                  style={{ width: 64, height: 58, fontSize: 30 }}
                  id={`featured-num-${gameCode}`}
                >
                  {thisGame.today_number}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── YEAR SELECTOR ── */}
        <div className="year-nav" id="year-nav">
          {years.map(y => (
            <button
              key={y}
              className={`year-btn ${year === String(y) ? 'active' : ''}`}
              onClick={() => setYear(String(y))}
              id={`year-btn-${y}`}
            >
              {y}
            </button>
          ))}
        </div>

        {/* ── ANNUAL CHART TABLE ── */}
        <div className="section-head">
          <span className="section-title">📊 {gameData?.name || gameCode} — {year}</span>
          <span className="section-meta">Annual result record</span>
        </div>

        <div className="annual-chart-wrapper" id="annual-chart-wrapper">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--text-mono)', color: 'var(--text-dim)' }}>
              [ LOADING CHART DATA... ]
            </div>
          ) : (
            <table className="annual-table" id="annual-chart-table" aria-label={`${gameData?.name} annual result chart ${year}`}>
              <thead>
                <tr>
                  <th className="day-head">DATE</th>
                  {MONTH_SHORT.map(m => <th key={m}>{m}</th>)}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 31 }, (_, i) => {
                  const dPad = String(i + 1).padStart(2, '0');
                  return (
                    <tr key={dPad}>
                      <td className="day-col">{dPad}</td>
                      {Array.from({ length: 12 }, (_, m) => {
                        const mPad = String(m + 1).padStart(2, '0');
                        const num = monthlyData?.[mPad]?.[dPad] || 'XX';
                        const hasNum = num && num !== 'XX' && num !== '--';
                        return (
                          <td key={mPad} className={`num-cell ${hasNum ? 'has-num' : ''}`}>
                            {num}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── COMBINED MONTHLY RESULTS BOARD ── */}
        <div className="section-head" style={{ marginTop: 40 }}>
          <span className="section-title">▦ ALL REGIONAL RESULTS</span>
          <div style={{ display: 'flex', gap: 16, marginLeft: 'auto' }}>
            <span className="section-meta">↩ {fmt(yesterdayDate)}</span>
            <span className="section-meta" style={{ color: 'var(--neon-pink)' }}>⬤ {fmt(todayDate)} (TODAY)</span>
          </div>
        </div>

        <div id="results-board">
          {categories.map(cat => {
            const catGames = todayResults.filter(g => g.category === cat.key);
            if (!catGames.length) return null;
            return (
              <div key={cat.key}>
                <div className={`cat-label ${cat.cls}`}>
                  <span className="cat-label-text">{cat.label}</span>
                </div>
                <div className="results-grid">
                  {catGames.map((g, idx) => {
                    const isPending   = g.today_number === 'XX' || g.today_number === '--';
                    const todayCls    = isPending ? 'pending' : `today${g.is_highlight ? ' is-highlight-num' : ''}`;
                    const isHighlight = g.is_highlight ? 'highlight' : '';
                    const catCard     = cat.key === 'NEXT' ? 'cat-next-card' : cat.key === 'REST' ? 'cat-rest-card' : '';
                    const dur         = FLOAT_DURS[idx % FLOAT_DURS.length];
                    const delay       = FLOAT_DELAYS[idx % FLOAT_DELAYS.length];
                    const amp         = FLOAT_AMPS[idx % FLOAT_AMPS.length];
                    const anim        = FLOAT_ANIMS[idx % FLOAT_ANIMS.length];
                    const chartHref   = `/${g.slug || g.code.toLowerCase()}/satta-result-chart/${g.code.toLowerCase()}/`;

                    return (
                      <div
                        key={g.code}
                        className={`game-card ${isHighlight} ${catCard} ${g.code === gameCode ? 'highlight' : ''}`}
                        id={`board-card-${g.code}`}
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
                          <Link href={chartHref} className="chart-link" id={`board-chart-link-${g.code}`}>
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
                            <span className={`num-badge ${todayCls}`} id={`board-num-${g.code}`}>
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
      </main>

      {/* FAB */}
      <div className="floating-bar">
        <button className="btn-fab fab-refresh" id="btn-refresh" onClick={() => window.location.reload()}>
          ↺ REFRESH
        </button>
      </div>
    </div>
  );
}
