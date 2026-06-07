import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function Settings() {
  const { t, i18n } = useTranslation()
  const [telegramToken, setTelegramToken] = useState('')
  const [telegramChatId, setTelegramChatId] = useState('')
  const [discordWebhook, setDiscordWebhook] = useState('')
  const [channel, setChannel] = useState('discord')
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/settings').then(res => {
      if (res.data.telegram_bot_token) setTelegramToken(res.data.telegram_bot_token)
      if (res.data.telegram_chat_id) setTelegramChatId(res.data.telegram_chat_id)
      if (res.data.discord_webhook_url) setDiscordWebhook(res.data.discord_webhook_url)
      if (res.data.notification_channel) setChannel(res.data.notification_channel)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.post('/settings', {
        telegram_bot_token: telegramToken,
        telegram_chat_id: telegramChatId,
        discord_webhook_url: discordWebhook,
        notification_channel: channel
      })
      toast.success('Settings saved!')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTestSend = async () => {
    setTesting(true)
    try {
      await api.post('/notifications/send-now')
      toast.success('Test notification sent!')
    } catch {
      toast.error('Failed to send notification')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">{t('settings.title')}</h1>
        <p className="text-slate-400 text-sm mt-1">Configure notifications and integrations</p>
      </div>

      {/* Language Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
          </div>
          <div>
            <h2 className="section-title">{t('settings.language')}</h2>
            <p className="text-xs text-slate-500">{t('settings.language.desc')}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div>
            <p className="text-sm font-medium text-white">{t('settings.language')}</p>
          </div>
          <select 
            value={i18n.language}
            onChange={(e) => {
              i18n.changeLanguage(e.target.value);
              localStorage.setItem('app_lang', e.target.value);
            }}
            className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none"
          >
            <option value="en">English (EN)</option>
            <option value="id">Bahasa Indonesia (ID)</option>
          </select>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h2 className="section-title">Notifications</h2>
            <p className="text-xs text-slate-500">Get reminders about upcoming deadlines</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Telegram Section */}
          <div className="p-4 rounded-xl bg-white/5 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <h3 className="text-sm font-semibold text-white">Telegram</h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="channel" value="telegram" checked={channel === 'telegram'} onChange={() => setChannel('telegram')} className="text-brand-500 focus:ring-brand-500 bg-slate-800 border-slate-600" />
                <span className="text-xs text-slate-300">Set Active</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Bot Token</label>
              <input
                type="password"
                value={telegramToken}
                onChange={e => setTelegramToken(e.target.value)}
                className="input-field"
                placeholder="123456789:ABC-DEF..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Chat ID</label>
              <input
                type="text"
                value={telegramChatId}
                onChange={e => setTelegramChatId(e.target.value)}
                className="input-field"
                placeholder="Your chat ID"
              />
            </div>
          </div>

          {/* Discord Section */}
          <div className="p-4 rounded-xl bg-white/5 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/>
                </svg>
                <h3 className="text-sm font-semibold text-white">Discord</h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="channel" value="discord" checked={channel === 'discord'} onChange={() => setChannel('discord')} className="text-brand-500 focus:ring-brand-500 bg-slate-800 border-slate-600" />
                <span className="text-xs text-slate-300">Set Active</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Webhook URL</label>
              <input
                type="text"
                value={discordWebhook}
                onChange={e => setDiscordWebhook(e.target.value)}
                className="input-field"
                placeholder="https://discord.com/api/webhooks/..."
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          
          <button
            onClick={handleTestSend}
            disabled={testing}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {testing ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Test Notification
              </>
            )}
          </button>
        </div>
      </div>

      {/* About */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="section-title">About</h2>
            <p className="text-xs text-slate-500">Academic Management System v0.1.0</p>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          A personal academic productivity tool for managing courses, schedules, tasks, and study materials.
          Built with FastAPI + React.
        </p>
      </div>
    </div>
  )
}