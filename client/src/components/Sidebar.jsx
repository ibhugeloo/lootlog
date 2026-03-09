import { useLocation, NavLink } from 'react-router-dom';
import { Gamepad2, LayoutDashboard, CreditCard, ChartLine, Heart, Settings, Menu, X, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const navItems = [
    { labelKey: 'nav.dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { labelKey: 'nav.transactions', icon: CreditCard, href: '/transactions' },
    { labelKey: 'nav.analytics', icon: ChartLine, href: '/analytics' },
    { labelKey: 'nav.wishlist', icon: Heart, href: '/wishlist' },
    { labelKey: 'nav.settings', icon: Settings, href: '/settings' },
];

const Sidebar = ({ isPremium, profile, onSignOut }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const sidebarContent = (
        <>
            {/* Header */}
            <div className="p-5 flex items-center gap-2.5">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Gamepad2 className="w-[18px] h-[18px] text-white" />
                </div>
                <span className="font-mono text-sm font-semibold tracking-[3px] text-white">
                    LOOTLOG
                </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 flex flex-col gap-1">
                <span className="px-3 py-2 text-[11px] font-semibold tracking-[1px] text-muted-foreground uppercase">
                    {t('nav.menu')}
                </span>
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

            {/* Desktop sidebar */}
            <aside className="hidden lg:flex w-64 h-full bg-card border-r border-border flex-col shrink-0">
                {sidebarContent}
            </aside>

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
