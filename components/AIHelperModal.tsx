import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCopyToClipboard } from 'usehooks-ts';
import html2pdf from 'html2pdf.js';
import { FileText, ListChecks, Sparkles, AlertTriangle, Lightbulb, Copy, Check, FileDown } from 'lucide-react';

import type { SkillGapAnalysisResult } from '../types';
import { translations } from '../i18n';
import { cn } from '../lib/utils';
import { XIcon } from './icons';

const MatchScoreBar: React.FC<{ score: number; t: (typeof translations)['en'] }> = ({ score, t }) => {
  const scoreColor = useMemo(() => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }, [score]);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        {t.aiHelperModal.skillGap.matchScoreTitle}
      </h3>
      <div className="relative w-full bg-gray-200 rounded-full h-6 overflow-hidden">
        <motion.div
          className={cn("absolute top-0 left-0 h-full rounded-full", scoreColor)}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white" style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.4)' }}>
            {Math.round(score)}% {t.aiHelperModal.skillGap.matchScoreLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

const AITab: React.FC<{
  title: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}> = ({ title, icon: Icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 focus:outline-none transition-colors",
        isActive
          ? "text-orange-600 border-orange-600"
          : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
      )}
      role="tab"
      aria-selected={isActive}
    >
      <Icon size={16} />
      <span>{title}</span>
    </button>
);

export const AIHelperModal: React.FC<{
  t: (typeof translations)['en'];
  onClose: () => void;
  activeCategory: string;
  isGenerating: boolean;
  onGenerate: (jobDescription: string) => void;
  result: string;
  error: string;
  onStartOver: () => void;
  isAnalyzing: boolean;
  onAnalyze: (jobDescription: string) => void;
  analysisResult: SkillGapAnalysisResult | null;
  analysisError: string;
  isSummarizing: boolean;
  onGenerateSummary: () => void;
  analysisSummary: string;
  summaryError: string;
}> = ({ 
  t, onClose, activeCategory, 
  onGenerate, isGenerating, result, error, onStartOver, 
  isAnalyzing, onAnalyze, analysisResult, analysisError,
  isSummarizing, onGenerateSummary, analysisSummary, summaryError 
}) => {
  const [jobDesc, setJobDesc] = useState('');
  const [copiedValue, copy] = useCopyToClipboard();
  const [isCopied, setIsCopied] = useState(false);
  const [activeAiTab, setActiveAiTab] = useState<'coverLetter' | 'skillGap'>('coverLetter');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const formatAnalysisForTxt = (result: SkillGapAnalysisResult) => {
    let content = `${t.aiHelperModal.title}\n\n`;
    content += `--- ${t.aiHelperModal.skillGap.matchScoreTitle} ---\n`;
    content += `${result.matchPercentage}% ${t.aiHelperModal.skillGap.matchScoreLabel}\n\n`;
    content += `--- ${t.aiHelperModal.skillGap.gapsTitle} ---\n`;
    if (result.skillGaps.length > 0) {
      result.skillGaps.forEach(gap => {
        content += `- ${gap.skill}: ${gap.reason}\n`;
      });
    } else {
      content += `${t.aiHelperModal.skillGap.noGapsFound}\n`;
    }
    content += `\n--- ${t.aiHelperModal.skillGap.suggestionsTitle} ---\n`;
    result.suggestions.forEach(suggestion => {
      content += `- ${suggestion}\n`;
    });
    return content;
  };

  const handleCopy = () => {
    const contentToCopy = activeAiTab === 'coverLetter' 
      ? result 
      : (analysisResult ? formatAnalysisForTxt(analysisResult) : '');
    copy(contentToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const downloadAsFile = (filename: string, content: string, mimeType: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element); // Required for Firefox
    element.click();
    document.body.removeChild(element);
  };

  const downloadResultAsPdf = (content: string) => {
    const element = document.createElement('div');
    element.style.padding = '2rem';
    element.style.fontFamily = 'Inter, sans-serif';
    element.style.whiteSpace = 'pre-wrap';
    element.style.wordBreak = 'break-word';
    element.style.lineHeight = '1.6';
    element.style.color = '#333';
    element.innerText = content;

    html2pdf().from(element).set({
      margin: [1, 1, 1, 1],
      filename: `Cover_Letter_Ronny_Christensen.pdf`,
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).save();
  };
  
  const hasResult = activeAiTab === 'coverLetter' ? !!result : !!analysisResult;
  const hasError = activeAiTab === 'coverLetter' ? !!error : !!analysisError;
  const isLoading = isGenerating || isAnalyzing;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in no-print"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 m-4 max-w-3xl w-full animate-fade-in-up flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Close">
          <XIcon className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-2 rounded-full">
                <Sparkles className="h-6 w-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
                {t.aiHelperModal.title}
            </h2>
        </div>

        <div className="border-b border-gray-200 mb-4">
            <nav className="flex -mb-px" role="tablist">
                <AITab title={t.aiHelperModal.tabs.coverLetter} icon={FileText} isActive={activeAiTab === 'coverLetter'} onClick={() => setActiveAiTab('coverLetter')} />
                <AITab title={t.aiHelperModal.tabs.skillGap} icon={ListChecks} isActive={activeAiTab === 'skillGap'} onClick={() => setActiveAiTab('skillGap')} />
            </nav>
        </div>

        {hasResult ? (
          <>
            {activeAiTab === 'coverLetter' && (
              <div className="bg-gray-50 border rounded-lg p-4 my-4 overflow-y-auto flex-grow">
                <pre className="text-gray-700 whitespace-pre-wrap font-sans text-base">{result}</pre>
              </div>
            )}
            {activeAiTab === 'skillGap' && analysisResult && (
                 <div className="bg-gray-50 border rounded-lg p-4 sm:p-6 my-4 overflow-y-auto flex-grow">
                    <MatchScoreBar score={analysisResult.matchPercentage} t={t} />

                    {analysisSummary && (
                        <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg">
                           <h4 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
                               <Lightbulb className="text-orange-500 flex-shrink-0" size={18} /> {t.aiHelperModal.skillGap.summaryTitle}
                           </h4>
                           <p className="text-gray-700">{analysisSummary}</p>
                        </div>
                    )}
                    {summaryError && <p className="text-red-500 mb-4">{summaryError}</p>}

                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <AlertTriangle className="text-red-500 flex-shrink-0" size={20} /> {t.aiHelperModal.skillGap.gapsTitle}
                    </h3>
                    <ul className="list-disc list-inside space-y-3 mb-6 pl-2">
                        {analysisResult.skillGaps.map((gap, index) => (
                            <li key={`gap-${index}`}>
                                <strong className="text-gray-700">{gap.skill}:</strong>
                                <span className="text-gray-600 ml-1">{gap.reason}</span>
                            </li>
                        ))}
                         {analysisResult.skillGaps.length === 0 && <p className="text-gray-500 italic">{t.aiHelperModal.skillGap.noGapsFound}</p>}
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Lightbulb className="text-green-500 flex-shrink-0" size={20} /> {t.aiHelperModal.skillGap.suggestionsTitle}
                    </h3>
                    <ul className="list-disc list-inside space-y-3 pl-2">
                        {analysisResult.suggestions.map((suggestion, index) => (
                            <li key={`sug-${index}`} className="text-gray-700">{suggestion}</li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="flex flex-wrap gap-2 justify-end pt-4 border-t">
              <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 text-green-700 font-semibold hover:bg-green-200 transition-colors">
                {isCopied ? <Check size={16} /> : <Copy size={16} />}
                {isCopied ? t.aiHelperModal.copiedButton : t.aiHelperModal.copyButton}
              </button>
              
              {activeAiTab === 'coverLetter' && (
                  <>
                    <button onClick={() => downloadAsFile('cover_letter.txt', result, 'text/plain')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
                      <FileDown size={16} /> {t.aiHelperModal.downloadTxtButton}
                    </button>
                    <button onClick={() => downloadResultAsPdf(result)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
                      <FileDown size={16} /> {t.aiHelperModal.downloadPdfButton}
                    </button>
                  </>
              )}

              {activeAiTab === 'skillGap' && analysisResult && (
                 <>
                    <button onClick={() => downloadAsFile('skill_gap_analysis.txt', formatAnalysisForTxt(analysisResult), 'text/plain')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
                      <FileDown size={16} /> {t.aiHelperModal.downloadTxtButton}
                    </button>
                    <button onClick={() => downloadAsFile('skill_gap_analysis.json', JSON.stringify(analysisResult, null, 2), 'application/json')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
                      <FileDown size={16} /> {t.aiHelperModal.skillGap.downloadJsonButton}
                    </button>
                 </>
              )}

               {activeAiTab === 'skillGap' && analysisResult && !analysisSummary && (
                <button onClick={onGenerateSummary} disabled={isSummarizing} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSummarizing ? (
                        <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span>{t.aiHelperModal.skillGap.generatingSummaryButton}</span>
                        </>
                    ) : (
                        <>
                            <Sparkles size={16} />
                            <span>{t.aiHelperModal.skillGap.generateSummaryButton}</span>
                        </>
                    )}
                </button>
              )}

              <button onClick={onStartOver} className="px-4 py-2 rounded-lg bg-gray-600 text-white font-semibold hover:bg-gray-700 transition-colors">
                {t.aiHelperModal.startOverButton}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col">
            <p className="text-gray-600 mb-4 text-sm">
                {activeAiTab === 'coverLetter' 
                    ? t.aiHelperModal.coverLetter.description.replace('{category}', activeCategory)
                    : t.aiHelperModal.skillGap.description.replace('{category}', activeCategory)
                }
            </p>
            <textarea
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder={t.aiHelperModal.jobDescriptionPlaceholder}
              className="w-full flex-grow border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              disabled={isLoading}
            />
            {hasError && <p className="text-red-500 mt-2">{activeAiTab === 'coverLetter' ? error : analysisError}</p>}
            <div className="flex justify-end pt-4 mt-auto">
              <button
                onClick={() => activeAiTab === 'coverLetter' ? onGenerate(jobDesc) : onAnalyze(jobDesc)}
                disabled={isLoading || !jobDesc.trim()}
                className="flex items-center justify-center px-6 py-2 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>
                      {activeAiTab === 'coverLetter' ? t.aiHelperModal.coverLetter.generatingButton : t.aiHelperModal.skillGap.analyzingButton}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="mr-2" />
                    <span>
                      {activeAiTab === 'coverLetter' ? t.aiHelperModal.coverLetter.generateButton : t.aiHelperModal.skillGap.analyzeButton}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
