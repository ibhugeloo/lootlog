import React, { useMemo, useState } from 'react';
import { Wallet, Plus, CheckCircle, XCircle, AlertTriangle, ChevronDown, Gamepad2, ArrowUpDown, Calendar } from 'lucide-react';
import { toEUR } from '../utils/currency';
import { useTranslation } from 'react-i18next';

const MONTH_NAMES_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_NAMES_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

const BudgetPage = ({ budget, allBudgets, transactions, exchangeRate = 0.92, onSetBudget }) => {
    const { t, i18n } = useTranslation();
    const [expandedMonth, setExpandedMonth] = useState(null);
    const [sortBy, setSortBy] = useState('date');
    const [filterYear, setFilterYear] = useState('all');
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const monthName = (month, lang) => {
        const names = lang === 'fr' ? MONTH_NAMES_FR : MONTH_NAMES_EN;
        return names[month - 1];
    };

    // Group transactions by month/year
    const txByMonth = useMemo(() => {
        const map = {};
        transactions.forEach(tx => {
            const d = new Date(tx.purchase_date);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            if (!map[key]) map[key] = [];
            map[key].push(tx);
        });
        return map;
    }, [transactions]);

    // Calculate spent for a specific month/year
    const getMonthSpent = useMemo(() => {
        const spentMap = {};
        transactions.forEach(tx => {
            const d = new Date(tx.purchase_date);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            if (!spentMap[key]) spentMap[key] = 0;
            spentMap[key] += toEUR(parseFloat(tx.price) || 0, tx.currency, exchangeRate);
        });
        return (month, year) => spentMap[`${year}-${month}`] || 0;
    }, [transactions, exchangeRate]);

    // Current month data
    const currentSpent = getMonthSpent(currentMonth, currentYear);
    const currentBudgetAmount = budget ? parseFloat(budget.amount) : 0;
    const currentPct = currentBudgetAmount > 0 ? Math.min((currentSpent / currentBudgetAmount) * 100, 100) : 0;
    const currentRemaining = currentBudgetAmount - currentSpent;
    const currentOverBudget = currentSpent > currentBudgetAmount;

    const currentBarColor = currentPct >= 100 ? 'bg-red-500' : currentPct >= 80 ? 'bg-amber-500' : 'bg-primary';
    const currentMonthTx = txByMonth[`${currentYear}-${currentMonth}`] || [];

    // Available years from history budgets
    const availableYears = useMemo(() => {
        const years = new Set();
        allBudgets.forEach(b => {
            if (!(b.month === currentMonth && b.year === currentYear)) {
                years.add(b.year);
            }
        });
        return [...years].sort((a, b) => b - a);
    }, [allBudgets, currentMonth, currentYear]);

    const SORT_OPTIONS = [
        { key: 'date', labelKey: 'budget.sortDate' },
        { key: 'spent', labelKey: 'budget.sortSpent' },
        { key: 'status', labelKey: 'budget.sortStatus' },
    ];

    // History: all budgets except current month, filtered by year
    const history = useMemo(() => {
        const items = allBudgets
            .filter(b => !(b.month === currentMonth && b.year === currentYear))
            .filter(b => filterYear === 'all' || b.year === parseInt(filterYear))
            .map(b => {
                const spent = getMonthSpent(b.month, b.year);
                const amount = parseFloat(b.amount);
                const pct = amount > 0 ? (spent / amount) * 100 : 0;
                const over = spent > amount;
                const monthTx = txByMonth[`${b.year}-${b.month}`] || [];
                return { ...b, spent, pct: Math.min(pct, 100), over, remaining: amount - spent, transactions: monthTx };
            });

        if (sortBy === 'spent') {
            items.sort((a, b) => b.spent - a.spent);
        } else if (sortBy === 'status') {
            items.sort((a, b) => (b.over ? 1 : 0) - (a.over ? 1 : 0) || b.pct - a.pct);
        }
        // 'date' is default order from allBudgets (year desc, month desc)

        return items;
    }, [allBudgets, getMonthSpent, txByMonth, currentMonth, currentYear, sortBy, filterYear]);

    const toggleExpand = (id) => {
        setExpandedMonth(prev => prev === id ? null : id);
    };

    const TransactionRow = ({ tx }) => {
        const price = toEUR(parseFloat(tx.price) || 0, tx.currency, exchangeRate);
        return (
            <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/5 transition-colors">
                {tx.cover_url ? (
                    <img src={tx.cover_url} alt="" className="w-8 h-8 rounded object-contain bg-muted flex-shrink-0" />
                ) : (
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                        <Gamepad2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <span className="text-sm text-white truncate block">{tx.title}</span>
                    <span className="text-xs text-muted-foreground">{tx.type} · {tx.platform}</span>
                </div>
                <span className="font-mono text-sm font-medium text-white flex-shrink-0">
                    {price.toFixed(2)} €
                </span>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="font-serif text-2xl font-semibold text-white">{t('budget.title')}</h1>
                <button
                    onClick={onSetBudget}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    {t('budget.setBudget')}
                </button>
            </div>

            {/* Current month */}
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Wallet className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-medium text-white">{t('budget.currentMonth')}</h2>
                    <span className="text-sm text-muted-foreground">— {monthName(currentMonth, i18n.language)} {currentYear}</span>
                </div>

                {budget ? (
                    <div>
                        <div className="flex items-baseline gap-3 mb-1">
                            <span className={`font-mono text-3xl font-bold ${currentOverBudget ? 'text-red-400' : 'text-white'}`}>
                                {currentSpent.toFixed(2)} €
                            </span>
                            <span className="font-mono text-lg text-muted-foreground">/ {currentBudgetAmount.toFixed(2)} €</span>
                        </div>

                        {currentOverBudget && (
                            <div className="flex items-center gap-1.5 text-sm text-red-400 mb-4">
                                <AlertTriangle className="w-4 h-4" />
                                {t('budget.overBudget', { amount: Math.abs(currentRemaining).toFixed(2) })}
                            </div>
                        )}

                        <div className="flex flex-col gap-2 mt-4">
                            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${currentBarColor}`}
                                    style={{ width: `${currentPct}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">{t('budget.used', { percent: currentPct.toFixed(0) })}</span>
                                <span className={`text-sm ${currentOverBudget ? 'text-red-400' : currentPct >= 80 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                                    {currentOverBudget
                                        ? t('budget.exhausted')
                                        : t('budget.remaining', { amount: currentRemaining.toFixed(2) })
                                    }
                                </span>
                            </div>
                        </div>

                        {/* Current month transactions */}
                        {currentMonthTx.length > 0 && (
                            <div className="mt-5 pt-4 border-t border-border">
                                <p className="text-xs text-muted-foreground mb-2">
                                    {t('budget.transactionsCount', { count: currentMonthTx.length })}
                                </p>
                                <div className="flex flex-col gap-0.5 max-h-64 overflow-y-auto">
                                    {currentMonthTx
                                        .sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date))
                                        .map(tx => <TransactionRow key={tx.id} tx={tx} />)
                                    }
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Wallet className="w-10 h-10 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground mb-4">{t('budget.noBudgetDesc')}</p>
                        <button
                            onClick={onSetBudget}
                            className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-border text-sm text-muted-foreground hover:text-white hover:border-border-light rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            {t('budget.setBudget')}
                        </button>
                    </div>
                )}
            </div>

            {/* History */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-lg font-medium text-white">{t('budget.history')}</h2>
                    <div className="flex items-center gap-3 flex-wrap">
                        {availableYears.length > 1 && (
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                <select
                                    value={filterYear}
                                    onChange={e => setFilterYear(e.target.value)}
                                    className="bg-card border border-border text-sm text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-primary transition-colors cursor-pointer appearance-none pr-7"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                                >
                                    <option value="all">{t('budget.allYears')}</option>
                                    {availableYears.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {history.length > 1 && (
                            <div className="flex items-center gap-1">
                                <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground mr-1" />
                                {SORT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.key}
                                        onClick={() => setSortBy(opt.key)}
                                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                            sortBy === opt.key
                                                ? 'bg-primary/20 text-primary font-medium'
                                                : 'text-muted-foreground hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        {t(opt.labelKey)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                {history.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {history.map(b => {
                            const amount = parseFloat(b.amount);
                            const barColor = b.pct >= 100 ? 'bg-red-500' : b.pct >= 80 ? 'bg-amber-500' : 'bg-primary';
                            const isExpanded = expandedMonth === b.id;

                            return (
                                <div key={b.id} className="bg-card border border-border rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => toggleExpand(b.id)}
                                        className="w-full p-5 flex flex-col gap-3 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-white">
                                                    {monthName(b.month, i18n.language)} {b.year}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            </div>
                                            {b.over ? (
                                                <span className="flex items-center gap-1 text-xs text-red-400">
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    {t('budget.exceeded')}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs text-green-400">
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    {t('budget.respected')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-baseline gap-2">
                                            <span className={`font-mono text-lg font-bold ${b.over ? 'text-red-400' : 'text-white'}`}>
                                                {b.spent.toFixed(2)} €
                                            </span>
                                            <span className="font-mono text-sm text-muted-foreground">/ {amount.toFixed(2)} €</span>
                                        </div>

                                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${barColor}`}
                                                style={{ width: `${b.pct}%` }}
                                            />
                                        </div>
                                    </button>

                                    {/* Expanded transaction list */}
                                    {isExpanded && (
                                        <div className="px-5 pb-5 border-t border-border">
                                            {b.transactions.length > 0 ? (
                                                <div className="pt-3">
                                                    <p className="text-xs text-muted-foreground mb-2">
                                                        {t('budget.transactionsCount', { count: b.transactions.length })}
                                                    </p>
                                                    <div className="flex flex-col gap-0.5 max-h-64 overflow-y-auto">
                                                        {b.transactions
                                                            .sort((a, c) => new Date(c.purchase_date) - new Date(a.purchase_date))
                                                            .map(tx => <TransactionRow key={tx.id} tx={tx} />)
                                                        }
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground pt-3">{t('budget.noTransactions')}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center">
                        <Wallet className="w-8 h-8 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">{t('budget.noHistory')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BudgetPage;
