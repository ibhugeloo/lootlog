import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const WARNING_KEYS = {
  unknown_type: 'import.warningUnknownType',
  invalid_price: 'import.warningInvalidPrice',
  unknown_currency: 'import.warningUnknownCurrency',
  unknown_platform: 'import.warningUnknownPlatform',
  unknown_genre: 'import.warningUnknownGenre',
  unknown_status: 'import.warningUnknownStatus',
  invalid_date: 'import.warningInvalidDate',
};

const ERROR_KEYS = {
  title_required: 'import.warningTitleRequired',
};

const ImportPreviewTable = ({ rows, onDeleteRow }) => {
  const { t } = useTranslation();

  const validCount = rows.filter(r => r.errors.length === 0 && r.warnings.length === 0).length;
  const warningCount = rows.filter(r => r.warnings.length > 0 && r.errors.length === 0).length;
  const errorCount = rows.filter(r => r.errors.length > 0).length;

  return (
    <div className="flex flex-col gap-3">
      {/* Summary */}
      <p className="text-xs text-[#FF5C00]">
        {t('import.previewSummary', { valid: validCount, warnings: warningCount, errors: errorCount })}
      </p>

      {/* Table */}
      <div className="bg-[#1A1A1F]/50 border border-[#1F1F23] rounded-lg overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1F1F23]">
              <th className="text-xs font-medium text-[#505058] px-3 py-2">{t('transactions.game')}</th>
              <th className="text-xs font-medium text-[#505058] px-3 py-2">{t('transactions.type')}</th>
              <th className="text-xs font-medium text-[#505058] px-3 py-2">{t('transactions.price')}</th>
              <th className="text-xs font-medium text-[#505058] px-3 py-2">{t('transactions.platform')}</th>
              <th className="text-xs font-medium text-[#505058] px-3 py-2">{t('transactions.date')}</th>
              <th className="text-xs font-medium text-[#505058] px-3 py-2">{t('transactions.status')}</th>
              <th className="text-xs font-medium text-[#505058] px-3 py-2"></th>
              <th className="text-xs font-medium text-[#505058] px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const hasError = row.errors.length > 0;
              const hasWarning = row.warnings.length > 0;

              return (
                <tr
                  key={i}
                  className={`border-b border-[#1F1F23] last:border-b-0 text-sm text-white ${
                    hasError ? 'bg-red-500/5' : hasWarning ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <td className="px-3 py-2 max-w-[140px] truncate" title={row.data.title}>
                    {row.data.title || '—'}
                  </td>
                  <td className="px-3 py-2 text-[#A0A0A8]">{row.data.type}</td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {row.data.price} {row.data.currency}
                  </td>
                  <td className="px-3 py-2 text-[#A0A0A8]">{row.data.platform}</td>
                  <td className="px-3 py-2 text-[#A0A0A8] text-xs">{row.data.purchase_date}</td>
                  <td className="px-3 py-2 text-[#A0A0A8]">{row.data.status}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {row.errors.map((e, j) => (
                        <span
                          key={`e-${j}`}
                          className="inline-block text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded"
                        >
                          {t(ERROR_KEYS[e] || e)}
                        </span>
                      ))}
                      {row.warnings.map((w, j) => (
                        <span
                          key={`w-${j}`}
                          className="inline-block text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded"
                        >
                          {t(WARNING_KEYS[w] || w)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => onDeleteRow(i)}
                      title={t('import.deleteRow')}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#1F1F23] text-[#505058] hover:text-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ImportPreviewTable;
