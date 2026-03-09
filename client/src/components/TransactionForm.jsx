import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const GENRES = [
    'FPS', 'RPG', 'MOBA', 'Racing', 'Action-Adventure',
    'Rogue-like', 'Sports', 'Strategy', 'Gacha', 'Card Game',
    'Simulation', 'Horror', 'Puzzle', 'Platformer', 'Battle Royale', 'Other'
];

const TRANSACTION_TYPES = [
    { value: 'game', labelKey: 'transactionTypes.game' },
    { value: 'dlc', labelKey: 'transactionTypes.dlc' },
    { value: 'skin', labelKey: 'transactionTypes.skin' },
    { value: 'battle_pass', labelKey: 'transactionTypes.battle_pass' },
    { value: 'currency', labelKey: 'transactionTypes.currency' },
    { value: 'loot_box', labelKey: 'transactionTypes.loot_box' },
    { value: 'subscription', labelKey: 'transactionTypes.subscription' },
];

const STATUS_OPTIONS = [
    { value: 'Backlog', labelKey: 'statusLabels.Backlog' },
    { value: 'Playing', labelKey: 'statusLabels.Playing' },
    { value: 'Completed', labelKey: 'statusLabels.Completed' },
    { value: 'Wishlist', labelKey: 'statusLabels.Wishlist' },
    { value: 'Abandoned', labelKey: 'statusLabels.Abandoned' },
];

const TransactionForm = ({ onAddTransaction, initialData = null, games = [] }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        title: '',
        platform: 'PC',
        price: '',
        currency: 'EUR',
        store: '',
        purchase_date: new Date().toISOString().split('T')[0],
        status: 'Backlog',
        notes: '',
        genre: 'Other',
        rating: null,
        hours_played: 0,
        cover_url: null,
        type: 'game',
        parent_game_id: null,
    });

    const [parentSearch, setParentSearch] = useState('');

    const [coverResults, setCoverResults] = useState([]);
    const [searchingCover, setSearchingCover] = useState(false);
    const searchTimeout = useRef(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                platform: initialData.platform || 'PC',
                price: initialData.price || '',
                currency: initialData.currency || 'EUR',
                store: initialData.store || '',
                purchase_date: initialData.purchase_date
                    ? initialData.purchase_date.split('T')[0]
                    : new Date().toISOString().split('T')[0],
                status: initialData.status || 'Backlog',
                notes: initialData.notes || '',
                genre: initialData.genre || 'Other',
                rating: initialData.rating || null,
                hours_played: initialData.hours_played || 0,
                cover_url: initialData.cover_url || null,
                type: initialData.type || 'game',
                parent_game_id: initialData.parent_game_id || null,
            });
            if (initialData.parent_game_id) {
                const parentGame = games.find(g => g.id === initialData.parent_game_id);
                if (parentGame) setParentSearch(parentGame.title);
            }
        }
    }, [initialData, games]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Debounced cover search on title change
        if (name === 'title' && value.length > 2) {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
            searchTimeout.current = setTimeout(() => searchCover(value), 600);
        }
    };

    const searchCover = async (query) => {
        const apiKey = import.meta.env.VITE_RAWG_API_KEY;
        if (!apiKey) return;

        setSearchingCover(true);
        try {
            const res = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=5`);
            const data = await res.json();
            if (data.results) {
                setCoverResults(data.results.map(g => ({
                    id: g.id,
                    name: g.name,
                    image: g.background_image,
                })));
            }
        } catch (err) {
            console.warn('RAWG search failed:', err);
        } finally {
            setSearchingCover(false);
        }
    };

    const selectCover = (url) => {
        setFormData(prev => ({ ...prev, cover_url: url }));
    };

    const filteredGames = parentSearch.length > 0
        ? games.filter(g => g.title.toLowerCase().includes(parentSearch.toLowerCase())).slice(0, 8)
        : games.slice(0, 8);

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddTransaction({
            ...formData,
            price: parseFloat(formData.price) || 0,
            hours_played: parseFloat(formData.hours_played) || 0,
            rating: formData.rating ? parseInt(formData.rating) : null,
            parent_game_id: formData.type === 'game' ? null : formData.parent_game_id,
        });
    };

    const setRating = (val) => {
        setFormData(prev => ({
            ...prev,
            rating: prev.rating === val ? null : val,
        }));
    };

    const inputClass = "w-full px-3.5 py-2.5 bg-secondary border border-border rounded-lg text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors";
    const labelClass = "text-sm font-medium text-secondary-foreground";
    const formGroupClass = "flex flex-col gap-1.5";
    const selectWrapClass = "relative";
    const selectClass = `${inputClass} appearance-none pr-8`;

    return (
        <div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Title */}
                <div className={formGroupClass}>
                    <label className={labelClass}>{t('form.gameTitle')}</label>
                    <div className="relative">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder={t('form.gameTitlePlaceholder')}
                            className={`${inputClass} pl-9`}
                            required
                        />
                    </div>
                    {/* Cover search results */}
                    {coverResults.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {coverResults.map(g => g.image && (
                                <img
                                    key={g.id}
                                    src={g.image}
                                    alt={g.name}
                                    title={g.name}
                                    className={`w-12 h-16 rounded-md object-cover cursor-pointer border-2 transition-colors ${
                                        formData.cover_url === g.image
                                            ? 'border-primary'
                                            : 'border-transparent hover:border-primary/50'
                                    }`}
                                    onClick={() => selectCover(g.image)}
                                />
                            ))}
                        </div>
                    )}
                    {searchingCover && (
                        <p className="text-xs text-muted-foreground mt-0.5">{t('form.searchingCovers')}</p>
                    )}
                </div>

                {/* Type d'achat */}
                <div className={formGroupClass}>
                    <label className={labelClass}>{t('form.purchaseType')}</label>
                    <div className={selectWrapClass}>
                        <select name="type" value={formData.type} onChange={handleChange} className={selectClass}>
                            {TRANSACTION_TYPES.map(tx => (
                                <option key={tx.value} value={tx.value}>{t(tx.labelKey)}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                </div>

                {/* Parent Game — only for non-game types */}
                {formData.type !== 'game' && (
                    <div className={formGroupClass}>
                        <label className={labelClass}>{t('form.parentGame')}</label>
                        <input
                            type="text"
                            placeholder={t('form.searchGame')}
                            value={parentSearch}
                            onChange={e => {
                                setParentSearch(e.target.value);
                                if (!e.target.value) setFormData(prev => ({ ...prev, parent_game_id: null }));
                            }}
                            className={inputClass}
                        />
                        {parentSearch.length > 0 && !formData.parent_game_id && filteredGames.length > 0 && (
                            <div className="mt-1 bg-secondary border border-border rounded-lg overflow-hidden">
                                {filteredGames.map(g => (
                                    <button
                                        key={g.id}
                                        type="button"
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-white hover:bg-muted transition-colors text-left"
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, parent_game_id: g.id }));
                                            setParentSearch(g.title);
                                        }}
                                    >
                                        {g.cover_url && (
                                            <img src={g.cover_url} alt="" className="w-6 h-8 rounded object-cover shrink-0" />
                                        )}
                                        <span>{g.title}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {formData.parent_game_id && (
                            <div className="mt-1 flex items-center gap-2">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary">
                                    {parentSearch}
                                </span>
                                <button
                                    type="button"
                                    className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, parent_game_id: null }));
                                        setParentSearch('');
                                    }}
                                >
                                    {t('form.remove')}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Date */}
                <div className={formGroupClass}>
                    <label className={labelClass}>{t('form.purchaseDate')}</label>
                    <input
                        type="date"
                        name="purchase_date"
                        value={formData.purchase_date}
                        onChange={handleChange}
                        className={inputClass}
                        required
                    />
                </div>

                {/* Platform + Status */}
                <div className="grid grid-cols-2 gap-3">
                    <div className={formGroupClass}>
                        <label className={labelClass}>{t('form.platform')}</label>
                        <div className={selectWrapClass}>
                            <select name="platform" value={formData.platform} onChange={handleChange} className={selectClass}>
                                <option value="PC">PC</option>
                                <option value="Steam">Steam</option>
                                <option value="PS5">PS5</option>
                                <option value="PS4">PS4</option>
                                <option value="Switch">Switch</option>
                                <option value="Xbox Series">Xbox Series</option>
                                <option value="Xbox One">Xbox One</option>
                                <option value="Mobile">Mobile</option>
                                <option value="Console">Console</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>

                    <div className={formGroupClass}>
                        <label className={labelClass}>{t('form.status')}</label>
                        <div className={selectWrapClass}>
                            <select name="status" value={formData.status} onChange={handleChange} className={selectClass}>
                                {STATUS_OPTIONS.map(s => (
                                    <option key={s.value} value={s.value}>{t(s.labelKey)}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Genre + Rating */}
                <div className="grid grid-cols-2 gap-3">
                    <div className={formGroupClass}>
                        <label className={labelClass}>{t('form.genre')}</label>
                        <div className={selectWrapClass}>
                            <select name="genre" value={formData.genre} onChange={handleChange} className={selectClass}>
                                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>

                    <div className={formGroupClass}>
                        <label className={labelClass}>{t('form.ratingLabel', { value: formData.rating || '—' })}</label>
                        <div className="flex gap-0.5 items-center pt-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => setRating(n)}
                                    className={`text-base leading-none transition-colors ${
                                        formData.rating >= n ? 'text-primary' : 'text-muted-foreground hover:text-primary/60'
                                    }`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Price + Currency + Hours */}
                <div className="grid grid-cols-[2fr_1fr_1.5fr] gap-3">
                    <div className={formGroupClass}>
                        <label className={labelClass}>{t('form.price')}</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                            className={`${inputClass} font-mono`}
                            required
                        />
                    </div>
                    <div className={formGroupClass}>
                        <label className={labelClass}>{t('form.currency')}</label>
                        <div className={selectWrapClass}>
                            <select name="currency" value={formData.currency} onChange={handleChange} className={selectClass}>
                                <option value="EUR">EUR</option>
                                <option value="USD">USD</option>
                                <option value="GBP">GBP</option>
                                <option value="JPY">JPY</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>
                    <div className={formGroupClass}>
                        <label className={labelClass}>{t('form.hoursPlayed')}</label>
                        <input
                            type="number"
                            name="hours_played"
                            value={formData.hours_played}
                            onChange={handleChange}
                            placeholder="0"
                            step="0.5"
                            min="0"
                            className={`${inputClass} font-mono`}
                        />
                    </div>
                </div>

                {/* Store */}
                <div className={formGroupClass}>
                    <label className={labelClass}>{t('form.store')}</label>
                    <input
                        type="text"
                        name="store"
                        value={formData.store}
                        onChange={handleChange}
                        placeholder={t('form.storePlaceholder')}
                        className={inputClass}
                    />
                </div>

                {/* Notes */}
                <div className={formGroupClass}>
                    <label className={labelClass}>{t('form.notes')}</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder={t('form.notesPlaceholder')}
                        rows="2"
                        className={`${inputClass} resize-none`}
                    />
                </div>

                {/* Selected Cover Preview */}
                {formData.cover_url && (
                    <div className="flex items-center gap-3">
                        <img
                            src={formData.cover_url}
                            alt="Cover"
                            className="w-[60px] h-[80px] rounded-lg object-cover"
                        />
                        <button
                            type="button"
                            className="flex items-center gap-1.5 text-xs text-destructive hover:text-destructive/80 transition-colors"
                            onClick={() => setFormData(prev => ({ ...prev, cover_url: null }))}
                        >
                            <X size={14} />
                            {t('form.removeCover')}
                        </button>
                    </div>
                )}

                <button type="submit" className="w-full py-3 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors mt-1">
                    {initialData ? t('form.saveChanges') : t('form.addTransaction')}
                </button>
            </form>
        </div>
    );
};

export default TransactionForm;
