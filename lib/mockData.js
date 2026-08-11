// lib/mockData.js — Full offline static & realistic data for all Satta King pages

export const WHATSAPP_URL = 'https://wa.me/917589085263';
export const WHATSAPP_NUMBER = '+91 7589085263';

export const STATIC_GAMES = [
  { id: 1, code: 'FB', name: 'FARIDABAD', slug: 'faridabad', draw_time: '06:10 PM', category: 'LIVE', is_main: 1, is_highlight: 1, yesterday_number: '58', today_number: '58' },
  { id: 2, code: 'GB', name: 'GAZIYABAD', slug: 'gaziyabad', draw_time: '09:50 PM', category: 'LIVE', is_main: 1, is_highlight: 1, yesterday_number: '54', today_number: '72' },
  { id: 3, code: 'GL', name: 'GALI', slug: 'gali', draw_time: '11:45 PM', category: 'NEXT', is_main: 1, is_highlight: 1, yesterday_number: '43', today_number: 'XX' },
  { id: 4, code: 'DS', name: 'DESHAWER', slug: 'deshawer', draw_time: '05:15 AM', category: 'REST', is_main: 1, is_highlight: 1, yesterday_number: '88', today_number: '88' },
  { id: 5, code: 'DB', name: 'DELHI BAZAAR', slug: 'delhi-bazaar', draw_time: '03:15 PM', category: 'REST', is_main: 0, is_highlight: 0, yesterday_number: '85', today_number: '78' },
  { id: 6, code: 'SG', name: 'SHREE GANESH', slug: 'shree-ganesh', draw_time: '04:45 PM', category: 'REST', is_main: 0, is_highlight: 0, yesterday_number: '64', today_number: '30' },
  { id: 7, code: 'IK', name: 'INDIA KING', slug: 'india-king', draw_time: '02:20 PM', category: 'REST', is_main: 0, is_highlight: 0, yesterday_number: '41', today_number: '74' },
  { id: 8, code: 'TD', name: 'TRIDEV', slug: 'tridev', draw_time: '08:15 PM', category: 'LIVE', is_main: 0, is_highlight: 0, yesterday_number: '18', today_number: 'XX' },
  { id: 9, code: 'NC', name: 'NAMAN CITY', slug: 'naman-city', draw_time: '08:35 PM', category: 'LIVE', is_main: 0, is_highlight: 0, yesterday_number: '92', today_number: 'XX' },
  { id: 10, code: 'MK', name: 'MAHAKAL', slug: 'mahakal', draw_time: '01:30 AM', category: 'REST', is_main: 0, is_highlight: 0, yesterday_number: '23', today_number: '01' },
  { id: 11, code: 'NG', name: 'NEW GAZIYABAD', slug: 'new-gaziyabad', draw_time: '04:10 PM', category: 'REST', is_main: 0, is_highlight: 0, yesterday_number: '67', today_number: '54' },
  { id: 12, code: 'GS', name: 'GALI SUPER', slug: 'gali-super', draw_time: '10:30 PM', category: 'NEXT', is_main: 0, is_highlight: 0, yesterday_number: '38', today_number: 'XX' },
  { id: 13, code: 'KY', name: 'KALYUG', slug: 'kalyug', draw_time: '02:20 PM', category: 'REST', is_main: 0, is_highlight: 0, yesterday_number: '81', today_number: '49' },
  { id: 14, code: 'FP', name: 'FOOTPATH', slug: 'footpath', draw_time: '12:15 AM', category: 'REST', is_main: 0, is_highlight: 0, yesterday_number: '95', today_number: '11' },
  { id: 15, code: 'BC', name: 'BOMBAY CITY', slug: 'bombay-city', draw_time: '02:20 PM', category: 'REST', is_main: 0, is_highlight: 0, yesterday_number: '62', today_number: '49' },
  { id: 16, code: 'NOD', name: 'NOIDA CITY', slug: 'noida-city', draw_time: '10:20 PM', category: 'NEXT', is_main: 0, is_highlight: 0, yesterday_number: '14', today_number: 'XX' },
];

function pseudoRandomNumber(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const num = Math.abs(hash % 100);
  return String(num).padStart(2, '0');
}

export function getMockMonthlyChart(month, year) {
  const mInt = parseInt(month, 10);
  const yInt = parseInt(year, 10);
  const daysInMonth = new Date(yInt, mInt, 0).getDate();
  const now = new Date();
  const isCurrentMonth = (now.getFullYear() === yInt) && (now.getMonth() + 1 === mInt);
  const currentDay = now.getDate();

  const rows = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dayPad = String(day).padStart(2, '0');
    const isFuture = isCurrentMonth && day > currentDay;
    const isToday = isCurrentMonth && day === currentDay;

    rows.push({
      day: dayPad,
      date: `${year}-${month}-${dayPad}`,
      DS: isFuture ? 'XX' : (isToday ? '88' : pseudoRandomNumber(`DS-${year}-${month}-${day}`)),
      FB: isFuture ? 'XX' : (isToday ? '58' : pseudoRandomNumber(`FB-${year}-${month}-${day}`)),
      GB: isFuture ? 'XX' : (isToday ? '72' : pseudoRandomNumber(`GB-${year}-${month}-${day}`)),
      GL: isFuture ? 'XX' : (isToday ? 'XX' : pseudoRandomNumber(`GL-${year}-${month}-${day}`)),
    });
  }

  return {
    success: true,
    month: String(month).padStart(2, '0'),
    year: String(year),
    days_in_month: daysInMonth,
    rows,
  };
}

export function getMockGameAnnualChart(gameCode, year) {
  const code = (gameCode || 'FB').toUpperCase();
  const game = STATIC_GAMES.find(g => g.code.toUpperCase() === code) || {
    id: 99,
    code,
    name: code,
    slug: code.toLowerCase(),
    draw_time: '08:00 PM',
  };

  const monthly_data = {};
  const yInt = parseInt(year, 10);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  for (let m = 1; m <= 12; m++) {
    const mPad = String(m).padStart(2, '0');
    monthly_data[mPad] = {};
    const days = new Date(yInt, m, 0).getDate();

    for (let d = 1; d <= 31; d++) {
      const dPad = String(d).padStart(2, '0');
      if (d > days) {
        monthly_data[mPad][dPad] = '--';
        continue;
      }

      if (yInt === currentYear && m > currentMonth) {
        monthly_data[mPad][dPad] = 'XX';
      } else if (yInt === currentYear && m === currentMonth && d > currentDay) {
        monthly_data[mPad][dPad] = 'XX';
      } else if (yInt === currentYear && m === currentMonth && d === currentDay) {
        const liveGame = STATIC_GAMES.find(g => g.code.toUpperCase() === code);
        monthly_data[mPad][dPad] = liveGame?.today_number || 'XX';
      } else {
        monthly_data[mPad][dPad] = pseudoRandomNumber(`${code}-${year}-${mPad}-${dPad}`);
      }
    }
  }

  return {
    success: true,
    game,
    year: String(year),
    monthly_data,
  };
}
