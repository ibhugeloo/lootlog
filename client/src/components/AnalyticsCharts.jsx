import React, { useMemo, useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';
import { PieChartIcon, TrendingUp, MoreHorizontal, Trophy, Gamepad2, Tag, Lock } from 'lucide-react';
import { toEUR } from '../utils/currency';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatMonthShort, getLocale } from '../utils/formatters';

const CHART_COLORS = ['#FF5C00', '#3B82F6', '#A855F7', '#22C55E', '#EAB308', '#EF4444'];

const TOOLTIP_STYLE = {
    backgroundColor: '#141417',
    border: '1px solid #1F1F23',
    borderRadius: '8px',
    padding: '10px 14px',
};

const AnalyticsCharts = ({ transactions, exchangeRate = 0.92, isPremium = false }) => {
    const { t, i18n } = useTranslation();
    const locale = getLocale(i18n.language);

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 640px)');
        setIsMobile(mq.matches);
        const handler = (e) => setIsMobile(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    // 1. Platform donut
    const platformData = useMemo(() => {
        return transactions.reduce((acc, t) => {
            const existing = acc.find(p => p.name === t.platform);
            const price = toEUR(parseFloat(t.price) || 0, t.currency, exchangeRate);
            if (existing) existing.value += price;
            else acc.push({ name: t.platform, value: price });
            return acc;
        }, []).map(i => ({ ...i, value: Math.round(i.value) })).sort((a, b) => b.value - a.value).slice(0, 6);
    }, [transactions, exchangeRate]);

    const totalPlatformSpent = platformData.reduce((a, p) => a + p.value, 0);

    // 2. Store donut
    const unknownLabel = t('common.unknown');
    const storeData = useMemo(() => {
        return transactions.reduce((acc, tx) => {
            const storeName = tx.store || unknownLabel;
            const existing = acc.find(s => s.name === storeName);
            const price = toEUR(parseFloat(tx.price) || 0, tx.currency, exchangeRate);
            if (existing) existing.value += price;
            else acc.push({ name: storeName, value: price });
            return acc;
        }, []).sort((a, b) => b.value - a.value);
    }, [transactions, exchangeRate, unknownLabel]);

    const topStore = storeData[0] || { name: 'N/A', value: 0 };

    // 3. Monthly evolution
    const monthlyData = useMemo(() => {
        return transactions.reduce((acc, t) => {
            const date = new Date(t.purchase_date);
            const monthYear = formatMonthShort(date, i18n.language);
            const existing = acc.find(m => m.name === monthYear);
            const price = toEUR(parseFloat(t.price) || 0, t.currency, exchangeRate);
            if (existing) existing.value += price;
            else acc.push({ name: monthYear, value: price, dateObj: date });
            return acc;
        }, []).map(i => ({ ...i, value: Math.round(i.value) })).sort((a, b) => a.dateObj - b.dateObj);
    }, [transactions, exchangeRate, i18n.language]);

    // 4. Cumulative spending
    const cumulativeData = useMemo(() => {
        let cumulative = 0;
        return monthlyData.map(m => {
            cumulative += m.value;
            return { name: m.name, value: cumulative };
        });
    }, [monthlyData]);

    // 5. Top games
    const gameData = useMemo(() => {
        return transactions.reduce((acc, tx) => {
            const title = tx.title || unknownLabel;
            const existing = acc.find(g => g.name === title);
            const price = toEUR(parseFloat(tx.price) || 0, tx.currency, exchangeRate);
            if (existing) existing.value += price;
            else acc.push({ name: title, value: price });
            return acc;
        }, []).map(i => ({ ...i, value: Math.round(i.value) })).sort((a, b) => b.value - a.value).slice(0, 10);
    }, [transactions, exchangeRate, unknownLabel]);

    // 6. Genre donut
    const genreData = useMemo(() => {
        return transactions.reduce((acc, t) => {
            const genreName = t.genre || 'Other';
            const existing = acc.find(g => g.name === genreName);
            const price = toEUR(parseFloat(t.price) || 0, t.currency, exchangeRate);
            if (existing) {
                existing.value += price;
                existing.count += 1;
            } else {
                acc.push({ name: genreName, value: price, count: 1 });
            }
            return acc;
        }, []).map(i => ({ ...i, value: Math.round(i.value) })).sort((a, b) => b.value - a.value);
    }, [transactions, exchangeRate]);

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={TOOLTIP_STYLE}>
                    <p className="text-[13px] font-semibold text-white mb-1">{label}</p>
                    <p className="text-[13px] text-white flex items-center gap-2 m-0">
                        <span
                            className="inline-block w-2.5 h-2.5 rounded-full"
                            style={{ background: payload[0].fill || payload[0].stroke || '#FF5C00' }}
                        />
                        {payload[0].value.toLocaleString(locale)} €
                    </p>
                </div>
            );
        }
        return null;
    };

    const axisColor = '#6B6B70';

    return (
        <div className="flex flex-col gap-6">
            {/* Main chart grid: Platform + Monthly */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Distribution */}
                <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                    <h3 className="text-[15px] font-semibold text-white mb-6 flex items-center gap-2">
                        <PieChartIcon size={16} className="text-primary" />
                        {t('charts.spendingByPlatform')}
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        <div className="relative" style={{ width: 140, height: 140, flexShrink: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={platformData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                                        {platformData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <div className="text-xl font-bold text-white">{transactions.length}</div>
                                <div className="text-[11px] text-muted-foreground">{t('charts.total')}</div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5 flex-1">
                            {platformData.map((item, i) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="w-2 h-2 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                                        />
                                        <span className="text-xs text-secondary-foreground truncate">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-mono text-white ml-2">{item.value} €</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Store sub-section */}
                    <div className="mt-6 pt-5 border-t border-border">
                        <h3 className="text-[15px] font-semibold text-white mb-5 flex items-center gap-2">
                            <PieChartIcon size={16} className="text-primary" />
                            {t('charts.spendingByStore')}
                        </h3>
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                            <div className="relative" style={{ width: 140, height: 140, flexShrink: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={storeData.slice(0, 5).map(s => ({ ...s, value: Math.round(s.value) }))}
                                            cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none"
                                        >
                                            {storeData.slice(0, 5).map((_, i) => (
                                                <Cell key={i} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <div className="text-xl font-bold text-white">{storeData.length}</div>
                                    <div className="text-[11px] text-muted-foreground">{t('charts.stores')}</div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5 flex-1">
                                {storeData.slice(0, 5).map((item, i) => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-2 h-2 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: CHART_COLORS[(i + 2) % CHART_COLORS.length] }}
                                            />
                                            <span className="text-xs text-secondary-foreground truncate">{item.name}</span>
                                        </div>
                                        <span className="text-xs font-mono text-white ml-2">{Math.round(item.value)} €</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Evolution + Highlights */}
                <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
                    <h3 className="text-[15px] font-semibold text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={16} className="text-primary" />
                        {t('charts.monthlyEvolution')}
                    </h3>

                    <div className="text-3xl font-bold text-white font-mono">
                        {totalPlatformSpent.toLocaleString(locale)} €
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 mb-4">{t('charts.totalSpending')}</div>

                    <div className="bg-secondary border border-border rounded-lg px-4 py-3 mb-5">
                        <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-1">
                            <Trophy size={13} />
                            {t('charts.favoriteStore')}
                        </div>
                        <div className="text-sm text-white">
                            {t('charts.storeSpending', { name: topStore.name, amount: Math.round(topStore.value) })}
                        </div>
                    </div>

                    <div style={{ height: 180 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FF5C00" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="#FF5C00" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F23" vertical={false} />
                                <XAxis dataKey="name" stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}€`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="value" stroke="#FF5C00" strokeWidth={3} fillOpacity={1} fill="url(#areaGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Extra charts: Genre + Cumulative */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Genre Distribution */}
                <div className="relative bg-card border border-border rounded-xl p-4 sm:p-6">
                    {!isPremium && (
                        <div className="absolute inset-0 bg-card/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3 z-10">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <Lock size={18} className="text-muted-foreground" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-white">{t('charts.spendingByGenre')}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{t('common.premiumFeature')}</p>
                            </div>
                        </div>
                    )}
                    <div>
                        <h3 className="text-[15px] font-semibold text-white mb-1 flex items-center gap-2">
                            <Tag size={16} className="text-primary" />
                            {t('charts.spendingByGenre')}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-6">
                            {t('charts.differentGenres', { count: genreData.length })}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                            <div className="relative" style={{ width: 140, height: 140, flexShrink: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={genreData.slice(0, 6)} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                                            {genreData.slice(0, 6).map((_, i) => (
                                                <Cell key={i} fill={CHART_COLORS[(i + 4) % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <div className="text-xl font-bold text-white">{genreData.length}</div>
                                    <div className="text-[11px] text-muted-foreground">{t('charts.genres')}</div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5 flex-1">
                                {genreData.slice(0, 6).map((item, i) => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-2 h-2 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: CHART_COLORS[(i + 4) % CHART_COLORS.length] }}
                                            />
                                            <span className="text-xs text-secondary-foreground truncate">
                                                {item.name} ({item.count})
                                            </span>
                                        </div>
                                        <span className="text-xs font-mono text-white ml-2">{item.value} €</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cumulative Spending */}
                <div className="relative bg-card border border-border rounded-xl p-4 sm:p-6">
                    {!isPremium && (
                        <div className="absolute inset-0 bg-card/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3 z-10">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                <Lock size={18} className="text-muted-foreground" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-white">{t('charts.cumulativeSpending')}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{t('common.premiumFeature')}</p>
                            </div>
                        </div>
                    )}
                    <div>
                        <h3 className="text-[15px] font-semibold text-white mb-1 flex items-center gap-2">
                            <TrendingUp size={16} className="text-primary" />
                            {t('charts.cumulativeSpending')}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-5">
                            {t('charts.cumulativeSubtitle')}
                        </p>
                        <div style={{ height: 220 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={cumulativeData}>
                                    <defs>
                                        <linearGradient id="cumulGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FF5C00" stopOpacity={0.6} />
                                            <stop offset="95%" stopColor="#FF5C00" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1F1F23" vertical={false} />
                                    <XAxis dataKey="name" stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}€`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="value" stroke="#FF5C00" strokeWidth={3} fillOpacity={1} fill="url(#cumulGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Games Bar Chart */}
            <div className="relative bg-card border border-border rounded-xl p-4 sm:p-6 mb-8">
                {!isPremium && (
                    <div className="absolute inset-0 bg-card/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3 z-10">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Lock size={18} className="text-muted-foreground" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-white">{t('charts.spendingByGame')}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{t('common.premiumFeature')}</p>
                        </div>
                    </div>
                )}
                <div>
                    <h3 className="text-[15px] font-semibold text-white mb-1 flex items-center gap-2">
                        <Gamepad2 size={16} className="text-primary" />
                        {t('charts.spendingByGame')}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                        {t('charts.topGamesBySpending')}
                    </p>
                    <div style={{ height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gameData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#FF5C00" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#FF8A4C" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F23" horizontal={false} />
                                <XAxis type="number" stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}€`} />
                                <YAxis type="category" dataKey="name" stroke={axisColor} fontSize={isMobile ? 10 : 12} tickLine={false} axisLine={false} width={isMobile ? 80 : 150} tick={{ fill: '#ADADB0' }} tickFormatter={v => isMobile && v.length > 12 ? v.slice(0, 12) + '…' : v} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1A1A1F' }} />
                                <Bar dataKey="value" fill="url(#barGrad)" radius={[0, 12, 12, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCharts;
