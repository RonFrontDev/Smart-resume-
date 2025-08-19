import React from 'react';
import { translations } from '../i18n';
import { XIcon } from './icons';

interface DownloadConfirmationModalProps {
  t: (typeof translations)['en'];
  onClose: () => void;
  onConfirm: () => void;
  language: string;
  isDownloading: boolean;
}

export const DownloadConfirmationModal: React.FC<DownloadConfirmationModalProps> = ({
  t,
  onClose,
  onConfirm,
  language,
  isDownloading,
}) => {
  const languageMap: { [key: string]: string } = {
    en: 'English',
    da: 'Dansk',
    sv: 'Svenska',
  };
  const fullLanguageName = languageMap[language] || 'English';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in no-print"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-8 m-4 max-w-sm w-full animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Close" disabled={isDownloading}>
          <XIcon className="h-6 w-6" />
        </button>
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t.downloadModal.title}</h3>
        <p className="text-gray-600 mb-6">{t.downloadModal.message.replace('{language}', fullLanguageName)}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDownloading}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            {t.downloadModal.cancel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isDownloading}
            className="px-4 py-2 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-wait w-32 text-center"
          >
            {isDownloading ? (
              <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.downloadModal.downloading}
              </div>
            ) : (
              t.downloadModal.confirm
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
