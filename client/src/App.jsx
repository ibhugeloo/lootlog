import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, X, Search, Bell, Download, Upload, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useAuth } from './hooks/useAuth';
import { usePlan } from './hooks/usePlan';
import { useProfile } from './hooks/useProfile';
import { useTransactions } from './hooks/useTransactions';
import { useBudget } from './hooks/useBudget';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import OnboardingFlow from './components/OnboardingFlow';
import UpgradeModal from './components/UpgradeModal';
import SettingsPage from './components/SettingsPage';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import StatsOverview from './components/StatsOverview';
import AnalyticsCharts from './components/AnalyticsCharts';
import BudgetWidget from './components/BudgetWidget';
import BudgetForm from './components/BudgetForm';
import SearchOverlay from './components/SearchOverlay';
import NotificationDropdown from './components/NotificationDropdown';
import WishlistView from './components/WishlistView';
import Toast from './components/Toast';
import ImportModal from './components/ImportModal';
import OfflineBanner from './components/OfflineBanner';
import Sidebar from './components/Sidebar';
import { exportTransactionsCsv } from './utils/exportCsv';
import { SkeletonStats, SkeletonChart, SkeletonTable } from './components/SkeletonLoader';
import { identifyUser, resetUser, trackEvent } from './posthog';

function App() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading, signIn, signUp, signOut, resetPassword, deleteAccount } = useAuth();
  const { isPremium, limits, canAddTransaction, createCheckoutSession, checkoutLoading, refreshPlan } = usePlan(user?.id);
  const { profile, loading: profileLoading, updateProfile, completeOnboarding } = useProfile(user?.id);
  const { transactions, loading, fetchTransactions, saveTransaction, deleteTransaction } = useTransactions(user?.id);
  const { budget, fetchBudget, saveBudget } = useBudget(user?.id);

  const [showForm, setShowForm] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(0.92);
  const [toast, setToast] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('session_id')) {
      setTimeout(() => refreshPlan(), 1500);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await res.json();
        if (data.rates && data.rates.EUR) {
          setExchangeRate(data.rates.EUR);
        }
      } catch (err) {
        console.warn('Exchange rate fetch failed, using fallback:', err);
      }
    };
    fetchRate();
  }, []);

  useEffect(() => {
    if (user) {
      identifyUser(user.id, { email: user.email });
    } else {
      resetUser();
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
    fetchBudget();
  }, [fetchTransactions, fetchBudget]);

  const gamesList = useMemo(() => {
    return transactions.filter(tx => tx.type === 'game' || !tx.type);
  }, [transactions]);

  const wishlistTransactions = useMemo(() => {
    return transactions.filter(tx => tx.status === 'Wishlist');
  }, [transactions]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await supabase.from('transactions').update({ status: newStatus }).eq('id', id);
      await fetchTransactions();
    } catch (err) {
      console.error(err);
      showToast(t('errors.generic', { message: err.message }));
    }
  };

  const handleSaveTransaction = async (transaction) => {
    try {
      await saveTransaction(transaction, editingTransaction?.id);
      trackEvent(editingTransaction ? 'transaction_edited' : 'transaction_added', {
        type: transaction.type || 'game',
        currency: transaction.currency,
        platform: transaction.platform,
      });
      setShowForm(false);
      setEditingTransaction(null);
    } catch (err) {
      console.error(err);
      showToast(t('errors.generic', { message: err.message || t('errors.unknownError') }));
    }
  };

  const handleSaveBudget = async (amount) => {
    try {
      await saveBudget(amount);
      trackEvent('budget_set', { amount });
      setShowBudgetModal(false);
    } catch (err) {
      console.error(err);
      showToast(t('errors.budgetError', { message: err.message }));
    }
  };

  const openAddModal = () => { setEditingTransaction(null); setShowForm(true); };
  const openEditModal = (transaction) => { setEditingTransaction(transaction); setShowForm(true); };

  const handleDelete = async (id) => {
    if (!window.confirm(t('transactions.confirmDelete'))) return;
    try {
      await deleteTransaction(id);
      trackEvent('transaction_deleted');
    } catch (err) {
      console.error(err);
      showToast(t('transactions.deleteError'));
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage signIn={signIn} signUp={signUp} resetPassword={resetPassword} />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!profile.onboarding_completed) {
    return <OnboardingFlow profile={profile} onComplete={completeOnboarding} />;
  }

  const DashboardContent = () => (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl font-semibold text-white">{t('nav.dashboard')}</h1>
          {!isPremium && (
            <span className="bg-secondary text-secondary-foreground text-xs font-medium rounded-full px-3 py-1">{t('common.freePlan')}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSearch(true)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-white hover:border-border-light transition-colors" title={t('common.search')}>
            <Search className="w-4 h-4" />
          </button>
          <div className="relative">
            <button onClick={() => setShowNotifications(prev => !prev)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-white hover:border-border-light transition-colors" title={t('header.notifications')}>
              <Bell className="w-4 h-4" />
              {isPremium && budget && (() => {
                const now = new Date();
                const monthSpent = transactions
                  .filter(tx => { const d = new Date(tx.purchase_date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
                  .reduce((sum, tx) => sum + (parseFloat(tx.price) || 0), 0);
                return monthSpent / budget.amount >= 0.8 ? <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" /> : null;
              })()}
            </button>
            {showNotifications && (
              <NotificationDropdown transactions={transactions} budget={budget} exchangeRate={exchangeRate} onClose={() => setShowNotifications(false)} />
            )}
          </div>
          {isPremium && (
            <button onClick={() => { exportTransactionsCsv(transactions); trackEvent('csv_exported', { count: transactions.length }); }} className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-white hover:border-border-light transition-colors" title={t('header.exportCsv')}>
              <Download className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => setShowImport(true)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-white hover:border-border-light transition-colors" title={t('header.import')}>
            <Upload className="w-4 h-4" />
          </button>
          <button onClick={() => { if (!canAddTransaction(transactions.length)) { setShowUpgradeModal(true); } else { openAddModal(); } }} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            {t('header.addTransaction')}
          </button>
        </div>
      </div>

      {loading ? (
        <><SkeletonStats /><SkeletonChart /><SkeletonTable /></>
      ) : (
        <>
          <StatsOverview transactions={transactions} exchangeRate={exchangeRate} />
          {isPremium && budget && <BudgetWidget budget={budget} transactions={transactions} exchangeRate={exchangeRate} />}

          <div className="bg-card border border-border rounded-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-[15px] font-semibold text-white">{t('transactions.filteredExpenses')}</h2>
              <NavLinkButton to="/transactions" />
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-left font-medium px-6 py-3">{t('transactions.game')}</th>
                  <th className="text-left font-medium px-6 py-3">{t('transactions.platform')}</th>
                  <th className="text-left font-medium px-6 py-3">{t('transactions.date')}</th>
                  <th className="text-right font-medium px-6 py-3">{t('transactions.price')}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 6).map((tx) => (
                  <tr key={tx.id} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => openEditModal(tx)}>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        {tx.cover_url ? <img src={tx.cover_url} alt="" className="w-8 h-8 rounded-md object-cover shrink-0" /> : <div className="w-8 h-8 rounded-md shrink-0 bg-primary/20" />}
                        <span className="text-sm text-white font-medium truncate">{tx.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5"><span className="text-sm text-secondary-foreground">{tx.platform}</span></td>
                    <td className="px-6 py-3.5"><span className="text-sm text-secondary-foreground">{new Date(tx.purchase_date).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></td>
                    <td className="px-6 py-3.5 text-right"><span className="text-sm font-mono text-white">{parseFloat(tx.price).toFixed(2)} {tx.currency}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isPremium && <UpgradeBanner onUpgrade={() => { setShowUpgradeModal(true); trackEvent('upgrade_clicked'); }} />}
        </>
      )}
    </div>
  );

  const TransactionsContent = () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl text-white">{t('nav.transactions')}</h1>
          {!isPremium && <span className="bg-secondary text-secondary-foreground text-xs font-medium rounded-full px-3 py-1">{t('common.freePlan')}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-4 py-2.5 border border-border text-secondary-foreground hover:text-white text-sm font-medium rounded-lg transition-colors">
            <Upload className="w-4 h-4" />{t('header.import')}
          </button>
          <button onClick={() => { if (!canAddTransaction(transactions.length)) { setShowUpgradeModal(true); } else { openAddModal(); } }} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" />{t('header.addTransaction')}
          </button>
        </div>
      </div>
      {!isPremium && transactions.length >= 40 && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-amber-400">{t('transactions.filteredExpenses')}</span>
            <span className="text-xs text-muted-foreground">{transactions.length}/50 {t('transactions.transactions')}</span>
          </div>
          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(transactions.length / 50) * 100}%` }} />
          </div>
        </div>
      )}
      <TransactionList transactions={transactions} onDelete={handleDelete} onEdit={openEditModal} exchangeRate={exchangeRate} isPremium={isPremium} />
      {!isPremium && <UpgradeBanner onUpgrade={() => { setShowUpgradeModal(true); trackEvent('upgrade_clicked'); }} />}
    </div>
  );

  const AnalyticsContent = () => (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <h1 className="font-serif text-2xl font-semibold text-white">{t('nav.analytics')}</h1>
        {!isPremium && <span className="bg-secondary text-secondary-foreground text-xs font-medium rounded-full px-3 py-1">{t('common.freePlan')}</span>}
      </div>
      {loading ? <SkeletonChart /> : <AnalyticsCharts transactions={transactions} exchangeRate={exchangeRate} isPremium={isPremium} />}
      {!isPremium && <UpgradeBanner onUpgrade={() => { setShowUpgradeModal(true); trackEvent('upgrade_clicked'); }} />}
    </div>
  );

  const WishlistContent = () => (
    <WishlistView transactions={wishlistTransactions} onEdit={openEditModal} onDelete={handleDelete} onStatusChange={handleStatusChange} onAdd={openAddModal} exchangeRate={exchangeRate} />
  );

  const SettingsContent = () => (
    <SettingsPage
      profile={profile} updateProfile={updateProfile} isPremium={isPremium} plan={isPremium ? 'premium' : 'free'}
      userEmail={user?.email} onSignOut={signOut} onDeleteAccount={deleteAccount}
      onUpgrade={() => { setShowUpgradeModal(true); trackEvent('upgrade_clicked'); }}
      budget={budget} transactions={transactions} exchangeRate={exchangeRate} onSaveBudget={handleSaveBudget}
      onCancelSubscription={async () => {
        try {
          await supabase.from('subscriptions').update({ plan: 'free' }).eq('user_id', user.id);
          await refreshPlan();
        } catch (err) {
          console.error(err);
          showToast(t('settings.subscription.cancelError'));
        }
      }}
    />
  );

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isPremium={isPremium} profile={profile} onSignOut={signOut} />

      <main className="flex-1 overflow-auto p-6 lg:p-8 xl:p-10 pl-16 lg:pl-8 xl:pl-10">
        <Routes>
          <Route path="/dashboard" element={<DashboardContent />} />
          <Route path="/transactions" element={<TransactionsContent />} />
          <Route path="/analytics" element={<AnalyticsContent />} />
          <Route path="/wishlist" element={<WishlistContent />} />
          <Route path="/settings" element={<SettingsContent />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-[#0A0A0B]/60 flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="w-[560px] max-h-[90vh] overflow-y-auto bg-card border border-border rounded-xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="font-serif text-lg text-white">{editingTransaction ? t('transactions.editTransaction') : t('transactions.newPurchase')}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-white transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5">
              <TransactionForm onAddTransaction={handleSaveTransaction} initialData={editingTransaction} games={gamesList} />
            </div>
          </div>
        </div>
      )}

      {showBudgetModal && (
        <div className="fixed inset-0 bg-[#0A0A0B]/60 flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setShowBudgetModal(false) }}>
          <div className="w-[400px] bg-card border border-border rounded-xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="font-serif text-lg text-white">{t('budget.monthlyBudget')}</h2>
              <button onClick={() => setShowBudgetModal(false)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-white transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5">
              <BudgetForm currentBudget={budget} onSave={handleSaveBudget} />
            </div>
          </div>
        </div>
      )}

      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} onCheckout={createCheckoutSession} checkoutLoading={checkoutLoading} />}
      {showImport && <ImportModal onClose={() => { setShowImport(false); fetchTransactions(); }} userId={user.id} />}
      {showSearch && <SearchOverlay transactions={transactions} onSelect={openEditModal} onClose={() => setShowSearch(false)} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <OfflineBanner />
    </div>
  );
}

function NavLinkButton({ to }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(to)} className="flex items-center gap-1.5 text-sm text-primary hover:text-accent transition-colors">
      {t('header.viewAll')}<span className="text-xs">&rarr;</span>
    </button>
  );
}

function UpgradeBanner({ onUpgrade }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-primary/20 p-6 bg-gradient-to-br from-primary/10 to-primary/[0.03]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-white">{t('upgrade.title')}</span>
          <span className="text-sm text-secondary-foreground">{t('upgrade.subtitle')}</span>
        </div>
        <button onClick={onUpgrade} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shrink-0">
          <Zap className="w-4 h-4" />{t('upgrade.ctaButton')}
        </button>
      </div>
    </div>
  );
}

export default App;
