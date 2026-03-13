import { useLocation, NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Wallet, Heart, RefreshCw, Settings, Menu, X, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useRef } from 'react';

const navItems = [
    { labelKey: 'nav.dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { labelKey: 'nav.transactions', icon: CreditCard, href: '/transactions' },
    { labelKey: 'nav.budget', icon: Wallet, href: '/budget' },
    { labelKey: 'nav.wishlist', icon: Heart, href: '/wishlist' },
    { labelKey: 'nav.subscriptions', icon: RefreshCw, href: '/subscriptions' },
];

const Sidebar = ({ isPremium, profile, onSignOut, onUpgrade }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [peeking, setPeeking] = useState(false);
    const peekTimeout = useRef(null);

    const handlePeekEnter = () => {
        if (peekTimeout.current) clearTimeout(peekTimeout.current);
        setPeeking(true);
    };

    const handlePeekLeave = () => {
        peekTimeout.current = setTimeout(() => setPeeking(false), 200);
    };

    const sidebarContent = (
        <>
            {/* Header */}
            <div className="p-5 flex items-center gap-2.5">
                <img src="/logo.png" alt="LootLog" className="w-8 h-8 object-contain" />
                <span className="font-mono text-sm font-semibold tracking-[3px] text-white">
                    LOOTLOG
                </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 flex flex-col gap-1">
                <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-[11px] font-semibold tracking-[1px] text-muted-foreground uppercase">
                        {t('nav.menu')}
                    </span>
                    {collapsed ? (
                        <button
                            onClick={() => { setCollapsed(false); setPeeking(false); }}
                            className="hidden lg:flex w-6 h-6 items-center justify-center rounded-md text-muted-foreground hover:text-white hover:bg-muted transition-colors"
                            title={t('nav.showMenu')}
                        >
                            <PanelLeftOpen className="w-3.5 h-3.5" />
                        </button>
                    ) : (
                        <button
                            onClick={() => { setCollapsed(true); setPeeking(false); }}
                            className="hidden lg:flex w-6 h-6 items-center justify-center rounded-md text-muted-foreground hover:text-white hover:bg-muted transition-colors"
                            title={t('nav.hideMenu')}
                        >
                            <PanelLeftClose className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.href);
                    return (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                                isActive
                                    ? 'bg-primary/10 text-white font-medium'
                                    : 'text-secondary-foreground hover:bg-muted hover:text-white'
                            }`}
                        >
                            <item.icon
                                className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                            />
                            {t(item.labelKey)}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="mt-auto">
                {!isPremium && onUpgrade && (
                    <div className="px-3 pb-3">
                        <div className="rounded-xl bg-[#1A1510] border border-primary/20 p-4">
                            <p className="text-sm font-semibold text-white mb-0.5">{t('common.freePlan')}</p>
                            <p className="text-[11px] text-muted-foreground mb-3">{t('upgrade.subtitle')}</p>
                            <button
                                onClick={onUpgrade}
                                className="w-full py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-colors"
                            >
                                {t('upgrade.ctaButton')}
                            </button>
                        </div>
                    </div>
                )}
                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm">
                            {profile?.avatar || '🎮'}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-[13px] font-medium text-white truncate">
                                {profile?.display_name || 'Player'}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                                {isPremium ? 'Premium' : t('common.freePlan')}
                            </span>
                        </div>
                        <NavLink
                            to="/settings"
                            onClick={() => setMobileOpen(false)}
                            className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                                location.pathname.startsWith('/settings')
                                    ? 'text-primary bg-primary/10'
                                    : 'text-muted-foreground hover:text-white hover:bg-muted'
                            }`}
                            title={t('nav.settings')}
                        >
                            <Settings className="w-3.5 h-3.5" />
                        </NavLink>
                        {onSignOut && (
                            <button
                                onClick={onSignOut}
                                className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-white hover:bg-muted transition-colors"
                                title={t('settings.signOut')}
                            >
                                <LogOut className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile hamburger */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-card border border-border rounded-lg flex items-center justify-center text-white"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-background/80 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Desktop sidebar — inline (pushes content) */}
            <aside
                className={`hidden lg:flex h-full bg-card border-r border-border flex-col shrink-0 transition-all duration-300 ${
                    collapsed ? 'w-0 overflow-hidden border-r-0' : 'w-64'
                }`}
            >
                {sidebarContent}
            </aside>

            {/* Desktop hover trigger — visible when collapsed */}
            {collapsed && (
                <div
                    className="hidden lg:block fixed inset-y-0 left-0 w-4 z-50"
                    onMouseEnter={handlePeekEnter}
                />
            )}

            {/* Desktop peek sidebar — floating overlay on hover */}
            {collapsed && (
                <aside
                    className={`hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex-col shadow-2xl transition-transform duration-200 ease-out ${
                        peeking ? 'translate-x-0' : '-translate-x-full'
                    }`}
                    onMouseEnter={handlePeekEnter}
                    onMouseLeave={handlePeekLeave}
                >
                    {sidebarContent}
                </aside>
            )}

            {/* Mobile sidebar */}
            <aside className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transform transition-transform ${
                mobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                {sidebarContent}
            </aside>
        </>
    );
};

export default Sidebar;
