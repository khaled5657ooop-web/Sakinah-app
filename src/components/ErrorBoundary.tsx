import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onResetToHome?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'حدث خلل غير متوقع أثناء عرض هذه الصفحة.',
    };
  }

  componentDidCatch(error: Error) {
    console.error('SAKINAH ErrorBoundary caught error:', error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, errorMessage: '' });
    if (this.props.onResetToHome) {
      this.props.onResetToHome();
    } else {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-lg w-full rounded-3xl bg-gradient-to-b from-[#03241b] to-[#021812] border border-[#c5a059]/35 p-8 text-center shadow-2xl space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-950/50 border border-amber-500/35 flex items-center justify-center text-amber-300">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold font-['Aref_Ruqaa',serif] text-[#dfbd69]">
              عذرًا، حدث عطل مؤقت في العرض
            </h2>
            <p className="text-sm font-['Amiri',serif] text-[#d4ccbf] leading-relaxed">
              نرجو المعذرة؛ تعثّر تحميل هذا الجزء مؤقتًا. يمكنك إعادة المحاولة أو العودة إلى الواجهة الرئيسية بسلام.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#dfbd69] to-[#c5a059] text-[#021812] font-bold font-['Amiri',serif] text-sm cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة المحاولة</span>
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#c5a059]/35 text-[#fbf9f5] hover:border-[#dfbd69] font-['Amiri',serif] text-sm cursor-pointer"
              >
                <Home className="w-4 h-4 text-[#dfbd69]" />
                <span>العودة للرئيسية</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
