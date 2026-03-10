import React, { useMemo, useState, useRef } from 'react';
import { Heart, Plus, Gamepad2, Trash2, ArrowRight, ChevronDown, Target } from 'lucide-react';
import { toEUR } from '../utils/currency';
import { useTranslation } from 'react-i18next';
import WishlistAddForm from './WishlistAddForm';

const PLATFORM_COLORS = {
    PC: 'bg-blue-500/20 text-blue-400',
    Steam: 'bg-blue-600/20 text-blue-300',
    PS5: 'bg-indigo-500/20 text-indigo-400',
    PS4: 'bg-indigo-400/20 text-indigo-300',
    Switch: 'bg-red-500/20 text-red-400',
    'Xbox Series': 'bg-green-500/20 text-green-400',
    'Xbox One': 'bg-green-400/20 text-green-300',
    Mobile: 'bg-purple-500/20 text-purple-400',
    Console: 'bg-gray-500/20 text-gray-400',
};

const PRIORITY_STYLES = {
    High: 'bg-primary/15 text-primary border-primary/30',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Low: 'bg-[#1F1F23] text-muted-foreground border-[#2F2F35]',
};

const WishlistView = ({ transactions, onEdit, onDelete, onStatusChange, onSave, onUpdate, exchangeRate }) => {
    const { t } = useTranslation();
    const [showAddForm, setShowAddForm] = useState(false);
    const [sortBy, setSortBy] = useState('date');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [editingPriceId, setEditingPriceId] = useState(null);
    const [editingPriceValue, setEditingPriceValue] = useState('');
    const priceInputRef = useRef(null);

    const totalValue = useMemo(() => {
        return transactions.reduce((sum, tx) => {
            return sum + toEUR(parseFloat(tx.price) || 0, tx.currency, exchangeRate);
        }, 0);
    }, [transactions, exchangeRate]);

    const gamesWithTarget = useMemo(() => {
        return transactions.filter(tx => tx.target_price != null);
    }, [transactions]);

    const sortedTransactions = useMemo(() => {
        const sorted = [...transactions];
        if (sortBy === 'price') {
            sorted.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
        } else if (sortBy === 'priority') {
            const order = { High: 3, Medium: 2, Low: 1 };
            sorted.sort((a, b) => (order[b.priority] || 0) - (order[a.priority] || 0));
        } else {
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        return sorted;
    }, [transactions, sortBy]);

    const sortLabel = sortBy === 'price' ? t('wishlist.sortPrice') : sortBy === 'priority' ? t('wishlist.sortPriority') : t('wishlist.sortDateAdded');

    const handleSave = async (data) => {
        await onSave(data);
        setShowAddForm(false);
    };

    const startEditingPrice = (tx) => {
        setEditingPriceId(tx.id);
        setEditingPriceValue(String(parseFloat(tx.price) || 0));
        setTimeout(() => priceInputRef.current?.select(), 0);
    };

    const commitPrice = async (txId) => {
        const newPrice = parseFloat(editingPriceValue);
        if (!isNaN(newPrice) && newPrice >= 0 && onUpdate) {
            await onUpdate(txId, { price: newPrice });
        }
        setEditingPriceId(null);
    };

    const handlePriceKeyDown = (e, txId) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            commitPrice(txId);
        } else if (e.key === 'Escape') {
            setEditingPriceId(null);
        }
    };

    // Show add form
    if (showAddForm) {
        return <WishlistAddForm onSave={handleSave} onCancel={() => setShowAddForm(false)} />;
    }

    // Empty state
    if (transactions.length === 0) {
        return (
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-serif text-2xl font-semibold text-white">{t('wishlist.title')}</h1>
                        <p className="text-sm text-muted-foreground mt-1">{t('wishlist.subtitle')}</p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Heart className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-base font-semibold text-white mb-1">{t('wishlist.emptyTitle')}</h3>
                        <p className="text-sm text-muted-foreground">{t('wishlist.emptyDescription')}</p>
                    </div>
                    <button
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors"
                        onClick={() => setShowAddForm(true)}
                    >
                        <Plus className="w-4 h-4" />
                        {t('wishlist.addGame')}
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
                    <h1 className="font-serif text-2xl font-semibold text-white">{t('wishlist.title')}</h1>
                    <span className="px-2.5 py-1 rounded-full bg-[#1F1F23] text-xs font-medium text-muted-foreground">
                        {t('wishlist.gamesCount', { count: transactions.length })}
                    </span>
                </div>
                <button
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors"
                    onClick={() => setShowAddForm(true)}
                >
                    <Plus className="w-4 h-4" />
                    {t('wishlist.addGame')}
                </button>
            </div>

            {/* Subtitle */}
            <p className="text-sm text-muted-foreground -mt-5">{t('wishlist.subtitle')}</p>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{t('wishlist.totalGames')}</p>
                        <p className="text-2xl font-bold text-white font-mono">{transactions.length}</p>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary text-lg font-bold">&euro;</span>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{t('wishlist.wishlistValue')}</p>
                        <p className="text-2xl font-bold text-white font-mono">{totalValue.toFixed(2)} EUR</p>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{t('wishlist.targetPrices')}</p>
                        <p className="text-2xl font-bold text-white font-mono">
                            {gamesWithTarget.length > 0 ? t('wishlist.active', { count: gamesWithTarget.length }) : '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Your Games + Sort */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-white">{t('wishlist.yourGames')}</h2>
                    <div className="relative">
                        <button
                            onClick={() => setShowSortMenu(!showSortMenu)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                        >
                            {t('wishlist.sortBy')}: {sortLabel}
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                        </button>
                        {showSortMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-20 py-1 min-w-[160px]">
                                    {[
                                        { key: 'date', label: t('wishlist.sortDateAdded') },
                                        { key: 'price', label: t('wishlist.sortPrice') },
                                        { key: 'priority', label: t('wishlist.sortPriority') },
                                    ].map(opt => (
                                        <button
                                            key={opt.key}
                                            onClick={() => { setSortBy(opt.key); setShowSortMenu(false); }}
                                            className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                                                sortBy === opt.key ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Game cards */}
                <div className="flex flex-col gap-3">
                    {sortedTransactions.map(tx => {
                        const price = toEUR(parseFloat(tx.price) || 0, tx.currency, exchangeRate);
                        const year = tx.purchase_date ? new Date(tx.purchase_date).getFullYear() : null;
                        const platformColor = PLATFORM_COLORS[tx.platform] || PLATFORM_COLORS.Console;
                        const priorityStyle = tx.priority ? PRIORITY_STYLES[tx.priority] : null;

                        return (
                            <div key={tx.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors group">
                                {/* Cover */}
                                {tx.cover_url ? (
                                    <img src={tx.cover_url} alt="" className="w-14 h-18 rounded-lg object-cover flex-shrink-0" />
                                ) : (
                                    <div className="w-14 h-18 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                        <Gamepad2 className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-white truncate">{tx.title}</h3>
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${platformColor}`}>
                                            {tx.platform}
                                        </span>
                                        {year && <span className="text-xs text-muted-foreground">{year}</span>}
                                    </div>
                                    {editingPriceId === tx.id ? (
                                        <div className="mt-1.5 flex items-center gap-1.5">
                                            <input
                                                ref={priceInputRef}
                                                type="number"
                                                step="0.01"
                                                value={editingPriceValue}
                                                onChange={e => setEditingPriceValue(e.target.value)}
                                                onBlur={() => commitPrice(tx.id)}
                                                onKeyDown={e => handlePriceKeyDown(e, tx.id)}
                                                autoFocus
                                                className="w-24 px-2 py-1 bg-[#111113] border border-primary/50 rounded-md text-sm font-mono font-bold text-primary outline-none"
                                            />
                                            <span className="text-xs text-muted-foreground">EUR</span>
                                        </div>
                                    ) : (
                                        <span
                                            className="font-mono text-sm font-bold text-primary mt-1.5 block cursor-pointer hover:underline"
                                            onDoubleClick={() => startEditingPrice(tx)}
                                            title={t('common.edit')}
                                        >
                                            {price.toFixed(2)} EUR
                                        </span>
                                    )}
                                </div>

                                {/* Priority badge */}
                                {priorityStyle && (
                                    <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium flex-shrink-0 ${priorityStyle}`}>
                                        {t(`wishlist.priority${tx.priority}`)}
                                    </span>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    <button
                                        onClick={() => onStatusChange(tx.id, 'Backlog')}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                                        title={t('wishlist.moveToBacklog')}
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(tx.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                                        title={t('common.delete')}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Target Prices section */}
            {gamesWithTarget.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-semibold text-white">{t('wishlist.targetPrices')}</h3>
                    </div>
                    <div className="flex flex-col gap-2">
                        {gamesWithTarget.map(tx => {
                            const currentPrice = toEUR(parseFloat(tx.price) || 0, tx.currency, exchangeRate);
                            return (
                                <div key={tx.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <span className="text-sm text-white">{tx.title}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-muted-foreground">{t('wishlist.target')}:</span>
                                        <span className="font-mono text-sm font-medium text-primary">{parseFloat(tx.target_price).toFixed(2)} EUR</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WishlistView;
