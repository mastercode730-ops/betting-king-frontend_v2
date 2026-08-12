'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { WHATSAPP_URL, WHATSAPP_NUMBER } from '../../../../lib/constants';

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function GameChartPage() {
  const params = useParams();
  const gameCode = params.code?.toUpperCase() || 'FB';

  const currentYear = new Date().getFullYear();
  const [year, setYear]           = useState(String(currentYear));
  const [gameData, setGameData]   = useState(null);
  const [monthlyData, setMonthly] = useState({});
  const [todayResults, setToday]  = useState([]);
  const [todayDate, setTDate]     = useState('');
  const [yesterdayDate, setYDate] = useState('');
  const [loading, setLoading]     = useState(true);

  const loadGameChart = useCallback(async (yr) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/chart/game/${gameCode}?year=${yr}`);
      const json = await res.json();
      if (json.success && json.monthly_data) {
        setGameData(json.game || { name: gameCode, code: gameCode });
        setMonthly(json.monthly_data);
      }
    } catch (e) {
      console.warn('[SK] Failed to fetch game chart:', e.message);
    } finally {
      setLoading(false);
    }
  }, [gameCode]);

  const loadToday = useCallback(async () => {
    try {
      const res = await fetch('/api/results/today');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setToday(json.data);
        if (json.today_date) setTDate(json.today_date);
        if (json.yesterday_date) setYDate(json.yesterday_date);
      }
    } catch (e) {
      console.warn('[SK] Failed to fetch today results:', e.message);
    }
  }, []);

  useEffect(() => { loadGameChart(year); }, [loadGameChart, year]);
  useEffect(() => { loadToday(); const id = setInterval(loadToday, 15000); return () => clearInterval(id); }, [loadToday]);

  const years = [2026, 2025, 2024, 2023, 2022];
  const thisGame = todayResults.find(g => g.code === gameCode) || gameData;

  const SpinnerIcon = () => (
    <span className="wait-spinner" title="लाइव रिजल्ट का इंतज़ार">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="12" cy="12" r="9.5" />
        <line className="clock-hand" x1="12" y1="12" x2="12" y2="6.5" />
      </svg>
    </span>
  );

  return (
    <div id="wrapper">
      <div className="sheet">
        <header className="masthead">
          <div className="kicker">दैनिक सट्टा समाचार &bull; विशेष वार्षिक अंक</div>
          <h1>{gameData?.name || gameCode} रिकॉर्ड चार्ट {year}</h1>
          <div className="dateline">
            <span className="dateline-item">समय: {gameData?.draw_time || '—'}</span>
            <span className="dateline-sep">&bull;</span>
            <span className="dateline-item">कोड: {gameCode}</span>
            <span className="dateline-sep">&bull;</span>
            <span className="dateline-item">वार्षिक अंक: {year}</span>
          </div>
        </header>

        <nav className="paper-nav">
          <div className="paper-nav-links">
            <Link href="/" className="on">← मुख्य पृष्ठ</Link>
            <a href="#annual-chart">वार्षिक चार्ट</a>
            <a href="#all-results">अन्य परिणाम</a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--wa)', fontWeight: 800 }}>
              💬 WhatsApp बुकिंग
            </a>
          </div>
        </nav>

        {/* WHATSAPP BANNER */}
        <div className="wa-paper-banner" style={{ marginTop: 16 }}>
          <div>
            <div className="wa-paper-title">👑 {gameData?.name || gameCode} लीक जोड़ी WhatsApp पर पाएं</div>
            <div className="wa-paper-sub">सीधा खाईवाल से संपर्क &bull; WhatsApp: {WHATSAPP_NUMBER}</div>
          </div>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-wa-paper">
            📲 WhatsApp चैट
          </a>
        </div>

        {/* FEATURED: THIS GAME TODAY RESULT */}
        {thisGame && (
          <div className="figure" style={{ marginTop: 18 }}>
            <span className="big">
              {!thisGame.today_number || thisGame.today_number === 'XX' || thisGame.today_number === '--' ? <SpinnerIcon /> : thisGame.today_number}
            </span>
            <div className="meta-group">
              <div className="meta">
                <span>आज का नंबर (TODAY)</span>
                <b>{thisGame.today_number || '—'}</b>
              </div>
              <div className="meta">
                <span>कल का नंबर (YEST)</span>
                <b>{thisGame.yesterday_number || '—'}</b>
              </div>
              <div className="meta">
                <span>रिजल्ट समय</span>
                <b>{thisGame.draw_time || '—'}</b>
              </div>
            </div>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-wa-paper" style={{ marginLeft: 'auto' }}>
              💬 खाईवाल बुकिंग
            </a>
          </div>
        )}

        {/* YEAR NAV */}
        <div className="archive-nav" style={{ margin: '20px 0' }}>
          {years.map(y => (
            <button
              key={y}
              className={`archive-btn ${year === String(y) ? 'active' : ''}`}
              onClick={() => setYear(String(y))}
            >
              {y} चार्ट
            </button>
          ))}
        </div>

        {/* ANNUAL LEDGER TABLE */}
        <section className="sec" id="annual-chart">
          <div className="sec-h">
            <h3>{gameData?.name || gameCode} &mdash; वार्षिक परिणाम तालिका {year}</h3>
            <span className="rule" />
          </div>

          <div className="scroll-hint">👈 बाएँ-दाएँ स्क्रॉल करें (12 महीने) 👉</div>
          <div className="tbl-wrap">
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--dim)' }}>
                <SpinnerIcon /> [ डेटा लोड हो रहा है... ]
              </div>
            ) : (
              <table className="archive-ledger sticky-col" aria-label="Annual Game Chart" style={{ minWidth: 640 }}>
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>तारीख</th>
                    {MONTH_SHORT.map(m => <th key={m}>{m}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 31 }, (_, i) => {
                    const dPad = String(i + 1).padStart(2, '0');
                    return (
                      <tr key={dPad}>
                        <td><b>{dPad}</b></td>
                        {Array.from({ length: 12 }, (_, m) => {
                          const mPad = String(m + 1).padStart(2, '0');
                          const num = monthlyData?.[mPad]?.[dPad];
                          const hasNum = num && num !== 'XX' && num !== '--';
                          return (
                            <td key={mPad} className={hasNum ? 'has-num' : ''}>
                              {num === 'XX' ? <SpinnerIcon /> : (num || '—')}
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
        </section>

        {/* ALL OTHER RESULTS */}
        <section className="sec" id="all-results">
          <div className="sec-h">
            <h3>अन्य सभी गेम का आज का परिणाम</h3>
            <span className="rule" />
          </div>

          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>सट्टा का नाम</th>
                  <th style={{ textAlign: 'center' }}>कल आया था</th>
                  <th style={{ textAlign: 'center' }}>आज का रिजल्ट</th>
                  <th style={{ textAlign: 'right' }}>रिकॉर्ड</th>
                </tr>
              </thead>
              <tbody>
                {todayResults.map((g) => {
                  const isPending = !g.today_number || g.today_number === 'XX' || g.today_number === '--';
                  const chartHref = `/${g.slug || g.code.toLowerCase()}/satta-result-chart/${g.code.toLowerCase()}/`;

                  return (
                    <tr key={g.code}>
                      <td>
                        <div className="g-name">{g.name}</div>
                        <div className="g-time">⏰ {g.draw_time}</div>
                      </td>
                      <td className="n">{g.yesterday_number || '—'}</td>
                      <td className={`n ${isPending ? 'pending' : 'today'}`}>
                        {isPending ? <SpinnerIcon /> : g.today_number}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link href={chartHref} className="link-cta">
                          चार्ट देखें →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* FLOATING WHATSAPP BUTTON */}
      <div className="floating-wa">
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="paper-fab-wa">
          💬 WhatsApp
        </a>
      </div>

      <div className="floating-bar">
        <button className="paper-fab" onClick={() => window.location.reload()}>
          ↻ ताज़ा करें
        </button>
      </div>
    </div>
  );
}
