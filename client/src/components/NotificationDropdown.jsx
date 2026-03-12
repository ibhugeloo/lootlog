import React, { useEffect, useRef, useMemo } from 'react';
import { AlertTriangle, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../utils/formatters';

const NotificationDropdown = ({ transactions, budget, exchangeRate, onClose }) => {
    const { t, i18n } = useTranslation();
    const ref = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onClose();
        };
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [onClose]);

    const budgetAlert = useMemo(() => {
        if (!budget || !budget.amount) return null;

        const now = new Date();
        const monthTransactions = transactions.filter(tx => {
            const d = new Date(tx.purchase_date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        const spent = monthTransactions.reduce((sum, tx) => {
            const price = parseFloat(tx.price) || 0;
            if (tx.currency === 'USD') return sum + price * exchangeRate;
            if (tx.currency === 'GBP') return sum + price * exchangeRate * 1.27;
            if (tx.currency === 'JPY') return sum + price * exchangeRate * 0.0067;
            return sum + price;
        }, 0);

        const percent = Math.round((spent / budget.amount) * 100);

        if (percent >= 100) {
            return { type: 'danger', message: t('notifications.budgetExceeded', { amount: (spent - budget.amount).toFixed(0) }), percent };
        }
        if (percent >= 80) {
            return { type: 'warning', message: t('notifications.budgetAlmost', { percent }), percent };
        }
        return null;
    }, [budget, transactions, exchangeRate, t]);

    const recentPurchases = useMemo(() => {
        return [...transactions]
            .sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date))
            .slice(0, 5);
    }, [transactions]);

    const hasNotifications = budgetAlert || recentPurchases.length > 0;

    return (
        <div
            ref={ref}
            className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-[#141417] border border-[#1F1F23] rounded-xl shadow-2xl z-50 overflow-hidden"
        >
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#1F1F23]">
                <span className="text-sm font-semibold text-white">{t('notifications.title')}</span>
            </div>

            {/* Items */}
            <div className="max-h-[300px] overflow-y-auto">
                {!hasNotifications && (
                    <div className="px-4 py-8 text-center text-sm text-[#505058]">
                        {t('notifications.empty')}
                    </div>
                )}

                {/* Budget alert */}
                {budgetAlert && (
                    <div className="px-4 py-3 border-b border-[#1F1F23] flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            budgetAlert.type === 'danger'
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-amber-500/10 text-amber-400'
                        }`}>
                            <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                        <div>
                            <div className="text-sm text-white">{t('notifications.budgetAlert')}</div>
                            <div className={`text-xs mt-1 ${budgetAlert.type === 'danger' ? 'text-red-400' : 'text-amber-400'}`}>
                                {budgetAlert.message}
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent purchases */}
                {recentPurchases.length > 0 && (
                    <>
                        <div className="px-4 py-2 border-b border-[#1F1F23]">
                            <span className="text-xs font-medium text-[#505058] uppercase tracking-wider">
                                {t('notifications.recentActivity')}
                            </span>
                        </div>
                        {recentPurchases.map(tx => (
                            <div key={tx.id} className="px-4 py-3 border-b border-[#1F1F23] last:border-b-0 flex items-start gap-3">
                                <div className="w-7 h-7 rounded-md bg-[#FF5C00]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <ShoppingCart className="w-3.5 h-3.5 text-[#FF5C00]" />
                                </div>
                                <div>
                                    <div className="text-sm text-white">{tx.title}</div>
                                    <div className="text-xs text-[#505058] mt-1">
                                        {parseFloat(tx.price || 0).toFixed(2)} {tx.currency || '€'} · {formatDate(tx.purchase_date, i18n.language)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;
