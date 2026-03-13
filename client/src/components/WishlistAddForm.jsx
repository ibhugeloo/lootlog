import React, { useState, useRef } from 'react';
import { Search, ArrowLeft, Heart, Gamepad2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PLATFORMS = ['PC', 'Steam', 'PS5', 'PS4', 'Switch', 'Xbox Series', 'Xbox One', 'Mobile'];

const WishlistAddForm = ({ onSave, onCancel }) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);
    const searchTimeout = useRef(null);

    // Form state
    const [platform, setPlatform] = useState('PC');
    const [priority, setPriority] = useState(null);
    const [targetPrice, setTargetPrice] = useState('');
    const [notes, setNotes] = useState('');
    const [manualTitle, setManualTitle] = useState('');
    const [manualPrice, setManualPrice] = useState('');

    const searchRAWG = async (query) => {
        const apiKey = import.meta.env.VITE_RAWG_API_KEY;
        if (!apiKey || query.length < 2) return;

        setSearching(true);
        try {
            const res = await fetch(
                `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=8`
            );
            const data = await res.json();
            if (data.results) {
                setSearchResults(data.results.map(g => ({
                    id: g.id,
                    name: g.name,
                    image: g.background_image,
                    released: g.released,
                    platforms: g.platforms?.map(p => p.platform.name).slice(0, 3) || [],
                    genres: g.genres?.map(g => g.name).slice(0, 2) || [],
                })));
            }
        } catch (err) {
            console.warn('RAWG search failed:', err);
        } finally {
            setSearching(false);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (value.length > 1) {
            searchTimeout.current = setTimeout(() => searchRAWG(value), 500);
        } else {
            setSearchResults([]);
        }
    };

    const selectGame = (game) => {
        setSelectedGame(game);
        // Auto-detect platform from game data
        if (game.platforms?.length > 0) {
            const firstPlatform = game.platforms[0];
            const mapped = PLATFORMS.find(p => firstPlatform.toLowerCase().includes(p.toLowerCase()));
            if (mapped) setPlatform(mapped);
        }
    };

    const handleSubmit = () => {
        const title = selectedGame ? selectedGame.name : manualTitle;
        if (!title.trim()) return;

        onSave({
            title: title.trim(),
            platform,
            price: parseFloat(manualPrice) || parseFloat(targetPrice) || 0,
            currency: 'EUR',
            status: 'Wishlist',
            type: 'game',
            genre: selectedGame?.genres?.[0] || 'Other',
            cover_url: selectedGame?.image || null,
            purchase_date: new Date().toISOString().split('T')[0],
            notes,
            priority,
            target_price: targetPrice ? parseFloat(targetPrice) : null,
        });
    };

    const hasRAWGKey = !!import.meta.env.VITE_RAWG_API_KEY;

    const inputClass = "w-full px-3.5 py-2.5 bg-[#111113] border border-[#1F1F23] rounded-lg text-sm text-white placeholder:text-[#505058] outline-none focus:border-primary/50 transition-colors";

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-semibold text-white">{t('wishlist.addToWishlist')}</h1>
                    <p className="text-sm text-muted-foreground mt-1">{t('wishlist.searchGame')}</p>
                </div>
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('wishlist.backToWishlist')}
                </button>
            </div>

            {/* Two-panel layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
                {/* Left: Search */}
                <div className="flex flex-col gap-4">
                    {hasRAWGKey && (
                        <>
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder={t('wishlist.searchGame')}
                                    className={`${inputClass} pl-10`}
                                    autoFocus
                                />
                            </div>

                            {/* Search results */}
                            <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
                                {searching && (
                                    <div className="text-sm text-muted-foreground py-4 text-center">{t('common.loading')}</div>
                                )}
                                {!searching && searchQuery.length > 1 && searchResults.length === 0 && (
                                    <div className="text-sm text-muted-foreground py-4 text-center">{t('wishlist.noResults')}</div>
                                )}
                                {searchResults.map(game => (
                                    <button
                                        key={game.id}
                                        onClick={() => selectGame(game)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:bg-white/5 ${
                                            selectedGame?.id === game.id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-[#1F1F23]'
                                        }`}
                                    >
                                        {game.image ? (
                                            <img src={game.image} alt="" className="w-12 h-16 rounded-lg object-cover flex-shrink-0" />
                                        ) : (
                                            <div className="w-12 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                                <Gamepad2 className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-white truncate">{game.name}</div>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                {game.platforms?.map((p, i) => (
                                                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[#1F1F23] text-muted-foreground">{p}</span>
                                                ))}
                                            </div>
                                            {game.released && (
                                                <span className="text-xs text-muted-foreground mt-1 block">{game.released.split('-')[0]}</span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Manual entry */}
                    <div className="flex flex-col gap-3">
                        {hasRAWGKey && (
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex-1 h-px bg-[#1F1F23]" />
                                {t('wishlist.manualEntry')}
                                <div className="flex-1 h-px bg-[#1F1F23]" />
                            </div>
                        )}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('wishlist.gameTitle')}</label>
                            <input
                                type="text"
                                value={selectedGame ? selectedGame.name : manualTitle}
                                onChange={e => { setManualTitle(e.target.value); setSelectedGame(null); }}
                                placeholder="e.g. Elden Ring"
                                className={inputClass}
                                autoFocus={!hasRAWGKey}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('wishlist.price')}</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={manualPrice}
                                    onChange={e => setManualPrice(e.target.value)}
                                    placeholder="0.00"
                                    className={`${inputClass} pr-12`}
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">EUR</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Selected game + options */}
                <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-5">
                    <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{t('wishlist.selectedGame')}</h3>

                    {selectedGame ? (
                        <div className="flex flex-col gap-4">
                            {/* Cover + info */}
                            <div className="flex gap-4">
                                {selectedGame.image ? (
                                    <img src={selectedGame.image} alt="" className="w-28 h-36 rounded-xl object-cover flex-shrink-0" />
                                ) : (
                                    <div className="w-28 h-36 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                                        <Gamepad2 className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="flex flex-col gap-2">
                                    <h4 className="text-lg font-semibold text-white">{selectedGame.name}</h4>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {selectedGame.platforms?.map((p, i) => (
                                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium">{p}</span>
                                        ))}
                                    </div>
                                    {selectedGame.released && (
                                        <span className="text-xs text-muted-foreground">{selectedGame.released}</span>
                                    )}
                                    {manualPrice && (
                                        <span className="font-mono text-lg font-bold text-primary">{parseFloat(manualPrice).toFixed(2)} EUR</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : manualTitle ? (
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-20 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                                <Gamepad2 className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-white">{manualTitle}</h4>
                                {manualPrice && (
                                    <span className="font-mono text-lg font-bold text-primary">{parseFloat(manualPrice).toFixed(2)} EUR</span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                <Search className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">{t('wishlist.noGameSelected')}</p>
                        </div>
                    )}

                    {/* Options */}
                    <div className="flex flex-col gap-4 pt-2 border-t border-border">
                        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{t('wishlist.wishlistOptions')}</h3>

                        {/* Platform */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('wishlist.preferredPlatform')}</label>
                            <select
                                value={platform}
                                onChange={e => setPlatform(e.target.value)}
                                className={`${inputClass} appearance-none`}
                            >
                                {PLATFORMS.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>

                        {/* Priority */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('wishlist.priority')}</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['Low', 'Medium', 'High'].map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(priority === p ? null : p)}
                                        className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                                            priority === p
                                                ? p === 'High' ? 'bg-primary text-white' : p === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[#1F1F23] text-white border border-[#2F2F35]'
                                                : 'bg-[#111113] border border-[#1F1F23] text-muted-foreground hover:text-white hover:border-[#2F2F35]'
                                        }`}
                                    >
                                        {t(`wishlist.priority${p}`)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Target price */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('wishlist.targetPrice')}</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={targetPrice}
                                    onChange={e => setTargetPrice(e.target.value)}
                                    placeholder="0.00"
                                    className={`${inputClass} pr-12`}
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">EUR</span>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('wishlist.notesOptional')}</label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder={t('wishlist.notesPlaceholder')}
                                rows={2}
                                className={`${inputClass} resize-none`}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-5 py-2.5 text-sm text-muted-foreground hover:text-white transition-colors"
                        >
                            {t('wishlist.cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!selectedGame && !manualTitle.trim()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Heart className="w-4 h-4" />
                            {t('wishlist.addToWishlist')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WishlistAddForm;
