import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useLanguage } from '../lib/i18n';
import { User, Youtube, Instagram, Share2, Save, CheckCircle2, Lock, ShieldCheck, Key, RefreshCw } from 'lucide-react';

// Mock Platform Type
interface Platform {
    id: string;
    name: string;
    icon: React.ElementType;
    connected: boolean;
    color: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // Local state for profile form
  const [name, setName] = useState('Creator');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaved, setIsSaved] = useState(false);

  // Local state for integrations
  const [platforms, setPlatforms] = useState<Platform[]>([
      { id: 'tiktok', name: 'TikTok', icon: Share2, connected: false, color: 'text-pink-500' }, // Using Share2 as generic for TikTok
      { id: 'reels', name: 'Instagram Reels', icon: Instagram, connected: true, color: 'text-purple-500' },
      { id: 'shorts', name: 'YouTube Shorts', icon: Youtube, connected: false, color: 'text-red-500' },
  ]);

  // --- Password Change Logic ---
  const [passwordStep, setPasswordStep] = useState<'initial' | 'verification' | 'reset'>('initial');
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [mockOtp, setMockOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
      e.preventDefault();
      // Logic to update user profile in backend would go here
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
  };

  const toggleConnection = (id: string) => {
      setPlatforms(prev => prev.map(p => {
          if (p.id === id) {
              return { ...p, connected: !p.connected };
          }
          return p;
      }));
  };

  // --- Security Functions ---

  const handleSendCode = () => {
    setIsLoadingCode(true);
    // Simulate API call to send email
    setTimeout(() => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setMockOtp(code);
        setIsLoadingCode(false);
        setPasswordStep('verification');
        // Simulate email receipt (In real app, this wouldn't happen, user checks email)
        alert(`[DEV SIMULATION] Email sent to ${email}.\nYour Verification Code is: ${code}`);
    }, 1500);
  };

  const handleVerifyCode = () => {
      if (otpInput === mockOtp) {
          setPasswordStep('reset');
          setPasswordError('');
      } else {
          setPasswordError('Invalid code. Please try again.');
      }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
      e.preventDefault();
      if (newPassword.length < 6) {
          setPasswordError('Password must be at least 6 characters.');
          return;
      }
      if (newPassword !== confirmPassword) {
          setPasswordError('Passwords do not match.');
          return;
      }
      
      setIsLoadingUpdate(true);
      // Simulate API update
      setTimeout(() => {
          setIsLoadingUpdate(false);
          setUpdateSuccess(true);
          setPasswordStep('initial');
          setNewPassword('');
          setConfirmPassword('');
          setOtpInput('');
          setTimeout(() => setUpdateSuccess(false), 3000);
      }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">{t('settings.title')}</h1>

      {/* Profile Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
              <User className="text-primary" size={24} />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('settings.profile.title')}</h2>
          </div>
          
          <form onSubmit={handleProfileSave} className="max-w-md space-y-5">
              <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl border border-slate-200 dark:border-slate-700">
                     🤖
                  </div>
                  <button type="button" className="text-sm text-primary hover:underline">
                      Change Avatar
                  </button>
              </div>

              <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('settings.profile.name')}</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-colors" 
                  />
              </div>

              <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('settings.profile.email')}</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-colors" 
                  />
              </div>

              <button 
                type="submit" 
                className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-lg transition flex items-center gap-2"
              >
                {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
                {isSaved ? 'Saved' : t('settings.profile.save')}
              </button>
          </form>
      </div>

      {/* Security / Password Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
              <Lock className="text-blue-500" size={24} />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('settings.security.title')}</h2>
          </div>

          {updateSuccess && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-500 dark:text-green-400">
                  <CheckCircle2 size={20} />
                  <span>{t('settings.security.success')}</span>
              </div>
          )}

          <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-6 border border-slate-200 dark:border-slate-800 transition-colors">
              {passwordStep === 'initial' && (
                  <div className="flex items-center justify-between">
                      <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{t('settings.security.changePassword')}</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">{t('settings.security.verifyDesc')}</p>
                      </div>
                      <button 
                        onClick={handleSendCode}
                        disabled={isLoadingCode}
                        className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                      >
                         {isLoadingCode && <RefreshCw className="animate-spin" size={16} />}
                         {t('settings.security.sendCode')}
                      </button>
                  </div>
              )}

              {passwordStep === 'verification' && (
                   <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                       <div className="flex items-center gap-2 mb-4">
                           <ShieldCheck className="text-green-500" size={20} />
                           <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('settings.security.enterCode')}</h3>
                       </div>
                       <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                           {t('settings.security.sent')} <span className="text-slate-900 dark:text-white font-medium">{email}</span>
                       </p>
                       <div className="flex gap-3">
                           <input 
                             type="text" 
                             value={otpInput}
                             onChange={(e) => setOtpInput(e.target.value)}
                             placeholder={t('settings.security.codePlaceholder')}
                             className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none w-40 text-center tracking-widest font-mono text-lg transition-colors"
                           />
                           <button 
                             onClick={handleVerifyCode}
                             className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition"
                           >
                               {t('settings.security.verify')}
                           </button>
                           <button 
                             onClick={() => setPasswordStep('initial')}
                             className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-3"
                           >
                               Cancel
                           </button>
                       </div>
                       {passwordError && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{passwordError}</p>}
                   </div>
              )}

              {passwordStep === 'reset' && (
                  <form onSubmit={handleUpdatePassword} className="animate-in fade-in slide-in-from-top-2 duration-300 max-w-md">
                      <div className="flex items-center gap-2 mb-4">
                           <Key className="text-yellow-500" size={20} />
                           <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('settings.security.newPassword')}</h3>
                       </div>
                      
                      <div className="space-y-4 mb-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('settings.security.newPassword')}</label>
                              <input 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-colors" 
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{t('settings.security.confirmPassword')}</label>
                              <input 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-colors" 
                              />
                          </div>
                      </div>

                      {passwordError && <p className="text-red-500 dark:text-red-400 text-sm mb-4">{passwordError}</p>}

                      <div className="flex gap-3">
                        <button 
                            type="submit" 
                            disabled={isLoadingUpdate}
                            className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {isLoadingUpdate && <RefreshCw className="animate-spin" size={16} />}
                            {t('settings.security.updatePassword')}
                        </button>
                        <button 
                             type="button"
                             onClick={() => {
                                 setPasswordStep('initial');
                                 setNewPassword('');
                                 setConfirmPassword('');
                                 setPasswordError('');
                             }}
                             className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-3"
                           >
                               Cancel
                           </button>
                      </div>
                  </form>
              )}
          </div>
      </div>

      {/* Integrations Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
              <Share2 className="text-secondary" size={24} />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('settings.integrations.title')}</h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">{t('settings.integrations.desc')}</p>

          <div className="space-y-4">
              {platforms.map((platform) => (
                  <div key={platform.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
                      <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 ${platform.color}`}>
                              <platform.icon size={24} />
                          </div>
                          <div>
                              <h3 className="font-bold text-slate-900 dark:text-white">{platform.name}</h3>
                              <div className="flex items-center gap-1.5 mt-1">
                                  <div className={`w-2 h-2 rounded-full ${platform.connected ? 'bg-green-500' : 'bg-slate-400 dark:bg-slate-500'}`}></div>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                      {platform.connected ? t('settings.integrations.connected') : 'Not Connected'}
                                  </span>
                              </div>
                          </div>
                      </div>
                      <button 
                        onClick={() => toggleConnection(platform.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                            platform.connected 
                            ? 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' 
                            : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                          {platform.connected ? t('settings.integrations.disconnect') : t('settings.integrations.connect')}
                      </button>
                  </div>
              ))}
          </div>
      </div>

    </div>
  );
}