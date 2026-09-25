import React from 'react';
import { Sprout } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-[#DDE8DF] text-[#66756B] py-6 text-xs text-center">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="bg-[#EAF5EC] p-1.5 rounded-lg border border-[#DDE8DF]">
            <Sprout className="w-4 h-4 text-[#075B2A]" />
          </div>
          <span className="font-bold text-[#123524] text-sm">AgriChain</span>
          <span className="text-[#66756B]">| Agricultural Supply Chain Platform</span>
        </div>
        <div className="text-[#66756B]">
          © {new Date().getFullYear()} AgriChain Ecosystem. All rights reserved. Secure escrow payments & transparent logistics.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
