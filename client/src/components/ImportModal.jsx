import React, { useState } from 'react';
import { X, FileText, Sparkles, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useImport } from '../hooks/useImport';
import ImportDropZone from './ImportDropZone';
import ImportPreviewTable from './ImportPreviewTable';

const ImportModal = ({ onClose, userId }) => {
  const { t, i18n } = useTranslation();
  const {
    step, mode, setMode,
    parsedRows, unmappedColumns, importableRows,
    importing, importResult,
    aiLoading, aiError,
    handleCsvParsed, handleAiParse, handleDeleteRow, handleConfirmImport,
    reset, setStep,
  } = useImport(userId);

  const [aiText, setAiText] = useState('');

  const handleClose = () => {
    onClose();
  };

  const handleBack = () => {
    if (step === 2) {
      reset();
    }
  };

  const handleTabChange = (newMode) => {
    if (step === 1) {
      setMode(newMode);
    }
  };

  const handleAiExtract = () => {
    if (!aiText.trim()) return;
    const language = i18n.language?.startsWith('fr') ? 'fr' : 'en';
    handleAiParse(aiText.trim(), language);
  };

  return (
    <div
      className="fixed inset-0 bg-[#0A0A0B]/60 flex items-center justify-center z-50"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="w-[600px] max-h-[85vh] overflow-y-auto bg-[#141417] border border-[#1F1F23] rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1F1F23]">
          <h2 className="font-serif text-lg text-white">{t('import.title')}</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#1A1A1F] text-[#505058] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 px-6 py-4">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-[#FF5C00]' : 'bg-[#1F1F23]'}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pb-5 flex flex-col gap-4">
          {/* Tabs — only on step 1 */}
          {step === 1 && (
            <div className="flex items-center gap-1 p-1 bg-[#1A1A1F] rounded-lg w-fit">
              <button
                onClick={() => handleTabChange('csv')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'csv'
                    ? 'bg-[#141417] text-white shadow-sm'
                    : 'text-[#505058] hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                {t('import.tabCsv')}
              </button>
              <button
                onClick={() => handleTabChange('ai')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'ai'
                    ? 'bg-[#141417] text-white shadow-sm'
                    : 'text-[#505058] hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                {t('import.tabAi')}
              </button>
            </div>
          )}

          {/* Step 1: Upload CSV */}
          {step === 1 && mode === 'csv' && (
            <ImportDropZone onFileLoaded={handleCsvParsed} />
          )}

          {/* Step 1: AI Import */}
          {step === 1 && mode === 'ai' && (
            <div className="flex flex-col gap-3">
              <textarea
                value={aiText}
                onChange={e => setAiText(e.target.value)}
                placeholder={t('import.aiPlaceholder')}
                maxLength={5000}
                className="w-full h-40 bg-[#111113] border border-[#1F1F23] rounded-lg px-4 py-3 text-sm text-white placeholder:text-[#505058] outline-none focus:border-[#FF5C00]/50 transition-colors resize-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAiExtract}
                  disabled={aiLoading || !aiText.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#FF5C00] hover:bg-[#FF5C00]/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {aiLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      {t('import.aiExtracting')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {t('import.aiExtract')}
                    </>
                  )}
                </button>
              </div>
              {aiError === 'error' && (
                <p className="text-xs text-red-400">{t('import.aiError')}</p>
              )}
              {aiError === 'empty' && (
                <p className="text-xs text-amber-400">{t('import.aiEmpty')}</p>
              )}
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              {unmappedColumns.length > 0 && (
                <div className="px-4 py-3 bg-amber-500/5 border border-amber-500/20 rounded-lg text-xs text-amber-400">
                  {t('import.unmappedColumns', { columns: unmappedColumns.join(', ') })}
                </div>
              )}

              {parsedRows.length > 0 ? (
                <ImportPreviewTable rows={parsedRows} onDeleteRow={handleDeleteRow} />
              ) : (
                <p className="text-center text-sm text-[#505058] py-8">{t('import.aiEmpty')}</p>
              )}
            </div>
          )}

          {/* Step 3: Result */}
          {step === 3 && importResult && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="text-5xl">{importResult.success > 0 ? '🎉' : '😕'}</div>
              <h3 className="text-lg font-semibold text-white">{t('import.resultSuccess')}</h3>
              <p className="text-sm text-[#A0A0A8]">{t('import.resultCount', { count: importResult.success })}</p>
              {importResult.errors > 0 && (
                <p className="text-sm text-red-400">{t('import.resultErrors', { count: importResult.errors })}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {(step === 2 || step === 3) && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1F1F23]">
            {step === 2 && (
              <>
                <button
                  onClick={handleBack}
                  className="px-4 py-2 bg-[#1A1A1F] hover:bg-[#1F1F23] text-sm text-[#A0A0A8] hover:text-white rounded-lg transition-colors"
                >
                  {t('import.back')}
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={importing || importableRows.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#FF5C00] hover:bg-[#FF5C00]/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {importing
                    ? t('import.importing')
                    : t('import.import', { count: importableRows.length })
                  }
                </button>
              </>
            )}
            {step === 3 && (
              <button
                onClick={handleClose}
                className="px-5 py-2.5 bg-[#FF5C00] hover:bg-[#FF5C00]/90 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {t('import.done')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportModal;
