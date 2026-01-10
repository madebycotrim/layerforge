import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';

/**
 * Componente de Feedback para Formulários
 * Exibe mensagens de sucesso, erro, warning ou info com animações suaves
 */
export default function FormFeedback({
    type = 'info',
    message,
    show = false,
    className = '',
    onClose
}) {
    if (!show || !message) return null;

    const configs = {
        success: {
            icon: CheckCircle2,
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/30',
            textColor: 'text-emerald-400',
            iconClass: 'icon-success'
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-rose-500/10',
            borderColor: 'border-rose-500/30',
            textColor: 'text-rose-400',
            iconClass: 'icon-error'
        },
        warning: {
            icon: AlertCircle,
            bgColor: 'bg-amber-500/10',
            borderColor: 'border-amber-500/30',
            textColor: 'text-amber-400',
            iconClass: 'animate-scale-in'
        },
        info: {
            icon: Info,
            bgColor: 'bg-sky-500/10',
            borderColor: 'border-sky-500/30',
            textColor: 'text-sky-400',
            iconClass: 'animate-scale-in'
        }
    };

    const config = configs[type] || configs.info;
    const Icon = config.icon;

    return (
        <div
            className={`
        flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm
        ${config.bgColor} ${config.borderColor}
        animate-slide-down
        ${className}
      `}
        >
            <Icon
                size={20}
                className={`shrink-0 mt-0.5 ${config.textColor} ${config.iconClass}`}
            />
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-relaxed ${config.textColor}`}>
                    {message}
                </p>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className={`shrink-0 ${config.textColor} hover:opacity-70 transition-opacity`}
                    aria-label="Fechar"
                >
                    <XCircle size={16} />
                </button>
            )}
        </div>
    );
}

/**
 * Hook para gerenciar feedback de formulário
 */
export function useFormFeedback() {
    const [feedback, setFeedback] = React.useState({
        show: false,
        type: 'info',
        message: ''
    });

    const showSuccess = (message) => {
        setFeedback({ show: true, type: 'success', message });
    };

    const showError = (message) => {
        setFeedback({ show: true, type: 'error', message });
    };

    const showWarning = (message) => {
        setFeedback({ show: true, type: 'warning', message });
    };

    const showInfo = (message) => {
        setFeedback({ show: true, type: 'info', message });
    };

    const hide = () => {
        setFeedback({ show: false, type: 'info', message: '' });
    };

    return {
        feedback,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hide
    };
}

/**
 * Componente de Input com validação visual
 */
export function ValidatedInput({
    value,
    onChange,
    onBlur,
    error,
    success,
    placeholder,
    type = 'text',
    className = '',
    ...props
}) {
    const getInputClass = () => {
        if (error) return 'input-error';
        if (success) return 'input-success';
        return '';
    };

    return (
        <div className="space-y-2">
            <input
                type={type}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                className={`
          w-full px-4 py-3 rounded-xl
          bg-zinc-900/50 border border-zinc-800
          text-zinc-100 placeholder-zinc-600
          focus:outline-none focus:border-sky-500/50
          transition-all duration-300
          ${getInputClass()}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="text-xs font-medium message-error flex items-center gap-2">
                    <XCircle size={14} />
                    {error}
                </p>
            )}
            {success && (
                <p className="text-xs font-medium message-success flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    {success}
                </p>
            )}
        </div>
    );
}
