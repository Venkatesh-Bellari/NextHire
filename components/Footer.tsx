import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white mt-12 border-t border-slate-200">
      <div className="container mx-auto py-6 px-4 text-center text-slate-500">
        <p>&copy; {new Date().getFullYear()} NextHire. All rights reserved.</p>
        <p className="text-sm mt-1">Powered by AI for a smarter job search.</p>
      </div>
    </footer>
  );
};

export default Footer;