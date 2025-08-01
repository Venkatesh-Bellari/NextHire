import React from 'react';
import NextHireLogo from './icons/NextHireLogo';
import { View } from '../App';

interface HeaderProps {
    onNavigate: (view: View) => void;
    onScrollTo?: {
        features: () => void;
        about: () => void;
        howItWorks: () => void;
    };
}

const Header = ({ onNavigate, onScrollTo }: HeaderProps) => {
  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
      <nav className="flex items-center justify-between p-2 pl-4 text-white bg-black/20 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
        <a href="#" className="flex items-center gap-2" onClick={(e) => { e.preventDefault(); onNavigate('landing'); }}>
          <NextHireLogo className="h-6 w-6" />
          <span className="font-semibold text-lg">NextHire</span>
        </a>
        <div className="flex items-center gap-2">
            {onScrollTo && (
                <div className="hidden lg:flex items-center gap-2">
                    <button onClick={onScrollTo.features} className="px-4 py-1.5 text-sm hover:bg-white/10 rounded-full transition-colors">Features</button>
                    <button onClick={onScrollTo.about} className="px-4 py-1.5 text-sm hover:bg-white/10 rounded-full transition-colors">About</button>
                    <button onClick={onScrollTo.howItWorks} className="px-4 py-1.5 text-sm hover:bg-white/10 rounded-full transition-colors">How It Works</button>
                </div>
            )}
            
            <div className="flex items-center text-sm font-semibold">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3 py-1.5 text-slate-300 hover:text-white transition-colors"
                >
                  Login
                </button>
                <span className="text-slate-500">/</span>
                <button
                  onClick={() => onNavigate('signup')}
                  className="px-3 py-1.5 text-white hover:text-slate-200 transition-colors"
                >
                  Sign Up
                </button>
            </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
