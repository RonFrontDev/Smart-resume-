import React, { useState } from 'react';
import { translations } from '../i18n';
import { XIcon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { SkillGapAnalysisResult } from '../types';
import { callAIAssistant } from '../lib/utils';
import { cn } from '../lib/utils';

interface AIHelperModalProps {
  t: (typeof translations)['en'];
  onClose: () => void;
  resumeContent: string;
}

export const AIHelperModal: React.FC<AIHelperModalProps> = ({ t, onClose, resumeContent }) => {
    const [jobDescription, setJobDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<SkillGapAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!jobDescription.trim()) return;
        
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await callAIAssistant(jobDescription, resumeContent);
            setAnalysisResult(result);
        } catch (err) {
            setError(t.aiHelperModal.error);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderContent = () => {
        if (analysisResult) {
            return (
                <div className="space-y-6 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                    <h4 className="text-lg font-bold text-gray-800">{t.aiHelperModal.resultsTitle}</h4>
                    {/* Matching Skills */}
                    <div>
                        <h5 className="flex items-center gap-2 font-semibold text-green-700 mb-2">
                            <CheckCircle2 size={20} />
                            <span>{t.aiHelperModal.matchingSkills}</span>
                        </h5>
                        <ul className="space-y-2">
                            {analysisResult.matchingSkills.map((item, i) => (
                                <li key={`match-${i}`} className="p-3 bg-green-50/70 rounded-lg">
                                    <p className="font-semibold text-gray-800">{item.skill}</p>
                                    <p className="text-sm text-gray-600">{item.reasoning}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* Missing Skills */}
                    <div>
                        <h5 className="flex items-center gap-2 font-semibold text-red-700 mb-2">
                            <XCircle size={20} />
                            <span>{t.aiHelperModal.missingSkills}</span>
                        </h5>
                        <ul className="space-y-2">
                            {analysisResult.missingSkills.map((item, i) => (
                                <li key={`miss-${i}`} className="p-3 bg-red-50/70 rounded-lg">
                                    <p className="font-semibold text-gray-800">{item.skill}</p>
                                    <p className="text-sm text-gray-600">{item.reasoning}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                     {/* Suggestions */}
                    <div>
                        <h5 className="flex items-center gap-2 font-semibold text-blue-700 mb-2">
                            <Lightbulb size={20} />
                            <span>{t.aiHelperModal.suggestions}</span>
                        </h5>
                        <ul className="list-disc list-inside space-y-2 pl-2 text-gray-700">
                             {analysisResult.suggestions.map((suggestion, i) => (
                                <li key={`sug-${i}`}>{suggestion}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )
        }
        
        return (
             <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder={t.aiHelperModal.placeholder}
                  className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-shadow"
                  disabled={isLoading}
                  aria-label="Job Description"
                />
                <button
                  type="submit"
                  disabled={isLoading || !jobDescription.trim()}
                  className="w-full px-4 py-2.5 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t.aiHelperModal.analyzing}
                      </>
                    ) : (
                      t.aiHelperModal.button
                    )}
                </button>
             </form>
        )
    };

    return (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in no-print"
          role="dialog"
          aria-modal="true"
          onClick={onClose}
        >
          <div
            className={cn(
                "relative bg-white rounded-2xl shadow-2xl p-8 m-4 max-w-2xl w-full animate-fade-in-up transition-all duration-300",
                analysisResult ? "min-h-[500px]" : ""
            )}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Close">
              <XIcon className="h-6 w-6" />
            </button>
            <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{t.aiHelperModal.title}</h3>
                <p className="text-gray-600 mb-6">{t.aiHelperModal.subtitle}</p>
            </div>
            
            {error && (
                 <div className="bg-red-100/80 border-l-4 border-red-500 text-red-800 p-4 rounded-lg mb-4 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5" />
                    <p>{error}</p>
                 </div>
            )}
            
            {renderContent()}

          </div>
        </div>
      );
};
