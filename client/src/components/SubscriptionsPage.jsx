import React, { useMemo, useState } from 'react';
import { RefreshCw, Plus, DollarSign, Calendar, Wallet, Trash2 } from 'lucide-react';
import { toEUR } from '../utils/currency';
import { useTranslation } from 'react-i18next';
import SubscriptionAddForm from './SubscriptionAddForm';

const STATUS_COLORS = {
    active: 'bg-green-500/20 text-green-400',
    paused: 'bg-amber-500/20 text-amber-400',
    cancelled: 'bg-red-500/20 text-red-400',
    expired: 'bg-[#1F1F23] text-muted-foreground',
};

const SubscriptionsPage = ({ subscriptions, loading, onSave, onDelete, exchangeRate }) => {
    const { t, i18n } = useTranslation();
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState(null);

    const activeSubs = useMemo(() => {
        return subscriptions.filter(s => s.status === 'active');
    }, [subscriptions]);

    const monthlyCost = useMemo(() => {
        return activeSubs.reduce((sum, s) => {
            const priceEUR = toEUR(parseFloat(s.price) || 0, s.currency, exchangeRate);
            if (s.billing_cycle === 'quarterly') return sum + priceEUR / 3;
            if (s.billing_cycle === 'yearly') return sum + priceEUR / 12;
            return sum + priceEUR;
        }, 0);
    }, [activeSubs, exchangeRate]);

    const nextRenewalDate = useMemo(() => {
        const now = new Date();
        const upcoming = activeSubs
            .filter(s => s.next_renewal)
            .map(s => new Date(s.next_renewal))
            .filter(d => d >= now)
            .sort((a, b) => a - b);
        return upcoming[0] || null;
    }, [activeSubs]);

    const upcomingRenewals = useMemo(() => {
        return activeSubs
            .filter(s => s.next_renewal)
            .sort((a, b) => new Date(a.next_renewal) - new Date(b.next_renewal));
    }, [activeSubs]);

    const getDaysUntil = (dateStr) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const target = new Date(dateStr);
        target.setHours(0, 0, 0, 0);
        return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const formatShortDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
            month: 'short', day: 'numeric'
        });
    };

    const getMonthlyPrice = (s) => {
        const priceEUR = toEUR(parseFloat(s.price) || 0, s.currency, exchangeRate);
        if (s.billing_cycle === 'quarterly') return priceEUR / 3;
        if (s.billing_cycle === 'yearly') return priceEUR / 12;
        return priceEUR;
    };

    const handleSave = async (data, editingId) => {
        await onSave(data, editingId);
        setShowAddForm(false);
        setEditingSubscription(null);
    };

    const handleEdit = (sub) => {
        setEditingSubscription(sub);
        setShowAddForm(true);
    };

    const handleCancel = () => {
        setShowAddForm(false);
        setEditingSubscription(null);
    };

    // Show add/edit form
    if (showAddForm) {
        return (
            <SubscriptionAddForm
                onSave={handleSave}
                onCancel={handleCancel}
                initialData={editingSubscription}
            />
        );
    }

    // Empty state
    if (!loading && subscriptions.length === 0) {
        return (
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-serif text-2xl font-semibold text-white">{t('subscriptions.title')}</h1>
                        <p className="text-sm text-muted-foreground mt-1">{t('subscriptions.subtitle')}</p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <RefreshCw className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-base font-semibold text-white mb-1">{t('subscriptions.emptyTitle')}</h3>
                        <p className="text-sm text-muted-foreground">{t('subscriptions.emptyDescription')}</p>
                    </div>
                    <button
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors"
                        onClick={() => setShowAddForm(true)}
                    >
                        <Plus className="w-4 h-4" />
                        {t('subscriptions.addSubscription')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="font-serif text-2xl font-semibold text-white">{t('subscriptions.title')}</h1>
                    <span className="px-2.5 py-1 rounded-full bg-[#1F1F23] text-xs font-medium text-muted-foreground">
                        {t('subscriptions.activeCount', { count: activeSubs.length })}
                    </span>
                </div>
                <button
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors"
                    onClick={() => setShowAddForm(true)}
                >
                    <Plus className="w-4 h-4" />
                    {t('subscriptions.addSubscription')}
                </button>
            </div>

            {/* Subtitle */}
            <p className="text-sm text-muted-foreground -mt-5">{t('subscriptions.subtitle')}</p>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{t('subscriptions.monthlyCost')}</p>
                        <p className="text-2xl font-bold text-white font-mono">{monthlyCost.toFixed(2)} EUR</p>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <RefreshCw className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{t('subscriptions.activeSubscriptions')}</p>
                        <p className="text-2xl font-bold text-white font-mono">{activeSubs.length}</p>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{t('subscriptions.nextRenewal')}</p>
                        <p className="text-2xl font-bold text-white font-mono">
                            {nextRenewalDate ? formatShortDate(nextRenewalDate) : t('subscriptions.noNextRenewal')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Subscription cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {subscriptions.map(sub => {
                    const statusColor = STATUS_COLORS[sub.status] || STATUS_COLORS.expired;
                    const priceVal = parseFloat(sub.price) || 0;

                    return (
                        <div key={sub.id} className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
                            {/* Colored top border */}
                            <div className="h-1" style={{ backgroundColor: sub.color || '#FF5C00' }} />

                            <div className="p-5 flex flex-col gap-3 flex-1">
                                {/* Icon + Name */}
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                                        style={{ backgroundColor: `${sub.color || '#FF5C00'}20` }}
                                    >
                                        {sub.icon_url ? (
                                            <img src={sub.icon_url} alt="" className="w-6 h-6 rounded object-cover" />
                                        ) : (
                                            <span style={{ color: sub.color || '#FF5C00' }}>
                                                {sub.service_name.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-sm font-semibold text-white truncate">{sub.service_name}</h3>
                                </div>

                                {/* Price */}
                                <p className="font-mono text-lg font-bold text-primary">
                                    {priceVal.toFixed(2)} {sub.currency}{t(`subscriptions.billingCycleShort.${sub.billing_cycle}`)}
                                </p>

                                {/* Status + Renewal */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${statusColor}`}>
                                        {t(`subscriptions.statuses.${sub.status}`)}
                                    </span>
                                    {sub.next_renewal && (
                                        <span className="text-xs text-muted-foreground">
                                            {t('subscriptions.renewsOn', { date: formatDate(sub.next_renewal) })}
                                        </span>
                                    )}
                                </div>

                                {/* Spacer */}
                                <div className="flex-1" />

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-2 border-t border-border">
                                    <button
                                        onClick={() => handleEdit(sub)}
                                        className="flex-1 py-2 text-sm text-muted-foreground hover:text-white border border-border rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        {t('subscriptions.manage')}
                                    </button>
                                    <button
                                        onClick={() => onDelete(sub.id)}
                                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                                        title={t('common.delete')}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom: Spending Overview + Upcoming Renewals */}
            {activeSubs.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Spending Overview */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <Wallet className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-semibold text-white">{t('subscriptions.spendingOverview')}</h3>
                        </div>

                        {/* Monthly total */}
                        <div className="flex items-center justify-between mb-5">
                            <span className="text-sm text-muted-foreground">{t('subscriptions.monthlyTotal')}</span>
                            <span className="text-2xl font-bold text-white font-mono">{monthlyCost.toFixed(2)} &euro;</span>
                        </div>

                        {/* Per-service breakdown */}
                        <div className="flex flex-col gap-3 mb-5">
                            {activeSubs.map(sub => {
                                const monthly = getMonthlyPrice(sub);
                                return (
                                    <div key={sub.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color || '#FF5C00' }} />
                                            <span className="text-sm text-white">{sub.service_name}</span>
                                        </div>
                                        <span className="font-mono text-sm text-white">{monthly.toFixed(2)} &euro;</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Yearly estimate */}
                        <div className="flex items-center justify-between pt-4 border-t border-border mb-4">
                            <span className="text-sm text-muted-foreground">{t('subscriptions.yearlyEstimate')}</span>
                            <span className="font-mono text-lg font-bold text-primary">{(monthlyCost * 12).toFixed(2)} &euro;</span>
                        </div>

                        {/* Cost distribution bar */}
                        <div className="flex flex-col gap-2">
                            <span className="text-xs text-muted-foreground">{t('subscriptions.costDistribution')}</span>
                            <div className="flex h-3 rounded-full overflow-hidden">
                                {activeSubs.map(sub => {
                                    const monthly = getMonthlyPrice(sub);
                                    const pct = monthlyCost > 0 ? (monthly / monthlyCost) * 100 : 0;
                                    return (
                                        <div
                                            key={sub.id}
                                            className="h-full first:rounded-l-full last:rounded-r-full"
                                            style={{ width: `${pct}%`, backgroundColor: sub.color || '#FF5C00' }}
                                            title={`${sub.service_name}: ${pct.toFixed(0)}%`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Renewals */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <Calendar className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-semibold text-white">{t('subscriptions.upcomingRenewals')}</h3>
                        </div>

                        <div className="flex flex-col gap-2">
                            {upcomingRenewals.map(sub => {
                                const days = getDaysUntil(sub.next_renewal);
                                const priceEUR = toEUR(parseFloat(sub.price) || 0, sub.currency, exchangeRate);
                                let daysBadgeClass = 'bg-[#1F1F23] text-muted-foreground';
                                let daysLabel = t('subscriptions.daysUntil', { count: days });
                                if (days < 0) {
                                    daysBadgeClass = 'bg-red-500/20 text-red-400';
                                    daysLabel = t('subscriptions.overdue');
                                } else if (days === 0) {
                                    daysBadgeClass = 'bg-red-500/20 text-red-400';
                                    daysLabel = t('subscriptions.today');
                                } else if (days <= 7) {
                                    daysBadgeClass = 'bg-amber-500/20 text-amber-400';
                                }

                                return (
                                    <div key={sub.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color || '#FF5C00' }} />
                                            <div>
                                                <span className="text-sm text-white">{sub.service_name}</span>
                                                <span className="text-xs text-muted-foreground block">
                                                    {t('subscriptions.renewsOn', { date: formatDate(sub.next_renewal) })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-sm font-medium text-primary">{priceEUR.toFixed(2)} EUR</span>
                                            <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${daysBadgeClass}`}>
                                                {daysLabel}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {upcomingRenewals.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">{t('subscriptions.noNextRenewal')}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionsPage;
