import React from 'react';
import { X, Mic, Globe, Volume2, Brain, Smartphone, CheckCircle2, Sparkles } from 'lucide-react';

interface BeginnerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BeginnerGuideModal: React.FC<BeginnerGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: '1',
      title: 'Tap the Large Mic Button',
      desc: 'Tap the glowing green/blue orb or the big center microphone button. Your browser will ask for microphone permission. Click "Allow".',
      icon: Mic,
      color: 'from-emerald-500 to-teal-400',
    },
    {
      num: '2',
      title: 'Speak in Hindi or English',
      desc: 'Ask any question! You can speak pure Hindi ("भारत की राजधानी क्या है?"), English ("Tell me a joke"), or Hinglish ("Aaj weather kaisa hai?").',
      icon: Globe,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      num: '3',
      title: 'AI Understands & Answers with Voice',
      desc: 'NOVA processes your question using Gemini AI and immediately speaks the answer aloud. You can tap the speaker button anytime to replay.',
      icon: Volume2,
      color: 'from-blue-500 to-purple-500',
    },
    {
      num: '4',
      title: 'Automatic & Custom Memory',
      desc: 'NOVA remembers your preferences. In the Settings tab, you can view, add, or delete memories (like favorite foods, your name, habits, or notes).',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
    },
    {
      num: '5',
      title: 'Android Phone Experience',
      desc: 'Designed specifically for mobile screens. You can switch between Home, Chat, Voice, History, and Settings using the bottom navigation bar.',
      icon: Smartphone,
      color: 'from-emerald-500 to-cyan-500',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0a1326] border border-cyan-500/30 rounded-3xl p-5 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full filter blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Beginner Guide: NOVA AI</h3>
              <p className="text-[11px] text-slate-400">Step-by-step simple instructions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="flex items-start gap-3 p-3 rounded-2xl bg-[#0e1b33] border border-cyan-500/10"
              >
                <div
                  className={`w-8 h-8 rounded-xl bg-gradient-to-br ${st.color} text-slate-950 font-bold flex items-center justify-center text-xs shrink-0 shadow-md mt-0.5`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-100">{st.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-cyan-500/15">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] active:scale-95 transition-all"
          >
            Got it, Let's Start!
          </button>
        </div>
      </div>
    </div>
  );
};
