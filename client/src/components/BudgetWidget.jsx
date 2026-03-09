import React from 'react';
import { Wallet, AlertTriangle } from 'lucide-react';
import { toEUR } from '../utils/currency';
import { useTranslation } from 'react-i18next';
import { formatMonth } from '../utils/formatters';

const BudgetWidget = ({ budget, transactions, exchangeRate = 0.92 }) => {
    const { t, i18n } = useTranslation();
    if (!budget) return null;

    const now = new Date();
    const currentMonthTx = transactions.filter(t => {
        const d = new Date(t.purchase_date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const spent = currentMonthTx.reduce((acc, t) => acc + toEUR(parseFloat(t.price) || 0, t.currency, exchangeRate), 0);
    const budgetAmount = parseFloat(budget.amount) || 0;
    const pct = budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 100) : 0;
    const remaining = budgetAmount - spent;
    const overBudget = spent > budgetAmount;

    const barColor = pct >= 100
        ? 'bg-red-500'
        : pct >= 80
        ? 'bg-amber-500'
        : 'bg-[#FF5C00]';

    const monthName = formatMonth(now, i18n.language);

    return (
        <div className="bg-[#141417] border border-[#1F1F23] rounded-xl px-6 py-5">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-[#FF5C00]" />
                <span className="text-xs text-[#A0A0A8] tracking-wide">
                    {t('budget.budgetFor', { month: monthName })}
                </span>
            </div>

            {/* Amounts */}
            <div className="flex items-baseline gap-2 mb-1">
                <span className={`font-mono text-2xl font-bold ${overBudget ? 'text-red-400' : 'text-white'}`}>
                    {spent.toFixed(2)} €
                </span>
                <span className="font-mono text-sm text-[#505058]">/ {budgetAmount.toFixed(2)} €</span>
            </div>

            {overBudget && (
                <div className="flex items-center gap-1.5 text-xs text-red-400 mb-3">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {t('budget.overBudget', { amount: Math.abs(remaining).toFixed(2) })}
                </div>
            )}

            {/* Progress bar */}
            <div className="flex flex-col gap-1.5 mt-3">
                <div className="w-full h-2 bg-[#1F1F23] rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${barColor}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-[#505058]">{t('budget.used', { percent: pct.toFixed(0) })}</span>
                    {pct >= 80 && !overBudget && (
                        <span className="text-xs text-amber-400">
                            {t('budget.remaining', { amount: remaining.toFixed(2) })}
                        </span>
                    )}
                    {!overBudget && pct < 80 && (
                        <span className="text-xs text-[#505058]">
                            {remaining > 0
                                ? t('budget.remaining', { amount: remaining.toFixed(2) })
                                : t('budget.exhausted')
                            }
                        </span>
                    )}
                    {overBudget && (
                        <span className="text-xs text-red-400">{t('budget.exhausted')}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BudgetWidget;
