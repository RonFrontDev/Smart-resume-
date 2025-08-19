import React from 'react';
import { translations } from '../i18n';
import { XIcon, MailIcon, PhoneIcon, LinkedInIcon, InstagramIcon } from './icons';

interface ContactModalProps {
  t: (typeof translations)['en'];
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ t, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in no-print"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-8 m-4 max-w-md w-full animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Close">
          <XIcon className="h-6 w-6" />
        </button>
        <h3 className="text-2xl font-bold text-gray-800 mb-6">{t.contact.title}</h3>
        <div className="space-y-4">
          <a href={`tel:${t.contact.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 group">
            <PhoneIcon className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
            <span className="text-gray-700 font-medium group-hover:text-orange-600 transition-colors">{t.contact.phone}</span>
          </a>
          <a href={`mailto:${t.contact.email}`} className="flex items-center gap-3 group">
            <MailIcon className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
            <span className="text-gray-700 font-medium group-hover:text-orange-600 transition-colors">{t.contact.email}</span>
          </a>
          <a href={`https://${t.online.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
            <LinkedInIcon className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
            <span className="text-gray-700 font-medium group-hover:text-orange-600 transition-colors print-show-url">{t.online.linkedinText}</span>
          </a>
          <a href={`https://${t.online.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
            <InstagramIcon className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
            <span className="text-gray-700 font-medium group-hover:text-orange-600 transition-colors print-show-url">{t.online.instagramText}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
