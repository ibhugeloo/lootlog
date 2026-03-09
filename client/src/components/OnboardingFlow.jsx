import React, { useState } from 'react';
import { Gamepad2, ArrowRight, ArrowLeft, Check, BarChart3, Wallet, Target, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AVATAR_OPTIONS } from '../constants/avatars';
import { trackEvent } from '../posthog';

const TOTAL_STEPS = 4;

const OnboardingFlow = ({ profile, onComplete }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [avatar, setAvatar] = useState(profile.avatar || '🎮');
    const [displayName, setDisplayName] = useState(profile.display_name || '');
    const [currency, setCurrency] = useState(profile.default_currency || 'EUR');
    const [saving, setSaving] = useState(false);

    const handleNext = () => {
        if (step < TOTAL_STEPS) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleFinish = async () => {
        setSaving(true);
        await onComplete({
            avatar,
            display_name: displayName,
            default_currency: currency,
        });
        trackEvent('onboarding_completed', { avatar, currency, step: 'finish' });
        setSaving(false);
    };

    const handleSkip = async () => {
        setSaving(true);
        await onComplete({
            avatar,
            display_name: displayName,
            default_currency: currency,
        });
        trackEvent('onboarding_completed', { avatar, currency, step: `skip_step_${step}` });
        setSaving(false);
    };

    const stepIcons = [Gamepad2, Globe, BarChart3, Check];
    const StepIcon = stepIcons[step - 1];

    return (
        <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-8">
            <div className="w-full max-w-[520px]">
                {/* Brand */}
                <div className="flex items-center gap-2 mb-10">
                    <Gamepad2 className="w-5 h-5 text-[#FF5C00]" />
                    <span className="font-mono text-sm font-bold tracking-widest text-white uppercase">LOOTLOG</span>
                </div>

                {/* Progress bars */}
                <div className="flex items-center gap-2 mb-8">
                    {[1, 2, 3, 4].map(s => (
                        <div
                            key={s}
                            className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-[#FF5C00]' : 'bg-[#1F1F23]'}`}
                        />
                    ))}
                </div>

                {/* Card */}
                <div className="bg-[#141417] border border-[#1F1F23] rounded-xl p-8 flex flex-col gap-6">
                    {/* Step icon + counter */}
                    <div className="flex flex-col gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#FF5C00]/10 flex items-center justify-center">
                            <StepIcon className="w-6 h-6 text-[#FF5C00]" />
                        </div>
                        <span className="text-xs text-[#FF5C00] font-semibold tracking-wider uppercase">
                            {t('onboarding.stepCounter', { current: step, total: TOTAL_STEPS }) || `Step ${step} of ${TOTAL_STEPS}`}
                        </span>
                    </div>

                    {/* Step 1: Welcome + Avatar */}
                    {step === 1 && (
                        <div className="flex flex-col gap-5">
                            <div>
                                <h2 className="font-serif text-[28px] text-white leading-tight">{t('onboarding.step1Title')}</h2>
                                <p className="text-sm text-[#A0A0A8] leading-relaxed mt-2">{t('onboarding.step1Desc')}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#A0A0A8] font-medium uppercase tracking-wider mb-3">{t('onboarding.chooseAvatar')}</p>
                                <div className="grid grid-cols-8 gap-2">
                                    {AVATAR_OPTIONS.map(emoji => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setAvatar(emoji)}
                                            className={`w-10 h-10 rounded-lg border text-xl flex items-center justify-center hover:border-[#FF5C00] transition-colors ${
                                                avatar === emoji
                                                    ? 'border-[#FF5C00] bg-[#FF5C00]/10'
                                                    : 'border-[#1F1F23]'
                                            }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Display Name + Currency */}
                    {step === 2 && (
                        <div className="flex flex-col gap-5">
                            <div>
                                <h2 className="font-serif text-[28px] text-white leading-tight">{t('onboarding.step2Title')}</h2>
                                <p className="text-sm text-[#A0A0A8] leading-relaxed mt-2">{t('onboarding.step2Desc')}</p>
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs text-[#A0A0A8] font-medium uppercase tracking-wider">
                                        {t('settings.profile.displayName')}
                                    </label>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={e => setDisplayName(e.target.value)}
                                        placeholder={t('settings.profile.displayNamePlaceholder')}
                                        autoFocus
                                        className="w-full bg-[#111113] border border-[#1F1F23] rounded-lg px-4 py-3 text-sm text-white placeholder:text-[#505058] outline-none focus:border-[#FF5C00]/50 transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs text-[#A0A0A8] font-medium uppercase tracking-wider">
                                        {t('settings.preferences.defaultCurrency')}
                                    </label>
                                    <select
                                        value={currency}
                                        onChange={e => setCurrency(e.target.value)}
                                        className="w-full bg-[#111113] border border-[#1F1F23] rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-[#FF5C00]/50 transition-colors appearance-none"
                                    >
                                        <option value="EUR">EUR (€)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="JPY">JPY (¥)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Features Tour */}
                    {step === 3 && (
                        <div className="flex flex-col gap-5">
                            <div>
                                <h2 className="font-serif text-[28px] text-white leading-tight">{t('onboarding.step3Title')}</h2>
                                <p className="text-sm text-[#A0A0A8] leading-relaxed mt-2">{t('onboarding.step3Desc')}</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                {[
                                    { icon: BarChart3, key: 'onboarding.tour1' },
                                    { icon: Wallet, key: 'onboarding.tour2' },
                                    { icon: Target, key: 'onboarding.tour3' },
                                    { icon: Globe, key: 'onboarding.tour4' },
                                ].map((f, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1A1F]">
                                        <div className="w-8 h-8 rounded-md bg-[#FF5C00]/10 flex items-center justify-center flex-shrink-0">
                                            <f.icon className="w-4 h-4 text-[#FF5C00]" />
                                        </div>
                                        <span className="text-sm text-[#A0A0A8]">{t(f.key)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4: All Set */}
                    {step === 4 && (
                        <div className="flex flex-col gap-4">
                            <div className="text-5xl">🎉</div>
                            <div>
                                <h2 className="font-serif text-[28px] text-white leading-tight">{t('onboarding.step4Title')}</h2>
                                <p className="text-sm text-[#A0A0A8] leading-relaxed mt-2">{t('onboarding.step4Desc')}</p>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-2">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex items-center gap-2 text-sm text-[#A0A0A8] hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                {t('onboarding.back')}
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < TOTAL_STEPS ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#FF5C00] hover:bg-[#FF5C00]/90 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                {t('onboarding.next')}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleFinish}
                                disabled={saving}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#FF5C00] hover:bg-[#FF5C00]/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                {saving ? t('common.saving') : t('onboarding.finish')}
                                {!saving && <Check className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                </div>

                {/* Skip link */}
                {step < TOTAL_STEPS && (
                    <button
                        type="button"
                        onClick={handleSkip}
                        disabled={saving}
                        className="text-sm text-[#505058] hover:text-white transition-colors mt-4 mx-auto block disabled:opacity-50"
                    >
                        {t('onboarding.skip')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default OnboardingFlow;
