import React, { useState, useMemo } from 'react';
import { Filter, Search, Trash2, Edit2, Download, ChevronLeft, ChevronRight, Gamepad2, ChevronDown } from 'lucide-react';
import { toEUR } from '../utils/currency';
import { useTranslation } from 'react-i18next';
import { formatDate, getLocale } from '../utils/formatters';

const ITEMS_PER_PAGE = 20;

const TYPE_KEYS = {
    game: 'transactionTypesShort.game',
    dlc: 'transactionTypesShort.dlc',
    skin: 'transactionTypesShort.skin',
    battle_pass: 'transactionTypesShort.battle_pass',
    currency: 'transactionTypesShort.currency',
    loot_box: 'transactionTypesShort.loot_box',
    subscription: 'transactionTypesShort.subscription',
};

const TYPE_PILL_CLASSES = {
    game: 'bg-primary/15 text-primary',
    dlc: 'bg-[#8B5CF6]/15 text-[#8B5CF6]',
    skin: 'bg-[#3B82F6]/15 text-[#3B82F6]',
    battle_pass: 'bg-[#F59E0B]/15 text-[#F59E0B]',
    currency: 'bg-[#10B981]/15 text-[#10B981]',
    loot_box: 'bg-[#EC4899]/15 text-[#EC4899]',
    subscription: 'bg-[#22C55E]/15 text-[#22C55E]',
};

const STATUS_PILL_CLASSES = {
    Backlog: 'bg-[#6B7280]/15 text-[#9CA3AF]',
    Playing: 'bg-[#3B82F6]/15 text-[#3B82F6]',
    Completed: 'bg-[#22C55E]/15 text-[#22C55E]',
    Wishlist: 'bg-[#8B5CF6]/15 text-[#8B5CF6]',
    Abandoned: 'bg-[#EF4444]/15 text-[#EF4444]',
};

const TransactionList = ({ transactions, onDelete, onEdit, exchangeRate = 0.92, isPremium = false }) => {
    const { t, i18n } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [platform, setPlatform] = useState('All');
    const [status, setStatus] = useState('All');
    const [store, setStore] = useState('All');
    const [genre, setGenre] = useState('All');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [currency, setCurrency] = useState('All');
    const [type, setType] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'purchase_date', direction: 'descending' });
    const [filtersOpen, setFiltersOpen] = useState(true);

    // Extract unique filter values from transactions
    const platforms = useMemo(() => ['All', ...new Set(transactions.map(tx => tx.platform).filter(Boolean))], [transactions]);
    const genres = useMemo(() => ['All', ...new Set(transactions.map(tx => tx.genre).filter(Boolean))], [transactions]);
    const stores = useMemo(() => ['All', ...new Set(transactions.map(tx => tx.store).filter(Boolean))], [transactions]);
    const currencies = useMemo(() => ['All', ...new Set(transactions.map(tx => tx.currency).filter(Boolean))], [transactions]);

    // Filter
    const filtered = useMemo(() => {
        return transactions.filter(tx => {
            const matchSearch = tx.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchPlatform = platform === 'All' || tx.platform === platform;
            const matchStatus = status === 'All' || tx.status === status;
            const matchStore = store === 'All' || tx.store === store;
            const matchCurrency = currency === 'All' || tx.currency === currency;
            const matchGenre = genre === 'All' || tx.genre === genre;
            const matchType = type === 'All' || (tx.type || 'game') === type;

            let matchDate = true;
            if (dateStart) matchDate = matchDate && new Date(tx.purchase_date) >= new Date(dateStart);
            if (dateEnd) matchDate = matchDate && new Date(tx.purchase_date) <= new Date(dateEnd);

            return matchSearch && matchPlatform && matchStatus && matchStore && matchCurrency && matchGenre && matchType && matchDate;
        });
    }, [transactions, searchTerm, platform, status, store, currency, genre, type, dateStart, dateEnd]);

    // Sort
    const sortedData = useMemo(() => {
        let items = [...filtered];
        if (sortConfig.key) {
            items.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                if (sortConfig.key === 'price') {
                    aVal = parseFloat(aVal);
                    bVal = parseFloat(bVal);
                }
                if (sortConfig.key === 'purchase_date') {
                    aVal = new Date(aVal);
                    bVal = new Date(bVal);
                }
                if (sortConfig.key === 'hours_played' || sortConfig.key === 'rating') {
                    aVal = parseFloat(aVal) || 0;
                    bVal = parseFloat(bVal) || 0;
                }

                if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [filtered, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
    const paginatedData = sortedData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Reset page on filter change
    React.useEffect(() => { setCurrentPage(1); }, [searchTerm, platform, status, store, genre, currency, type, dateStart, dateEnd]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key) => sortConfig.key === key ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : '';

    const totalSpent = filtered.reduce((acc, tx) => acc + toEUR(parseFloat(tx.price) || 0, tx.currency, exchangeRate), 0);

    // CSV Export
    const exportCSV = () => {
        const headers = [
            t('transactions.date'), t('transactions.game'), t('transactions.type'),
            t('transactions.platform'), t('transactions.price'), t('transactions.currency'),
            t('transactions.store'), t('transactions.status'), t('transactions.genre'),
            t('transactions.rating'), t('form.hoursPlayed'), t('form.notes')
        ];
        const rows = sortedData.map(tx => [
            tx.purchase_date,
            `"${tx.title}"`,
            tx.type || 'game',
            tx.platform,
            tx.price,
            tx.currency,
            `"${tx.store || ''}"`,
            tx.status,
            tx.genre || '',
            tx.rating || '',
            tx.hours_played || 0,
            `"${(tx.notes || '').replace(/"/g, '""')}"`,
        ].join(','));

        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mosaic_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const getCostPerHour = (tx) => {
        const hours = parseFloat(tx.hours_played) || 0;
        if (hours === 0) return null;
        const priceEur = toEUR(parseFloat(tx.price) || 0, tx.currency, exchangeRate);
        return priceEur / hours;
    };

    const getCostClass = (cph) => {
        if (cph === null) return '';
        if (cph <= 1) return 'great';
        if (cph <= 3) return 'good';
        if (cph <= 5) return 'okay';
        return 'expensive';
    };

    const filterInputClass = "w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors";
    const filterLabelClass = "text-xs font-semibold text-secondary-foreground mb-1 block";

    return (
        <div className="bg-card border border-border rounded-xl p-8">
            {/* Summary Banner */}
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-5 mb-6 flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h4 className="text-base font-semibold text-white m-0">{t('transactions.filteredExpenses')}</h4>
                    <p className="text-sm text-secondary-foreground mt-1 mb-0">
                        {sortedData.length} {t('transactions.transactions')}
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="font-mono text-3xl font-bold text-primary">
                        {totalSpent.toFixed(2)} €
                    </div>
                    {isPremium && (
                        <button
                            className="flex items-center gap-2 px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-white hover:border-primary/50 transition-colors"
                            onClick={exportCSV}
                        >
                            <Download size={16} />
                            CSV
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6">
                <button
                    type="button"
                    className="flex items-center gap-2 mb-4 text-primary hover:text-accent transition-colors"
                    onClick={() => setFiltersOpen(v => !v)}
                >
                    <Filter size={18} />
                    <h3 className="text-sm font-semibold m-0">{t('common.filters')}</h3>
                    <ChevronDown size={16} className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                </button>

                {filtersOpen && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {/* Search */}
                        <div>
                            <label className={filterLabelClass}>{t('common.search')}</label>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder={t('transactions.searchPlaceholder')}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className={`${filterInputClass} pl-8`}
                                />
                            </div>
                        </div>

                        {/* Platform */}
                        <div>
                            <label className={filterLabelClass}>{t('transactions.platform')}</label>
                            <div className="relative">
                                <select
                                    value={platform}
                                    onChange={e => setPlatform(e.target.value)}
                                    className={`${filterInputClass} appearance-none pr-8`}
                                >
                                    {platforms.map(p => <option key={p} value={p}>{p === 'All' ? t('transactions.allPlatforms') : p}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className={filterLabelClass}>{t('transactions.status')}</label>
                            <div className="relative">
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                    className={`${filterInputClass} appearance-none pr-8`}
                                >
                                    <option value="All">{t('transactions.allStatuses')}</option>
                                    <option value="Backlog">{t('statusLabels.Backlog')}</option>
                                    <option value="Playing">{t('statusLabels.Playing')}</option>
                                    <option value="Completed">{t('statusLabels.Completed')}</option>
                                    <option value="Wishlist">{t('statusLabels.Wishlist')}</option>
                                    <option value="Abandoned">{t('statusLabels.Abandoned')}</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>

                        {/* Type */}
                        <div>
                            <label className={filterLabelClass}>{t('transactions.type')}</label>
                            <div className="relative">
                                <select
                                    value={type}
                                    onChange={e => setType(e.target.value)}
                                    className={`${filterInputClass} appearance-none pr-8`}
                                >
                                    <option value="All">{t('transactions.allTypes')}</option>
                                    {Object.entries(TYPE_KEYS).map(([val, key]) => (
                                        <option key={val} value={val}>{t(key)}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>

                        {/* Genre */}
                        <div>
                            <label className={filterLabelClass}>{t('transactions.genre')}</label>
                            <div className="relative">
                                <select
                                    value={genre}
                                    onChange={e => setGenre(e.target.value)}
                                    className={`${filterInputClass} appearance-none pr-8`}
                                >
                                    {genres.map(g => <option key={g} value={g}>{g === 'All' ? t('transactions.allGenres') : g}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>

                        {/* Store */}
                        <div>
                            <label className={filterLabelClass}>{t('transactions.store')}</label>
                            <div className="relative">
                                <select
                                    value={store}
                                    onChange={e => setStore(e.target.value)}
                                    className={`${filterInputClass} appearance-none pr-8`}
                                >
                                    {stores.map(s => <option key={s} value={s}>{s === 'All' ? t('transactions.allStores') : s}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>

                        {/* Date From */}
                        <div>
                            <label className={filterLabelClass}>{t('transactions.dateFrom')}</label>
                            <input
                                type="date"
                                value={dateStart}
                                onChange={e => setDateStart(e.target.value)}
                                className={filterInputClass}
                            />
                        </div>

                        {/* Date To */}
                        <div>
                            <label className={filterLabelClass}>{t('transactions.dateTo')}</label>
                            <input
                                type="date"
                                value={dateEnd}
                                onChange={e => setDateEnd(e.target.value)}
                                className={filterInputClass}
                            />
                        </div>

                        {/* Currency */}
                        <div>
                            <label className={filterLabelClass}>{t('transactions.currency')}</label>
                            <div className="relative">
                                <select
                                    value={currency}
                                    onChange={e => setCurrency(e.target.value)}
                                    className={`${filterInputClass} appearance-none pr-8`}
                                >
                                    {currencies.map(c => <option key={c} value={c}>{c === 'All' ? t('transactions.allCurrencies') : c}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b border-border text-xs text-muted-foreground">
                        <tr>
                            <th className="text-left font-medium px-5 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('purchase_date')}>
                                {t('transactions.date')}{getSortIndicator('purchase_date')}
                            </th>
                            <th className="text-left font-medium px-5 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('title')}>
                                {t('transactions.game')}{getSortIndicator('title')}
                            </th>
                            <th className="text-left font-medium px-5 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('platform')}>
                                {t('transactions.platform')}{getSortIndicator('platform')}
                            </th>
                            <th className="text-left font-medium px-5 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('price')}>
                                {t('transactions.price')}{getSortIndicator('price')}
                            </th>
                            <th className="text-left font-medium px-5 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('status')}>
                                {t('transactions.status')}{getSortIndicator('status')}
                            </th>
                            <th className="text-left font-medium px-5 py-3">
                                {t('transactions.actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(tx => {
                            const cph = getCostPerHour(tx);
                            const typeKey = tx.type || 'game';
                            const typePillClass = TYPE_PILL_CLASSES[typeKey] || 'bg-muted text-secondary-foreground';
                            const statusPillClass = STATUS_PILL_CLASSES[tx.status] || 'bg-muted text-secondary-foreground';

                            return (
                                <tr key={tx.id} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-secondary-foreground">
                                        {formatDate(tx.purchase_date, i18n.language)}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            {tx.cover_url ? (
                                                <img
                                                    src={tx.cover_url}
                                                    alt={tx.title}
                                                    className="w-16 h-16 rounded-lg object-contain shrink-0"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                    <Gamepad2 size={24} className="text-primary opacity-60" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-white">{tx.title}</div>
                                                {tx.genre && tx.genre !== 'Other' && (
                                                    <div className="text-xs text-muted-foreground mt-0.5">{tx.genre}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-secondary-foreground">
                                            {tx.platform}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                        <span className="font-mono text-white text-sm">
                                            {parseFloat(tx.price).toFixed(2)} {tx.currency}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {(tx.type && tx.type !== 'game') ? (
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typePillClass}`}>
                                                {TYPE_KEYS[tx.type] ? t(TYPE_KEYS[tx.type]) : tx.type}
                                            </span>
                                        ) : (
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusPillClass}`}>
                                                {t(`statusLabels.${tx.status}`)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                className="w-8 h-8 flex items-center justify-center rounded-md transition-colors text-primary hover:bg-primary/10"
                                                onClick={() => onEdit(tx)}
                                                title={t('common.edit')}
                                            >
                                                <Edit2 size={15} />
                                            </button>
                                            <button
                                                className="w-8 h-8 flex items-center justify-center rounded-md transition-colors text-destructive hover:bg-destructive/10"
                                                onClick={() => onDelete(tx.id)}
                                                title={t('common.delete')}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {sortedData.length === 0 && (
                    <div className="py-16 flex flex-col items-center justify-center text-muted-foreground">
                        <Gamepad2 size={40} className="opacity-30 mb-4" />
                        <p className="text-sm">{t('transactions.noGamesFound')}</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center gap-1.5 mt-6 flex-wrap">
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-secondary-foreground hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        let page;
                        if (totalPages <= 7) {
                            page = i + 1;
                        } else if (currentPage <= 4) {
                            page = i + 1;
                        } else if (currentPage >= totalPages - 3) {
                            page = totalPages - 6 + i;
                        } else {
                            page = currentPage - 3 + i;
                        }
                        return (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors ${
                                    currentPage === page
                                        ? 'bg-primary text-white'
                                        : 'border border-border text-secondary-foreground hover:text-white'
                                }`}
                            >
                                {page}
                            </button>
                        );
                    })}

                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-secondary-foreground hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight size={16} />
                    </button>

                    <span className="ml-2 text-xs text-muted-foreground">
                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, sortedData.length)} {t('transactions.of')} {sortedData.length}
                    </span>
                </div>
            )}
        </div>
    );
};

export default TransactionList;
