import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ArrowLeft, Camera, Settings, KeyRound, Check, X, Trash2, Copy, RefreshCw, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import '@/styles/luxury.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  visible: (i = 0) => ({ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] } }),
};

const LiveGalleryManagement = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { admin, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.body.classList.add('luxe', 'luxe-grain', 'luxe-vignette');
    return () => document.body.classList.remove('luxe', 'luxe-grain', 'luxe-vignette');
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!admin) { navigate('/admin/login'); return; }
    load();
    // eslint-disable-next-line
  }, [admin, authLoading]);

  const load = async () => {
    try {
      const [s, g] = await Promise.all([
        axios.get(`${API_URL}/api/admin/profiles/${profileId}/live-gallery/settings`),
        axios.get(`${API_URL}/api/admin/profiles/${profileId}/live-gallery`),
      ]);
      setSettings(s.data);
      setPhotos(g.data.photos || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/api/admin/profiles/${profileId}/live-gallery/settings`, settings);
    } catch (e) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const generateToken = async () => {
    setTokenLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/admin/profiles/${profileId}/live-gallery/uploader-token`);
      setToken(res.data);
    } catch (e) {
      alert('Failed to generate token');
    } finally {
      setTokenLoading(false);
    }
  };

  const moderate = async (id, approved) => {
    await axios.put(`${API_URL}/api/admin/live-gallery/${id}/moderate?approved=${approved}`);
    setPhotos((p) => p.map((x) => x.id === id ? { ...x, approved } : x));
  };

  const deletePhoto = async (id) => {
    if (!window.confirm('Remove this photo permanently?')) return;
    await axios.delete(`${API_URL}/api/admin/live-gallery/${id}`);
    setPhotos((p) => p.filter((x) => x.id !== id));
  };

  if (loading) return <div className="grid place-items-center min-h-screen luxe"><div className="lux-mandala" /></div>;
  if (!settings) return null;

  return (
    <div className="luxe min-h-screen" data-testid="live-gallery-management">
      <div className="px-6 md:px-12 py-10 max-w-[1400px] mx-auto">
        <button onClick={() => navigate(-1)} className="lux-btn lux-btn-ghost mb-6" data-testid="lgm-back">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-10">
          <span className="lux-eyebrow block mb-3">◆ Live Photo Wall</span>
          <h1 className="font-display text-[2.2rem] md:text-[3.4rem] leading-tight" style={{ color: '#FFF8DC' }}>
            Live <span className="font-script italic text-gold">gallery</span> management
          </h1>
          <p className="mt-3 text-sm max-w-2xl" style={{ color: 'rgba(255,248,220,0.62)' }}>
            Configure guest uploads, moderation, and generate a token for the desktop uploader app.
          </p>
        </motion.div>

        {/* Settings */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="lux-glass p-6 md:p-8 mb-8" data-testid="lgm-settings">
          <h3 className="font-display text-2xl mb-5 flex items-center gap-2" style={{ color: '#FFF8DC' }}>
            <Settings className="w-5 h-5 text-gold" /> Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToggleField label="Live gallery enabled"   checked={settings.enabled}
              onChange={(v) => setSettings({ ...settings, enabled: v })} testid="lgm-toggle-enabled" />
            <ToggleField label="Allow guest uploads"    checked={settings.guest_upload_enabled}
              onChange={(v) => setSettings({ ...settings, guest_upload_enabled: v })} testid="lgm-toggle-guest" />
            <ToggleField label="Auto-approve uploads"   checked={settings.auto_approve}
              onChange={(v) => setSettings({ ...settings, auto_approve: v })} testid="lgm-toggle-auto" />
            <ToggleField label="Require moderation"     checked={settings.moderation_required}
              onChange={(v) => setSettings({ ...settings, moderation_required: v })} testid="lgm-toggle-mod" />
          </div>
          <button onClick={saveSettings} disabled={saving} className="lux-btn mt-5" data-testid="lgm-save-settings">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save settings
          </button>
        </motion.div>

        {/* Desktop uploader token */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="lux-glass p-6 md:p-8 mb-8" data-testid="lgm-token">
          <h3 className="font-display text-2xl mb-2 flex items-center gap-2" style={{ color: '#FFF8DC' }}>
            <KeyRound className="w-5 h-5 text-gold" /> Desktop uploader
          </h3>
          <p className="text-sm mb-5" style={{ color: 'rgba(255,248,220,0.6)' }}>
            Generate an upload token, paste it into the Maharani Uploader desktop app, point it at your camera-tethered folder, and photos sync to the live wall in real time. Tokens expire after 72 hours.
          </p>
          {token ? (
            <div className="space-y-3">
              <CodeRow label="Upload URL" value={token.upload_url} />
              <CodeRow label="Token (keep private)" value={token.token} sensitive />
              <p className="text-xs" style={{ color: 'rgba(255,248,220,0.5)' }}>Expires {new Date(token.expires_at).toLocaleString()}</p>
              <button onClick={generateToken} className="lux-btn lux-btn-ghost text-xs" data-testid="lgm-token-regen">
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </button>
            </div>
          ) : (
            <button onClick={generateToken} disabled={tokenLoading} className="lux-btn" data-testid="lgm-generate-token">
              {tokenLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />} Generate token
            </button>
          )}
        </motion.div>

        {/* Photos */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} data-testid="lgm-photos-section">
          <h3 className="font-display text-2xl mb-5 flex items-center gap-2" style={{ color: '#FFF8DC' }}>
            <Camera className="w-5 h-5 text-gold" /> Photos ({photos.length})
          </h3>
          {photos.length === 0 ? (
            <div className="lux-glass p-10 text-center text-sm" style={{ color: 'rgba(255,248,220,0.6)' }}>
              No photos yet. They'll appear here as soon as the desktop uploader or guests start posting.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {photos.map((p) => (
                <div key={p.id} className="relative group rounded-lg overflow-hidden"
                  style={{ border: '1px solid var(--lux-border)' }} data-testid={`lgm-photo-${p.id}`}>
                  <img src={`${API_URL}${p.thumb_url}`} alt="" className="w-full h-44 object-cover" loading="lazy" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.3))' }}>
                    <div className="flex items-center justify-between text-[10px]" style={{ color: 'rgba(255,248,220,0.9)' }}>
                      <span className="tracking-wider uppercase">{p.uploader_type}</span>
                      <span>{p.approved ? '✓' : '⏳'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {!p.approved && (
                        <button onClick={() => moderate(p.id, true)} className="flex-1 px-2 py-1 text-[10px] rounded"
                          style={{ background: '#D4AF37', color: '#16110C' }} data-testid={`lgm-approve-${p.id}`}>
                          <Check className="w-3 h-3 inline" /> Approve
                        </button>
                      )}
                      {p.approved && (
                        <button onClick={() => moderate(p.id, false)} className="flex-1 px-2 py-1 text-[10px] rounded"
                          style={{ background: 'rgba(255,255,255,0.1)', color: '#FFF8DC' }} data-testid={`lgm-hide-${p.id}`}>
                          <EyeOff className="w-3 h-3 inline" /> Hide
                        </button>
                      )}
                      <button onClick={() => deletePhoto(p.id)} className="px-2 py-1 text-[10px] rounded"
                        style={{ background: 'rgba(139,0,0,0.5)', color: '#FFD7C9' }} data-testid={`lgm-delete-${p.id}`}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {p.uploader_name && (
                    <div className="absolute bottom-0 left-0 right-0 px-2 py-1 text-[10px] truncate"
                      style={{ background: 'rgba(0,0,0,0.55)', color: 'rgba(255,248,220,0.85)' }}>
                      {p.uploader_name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const ToggleField = ({ label, checked, onChange, testid }) => (
  <label className="flex items-center justify-between p-3 rounded-lg cursor-pointer"
    style={{ border: '1px solid var(--lux-border)' }}>
    <span className="text-sm" style={{ color: 'rgba(255,248,220,0.85)' }}>{label}</span>
    <button type="button" onClick={() => onChange(!checked)}
      className="w-11 h-6 rounded-full relative transition-colors"
      style={{ background: checked ? '#D4AF37' : 'rgba(255,255,255,0.15)' }}
      data-testid={testid}>
      <span className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
        style={{ background: '#FFF8DC', left: checked ? 'calc(100% - 22px)' : '2px' }} />
    </button>
  </label>
);

const CodeRow = ({ label, value, sensitive }) => {
  const [show, setShow] = useState(!sensitive);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch (_) {}
  };
  return (
    <div>
      <div className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: 'rgba(255,248,220,0.55)' }}>{label}</div>
      <div className="flex items-center gap-2 p-2.5 rounded-lg" style={{ border: '1px solid var(--lux-border)', background: 'rgba(212,175,55,0.04)' }}>
        <code className="flex-1 text-xs truncate" style={{ color: '#FFF8DC' }}>
          {show ? value : '•'.repeat(Math.min(value.length, 40))}
        </code>
        {sensitive && (
          <button onClick={() => setShow(!show)} className="p-1.5 rounded"
            style={{ color: 'rgba(255,248,220,0.7)' }}>
            {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        )}
        <button onClick={copy} className="p-1.5 rounded" style={{ color: copied ? '#D4AF37' : 'rgba(255,248,220,0.7)' }}>
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};

export default LiveGalleryManagement;
