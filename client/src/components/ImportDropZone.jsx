import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const ImportDropZone = ({ onFileLoaded }) => {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    setError(null);
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError(t('import.invalidFileType'));
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(t('import.fileTooLarge'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      onFileLoaded(e.target.result);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onClick = () => {
    inputRef.current?.click();
  };

  const onInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          dragging
            ? 'border-[#FF5C00] bg-[#FF5C00]/5'
            : 'border-[#1F1F23] hover:border-[#2A2A2F]'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={onInputChange}
          className="hidden"
        />
        <Upload className="w-8 h-8 text-[#505058]" />
        <p className="text-sm text-[#505058]">{t('import.dropzoneDrag')}</p>
        <p className="text-xs text-[#505058]">{t('import.dropzoneOr')}</p>
        <span className="text-sm text-[#FF5C00] font-medium">{t('import.dropzoneBrowse')}</span>
        <p className="text-xs text-[#505058]">{t('import.dropzoneHint')}</p>
      </div>
      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}
    </div>
  );
};

export default ImportDropZone;
