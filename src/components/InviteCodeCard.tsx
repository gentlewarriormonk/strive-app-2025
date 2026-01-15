'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';

interface InviteCodeCardProps {
  code: string;
  groupName: string;
}

export function InviteCodeCard({ code, groupName }: InviteCodeCardProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  return (
    <>
      <div className="flex flex-col gap-1 mb-4">
        <p className="text-white text-base font-bold">Invite students</p>
        <p className="text-[#92c0c9] text-sm">
          Share this code with your students to let them join the class.
        </p>
      </div>
      <div className="flex flex-col items-start gap-4 sm:flex-row">
        <div className="flex w-full max-w-xs">
          <input
            type="text"
            readOnly
            value={code}
            className="input-field flex-1 rounded-r-none border-r-0 font-mono text-lg"
          />
          <button
            onClick={copyToClipboard}
            className={`flex items-center justify-center px-3 rounded-r-lg border border-l-0 border-[#325e67] transition-colors ${
              copied 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-[#192f33] text-[#92c0c9] hover:bg-[#234248]'
            }`}
            aria-label="Copy join code"
          >
            <span className="material-symbols-outlined">
              {copied ? 'check' : 'content_copy'}
            </span>
          </button>
        </div>
        <Button variant="secondary" icon="qr_code_2" onClick={() => setShowQR(true)}>
          Show QR code
        </Button>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-sm overflow-hidden rounded-xl bg-[#111f22] border border-[#325e67]/50 shadow-2xl animate-fade-in p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Join Code QR</h3>
              <button
                onClick={() => setShowQR(false)}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              {/* QR Code placeholder - using a simple grid pattern as visual representation */}
              <div className="w-48 h-48 bg-white p-4 rounded-lg">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* QR-like pattern */}
                  <rect x="0" y="0" width="30" height="30" fill="black"/>
                  <rect x="70" y="0" width="30" height="30" fill="black"/>
                  <rect x="0" y="70" width="30" height="30" fill="black"/>
                  <rect x="5" y="5" width="20" height="20" fill="white"/>
                  <rect x="75" y="5" width="20" height="20" fill="white"/>
                  <rect x="5" y="75" width="20" height="20" fill="white"/>
                  <rect x="10" y="10" width="10" height="10" fill="black"/>
                  <rect x="80" y="10" width="10" height="10" fill="black"/>
                  <rect x="10" y="80" width="10" height="10" fill="black"/>
                  {/* Random data squares */}
                  <rect x="35" y="5" width="5" height="5" fill="black"/>
                  <rect x="45" y="5" width="5" height="5" fill="black"/>
                  <rect x="55" y="5" width="5" height="5" fill="black"/>
                  <rect x="35" y="15" width="5" height="5" fill="black"/>
                  <rect x="50" y="15" width="5" height="5" fill="black"/>
                  <rect x="5" y="35" width="5" height="5" fill="black"/>
                  <rect x="15" y="40" width="5" height="5" fill="black"/>
                  <rect x="25" y="35" width="5" height="5" fill="black"/>
                  <rect x="35" y="35" width="30" height="30" fill="black"/>
                  <rect x="40" y="40" width="20" height="20" fill="white"/>
                  <rect x="45" y="45" width="10" height="10" fill="black"/>
                  <rect x="70" y="35" width="5" height="5" fill="black"/>
                  <rect x="80" y="40" width="5" height="5" fill="black"/>
                  <rect x="90" y="35" width="5" height="5" fill="black"/>
                  <rect x="5" y="55" width="5" height="5" fill="black"/>
                  <rect x="20" y="55" width="5" height="5" fill="black"/>
                  <rect x="35" y="70" width="5" height="5" fill="black"/>
                  <rect x="45" y="75" width="5" height="5" fill="black"/>
                  <rect x="55" y="70" width="5" height="5" fill="black"/>
                  <rect x="70" y="70" width="25" height="25" fill="black"/>
                  <rect x="75" y="75" width="15" height="15" fill="white"/>
                  <rect x="80" y="80" width="5" height="5" fill="black"/>
                </svg>
              </div>
              
              <div className="text-center">
                <p className="text-white font-mono text-xl font-bold">{code}</p>
                <p className="text-[#92c0c9] text-sm mt-1">{groupName}</p>
              </div>
              
              <p className="text-[#92c0c9] text-xs text-center">
                Students can scan this QR code or enter the code manually to join.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



