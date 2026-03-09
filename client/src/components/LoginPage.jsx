import React from 'react';
import { Gamepad2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AuthForm from './AuthForm';

const LoginPage = ({ signIn, signUp, resetPassword }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="flex h-screen w-full bg-background">
            {/* ── LEFT PANEL ── */}
            <div className="hidden w-[620px] shrink-0 flex-col justify-between border-r border-border bg-card p-12 lg:flex">
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <Gamepad2 size={18} color="white" />
                    </div>
                    <span className="font-mono text-sm font-semibold tracking-widest text-white uppercase">
                        LOOTLOG
                    </span>
                </div>

                {/* Hero copy */}
                <div className="flex flex-col gap-6">
                    <h1 className="font-serif text-[40px] font-normal leading-tight tracking-tight text-white">
                        Track Every Coin You Spend on Games
                    </h1>
                    <p className="text-base leading-relaxed text-secondary-foreground">
                        {t('auth.subtitle')}
                    </p>

                    {/* Social proof */}
                    <div className="flex flex-col gap-3 pt-2">
                        {[
                            'landing.feature1Title',
                            'landing.feature2Title',
                            'landing.feature3Title',
                        ].map((key) => (
                            <div key={key} className="flex items-center gap-2.5 text-sm text-secondary-foreground">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                {t(key)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom caption */}
                <p className="text-xs text-muted-foreground">{t('landing.footerText')}</p>
            </div>

            {/* Separator */}
            <div className="hidden w-px bg-border lg:block" />

            {/* ── RIGHT PANEL ── */}
            <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
                {/* Mobile logo (shown on small screens only) */}
                <div className="mb-8 flex items-center gap-2 lg:hidden">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <Gamepad2 size={18} color="white" />
                    </div>
                    <span className="font-mono text-sm font-semibold tracking-widest text-white uppercase">
                        LOOTLOG
                    </span>
                </div>

                <div className="w-full max-w-sm">
                    <AuthForm signIn={signIn} signUp={signUp} resetPassword={resetPassword} />
                </div>

                {/* Back to landing */}
                <button
                    className="mt-8 text-xs text-muted-foreground transition-colors hover:text-white"
                    onClick={() => navigate('/')}
                >
                    ← {t('auth.backToLogin') || 'Back'}
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
