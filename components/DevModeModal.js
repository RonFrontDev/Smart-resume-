import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { XIcon } from './icons';
export const DevModeModal = ({ t, onClose, onConfirm, isActivating }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        const success = onConfirm(code);
        if (!success) {
            setError(true);
            setCode('');
        }
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in no-print", role: "dialog", "aria-modal": "true", onClick: onClose, children: _jsxs("div", { className: "relative bg-white rounded-2xl shadow-2xl p-8 m-4 max-w-sm w-full animate-fade-in-up", onClick: e => e.stopPropagation(), children: [_jsx("button", { onClick: onClose, className: "absolute top-4 right-4 text-gray-400 hover:text-gray-600", "aria-label": "Close", children: _jsx(XIcon, { className: "h-6 w-6" }) }), _jsx("h3", { className: "text-xl font-bold text-gray-800 mb-4", children: isActivating ? t.devModeModal.titleActivate : t.devModeModal.titleDeactivate }), _jsx("p", { className: "text-gray-600 mb-6", children: t.devModeModal.message }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsx("label", { htmlFor: "dev-code", className: "block text-sm font-medium text-gray-700", children: t.devModeModal.codeLabel }), _jsx("input", { type: "password", id: "dev-code", value: code, onChange: (e) => {
                                setCode(e.target.value);
                                setError(false);
                            }, className: `mt-1 block w-full px-3 py-2 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none ${error ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-orange-500 focus:border-orange-500'} sm:text-sm`, autoFocus: true }), error && _jsx("p", { className: "mt-2 text-sm text-red-600", children: t.devModeModal.error }), _jsxs("div", { className: "flex justify-end gap-3 mt-6", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-colors", children: t.devModeModal.cancel }), _jsx("button", { type: "submit", className: "px-4 py-2 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors", children: t.devModeModal.confirm })] })] })] }) }));
};
