import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Gamepad2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../utils/formatters';

const TYPE_KEYS = {
    game: 'transactionTypesShort.game',
    dlc: 'transactionTypesShort.dlc',
    skin: 'transactionTypesShort.skin',
    battle_pass: 'transactionTypesShort.battle_pass',
    currency: 'transactionTypesShort.currency',
    loot_box: 'transactionTypesShort.loot_box',
    subscription: 'transactionTypesShort.subscription',
};

const SearchOverlay = ({ transactions, onSelect, onClose }) => {
    const { t, i18n } = useTranslation();
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const results = useMemo(() => {
        if (query.length < 2) return [];
        const q = query.toLowerCase();
        return transactions
            .filter(tx => tx.title.toLowerCase().includes(q))
            .slice(0, 12);
    }, [query, transactions]);

    return (
        <div
            className="fixed inset-0 bg-[#0A0A0B]/80 z-50 flex items-start justify-center pt-[20vh]"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full max-w-[560px] mx-4 bg-[#141417] border border-[#1F1F23] rounded-xl shadow-2xl overflow-hidden">
                {/* Search input row */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1F1F23]">
                    <Search className="w-5 h-5 text-[#505058] flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder={t('search.placeholder')}
                        className="flex-1 bg-transparent text-sm text-white placeholder:text-[#505058] outline-none"
                    />
                    <kbd className="text-xs text-[#505058] border border-[#1F1F23] rounded px-1.5 py-0.5 font-mono">ESC</kbd>
                </div>

                {/* Results */}
                {query.length >= 2 && (
                    <div className="max-h-[300px] overflow-y-auto">
                        {results.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-[#505058]">
                                {t('search.noResults')}
                            </div>
                        ) : (
                            results.map(tx => (
                                <button
                                    key={tx.id}
                                    className="w-full px-4 py-3 hover:bg-[#1F1F23]/50 cursor-pointer transition-colors flex items-center gap-3 text-left"
                                    onClick={() => { onSelect(tx); onClose(); }}
                                >
                                    {tx.cover_url ? (
                                        <img
                                            src={tx.cover_url}
                                            alt=""
                                            className="w-8 h-8 rounded object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded bg-[#1F1F23] flex items-center justify-center flex-shrink-0">
                                            <Gamepad2 className="w-4 h-4 text-[#505058]" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-white truncate">{tx.title}</div>
                                        <div className="text-xs text-[#505058] flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[#FF5C00]">
                                                {TYPE_KEYS[tx.type] ? t(TYPE_KEYS[tx.type]) : tx.type}
                                            </span>
                                            {tx.platform && <><span>·</span><span>{tx.platform}</span></>}
                                            {tx.purchase_date && <><span>·</span><span>{formatDate(tx.purchase_date, i18n.language)}</span></>}
                                        </div>
                                    </div>
                                    <div className="text-sm text-white font-mono flex-shrink-0">
                                        {parseFloat(tx.price || 0).toFixed(2)} {tx.currency || '€'}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}

                {query.length < 2 && (
                    <div className="px-4 py-8 text-center text-sm text-[#505058]">
                        {t('search.hint')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchOverlay;
