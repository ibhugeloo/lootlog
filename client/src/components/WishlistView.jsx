import React, { useMemo } from 'react';
import { Heart, ArrowRight, Pencil, Trash2, Plus, Gamepad2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const WishlistView = ({ transactions, onEdit, onDelete, onStatusChange, onAdd, exchangeRate }) => {
    const { t, i18n } = useTranslation();

    const totalValue = useMemo(() => {
        return transactions.reduce((sum, tx) => {
            const price = parseFloat(tx.price) || 0;
            if (tx.currency === 'USD') return sum + price * exchangeRate;
            if (tx.currency === 'GBP') return sum + price * exchangeRate * 1.27;
            if (tx.currency === 'JPY') return sum + price * exchangeRate * 0.0067;
            return sum + price;
        }, 0);
    }, [transactions, exchangeRate]);

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Gamepad2 size={28} className="text-muted-foreground" />
                </div>
                <div className="text-center">
                    <h3 className="text-base font-semibold text-white mb-1">{t('wishlist.emptyTitle')}</h3>
                    <p className="text-sm text-muted-foreground">{t('wishlist.emptyDescription')}</p>
                </div>
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors"
                    onClick={onAdd}
                >
                    <Plus size={16} />
                    {t('wishlist.addGame')}
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Header row */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-white">{t('wishlist.title')}</h2>
                    <span className="text-xs text-muted-foreground mt-0.5 block">
                        {t('wishlist.gamesCount', { count: transactions.length })}
                    </span>
                </div>
                <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-0.5">{t('wishlist.estimatedValue')}</div>
                    <div className="text-base font-mono font-semibold text-white">
                        {totalValue.toFixed(2)} &euro;
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] px-5 py-3 border-b border-border">
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        {t('wishlist.columns.game')}
                    </span>
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        {t('wishlist.columns.platform')}
                    </span>
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        {t('wishlist.columns.genre')}
                    </span>
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        {t('wishlist.columns.price')}
                    </span>
                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        {t('wishlist.columns.actions')}
                    </span>
                </div>

                {/* Data rows */}
                {transactions.map(tx => (
                    <div
                        key={tx.id}
                        className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center px-5 py-3.5 border-b border-border last:border-b-0 hover:bg-secondary/40 transition-colors"
                    >
                        {/* Game name */}
                        <div className="flex items-center gap-3 min-w-0">
                            {tx.cover_url ? (
                                <img
                                    src={tx.cover_url}
                                    alt={tx.title}
                                    className="w-9 h-9 rounded-md object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                    <Heart size={14} className="text-muted-foreground" />
                                </div>
                            )}
                            <span className="text-sm font-medium text-white truncate">{tx.title}</span>
                        </div>

                        {/* Platform */}
                        <span className="text-sm text-secondary-foreground truncate">
                            {tx.platform || '—'}
                        </span>

                        {/* Genre */}
                        <span className="text-sm text-secondary-foreground truncate">
                            {tx.genre || '—'}
                        </span>

                        {/* Price */}
                        <span className="text-sm font-mono text-white">
                            {(tx.price !== null && tx.price !== undefined)
                                ? `${parseFloat(tx.price || 0).toFixed(2)} ${tx.currency || 'EUR'}`
                                : '—'
                            }
                        </span>

                        {/* Actions */}
                        <div className="flex gap-1 items-center">
                            <button
                                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                                onClick={() => onStatusChange(tx.id, 'Backlog')}
                                title={t('wishlist.moveToBacklog')}
                            >
                                <ArrowRight size={14} />
                            </button>
                            <button
                                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-white transition-colors"
                                onClick={() => onEdit(tx)}
                                title={t('common.edit')}
                            >
                                <Pencil size={14} />
                            </button>
                            <button
                                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                onClick={() => onDelete(tx.id)}
                                title={t('common.delete')}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WishlistView;
