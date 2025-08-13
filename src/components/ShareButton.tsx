"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { 
  ShareIcon, 
  CopyIcon, 
  WhatsApp, 
  Facebook, 
  Twitter, 
  LinkedIn, 
  Telegram, 
  Email, 
  PhoneAndroid, 
  Close 
} from "@/components/icons/IconMappings";

interface ShareButtonProps {
  title?: string;
  description?: string;
  url?: string;
}

export default function ShareButton({ 
  title = "Pakistan Tech & Society Survey 2025", 
  description = "Share your voice about technology, healthcare, and youth issues in Pakistan",
  url 
}: ShareButtonProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  useEffect(() => {
    if (showShareMenu) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [showShareMenu]);
  
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("📋 Survey link copied to clipboard!");
      setShowShareMenu(false);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const shareToSocial = (platform: string) => {
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}%20-%20${encodedDescription}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}%20-%20${encodedDescription}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20-%20${encodedDescription}%20${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}%20-%20${encodedDescription}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      sms: `sms:?body=${encodedTitle}%20-%20${encodedDescription}%20${encodedUrl}`
    } as const;

    const dest = shareUrls[platform as keyof typeof shareUrls];
    if (dest) {
      window.open(dest, '_blank', 'width=600,height=400');
      setShowShareMenu(false);
      toast.success(`🚀 Opened ${platform} sharing!`);
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url: shareUrl });
        toast.success("📤 Shared successfully!");
      } catch (error:any) {
        if (error?.name !== 'AbortError') toast.error("Failed to share");
      }
    } else {
      copyToClipboard();
    }
    setShowShareMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-medium transition-all transform hover:scale-105 shadow-lg"
      >
        <ShareIcon sx={{ fontSize: 20 }} />
        Share Survey
      </button>

      {showShareMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[100] bg-black/60"
            onClick={() => setShowShareMenu(false)}
          />
          
          {/* Mobile Bottom Sheet (default) + Desktop Popover */}
          <div className="fixed inset-x-0 bottom-0 z-[101] glass rounded-t-2xl border border-white/20 p-4 max-h-[80vh] overflow-y-auto w-full pb-[calc(env(safe-area-inset-bottom)+16px)] md:absolute md:inset-auto md:top-full md:right-0 md:mt-2 md:rounded-xl md:w-auto md:min-w-80 shadow-2xl">
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ShareIcon sx={{ fontSize: 24, color: '#10b981' }} />
                  <h3 className="text-lg font-semibold text-white">Share Survey</h3>
                </div>
                <p className="text-sm text-white/70">Help others participate in this important survey</p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <button
                  onClick={shareNative}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-lg text-white text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <PhoneAndroid sx={{ fontSize: 18 }} />
                  {navigator.share ? 'Share via Device' : 'Copy Link'}
                </button>
                
                <button
                  onClick={copyToClipboard}
                  className="w-full bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg text-white text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <CopyIcon sx={{ fontSize: 18 }} />
                  Copy Link
                </button>
              </div>

              {/* URL Display */}
              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-xs text-white/50 mb-1">Survey URL:</div>
                <div className="text-sm text-emerald-400 font-mono break-all">
                  {shareUrl}
                </div>
              </div>

              {/* Social Platforms */}
              <div>
                <div className="text-sm text-white/70 mb-2">Share on social media:</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button onClick={() => shareToSocial('whatsapp')} className="bg-green-600 hover:bg-green-500 px-3 py-2 rounded-lg text-white text-sm flex items-center gap-2 transition-all"><WhatsApp sx={{ fontSize: 16 }} />WhatsApp</button>
                  <button onClick={() => shareToSocial('facebook')} className="bg-blue-700 hover:bg-blue-600 px-3 py-2 rounded-lg text-white text-sm flex items-center gap-2 transition-all"><Facebook sx={{ fontSize: 16 }} />Facebook</button>
                  <button onClick={() => shareToSocial('twitter')} className="bg-sky-600 hover:bg-sky-500 px-3 py-2 rounded-lg text-white text-sm flex items-center gap-2 transition-all"><Twitter sx={{ fontSize: 16 }} />Twitter</button>
                  <button onClick={() => shareToSocial('linkedin')} className="bg-blue-800 hover:bg-blue-700 px-3 py-2 rounded-lg text-white text-sm flex items-center gap-2 transition-all"><LinkedIn sx={{ fontSize: 16 }} />LinkedIn</button>
                  <button onClick={() => shareToSocial('telegram')} className="bg-cyan-600 hover:bg-cyan-500 px-3 py-2 rounded-lg text-white text-sm flex items-center gap-2 transition-all"><Telegram sx={{ fontSize: 16 }} />Telegram</button>
                  <button onClick={() => shareToSocial('email')} className="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-lg text-white text-sm flex items-center gap-2 transition-all"><Email sx={{ fontSize: 16 }} />Email</button>
                </div>
              </div>

              {/* Close Button */}
              <button onClick={() => setShowShareMenu(false)} className="w-full bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-white/70 text-sm transition-all flex items-center justify-center gap-2">
                <Close sx={{ fontSize: 16 }} />
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
