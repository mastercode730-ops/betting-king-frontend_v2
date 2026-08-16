'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { WHATSAPP_URL, WHATSAPP_NUMBER } from '../lib/constants';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const REFRESH_MS = 15_000;

export default function HomePage() {
  const [games, setGames]           = useState([]);
  const [todayDate, setTodayDate]   = useState('');
  const [yesterdayDate, setYDate]   = useState('');
  const [searchQ, setSearchQ]       = useState('');
  const [syncing, setSyncing]       = useState(false);
  const [chartMonth, setChartMonth] = useState(() => String(new Date().getMonth() + 1).padStart(2, '0'));
  const [chartYear, setChartYear]   = useState(() => String(new Date().getFullYear()));
  const [chartData, setChartData]   = useState(null);

  // Fetch today results from backend API
  const loadAnnouncement = useCallback(async () => {
    try {
      const res = await fetch('/api/announcement');
      const json = await res.json();
      if (json && json.success) setAnnouncement(json);
    } catch (e) {}
  }, []);

  const loadResults = useCallback(async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/results/today');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setGames(json.data);
        if (json.today_date) setTodayDate(json.today_date);
        if (json.yesterday_date) setYDate(json.yesterday_date);
      }
    } catch (e) {
      console.warn('[SK] API fetch error:', e.message);
    } finally {
      setTimeout(() => setSyncing(false), 800);
    }
  }, []);

  useEffect(() => {
    loadResults();
    loadAnnouncement();
    const id = setInterval(() => { loadResults(); loadAnnouncement(); }, REFRESH_MS);
    return () => clearInterval(id);
  }, [loadResults]);

  // Load monthly chart from backend API
  const loadChart = useCallback(async (month, year) => {
    try {
      const res = await fetch(`/api/chart/monthly?month=${month}&year=${year}`);
      const json = await res.json();
      if (json.success && json.rows) {
        setChartData(json);
      }
    } catch (e) {
      console.warn('[SK] Chart API error:', e.message);
    }
  }, []);

  useEffect(() => {
    loadChart(chartMonth, chartYear);
  }, [loadChart, chartMonth, chartYear]);

  const filtered = searchQ
    ? games.filter(g => g.name.toLowerCase().includes(searchQ.toLowerCase()) || g.code.toLowerCase().includes(searchQ.toLowerCase()))
    : games;

  const leadGame = games.find(g => g.today_number && g.today_number !== 'XX' && g.today_number !== '--') || games[0];
  const declaredCount = games.filter(g => g.today_number && g.today_number !== 'XX' && g.today_number !== '--').length;

  const fmtHindiDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

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

  // Spinner Icon component
  const SpinnerIcon = () => (
    <span className="wait-spinner" title="लाइव रिजल्ट का इंतज़ार">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="12" cy="12" r="9.5" />
        <line className="clock-hand" x1="12" y1="12" x2="12" y2="6.5" />
      </svg>
    </span>
  );

  return (
    <div id="wrapper">
      {/* ── BREAKING RESULT FLASH BAR ── */}
      {leadGame && (
        <div className="lrs">
          <span className="lrs-tag"><i className="lrs-dot" />अभी आया रिजल्ट</span>
          <span className="lrs-game">{leadGame.name}</span>
          <span className="lrs-time">({leadGame.draw_time})</span>
          <span className="lrs-arrow">&#10148;</span>
          <span className="lrs-num">{!leadGame.today_number || leadGame.today_number === 'XX' || leadGame.today_number === '--' ? '??' : leadGame.today_number}</span>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-wa-paper" style={{ padding: '2px 10px', fontSize: '11px', marginLeft: 8 }}>
            💬 WhatsApp
          </a>
        </div>
      )}

      <div className="sheet">
        {/* ── MASTHEAD ── */}
        <header className="masthead">
          <div className="kicker">दैनिक सट्टा समाचार — DAILY GAZETTE</div>
          <h1>SATTA KING PRO</h1>
          <div className="dateline">
            <span className="dateline-item">{fmtHindiDate(todayDate || new Date())}</span>
            <span className="dateline-sep">&bull;</span>
            <span className="dateline-item">मूल्य: नि:शुल्क</span>
            <span className="dateline-sep">&bull;</span>
            <span className="dateline-item">अंक: 2026-LIVE</span>
            <span className="dateline-sep">&bull;</span>
            <span className="dateline-item">
              <span className="lrs-dot" style={{ background: syncing ? '#b45309' : '#1c7a45' }} />
              {syncing ? 'लाइव सिंक...' : 'लाइव अपडेट (15s)'}
            </span>
          </div>
        </header>

      {/* ── LIVE ANNOUNCEMENT / ADVERTISEMENT BANNER ── */}
      {announcement && announcement.active && announcement.text && (
        <div className="adv-banner" role="alert">
          <div className="adv-banner-inner">
            <span className="adv-badge">📢 SPECIAL NOTICE</span>
            <span className="adv-text" dangerouslySetInnerHTML={{
              __html: announcement.text.replace(
                /(https?:\/\/[^\s]+)/g,
                '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
              )
            }} />
          </div>
        </div>
      )}

        {/* ── NEWSPAPER NAV ── */}
        <nav className="paper-nav">
          <div className="paper-nav-links">
            <Link href="/" className="on">मुख्य पृष्ठ</Link>
            <a href="#monthly-chart">रिकॉर्ड चार्ट</a>
            <a href="#schedule">कार्यक्रम</a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--wa)', fontWeight: 800 }}>
              💬 WhatsApp बुकिंग
            </a>
          </div>
          <div className="paper-search">
            <input
              type="text"
              className="paper-search-input"
              placeholder="🔍 गेम खोजें (Gali, Desawar...)"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              aria-label="खोजें"
            />
          </div>
        </nav>

        {/* ── WHATSAPP BROADSHEET BANNER ── */}
        <div className="wa-paper-banner">
          <div>
            <div className="wa-paper-title">👑 सीधा खाईवाल से संपर्क करें &bull; ईमानदार सट्टा कंपनी</div>
            <div className="wa-paper-sub">गेम पासिंग और फास्ट पेमेंट के लिए तुरंत WhatsApp करें: {WHATSAPP_NUMBER}</div>
          </div>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-wa-paper">
            📲 WhatsApp पर जुड़ें
          </a>
        </div>

        {/* ── NOTICE ── */}
        <div className="notice">
          हाँ भाई, सबसे पहले और सबसे तेज़ खबर यहीं आती है &mdash; <a href="#monthly-chart">मासिक चार्ट देखने के लिए नीचे स्क्रॉल करें ↓</a>
        </div>

        {/* ── BROADSHEET LEAD STORY ── */}
        <section className="lead">
          <div className="lead-main">
            <span className="lead-tag">ताज़ा खबर &bull; HEADLINE</span>
            <h2>{leadGame?.name || 'LIVE'} का आज का रिजल्ट घोषित</h2>
            <p className="byline">हाँ भाई, सबसे पहले खबर यहीं आती है &mdash; निज विशेष संवाददाता</p>

            <div className="figure">
              <span className="big">
                {!leadGame?.today_number || leadGame?.today_number === 'XX' || leadGame?.today_number === '--' ? <SpinnerIcon /> : leadGame?.today_number}
              </span>
              <div className="meta-group">
                <div className="meta">
                  <span>कल का नंबर</span>
                  <b>{leadGame?.yesterday_number || '—'}</b>
                </div>
                <div className="meta">
                  <span>रिजल्ट समय</span>
                  <b>{leadGame?.draw_time || '—'}</b>
                </div>
              </div>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-wa-paper" style={{ marginLeft: 'auto' }}>
                💬 खाईवाल चैट
              </a>
            </div>

            <div className="lead-body">
              <p>
                Satta King Pro पर फरीदाबाद, गाजियाबाद, गली, दिसावर सहित सभी प्रमुख सट्टा बाज़ार गेम के परिणाम सबसे पहले और सुपरफास्ट गति से प्रसारित किए जाते हैं।
              </p>
              <p>
                नीचे दी गई तालिका में आज के सभी गेम, उनका निश्चित समय, कल आया हुआ नंबर और आज का रिजल्ट क्रमानुसार दिया गया है। पुराने आंकड़ों के लिए नीचे मासिक चार्ट देखें।
              </p>
            </div>
          </div>

          <aside className="lead-side" id="schedule">
            <div className="side-h">आज का कार्यक्रम (SCHEDULE)</div>
            <ul className="side-list">
              {games.map((g) => (
                <li key={g.code}>
                  <span>{g.name}</span>
                  <i />
                  <b>{g.draw_time}</b>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        {/* ── TODAY'S RESULTS TABLE ── */}
        <section className="sec">
          <div className="sec-h">
            <h3>आज का ताज़ा रिजल्ट</h3>
            <span className="rule" />
            <span className="note">{declaredCount}/{games.length} घोषित</span>
          </div>

          <div className="scroll-hint">👈 बाएँ-दाएँ स्क्रॉल करें 👉</div>
          <div className="tbl-wrap">
            <table className="tbl" aria-label="Today Satta Results">
              <thead>
                <tr>
                  <th>सट्टा का नाम (GAME)</th>
                  <th style={{ textAlign: 'center' }}>कल आया था (YEST)</th>
                  <th style={{ textAlign: 'center' }}>आज का रिजल्ट (TODAY)</th>
                  <th style={{ textAlign: 'right' }}>रिकॉर्ड चार्ट</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => {
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

        {/* ── MONTHLY ARCHIVE LEDGER ── */}
        <section className="sec" id="monthly-chart">
          <div className="sec-h">
            <h3>
              मासिक रिकॉर्ड चार्ट &mdash; {chartData ? `${MONTH_NAMES[parseInt(chartData.month, 10) - 1]?.toUpperCase()} ${chartData.year}` : 'ARCHIVE'}
            </h3>
            <span className="rule" />
            <span className="note">ऐतिहासिक रिकॉर्ड</span>
          </div>

          <div className="scroll-hint">👈 बाएँ-दाएँ स्क्रॉल करें 👉</div>
          <div className="tbl-wrap">
            <table className="archive-ledger sticky-col" aria-label="Monthly Archive Table">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>तारीख (DAY)</th>
                  <th>DESAWAR (DSWR)</th>
                  <th>FARIDABAD (FRBD)</th>
                  <th>GAZIYABAD (GZBD)</th>
                  <th>GALI</th>
                </tr>
              </thead>
              <tbody>
                {chartData?.rows?.map((r) => {
                  const isToday = r.day === todayDay;
                  const hasNum = (val) => val && val !== 'XX' && val !== '--';
                  return (
                    <tr key={r.day} className={isToday ? 'today-row' : ''}>
                      <td><b>{r.day}</b></td>
                      <td className={hasNum(r.DS) ? 'has-num' : ''}>{r.DS === 'XX' && isToday ? <SpinnerIcon /> : (r.DS || '—')}</td>
                      <td className={hasNum(r.FB) ? 'has-num' : ''}>{r.FB === 'XX' && isToday ? <SpinnerIcon /> : (r.FB || '—')}</td>
                      <td className={hasNum(r.GB) ? 'has-num' : ''}>{r.GB === 'XX' && isToday ? <SpinnerIcon /> : (r.GB || '—')}</td>
                      <td className={hasNum(r.GL) ? 'has-num' : ''}>{r.GL === 'XX' && isToday ? <SpinnerIcon /> : (r.GL || '—')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="archive-nav">
            <button
              className="archive-btn"
              onClick={() => goToMonth(String(prevMIdx + 1).padStart(2, '0'), String(prevYear))}
            >
              ← पिछला महीना ({MONTH_NAMES[prevMIdx]?.substring(0, 3)} {prevYear})
            </button>
            <button
              className="archive-btn"
              onClick={() => goToMonth(String(nextMIdx + 1).padStart(2, '0'), String(nextYear))}
            >
              अगला महीना ({MONTH_NAMES[nextMIdx]?.substring(0, 3)} {nextYear}) →
            </button>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="paper-footer">
          <p><b>SATTA KING PRO NEWSPAPER EDITION</b> &bull; सर्वाधिकार सुरक्षित 2026</p>
          <div style={{ margin: '14px 0' }}>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-wa-paper">
              💬 24x7 WhatsApp सेवा: {WHATSAPP_NUMBER}
            </a>
          </div>
          <div className="paper-footer-selects">
            <select
              value={chartMonth}
              onChange={e => setChartMonth(e.target.value)}
              aria-label="Select month"
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
              ))}
            </select>
            <select
              value={chartYear}
              onChange={e => setChartYear(e.target.value)}
              aria-label="Select year"
            >
              {[2026, 2025, 2024, 2023, 2022].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </footer>
      </div>

      {/* FLOATING WHATSAPP BUTTON */}
      <div className="floating-wa">
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="paper-fab-wa">
          💬 WhatsApp
        </a>
      </div>

      {/* FAB */}
      <div className="floating-bar">
        <button className="paper-fab" onClick={() => window.location.reload()}>
          ↻ ताज़ा करें (REFRESH)
        </button>
      </div>
    </div>
  );
}
