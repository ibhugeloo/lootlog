import React, { useState } from 'react';
import { ArrowLeft, Gamepad2, Calendar, CreditCard, FileText, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PLATFORMS = ['PC', 'Steam', 'PS5', 'PS4', 'Switch', 'Xbox Series', 'Xbox One', 'Mobile'];
const CATEGORIES = ['gaming', 'cloud_gaming', 'online_multiplayer', 'game_library', 'content', 'other'];
const BILLING_CYCLES = ['monthly', 'quarterly', 'yearly'];
const PAYMENT_METHODS = ['credit_card', 'debit_card', 'paypal', 'gift_card', 'other'];
const STATUSES = ['active', 'paused', 'cancelled', 'expired'];
const COLOR_PRESETS = ['#22C55E', '#3B82F6', '#FF5C00', '#EF4444', '#A855F7', '#F59E0B', '#EC4899', '#6B7280'];

const SubscriptionAddForm = ({ onSave, onCancel, initialData }) => {
    const { t } = useTranslation();
    const isEditing = !!initialData;

    const [serviceName, setServiceName] = useState(initialData?.service_name || '');
    const [category, setCategory] = useState(initialData?.category || '');
    const [platform, setPlatform] = useState(initialData?.platform || '');
    const [price, setPrice] = useState(initialData?.price != null ? String(initialData.price) : '');
    const [currency, setCurrency] = useState(initialData?.currency || 'EUR');
    const [billingCycle, setBillingCycle] = useState(initialData?.billing_cycle || 'monthly');
    const [paymentMethod, setPaymentMethod] = useState(initialData?.payment_method || '');
    const [startDate, setStartDate] = useState(initialData?.start_date || '');
    const [nextRenewal, setNextRenewal] = useState(initialData?.next_renewal || '');
    const [autoRenewal, setAutoRenewal] = useState(initialData?.auto_renewal ?? true);
    const [status, setStatus] = useState(initialData?.status || 'active');
    const [notes, setNotes] = useState(initialData?.notes || '');
    const [renewalReminders, setRenewalReminders] = useState(initialData?.renewal_reminders ?? false);
    const [tags, setTags] = useState(initialData?.tags || []);
    const [tagInput, setTagInput] = useState('');
    const [color, setColor] = useState(initialData?.color || '#FF5C00');

    const handleSubmit = () => {
        if (!serviceName.trim()) return;
        onSave({
            service_name: serviceName.trim(),
            category: category || 'gaming',
            platform: platform || 'PC',
            price: parseFloat(price) || 0,
            currency,
            billing_cycle: billingCycle,
            payment_method: paymentMethod || null,
            start_date: startDate || new Date().toISOString().split('T')[0],
            next_renewal: nextRenewal || null,
            auto_renewal: autoRenewal,
            status,
            notes,
            renewal_reminders: renewalReminders,
            tags,
            color,
        }, initialData?.id || null);
    };

    const addTag = () => {
        const trimmed = tagInput.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
        }
        setTagInput('');
    };

    const removeTag = (tag) => {
        setTags(tags.filter(t => t !== tag));
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    const inputClass = "w-full px-3.5 py-2.5 bg-[#111113] border border-[#1F1F23] rounded-lg text-sm text-white placeholder:text-[#505058] outline-none focus:border-primary/50 transition-colors";
    const labelClass = "text-xs text-muted-foreground font-medium uppercase tracking-wider";

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-semibold text-white">
                        {isEditing ? t('subscriptions.editSubscription') : t('subscriptions.addSubscription')}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">{t('subscriptions.subtitle')}</p>
                </div>
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('subscriptions.backToSubscriptions')}
                </button>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
                {/* Left column */}
                <div className="flex flex-col gap-6">
                    {/* Service Information */}
                    <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
                        <div className="flex items-center gap-2">
                            <Gamepad2 className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-semibold text-white">{t('subscriptions.serviceInformation')}</h3>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>{t('subscriptions.serviceName')}</label>
                            <input
                                type="text"
                                value={serviceName}
                                onChange={e => setServiceName(e.target.value)}
                                placeholder={t('subscriptions.serviceNamePlaceholder')}
                                className={inputClass}
                                autoFocus
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>{t('subscriptions.category')}</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className={`${inputClass} appearance-none`}
                            >
                                <option value="">{t('subscriptions.selectCategory')}</option>
                                {CATEGORIES.map(c => (
                                    <option key={c} value={c}>{t(`subscriptions.categories.${c}`)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>{t('form.platform')}</label>
                            <select
                                value={platform}
                                onChange={e => setPlatform(e.target.value)}
                                className={`${inputClass} appearance-none`}
                            >
                                <option value="">{t('subscriptions.selectPlatform')}</option>
                                {PLATFORMS.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Pricing & Billing */}
                    <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-semibold text-white">{t('subscriptions.pricingBilling')}</h3>
                        </div>

                        <div className="grid grid-cols-[2fr_1fr] gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>{t('subscriptions.price')}</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    placeholder="14.99"
                                    className={inputClass}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>{t('subscriptions.currency')}</label>
                                <select
                                    value={currency}
                                    onChange={e => setCurrency(e.target.value)}
                                    className={`${inputClass} appearance-none`}
                                >
                                    <option value="EUR">EUR</option>
                                    <option value="USD">USD</option>
                                    <option value="GBP">GBP</option>
                                    <option value="JPY">JPY</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>{t('subscriptions.billingCycle')}</label>
                            <select
                                value={billingCycle}
                                onChange={e => setBillingCycle(e.target.value)}
                                className={`${inputClass} appearance-none`}
                            >
                                {BILLING_CYCLES.map(c => (
                                    <option key={c} value={c}>{t(`subscriptions.billingCycles.${c}`)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>{t('subscriptions.paymentMethod')}</label>
                            <select
                                value={paymentMethod}
                                onChange={e => setPaymentMethod(e.target.value)}
                                className={`${inputClass} appearance-none`}
                            >
                                <option value="">{t('subscriptions.selectPaymentMethod')}</option>
                                {PAYMENT_METHODS.map(m => (
                                    <option key={m} value={m}>{t(`subscriptions.paymentMethods.${m}`)}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-6">
                    {/* Dates & Status */}
                    <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-semibold text-white">{t('subscriptions.datesStatus')}</h3>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>{t('subscriptions.startDate')}</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>{t('subscriptions.nextRenewalDate')}</label>
                            <input
                                type="date"
                                value={nextRenewal}
                                onChange={e => setNextRenewal(e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className={labelClass}>{t('subscriptions.autoRenewal')}</label>
                            <button
                                type="button"
                                onClick={() => setAutoRenewal(!autoRenewal)}
                                className={`w-11 h-6 rounded-full transition-colors relative ${autoRenewal ? 'bg-primary' : 'bg-[#2F2F35]'}`}
                            >
                                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${autoRenewal ? 'left-[22px]' : 'left-0.5'}`} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>{t('subscriptions.status')}</label>
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                className={`${inputClass} appearance-none`}
                            >
                                {STATUSES.map(s => (
                                    <option key={s} value={s}>{t(`subscriptions.statuses.${s}`)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-semibold text-white">{t('subscriptions.notesSection')}</h3>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder={t('subscriptions.notesPlaceholder')}
                                rows={3}
                                className={`${inputClass} resize-none`}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className={labelClass}>{t('subscriptions.renewalReminders')}</label>
                                <p className="text-[11px] text-muted-foreground mt-0.5">{t('subscriptions.renewalRemindersDesc')}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setRenewalReminders(!renewalReminders)}
                                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${renewalReminders ? 'bg-primary' : 'bg-[#2F2F35]'}`}
                            >
                                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${renewalReminders ? 'left-[22px]' : 'left-0.5'}`} />
                            </button>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-col gap-2">
                            <label className={labelClass}>{t('subscriptions.tags')}</label>
                            <div className="flex items-center gap-2 flex-wrap">
                                {tags.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1F1F23] border border-[#2F2F35] text-xs text-white">
                                        {tag}
                                        <button onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-white ml-0.5">&times;</button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    onBlur={addTag}
                                    placeholder={tags.length === 0 ? t('subscriptions.tagsPlaceholder') : '+ Add'}
                                    className="bg-transparent text-sm text-white placeholder:text-[#505058] outline-none w-24"
                                />
                            </div>
                        </div>

                        {/* Color picker */}
                        <div className="flex flex-col gap-2">
                            <label className={labelClass}>{t('subscriptions.cardColor')}</label>
                            <div className="flex items-center gap-2">
                                {COLOR_PRESETS.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0A0A0B] scale-110' : 'hover:scale-110'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 text-sm text-muted-foreground hover:text-white transition-colors"
                >
                    {t('subscriptions.cancel')}
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!serviceName.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <RefreshCw className="w-4 h-4" />
                    {t('subscriptions.saveSubscription')}
                </button>
            </div>
        </div>
    );
};

export default SubscriptionAddForm;
