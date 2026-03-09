import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMonth } from '../utils/formatters';

const BudgetForm = ({ currentBudget, onSave }) => {
    const { t, i18n } = useTranslation();
    const [amount, setAmount] = useState(currentBudget?.amount || '');
    const now = new Date();
    const monthName = formatMonth(now, i18n.language);

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(amount); }} className="flex flex-col gap-4">
            <p className="text-sm text-[#A0A0A8]">
                {t('budget.setBudgetFor')}{' '}
                <strong className="text-white font-medium">{monthName}</strong>
            </p>
            <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#A0A0A8] font-medium uppercase tracking-wider">
                    {t('budget.amount')}
                </label>
                <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder={t('budget.amountPlaceholder')}
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-3.5 py-2.5 bg-[#1A1A1F] border border-[#1F1F23] rounded-lg text-sm text-white font-mono focus:outline-none focus:border-[#FF5C00]/50 transition-colors placeholder:text-[#505058]"
                />
            </div>
            <button
                type="submit"
                className="w-full py-2.5 bg-[#FF5C00] hover:bg-[#FF5C00]/90 text-white text-sm font-medium rounded-lg transition-colors"
            >
                {t('common.save')}
            </button>
        </form>
    );
};

export default BudgetForm;
