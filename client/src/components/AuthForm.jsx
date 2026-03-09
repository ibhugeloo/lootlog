import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, UserPlus, LogIn, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const inputClass =
    'w-full bg-[#111113] border border-border rounded-lg px-4 py-3 pl-10 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors';

const AuthForm = ({ signIn, signUp, resetPassword }) => {
    const { t } = useTranslation();
    const [isLogin, setIsLogin] = useState(true);
    const [isReset, setIsReset] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const clearMessages = () => {
        setError('');
        setSuccessMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearMessages();
        setLoading(true);

        try {
            if (isReset) {
                await resetPassword(email);
                setSuccessMessage(t('auth.resetEmailSent'));
            } else if (isLogin) {
                await signIn(email, password);
            } else {
                const data = await signUp(email, password);
                if (data?.user && !data?.session) {
                    setSuccessMessage(t('auth.checkEmail'));
                    setLoading(false);
                    return;
                }
            }
        } catch (err) {
            setError(err.message || t('auth.genericError'));
        } finally {
            setLoading(false);
        }
    };

    // ── Reset password view ──
    if (isReset) {
        return (
            <div className="flex flex-col gap-5">
                <button
                    className="flex w-fit items-center gap-1.5 text-sm text-secondary-foreground transition-colors hover:text-white"
                    onClick={() => { setIsReset(false); clearMessages(); }}
                >
                    <ArrowLeft size={14} />
                    {t('auth.backToLogin')}
                </button>

                <div>
                    <h3 className="mb-1 text-base font-bold text-white">
                        {t('auth.resetTitle')}
                    </h3>
                    <p className="text-sm text-secondary-foreground">
                        {t('auth.resetDesc')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-semibold text-secondary-foreground">
                            {t('auth.email')}
                        </label>
                        <div className="relative">
                            <Mail
                                size={15}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder={t('auth.emailPlaceholder')}
                                className={inputClass}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-500">
                            {successMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-primary to-accent py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                        {loading ? (
                            <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                            <>
                                {t('auth.resetButton')}
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        );
    }

    // ── Login / Signup view ──
    return (
        <div className="flex flex-col gap-5">
            {/* Tab toggle */}
            <div className="flex rounded-lg border border-border bg-card p-1">
                <button
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${
                        isLogin
                            ? 'bg-primary/10 text-primary'
                            : 'text-secondary-foreground hover:text-white'
                    }`}
                    onClick={() => { setIsLogin(true); clearMessages(); }}
                >
                    <LogIn size={15} />
                    {t('auth.login')}
                </button>
                <button
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${
                        !isLogin
                            ? 'bg-primary/10 text-primary'
                            : 'text-secondary-foreground hover:text-white'
                    }`}
                    onClick={() => { setIsLogin(false); clearMessages(); }}
                >
                    <UserPlus size={15} />
                    {t('auth.signup')}
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Email */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-secondary-foreground">
                        {t('auth.email')}
                    </label>
                    <div className="relative">
                        <Mail
                            size={15}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder={t('auth.emailPlaceholder')}
                            className={inputClass}
                            required
                            autoComplete="email"
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-secondary-foreground">
                        {t('auth.password')}
                    </label>
                    <div className="relative">
                        <Lock
                            size={15}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder={isLogin ? t('auth.passwordPlaceholderLogin') : t('auth.passwordPlaceholderSignup')}
                            className={inputClass}
                            required
                            minLength={6}
                            autoComplete={isLogin ? 'current-password' : 'new-password'}
                        />
                    </div>
                </div>

                {/* Forgot password */}
                {isLogin && (
                    <button
                        type="button"
                        className="self-end text-sm text-primary hover:underline"
                        onClick={() => { setIsReset(true); clearMessages(); }}
                    >
                        {t('auth.forgotPassword')}
                    </button>
                )}

                {/* Messages */}
                {error && (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-500">
                        {successMessage}
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-primary to-accent py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                    {loading ? (
                        <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                        <>
                            {isLogin ? t('auth.loginButton') : t('auth.signupButton')}
                            <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </form>

            {/* Sign up / sign in toggle */}
            <p className="text-center text-sm text-muted-foreground">
                {isLogin ? t('auth.noAccount') : t('auth.alreadyAccount')}{' '}
                <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => { setIsLogin(!isLogin); clearMessages(); }}
                >
                    {isLogin ? t('auth.signup') : t('auth.login')}
                </button>
            </p>
        </div>
    );
};

export default AuthForm;
