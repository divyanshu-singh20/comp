import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Clapperboard,
  FileCheck2,
  FileClock,
  PlayCircle,
  Plus,
  ReceiptText,
  TrendingUp,
  UserRound,
  Video,
  WalletCards
} from 'lucide-react';

const kpis = [
  { label: 'Active clients', value: '38', delta: '+12.4%', note: 'vs. last month', icon: UserRound, tone: 'amber' },
  { label: 'Active orders', value: '24', delta: '+4', note: 'this week', icon: ReceiptText, tone: 'white' },
  { label: 'Pending scripts', value: '17', delta: '6 urgent', note: 'need review', icon: FileClock, tone: 'red' },
  { label: 'Upcoming shoots', value: '09', delta: 'next 7 days', note: 'scheduled', icon: Clapperboard, tone: 'white' },
  { label: 'Total receivables', value: '₹18.6L', delta: '63%', note: 'collected', icon: CircleDollarSign, tone: 'amber' },
  { label: 'Monthly revenue', value: '₹32.4L', delta: '+18.2%', note: 'vs. last month', icon: TrendingUp, tone: 'amber' },
  { label: 'Monthly expenses', value: '₹11.8L', delta: '36.4%', note: 'of revenue', icon: WalletCards, tone: 'white' },
  { label: 'Creator payouts', value: '₹7.2L', delta: '14 pending', note: 'to clear', icon: UserRound, tone: 'white' },
  { label: 'Estimated net profit', value: '₹13.4L', delta: '+22.6%', note: 'this month', icon: TrendingUp, tone: 'amber' }
];

const shoots = [
  { time: '10:00', title: 'Nykaa winter skin drop', client: 'Nykaa Beauty', creator: 'Mira S.', color: 'bg-[#d9a441]' },
  { time: '13:30', title: 'Founder story / take 02', client: 'Northstar Labs', creator: 'Rohan K.', color: 'bg-[#6685a1]' },
  { time: '16:00', title: 'Festive edit batch', client: 'The Loom Room', creator: 'Ananya P.', color: 'bg-[#9b6d64]' }
];

const activities = [
  { title: 'Video approved by client', detail: 'Northstar Labs · VO-208', time: '12 min ago', icon: CheckCircle2, color: 'text-emerald-400' },
  { title: 'New payment received', detail: 'Nykaa Beauty · ₹2,40,000', time: '46 min ago', icon: CircleDollarSign, color: 'text-amber' },
  { title: 'Script sent for revision', detail: 'The Loom Room · SC-184', time: '1 hr ago', icon: FileCheck2, color: 'text-orange-300' },
  { title: 'Creator booked', detail: 'Rohan K. · 22 Sep shoot', time: '2 hrs ago', icon: UserRound, color: 'text-sky-400' }
];

const formatValue = (value) => value;

function SectionHeading({ eyebrow, title, action }) {
  return <div className="mb-4 flex items-end justify-between"><div><p className="font-mono text-[9px] uppercase tracking-[0.2em] text-amber">{eyebrow}</p><h2 className="mt-1 text-lg font-semibold tracking-tight text-white">{title}</h2></div>{action && <button className="flex items-center gap-1 text-xs text-muted transition hover:text-amber">{action}<ChevronRight size={14} /></button>}</div>;
}

export default function ExecutiveDashboard() {
  return (
    <div className="animate-rise-in space-y-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber">Friday, 18 September 2026 / 09:42 AM</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">Good morning, Aarav<span className="text-amber">.</span></h1><p className="mt-2 text-sm text-muted">Here is the pulse of your agency today.</p></div>
        <button className="flex h-10 items-center justify-center gap-2 bg-amber px-4 text-xs font-bold text-ink transition hover:bg-amber-soft"><Plus size={16} /> New order</button>
      </div>

      <section aria-label="Executive KPIs" className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 xl:grid-cols-9">
        {kpis.map(({ label, value, delta, note, icon: Icon, tone }, index) => <article key={label} className={`group relative min-h-[140px] bg-panel p-4 transition hover:bg-panel-strong ${index === 8 ? 'xl:min-w-[150px]' : ''}`}><div className="flex items-start justify-between"><span className={`grid h-7 w-7 place-items-center ${tone === 'amber' ? 'bg-[#33250e] text-amber' : tone === 'red' ? 'bg-[#321b1b] text-red-300' : 'bg-[#252525] text-muted'}`}><Icon size={14} /></span><ArrowUpRight size={14} className={`${tone === 'amber' ? 'text-amber' : tone === 'red' ? 'text-red-300' : 'text-[#555]'} opacity-0 transition group-hover:opacity-100`} /></div><p className="mt-5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">{label}</p><p className="mt-1 text-2xl font-semibold tracking-tight text-white">{formatValue(value)}</p><p className={`mt-2 font-mono text-[9px] ${tone === 'red' ? 'text-red-300' : 'text-amber'}`}>{delta} <span className="text-[#666]">{note}</span></p></article>)}
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <section><SectionHeading eyebrow="Operations / Today" title="Today's shoots" action="View calendar" /><div className="border border-line bg-panel"><div className="grid grid-cols-[72px_1fr_auto] border-b border-line px-4 py-3 font-mono text-[9px] uppercase tracking-[0.16em] text-[#666]"><span>Time</span><span>Production</span><span>Status</span></div>{shoots.map((shoot) => <div key={shoot.time} className="grid grid-cols-[72px_1fr_auto] items-center border-b border-line px-4 py-4 last:border-0"><span className="font-mono text-xs text-amber">{shoot.time}</span><div className="flex items-center gap-3"><span className={`grid h-8 w-8 place-items-center ${shoot.color} text-[10px] font-bold text-ink`}>{shoot.creator.slice(0, 2).toUpperCase()}</span><div><p className="text-sm font-medium text-white">{shoot.title}</p><p className="mt-1 text-xs text-muted">{shoot.client} <span className="text-[#555]">·</span> {shoot.creator}</p></div></div><span className="border border-[#5a4215] bg-[#271f0e] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-amber">Confirmed</span></div>)}</div></section>

        <section><SectionHeading eyebrow="Attention required" title="Urgent tasks" action="Open tasks" /><div className="space-y-2">{[
          ['Script approvals', '6 scripts waiting on client feedback', 'High', 'text-red-300', 'bg-red-400'],
          ['Edit queue', '4 videos due before tomorrow', 'Medium', 'text-orange-300', 'bg-orange-300'],
          ['Creator payouts', '14 payouts waiting for approval', 'Review', 'text-amber', 'bg-amber']
        ].map(([title, detail, tag, color, dot]) => <div key={title} className="flex items-center gap-3 border border-line bg-panel p-4"><span className={`h-2 w-2 shrink-0 ${dot}`} /><div className="min-w-0 flex-1"><p className="text-sm font-medium text-white">{title}</p><p className="mt-1 truncate text-xs text-muted">{detail}</p></div><span className={`font-mono text-[9px] uppercase tracking-[0.12em] ${color}`}>{tag}</span><ChevronRight size={14} className="text-[#555]" /></div>)}</div></section>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section><SectionHeading eyebrow="Throughput monitor" title="Bottlenecks" action="Production board" /><div className="border border-line bg-panel p-5"><div className="mb-6 flex items-end justify-between"><div><p className="text-3xl font-semibold text-white">71<span className="text-base text-muted">% on track</span></p><p className="mt-1 text-xs text-muted">Across 86 active deliverables</p></div><span className="font-mono text-[10px] text-amber">+8.4% this week</span></div>{[
          ['Overdue tasks', 11, 24, 'bg-red-400', 'text-red-300'],
          ['Pending script approvals', 17, 32, 'bg-amber', 'text-amber'],
          ['Pending edits', 9, 19, 'bg-sky-400', 'text-sky-300']
        ].map(([label, count, total, bar, text]) => <div key={label} className="mb-5 last:mb-0"><div className="mb-2 flex justify-between text-xs"><span className="text-muted">{label}</span><span className={`font-mono ${text}`}>{count} / {total}</span></div><div className="h-1.5 bg-[#2a2a2a]"><div className={`h-full ${bar}`} style={{ width: `${(count / total) * 100}%` }} /></div></div>)}</div></section>

        <section><SectionHeading eyebrow="Live feed" title="Recent activity" action="See all activity" /><div className="border border-line bg-panel">{activities.map(({ title, detail, time, icon: Icon, color }) => <div key={title} className="flex items-center gap-4 border-b border-line px-4 py-4 last:border-0"><span className={`grid h-8 w-8 shrink-0 place-items-center bg-[#252525] ${color}`}><Icon size={15} /></span><div className="min-w-0 flex-1"><p className="text-sm font-medium text-white">{title}</p><p className="mt-1 truncate text-xs text-muted">{detail}</p></div><span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] text-[#666]">{time}</span></div>)}</div></section>
      </div>

      <section><SectionHeading eyebrow="Financial pulse / September" title="Revenue against plan" action="Open finance" /><div className="border border-line bg-panel p-5"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-3xl font-semibold tracking-tight text-white">₹32,40,000</p><p className="mt-1 text-xs text-muted">Collected this month <span className="text-emerald-400">↑ 18.2%</span></p></div><div className="flex items-center gap-5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted"><span className="flex items-center gap-2"><i className="h-2 w-2 bg-amber" /> Actual</span><span className="flex items-center gap-2"><i className="h-2 w-2 bg-[#454545]" /> Target</span></div></div><div className="mt-7 grid h-28 grid-cols-12 items-end gap-2 border-b border-line pb-0">{[42, 58, 51, 68, 63, 76, 71, 84, 66, 88, 78, 94].map((height, index) => <div key={index} className="group relative h-full"><div className="absolute bottom-0 w-full bg-[#32302a]" style={{ height: `${Math.min(height + 8, 100)}%` }} /><div className="absolute bottom-0 z-10 w-full bg-amber transition group-hover:bg-amber-soft" style={{ height: `${height}%` }} /></div>)}</div><div className="mt-3 grid grid-cols-12 gap-2 font-mono text-[9px] text-[#666]"><span>O1</span><span>O2</span><span>O3</span><span>O4</span><span>O5</span><span>O6</span><span>O7</span><span>O8</span><span>O9</span><span>O10</span><span>O11</span><span>O12</span></div></div></section>
    </div>
  );
}
