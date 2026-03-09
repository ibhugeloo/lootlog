import React from 'react';
import { Gamepad2, ArrowRight, BarChart3, Wallet, Target, Globe, Crown, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const PRICING_FEATURES = [
    { key: 'transactions', freeKey: 'pricingFeature50', premiumKey: 'pricingFeatureUnlimited' },
    { key: 'currencies', freeKey: 'pricingFeature1Currency', premiumKey: 'pricingFeatureMultiCurrency' },
    { key: 'charts', freeKey: 'pricingFeatureBasicCharts', premiumKey: 'pricingFeatureAdvancedCharts' },
    { key: 'budget', freeKey: null, premiumKey: 'pricingFeatureBudget' },
    { key: 'export', freeKey: null, premiumKey: 'pricingFeatureExport' },
    { key: 'covers', freeKey: null, premiumKey: 'pricingFeatureCovers' },
];

const LandingPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const goToLogin = () => navigate('/login');

    return (
        <div className="min-h-screen bg-background text-white">
            {/* Ambient gradient overlay */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
            </div>

            {/* ── NAV ── */}
            <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    {/* Brand */}
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Gamepad2 size={18} color="white" />
                        </div>
                        <span className="font-mono text-sm font-semibold tracking-widest text-white uppercase">
                            LOOTLOG
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            className="rounded-md border border-border px-3 py-1.5 font-mono text-xs font-medium text-secondary-foreground transition-colors hover:border-border-light hover:text-white"
                            onClick={() => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')}
                        >
                            {i18n.language === 'fr' ? 'EN' : 'FR'}
                        </button>
                        <button
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                            onClick={goToLogin}
                        >
                            {t('landing.cta')}
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="mx-auto max-w-4xl px-6 pb-24 pt-24 text-center">
                {/* Badge */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-secondary-foreground">
                    <Gamepad2 size={13} className="text-primary" />
                    Game Expense Tracker
                </div>

                <h1 className="font-serif text-[56px] font-normal leading-tight tracking-tight text-white">
                    {t('landing.heroTitle')}
                </h1>

                <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-secondary-foreground">
                    {t('landing.heroTagline')}
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <button
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        onClick={goToLogin}
                    >
                        {t('landing.heroCta')}
                        <ArrowRight size={16} />
                    </button>
                    <button
                        className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-border-light hover:bg-card"
                        onClick={goToLogin}
                    >
                        {t('landing.pricingFreeTitle')}
                    </button>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="mx-auto max-w-6xl px-6 pb-24">
                <h2 className="mb-12 text-center text-2xl font-semibold text-white">
                    {t('landing.featuresTitle')}
                </h2>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { icon: BarChart3, titleKey: 'landing.feature1Title', descKey: 'landing.feature1Desc' },
                        { icon: Wallet,    titleKey: 'landing.feature2Title', descKey: 'landing.feature2Desc' },
                        { icon: Target,    titleKey: 'landing.feature3Title', descKey: 'landing.feature3Desc' },
                        { icon: Globe,     titleKey: 'landing.feature4Title', descKey: 'landing.feature4Desc' },
                    ].map((feature, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-border-light"
                        >
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <feature.icon size={20} className="text-primary" />
                            </div>
                            <h3 className="mb-2 font-sans text-sm font-semibold text-white">
                                {t(feature.titleKey)}
                            </h3>
                            <p className="text-sm leading-relaxed text-secondary-foreground">
                                {t(feature.descKey)}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── PRICING ── */}
            <section className="mx-auto max-w-3xl px-6 pb-28">
                <h2 className="mb-12 text-center text-2xl font-semibold text-white">
                    {t('landing.pricingTitle')}
                </h2>

                <div className="grid gap-5 md:grid-cols-2">
                    {/* Free */}
                    <div className="flex flex-col rounded-2xl border border-border bg-card p-7">
                        <h3 className="mb-1 text-lg font-semibold text-white">
                            {t('landing.pricingFreeTitle')}
                        </h3>
                        <div className="mt-2 text-3xl font-bold text-white">
                            {t('landing.pricingFreePrice')}
                        </div>
                        <p className="mt-2 text-sm text-secondary-foreground">
                            {t('landing.pricingFreeDesc')}
                        </p>

                        <ul className="mt-6 flex flex-col gap-3">
                            {PRICING_FEATURES.map((f, i) => (
                                <li key={i} className="flex items-center gap-2.5 text-sm">
                                    {f.freeKey ? (
                                        <Check size={14} className="shrink-0 text-primary" />
                                    ) : (
                                        <X size={14} className="shrink-0 text-muted-foreground" />
                                    )}
                                    <span className={f.freeKey ? 'text-white' : 'text-muted-foreground'}>
                                        {f.freeKey ? t(`landing.${f.freeKey}`) : t(`landing.${f.premiumKey}`)}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <button
                            className="mt-8 w-full rounded-lg border border-border py-2.5 text-sm font-semibold text-white transition-colors hover:border-border-light hover:bg-muted"
                            onClick={goToLogin}
                        >
                            {t('landing.heroCta')}
                        </button>
                    </div>

                    {/* Premium */}
                    <div className="relative flex flex-col rounded-2xl border border-primary bg-card p-7">
                        {/* Popular badge */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                                <Crown size={11} />
                                Popular
                            </div>
                        </div>

                        <h3 className="mb-1 text-lg font-semibold text-white">
                            {t('landing.pricingPremiumTitle')}
                        </h3>
                        <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-white">
                                {t('landing.pricingPremiumPrice')}
                            </span>
                            <span className="text-sm text-secondary-foreground">
                                {t('landing.pricingPremiumPriceUnit')}
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-secondary-foreground">
                            {t('landing.pricingPremiumDesc')}
                            <br />
                            <span className="text-primary">{t('landing.pricingPremiumYearly')}</span>
                        </p>

                        <ul className="mt-6 flex flex-col gap-3">
                            {PRICING_FEATURES.map((f, i) => (
                                <li key={i} className="flex items-center gap-2.5 text-sm">
                                    <Check size={14} className="shrink-0 text-primary" />
                                    <span className="text-white">{t(`landing.${f.premiumKey}`)}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            className="mt-8 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                            onClick={goToLogin}
                        >
                            {t('landing.cta')}
                        </button>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="border-t border-border py-8">
                <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 sm:flex-row sm:justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                            <Gamepad2 size={13} color="white" />
                        </div>
                        <span className="font-mono text-xs font-semibold tracking-widest text-white uppercase">
                            LOOTLOG
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{t('landing.footerText')}</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
