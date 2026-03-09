import React, { useState } from 'react';
import { Crown, Check, X, Zap, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PRICE_IDS = {
    monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY,
    yearly: import.meta.env.VITE_STRIPE_PRICE_YEARLY,
};

const FEATURES = [
    { nameKey: 'upgrade.features.transactions', freeKey: 'upgrade.features.transactionsFree', premiumKey: 'upgrade.features.transactionsPremium', key: 'txn' },
    { nameKey: 'upgrade.features.currencies', freeKey: 'upgrade.features.currenciesFree', premiumKey: 'upgrade.features.currenciesPremium', key: 'currency' },
    { nameKey: 'upgrade.features.csvExport', free: false, premium: true, key: 'csv' },
    { nameKey: 'upgrade.features.monthlyBudget', free: false, premium: true, key: 'budget' },
    { nameKey: 'upgrade.features.rawgCovers', free: false, premium: true, key: 'rawg' },
    { nameKey: 'upgrade.features.advancedCharts', free: false, premium: true, key: 'charts' },
];

const UpgradeModal = ({ onClose, onCheckout, checkoutLoading }) => {
    const { t } = useTranslation();
    const [selectedPlan, setSelectedPlan] = useState('monthly');

    const handleCheckout = async () => {
        try {
            await onCheckout(PRICE_IDS[selectedPlan]);
        } catch (err) {
            console.error('Checkout failed:', err);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-[#0A0A0B]/60 flex items-center justify-center z-50"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="relative w-[560px] max-w-[calc(100vw-2rem)] bg-card rounded-2xl border border-white/[0.07] shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden">
                {/* Close button */}
                <button
                    onClick={onClose}
                    disabled={checkoutLoading}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/5 transition-colors text-muted-foreground hover:text-white z-10"
                >
                    <X size={16} />
                </button>

                {/* Header */}
                <div className="flex flex-col items-center text-center px-8 pt-8 pb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-b from-[#FF5C0030] to-[#FF5C0008] border border-[#FF5C0040] flex items-center justify-center mb-4">
                        <Crown size={26} className="text-primary" />
                    </div>
                    <h2 className="font-serif text-[28px] text-white m-0">{t('upgrade.title')}</h2>
                    <p className="text-sm text-muted-foreground mt-2">{t('upgrade.subtitle')}</p>
                </div>

                {/* Plan toggle */}
                <div className="flex gap-3 px-8 pb-5">
                    <button
                        onClick={() => setSelectedPlan('monthly')}
                        className={`flex-1 p-4 rounded-xl border text-center cursor-pointer transition-all ${
                            selectedPlan === 'monthly'
                                ? 'border-primary/60 bg-primary/10'
                                : 'border-white/[0.06] bg-transparent hover:border-white/10'
                        }`}
                    >
                        <div className={`text-2xl font-extrabold font-mono ${selectedPlan === 'monthly' ? 'text-primary' : 'text-white'}`}>
                            3,99€
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{t('upgrade.monthly')}</div>
                    </button>

                    <button
                        onClick={() => setSelectedPlan('yearly')}
                        className={`relative flex-1 p-4 rounded-xl border text-center cursor-pointer transition-all ${
                            selectedPlan === 'yearly'
                                ? 'border-primary/60 bg-primary/10'
                                : 'border-white/[0.06] bg-transparent hover:border-white/10'
                        }`}
                    >
                        <div className="absolute -top-2.5 right-2.5 bg-gradient-to-r from-primary to-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            -17%
                        </div>
                        <div className={`text-2xl font-extrabold font-mono ${selectedPlan === 'yearly' ? 'text-primary' : 'text-white'}`}>
                            39,99€
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{t('upgrade.yearly')}</div>
                    </button>
                </div>

                {/* Feature comparison */}
                <div className="flex gap-3 px-8 pb-6">
                    {/* Free plan */}
                    <div className="flex-1 bg-[#1A1A1F] rounded-xl border border-white/[0.04] p-5">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                            {t('upgrade.free')}
                        </div>
                        <div className="flex flex-col gap-2.5">
                            {FEATURES.map(f => (
                                <div key={f.key} className="flex items-center gap-2">
                                    {typeof f.free === 'boolean' ? (
                                        f.free
                                            ? <Check size={14} className="text-primary flex-shrink-0" />
                                            : <X size={14} className="text-[#3A3A3F] flex-shrink-0" />
                                    ) : (
                                        <Check size={14} className="text-muted-foreground flex-shrink-0" />
                                    )}
                                    <span className="text-xs text-muted-foreground leading-tight">
                                        {typeof f.free === 'boolean'
                                            ? t(f.nameKey)
                                            : t(f.freeKey)
                                        }
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Premium plan */}
                    <div className="flex-1 bg-[#1A1A1F] rounded-xl border-[1.5px] border-[#FF5C0040] p-5">
                        <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">
                            {t('upgrade.premium')}
                        </div>
                        <div className="flex flex-col gap-2.5">
                            {FEATURES.map(f => (
                                <div key={f.key} className="flex items-center gap-2">
                                    <Check size={14} className="text-primary flex-shrink-0" />
                                    <span className="text-xs text-white leading-tight font-medium">
                                        {typeof f.premium === 'boolean'
                                            ? t(f.nameKey)
                                            : t(f.premiumKey)
                                        }
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="px-8 pb-5">
                    <button
                        className="w-full h-10 rounded-lg bg-primary text-sm font-semibold text-white flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
                        onClick={handleCheckout}
                        disabled={checkoutLoading}
                    >
                        {checkoutLoading ? (
                            <>
                                <Loader size={16} className="animate-spin" />
                                {t('upgrade.redirecting')}
                            </>
                        ) : (
                            <>
                                <Zap size={16} />
                                {t('upgrade.ctaButton')}
                            </>
                        )}
                    </button>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-4 px-8 pb-6">
                    <span className="text-xs text-muted-foreground">30-day money back</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Cancel anytime</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Secure payment</span>
                </div>

                <div className="pb-4 text-center">
                    <button
                        onClick={onClose}
                        disabled={checkoutLoading}
                        className="text-xs text-muted-foreground hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                    >
                        {t('upgrade.continueFree')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
