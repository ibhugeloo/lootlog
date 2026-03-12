import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, X, Search, Bell, Download, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useAuth } from './hooks/useAuth';
import { usePlan } from './hooks/usePlan';
import { useProfile } from './hooks/useProfile';
import { useTransactions } from './hooks/useTransactions';
import { useBudget } from './hooks/useBudget';
import { useSubscriptions } from './hooks/useSubscriptions';
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
import BudgetPage from './components/BudgetPage';
import SearchOverlay from './components/SearchOverlay';
import NotificationDropdown from './components/NotificationDropdown';
import WishlistView from './components/WishlistView';
import SubscriptionsPage from './components/SubscriptionsPage';
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
  const { budget, allBudgets, fetchBudget, fetchAllBudgets, saveBudget } = useBudget(user?.id);
  const { subscriptions: gamingSubs, loading: subsLoading, fetchSubscriptions, saveSubscription, deleteSubscription } = useSubscriptions(user?.id);

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
    fetchAllBudgets();
    fetchSubscriptions();
  }, [fetchTransactions, fetchBudget, fetchAllBudgets, fetchSubscriptions]);

  const gamesList = useMemo(() => {
    return transactions.filter(tx => tx.type === 'game' || !tx.type);
  }, [transactions]);

  const wishlistTransactions = useMemo(() => {
    return transactions.filter(tx => tx.status === 'Wishlist');
  }, [transactions]);

  const activeTransactions = useMemo(() => {
    return transactions.filter(tx => tx.status !== 'Wishlist');
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

  const handleUpdateTransaction = async (id, updates) => {
    try {
      await supabase.from('transactions').update(updates).eq('id', id);
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

  const handleSaveSubscription = async (subscription, editingId = null) => {
    try {
      await saveSubscription(subscription, editingId);
      trackEvent(editingId ? 'subscription_edited' : 'subscription_added', { service: subscription.service_name });
    } catch (err) {
      console.error(err);
      showToast(t('errors.generic', { message: err.message }));
    }
  };

  const handleDeleteSubscription = async (id) => {
    if (!window.confirm(t('subscriptions.confirmDelete'))) return;
    try {
      await deleteSubscription(id);
      trackEvent('subscription_deleted');
    } catch (err) {
      console.error(err);
      showToast(t('errors.generic', { message: err.message }));
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl font-semibold text-white">{t('nav.dashboard')}</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowSearch(true)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-white hover:border-border-light transition-colors" title={t('common.search')}>
            <Search className="w-4 h-4" />
          </button>
          <div className="relative">
            <button onClick={() => setShowNotifications(prev => !prev)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-white hover:border-border-light transition-colors" title={t('header.notifications')}>
              <Bell className="w-4 h-4" />
              {isPremium && budget && (() => {
                const now = new Date();
                const monthSpent = activeTransactions
                  .filter(tx => { const d = new Date(tx.purchase_date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
                  .reduce((sum, tx) => sum + (parseFloat(tx.price) || 0), 0);
                return monthSpent / budget.amount >= 0.8 ? <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" /> : null;
              })()}
            </button>
            {showNotifications && (
              <NotificationDropdown transactions={activeTransactions} budget={budget} exchangeRate={exchangeRate} onClose={() => setShowNotifications(false)} />
            )}
          </div>
          <button onClick={() => { exportTransactionsCsv(activeTransactions); trackEvent('csv_exported', { count: activeTransactions.length }); }} className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-white hover:border-border-light transition-colors" title={t('header.exportCsv')}>
            <Download className="w-4 h-4" />
          </button>
          <button onClick={() => setShowImport(true)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-white hover:border-border-light transition-colors" title={t('header.import')}>
            <Upload className="w-4 h-4" />
          </button>
          <button onClick={() => { if (!canAddTransaction(transactions.length)) { setShowUpgradeModal(true); } else { openAddModal(); } }} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('header.addTransaction')}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <><SkeletonStats /><SkeletonChart /><SkeletonTable /></>
      ) : (
        <>
          <StatsOverview transactions={activeTransactions} exchangeRate={exchangeRate} />
          {isPremium && (
            <div className="cursor-pointer" onClick={() => setShowBudgetModal(true)}>
              {budget ? (
                <BudgetWidget budget={budget} transactions={activeTransactions} exchangeRate={exchangeRate} />
              ) : (
                <button className="w-full py-4 border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:text-white hover:border-border-light transition-colors">
                  + {t('header.setBudget')}
                </button>
              )}
            </div>
          )}

          <div className="bg-card border border-border rounded-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-[15px] font-semibold text-white">{t('transactions.filteredExpenses')}</h2>
              <NavLinkButton to="/transactions" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="text-left font-medium px-3 sm:px-6 py-3">{t('transactions.game')}</th>
                    <th className="text-left font-medium px-3 sm:px-6 py-3 hidden sm:table-cell">{t('transactions.platform')}</th>
                    <th className="text-left font-medium px-3 sm:px-6 py-3 hidden sm:table-cell">{t('transactions.date')}</th>
                    <th className="text-right font-medium px-3 sm:px-6 py-3">{t('transactions.price')}</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTransactions.slice(0, 6).map((tx) => (
                    <tr key={tx.id} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => openEditModal(tx)}>
                      <td className="px-3 sm:px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          {tx.cover_url ? <img src={tx.cover_url} alt="" className="w-10 h-10 rounded-lg object-contain shrink-0" /> : <div className="w-10 h-10 rounded-lg shrink-0 bg-primary/20" />}
                          <span className="text-sm text-white font-medium truncate">{tx.title}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3.5 hidden sm:table-cell"><span className="text-sm text-secondary-foreground">{tx.platform}</span></td>
                      <td className="px-3 sm:px-6 py-3.5 hidden sm:table-cell"><span className="text-sm text-secondary-foreground">{new Date(tx.purchase_date).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></td>
                      <td className="px-3 sm:px-6 py-3.5 text-right"><span className="text-sm font-mono text-white">{parseFloat(tx.price).toFixed(2)} {tx.currency}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </>
      )}
    </div>
  );

  const TransactionsContent = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl text-white">{t('nav.transactions')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-4 py-2.5 border border-border text-secondary-foreground hover:text-white text-sm font-medium rounded-lg transition-colors">
            <Upload className="w-4 h-4" /><span className="hidden sm:inline">{t('header.import')}</span>
          </button>
          <button onClick={() => { if (!canAddTransaction(transactions.length)) { setShowUpgradeModal(true); } else { openAddModal(); } }} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" /><span className="hidden sm:inline">{t('header.addTransaction')}</span>
          </button>
        </div>
      </div>
      {!isPremium && activeTransactions.length >= 40 && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-amber-400">{t('transactions.filteredExpenses')}</span>
            <span className="text-xs text-muted-foreground">{activeTransactions.length}/50 {t('transactions.transactions')}</span>
          </div>
          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(activeTransactions.length / 50) * 100}%` }} />
          </div>
        </div>
      )}
      <TransactionList transactions={activeTransactions} onDelete={handleDelete} onEdit={openEditModal} exchangeRate={exchangeRate} isPremium={isPremium} />
    </div>
  );

  const AnalyticsContent = () => (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <h1 className="font-serif text-2xl font-semibold text-white">{t('nav.analytics')}</h1>
      </div>
      {loading ? <SkeletonChart /> : <AnalyticsCharts transactions={activeTransactions} exchangeRate={exchangeRate} isPremium={isPremium} />}
    </div>
  );

  const BudgetContent = () => (
    <BudgetPage budget={budget} allBudgets={allBudgets} transactions={activeTransactions} exchangeRate={exchangeRate} onSetBudget={() => setShowBudgetModal(true)} />
  );

  const WishlistContent = () => (
    <WishlistView transactions={wishlistTransactions} onEdit={openEditModal} onDelete={handleDelete} onStatusChange={handleStatusChange} onSave={handleSaveTransaction} onUpdate={handleUpdateTransaction} exchangeRate={exchangeRate} />
  );

  const SubscriptionsContent = () => (
    <SubscriptionsPage
      subscriptions={gamingSubs}
      loading={subsLoading}
      onSave={handleSaveSubscription}
      onDelete={handleDeleteSubscription}
      exchangeRate={exchangeRate}
    />
  );

  const SettingsContent = () => (
    <SettingsPage
      profile={profile} updateProfile={updateProfile} isPremium={isPremium} plan={isPremium ? 'premium' : 'free'}
      userEmail={user?.email} onSignOut={signOut} onDeleteAccount={deleteAccount}
      onUpgrade={() => { setShowUpgradeModal(true); trackEvent('upgrade_clicked'); }}
      budget={budget} transactions={activeTransactions} exchangeRate={exchangeRate} onSaveBudget={handleSaveBudget}
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
      <Sidebar isPremium={isPremium} profile={profile} onSignOut={signOut} onUpgrade={() => { setShowUpgradeModal(true); trackEvent('upgrade_clicked'); }} />

      <main className="flex-1 overflow-auto p-4 pt-16 sm:p-6 sm:pt-6 lg:p-8 xl:p-10">
        <Routes>
          <Route path="/dashboard" element={<DashboardContent />} />
          <Route path="/transactions" element={<TransactionsContent />} />
          <Route path="/analytics" element={<AnalyticsContent />} />
          <Route path="/budget" element={<BudgetContent />} />
          <Route path="/wishlist" element={<WishlistContent />} />
          <Route path="/subscriptions" element={<SubscriptionsContent />} />
          <Route path="/settings" element={<SettingsContent />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-[#0A0A0B]/60 flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="w-full max-w-[560px] mx-4 max-h-[90vh] overflow-y-auto bg-card border border-border rounded-xl">
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
          <div className="w-full max-w-[400px] mx-4 bg-card border border-border rounded-xl">
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
      {showSearch && <SearchOverlay transactions={activeTransactions} onSelect={openEditModal} onClose={() => setShowSearch(false)} />}
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

export default App;
