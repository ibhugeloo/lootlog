import React, { useState } from 'react';
import { X, User, Crown, CreditCard, Palette, Shield, LogOut, AlertTriangle, Key, Eye, EyeOff, Trash2, Lock, Globe, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabaseClient';
import { AVATAR_OPTIONS } from '../constants/avatars';

const SettingsPage = ({ onClose, profile, updateProfile, plan, isPremium, onCancelSubscription, onSignOut, onDeleteAccount, userEmail }) => {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('profile');
    const [displayName, setDisplayName] = useState(profile.display_name || '');
    const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar || '🎮');
    const [defaultCurrency, setDefaultCurrency] = useState(profile.default_currency || 'EUR');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    // Password change state
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    const handleSaveProfile = async () => {
        setSaving(true);
        setSaveError('');
        const success = await updateProfile({
            display_name: displayName,
            avatar: selectedAvatar,
            default_currency: defaultCurrency,
        });
        setSaving(false);
        if (success) {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } else {
            setSaveError(t('settings.profile.saveError'));
        }
    };

    const handleChangePassword = async () => {
        setPasswordMessage({ type: '', text: '' });

        if (newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: t('settings.security.passwordMinLength') });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: t('settings.security.passwordMismatch') });
            return;
        }

        setPasswordSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setPasswordMessage({ type: 'success', text: t('settings.security.passwordChanged') });
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPasswordMessage({ type: 'error', text: err.message || t('settings.security.passwordChangeError') });
        } finally {
            setPasswordSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        setDeleteError('');
        try {
            await onDeleteAccount();
        } catch (err) {
            setDeleteError(err.message || t('settings.security.deleteError'));
            setDeleting(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (onCancelSubscription) {
            await onCancelSubscription();
        }
        setShowCancelConfirm(false);
    };

    const inputClass = "w-full px-3.5 py-2.5 bg-secondary border border-border rounded-lg text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors";
    const selectClass = "w-full px-3.5 py-2.5 bg-secondary border border-border rounded-lg text-sm text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none";

    const tabs = [
        { id: 'profile', label: t('settings.tabs.profile'), icon: User },
        { id: 'subscription', label: t('settings.tabs.subscription'), icon: CreditCard },
        { id: 'preferences', label: t('settings.tabs.preferences'), icon: Palette },
        { id: 'security', label: t('settings.tabs.security'), icon: Shield },
    ];

    return (
        <div className="flex flex-col gap-8">
            {/* Tab navigation */}
            <div className="flex gap-1 bg-secondary border border-border rounded-xl p-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === tab.id
                                ? 'bg-card text-white shadow-sm'
                                : 'text-muted-foreground hover:text-white'
                        }`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon size={15} />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="flex flex-col gap-6">
                    {/* Avatar section */}
                    <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
                        <div className="flex items-center gap-3">
                            <User size={18} className="text-primary" />
                            <h3 className="text-[15px] font-semibold text-white">{t('settings.profile.avatar')}</h3>
                        </div>

                        {/* Selected avatar preview */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl flex-shrink-0">
                                {selectedAvatar}
                            </div>
                            <div>
                                <p className="text-sm text-white font-medium">{displayName || t('settings.profile.displayNamePlaceholder')}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{userEmail}</p>
                            </div>
                        </div>

                        {/* Avatar grid */}
                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                            {AVATAR_OPTIONS.map(emoji => (
                                <button
                                    key={emoji}
                                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                                        selectedAvatar === emoji
                                            ? 'bg-primary/20 ring-2 ring-primary'
                                            : 'bg-secondary hover:bg-muted'
                                    }`}
                                    onClick={() => setSelectedAvatar(emoji)}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Display name */}
                    <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
                        <div className="flex items-center gap-3">
                            <User size={18} className="text-primary" />
                            <h3 className="text-[15px] font-semibold text-white">{t('settings.profile.displayName')}</h3>
                        </div>
                        <input
                            type="text"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            placeholder={t('settings.profile.displayNamePlaceholder')}
                            className={inputClass}
                        />

                        {saveError && (
                            <p className="text-sm text-destructive">{saveError}</p>
                        )}

                        <button
                            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                            onClick={handleSaveProfile}
                            disabled={saving}
                        >
                            {saving ? t('common.saving') : saved ? `✓ ${t('common.saved')}` : t('common.save')}
                        </button>
                    </div>
                </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
                <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                        <CreditCard size={18} className="text-primary" />
                        <h3 className="text-[15px] font-semibold text-white">{t('settings.tabs.subscription')}</h3>
                    </div>

                    {/* Plan card */}
                    <div className="flex items-center gap-3 bg-secondary border border-border rounded-xl p-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isPremium
                                ? 'bg-gradient-to-b from-[#FF5C0030] to-[#FF5C0008] border border-[#FF5C0040]'
                                : 'bg-muted'
                        }`}>
                            <Crown size={20} className={isPremium ? 'text-primary' : 'text-muted-foreground'} />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-white">
                                {isPremium ? t('settings.subscription.planPremium') : t('settings.subscription.planFree')}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                                {isPremium ? t('settings.subscription.premiumDescription') : t('settings.subscription.freeDescription')}
                            </div>
                        </div>
                    </div>

                    {isPremium ? (
                        <>
                            {!showCancelConfirm ? (
                                <button
                                    className="w-full py-2.5 bg-destructive/10 text-destructive border border-destructive/30 text-sm font-medium rounded-lg hover:bg-destructive/20 transition-colors"
                                    onClick={() => setShowCancelConfirm(true)}
                                >
                                    {t('settings.subscription.cancelSubscription')}
                                </button>
                            ) : (
                                <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle size={16} className="text-destructive flex-shrink-0" />
                                        <strong className="text-sm text-destructive">{t('settings.subscription.confirmCancel')}</strong>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('settings.subscription.cancelWarning')}
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            className="flex-1 py-2 bg-secondary border border-border text-sm text-white rounded-lg hover:bg-muted transition-colors"
                                            onClick={() => setShowCancelConfirm(false)}
                                        >
                                            {t('settings.subscription.cancel')}
                                        </button>
                                        <button
                                            className="flex-1 py-2 bg-destructive text-sm text-white rounded-lg hover:bg-destructive/90 transition-colors"
                                            onClick={handleCancelSubscription}
                                        >
                                            {t('settings.subscription.confirm')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center">
                            {t('settings.subscription.upgradeCta')}
                        </p>
                    )}
                </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
                <div className="flex flex-col gap-6">
                    {/* Language */}
                    <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
                        <div className="flex items-center gap-3">
                            <Globe size={18} className="text-primary" />
                            <h3 className="text-[15px] font-semibold text-white">{t('settings.preferences.language')}</h3>
                        </div>
                        <select
                            value={i18n.language}
                            onChange={e => i18n.changeLanguage(e.target.value)}
                            className={selectClass}
                        >
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                        </select>
                    </div>

                    {/* Default currency */}
                    <div className="relative bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
                        {!isPremium && (
                            <div className="absolute inset-0 bg-card/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3 z-10 min-h-[150px]">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                    <Lock size={16} className="text-muted-foreground" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-white">{t('settings.preferences.defaultCurrency')}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{t('common.premiumFeature')}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <DollarSign size={18} className="text-primary" />
                            <h3 className="text-[15px] font-semibold text-white">{t('settings.preferences.defaultCurrency')}</h3>
                        </div>
                        <select
                            value={defaultCurrency}
                            onChange={e => setDefaultCurrency(e.target.value)}
                            disabled={!isPremium}
                            className={selectClass}
                        >
                            <option value="EUR">🇪🇺 EUR — Euro</option>
                            <option value="USD">🇺🇸 USD — Dollar</option>
                            <option value="GBP">🇬🇧 GBP — Livre</option>
                            <option value="JPY">🇯🇵 JPY — Yen</option>
                        </select>
                    </div>

                    <button
                        className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 self-start"
                        onClick={handleSaveProfile}
                        disabled={saving}
                    >
                        {saving ? t('common.saving') : saved ? `✓ ${t('common.saved')}` : t('common.save')}
                    </button>
                </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <div className="flex flex-col gap-6">
                    {/* Account info */}
                    <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
                        <div className="flex items-center gap-3">
                            <Shield size={18} className="text-primary" />
                            <h3 className="text-[15px] font-semibold text-white">{t('settings.security.account')}</h3>
                        </div>
                        <div className="bg-secondary border border-border rounded-lg px-4 py-3">
                            <div className="text-xs text-muted-foreground mb-1">{t('settings.security.email')}</div>
                            <div className="text-sm font-medium text-white">{userEmail}</div>
                        </div>
                    </div>

                    {/* Change password */}
                    <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
                        <div className="flex items-center gap-3">
                            <Key size={18} className="text-primary" />
                            <h3 className="text-[15px] font-semibold text-white">{t('settings.security.changePassword')}</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-muted-foreground">
                                    {t('settings.security.newPassword')}
                                </label>
                                <div className="relative">
                                    <Key size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder={t('settings.security.newPasswordPlaceholder')}
                                        className={`${inputClass} pl-9 pr-9`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-muted-foreground">
                                    {t('settings.security.confirmPassword')}
                                </label>
                                <div className="relative">
                                    <Key size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder={t('settings.security.confirmPlaceholder')}
                                        className={`${inputClass} pl-9`}
                                    />
                                </div>
                            </div>
                        </div>

                        {passwordMessage.text && (
                            <p className={`text-sm ${passwordMessage.type === 'error' ? 'text-destructive' : 'text-green-500'}`}>
                                {passwordMessage.text}
                            </p>
                        )}

                        <button
                            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 self-start"
                            onClick={handleChangePassword}
                            disabled={passwordSaving || !newPassword}
                        >
                            {passwordSaving ? t('settings.security.passwordChanging') : t('settings.security.changePasswordButton')}
                        </button>
                    </div>

                    {/* Sign out */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <button
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-secondary border border-border text-sm text-white rounded-lg hover:bg-muted transition-colors"
                            onClick={onSignOut}
                        >
                            <LogOut size={16} />
                            {t('settings.security.signOut')}
                        </button>
                    </div>

                    {/* Danger zone */}
                    <div className="bg-card border border-destructive/20 rounded-xl p-6 flex flex-col gap-5">
                        <div className="flex items-center gap-3">
                            <AlertTriangle size={18} className="text-destructive" />
                            <h3 className="text-[15px] font-semibold text-destructive">{t('settings.security.dangerZone')}</h3>
                        </div>

                        {!showDeleteConfirm ? (
                            <button
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-destructive/10 text-destructive border border-destructive/30 text-sm font-medium rounded-lg hover:bg-destructive/20 transition-colors"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                <Trash2 size={15} />
                                {t('settings.security.deleteAccount')}
                            </button>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle size={16} className="text-destructive flex-shrink-0" />
                                    <strong className="text-sm text-destructive">{t('settings.security.deleteConfirmTitle')}</strong>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t('settings.security.deleteWarning')}
                                </p>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={e => setDeleteConfirmText(e.target.value)}
                                    placeholder={t('settings.security.deleteConfirmPlaceholder')}
                                    className={inputClass}
                                />
                                {deleteError && (
                                    <p className="text-sm text-destructive">{deleteError}</p>
                                )}
                                <div className="flex gap-3">
                                    <button
                                        className="flex-1 py-2 bg-secondary border border-border text-sm text-white rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                                        onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); setDeleteError(''); }}
                                        disabled={deleting}
                                    >
                                        {t('settings.subscription.cancel')}
                                    </button>
                                    <button
                                        className="flex-1 py-2 bg-destructive text-sm text-white rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50"
                                        onClick={handleDeleteAccount}
                                        disabled={deleteConfirmText !== 'SUPPRIMER' || deleting}
                                    >
                                        {deleting ? t('settings.security.deleting') : t('settings.security.deleteConfirmButton')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
