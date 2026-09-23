import React from 'react';
import { Sprout } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs text-center">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-600/20 p-1.5 rounded-lg border border-emerald-500/30">
            <Sprout className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-bold text-slate-200 text-sm">AgriChain</span>
          <span className="text-slate-500">| Agricultural Supply Chain Platform</span>
        </div>
        <div className="text-slate-500">
          © {new Date().getFullYear()} AgriChain Inc. All rights reserved. Secure Escrow Payments.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
