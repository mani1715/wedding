import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link2, Map as MapIcon, Search, Crosshair, Loader2, Check, AlertCircle, Type, Car } from 'lucide-react';

// Fix default Leaflet marker icons (Webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:      'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

/**
 * VenuePicker — combo: paste URL / drop pin / type address.
 * Used in WeddingEditor for main venue and per-event venues.
 * Calls back with: { latitude, longitude, venue_name, venue_address, map_link, what3words, parking_info }
 */
const VenuePicker = ({ value = {}, onChange, label = 'Venue', testidPrefix = 'venue' }) => {
  const [tab, setTab] = useState(value.latitude ? 'pin' : 'url');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchQ, setSearchQ] = useState('');
  const [w3wLoading, setW3wLoading] = useState(false);
  const searchTimer = useRef(null);

  const v = value || {};
  const hasPin = Number.isFinite(v.latitude) && Number.isFinite(v.longitude);

  const update = (patch) => onChange?.({ ...v, ...patch });

  // --- Tab 1: paste URL ---
  const expandUrl = async (url) => {
    setError(''); setBusy(true);
    try {
      const res = await axios.post(`${API_URL}/api/admin/map/expand`, { url });
      update({
        latitude: res.data.latitude,
        longitude: res.data.longitude,
        map_link: res.data.expanded_url || url,
        venue_address: res.data.name || v.venue_address || '',
      });
      // Auto fetch W3W
      fetchW3W(res.data.latitude, res.data.longitude);
    } catch (e) {
      setError(e.response?.data?.detail || 'Could not extract coordinates from this URL.');
    } finally { setBusy(false); }
  };

  // --- Tab 2: search-as-you-type with Nominatim ---
  const doSearch = async (q) => {
    if (!q || q.length < 2) { setSearchResults([]); return; }
    try {
      const res = await axios.get(`${API_URL}/api/admin/map/search`, { params: { q } });
      setSearchResults(res.data.results || []);
    } catch (_) { setSearchResults([]); }
  };
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => doSearch(searchQ), 350);
    // eslint-disable-next-line
  }, [searchQ]);

  const selectResult = (r) => {
    update({
      latitude: r.latitude, longitude: r.longitude,
      venue_address: r.display_name,
      venue_name: v.venue_name || r.display_name?.split(',')[0],
    });
    setSearchResults([]); setSearchQ('');
    fetchW3W(r.latitude, r.longitude);
  };

  const fetchW3W = async (lat, lng) => {
    setW3wLoading(true);
    try {
      const r = await axios.post(`${API_URL}/api/admin/map/what3words`, { latitude: lat, longitude: lng });
      if (r.data?.words) update({ what3words: r.data.words });
    } catch (_) { /* ignore */ }
    finally { setW3wLoading(false); }
  };

  return (
    <div className="space-y-3" data-testid={`${testidPrefix}-picker`}>
      {label && (
        <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(255,248,220,0.55)' }}>{label}</div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5">
        <TabBtn id="url"     icon={Link2}     active={tab} onClick={setTab} label="Paste link"  testid={`${testidPrefix}-tab-url`} />
        <TabBtn id="pin"     icon={Crosshair} active={tab} onClick={setTab} label="Drop pin"    testid={`${testidPrefix}-tab-pin`} />
        <TabBtn id="search"  icon={Search}    active={tab} onClick={setTab} label="Search"      testid={`${testidPrefix}-tab-search`} />
        <TabBtn id="address" icon={Type}      active={tab} onClick={setTab} label="Type only"   testid={`${testidPrefix}-tab-address`} />
      </div>

      {/* Tab bodies */}
      {tab === 'url' && (
        <div className="space-y-2">
          <Field label="Venue name" value={v.venue_name || ''} onChange={(x) => update({ venue_name: x })}
            placeholder="Taj Falaknuma Palace" testid={`${testidPrefix}-name-url`} />
          <UrlInput onSubmit={expandUrl} busy={busy} testid={`${testidPrefix}-url-input`}
            initial={v.map_link || ''} />
          {hasPin && (
            <SuccessBadge text={`Pin set at ${v.latitude.toFixed(4)}, ${v.longitude.toFixed(4)}`} />
          )}
        </div>
      )}

      {tab === 'pin' && (
        <div className="space-y-2">
          <Field label="Venue name" value={v.venue_name || ''} onChange={(x) => update({ venue_name: x })}
            placeholder="Taj Falaknuma Palace" testid={`${testidPrefix}-name-pin`} />
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--lux-border-strong)', height: '320px' }}>
            <MapContainer center={[hasPin ? v.latitude : 20.5937, hasPin ? v.longitude : 78.9629]}
              zoom={hasPin ? 16 : 5} className="h-full w-full" scrollWheelZoom={true}>
              <TileLayer attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <PinHandler value={v} onChange={(p) => { update(p); if (p.latitude) fetchW3W(p.latitude, p.longitude); }} />
              {hasPin && <Marker position={[v.latitude, v.longitude]} />}
              {hasPin && <RecenterMap lat={v.latitude} lng={v.longitude} />}
            </MapContainer>
          </div>
          <div className="text-[11px]" style={{ color: 'rgba(255,248,220,0.5)' }}>
            Tap the map to drop a pin. Pan & zoom to fine-tune.
          </div>
        </div>
      )}

      {tab === 'search' && (
        <div className="space-y-2">
          <Field label="Search address" value={searchQ} onChange={setSearchQ}
            placeholder="e.g. Taj Falaknuma Palace Hyderabad" testid={`${testidPrefix}-search-input`} />
          {searchResults.length > 0 && (
            <div className="max-h-56 overflow-y-auto rounded-lg" style={{ border: '1px solid var(--lux-border)' }}>
              {searchResults.map((r, i) => (
                <button key={i} type="button" onClick={() => selectResult(r)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-[rgba(212,175,55,0.08)] transition-colors"
                  style={{ color: 'rgba(255,248,220,0.85)', borderTop: i > 0 ? '1px solid var(--lux-border)' : 'none' }}
                  data-testid={`${testidPrefix}-result-${i}`}>
                  {r.display_name}
                </button>
              ))}
            </div>
          )}
          {hasPin && <SuccessBadge text={`Selected: ${v.venue_address || `${v.latitude}, ${v.longitude}`}`} />}
        </div>
      )}

      {tab === 'address' && (
        <div className="space-y-2">
          <Field label="Venue name" value={v.venue_name || ''} onChange={(x) => update({ venue_name: x })}
            placeholder="Taj Falaknuma Palace" testid={`${testidPrefix}-name-addr`} />
          <Field label="Full address" value={v.venue_address || ''} onChange={(x) => update({ venue_address: x })}
            placeholder="Engine Bowli, Falaknuma, Hyderabad, Telangana 500053"
            testid={`${testidPrefix}-address-only`} textarea />
          <div className="text-[11px]" style={{ color: 'rgba(255,248,220,0.5)' }}>
            Guests will open "{v.venue_address || 'your address'}" via Google Maps search. For best results, also drop a pin or paste a Google Maps link.
          </div>
        </div>
      )}

      {/* Shared extras */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
        <div>
          <span className="text-[10px] tracking-[0.3em] uppercase block mb-1" style={{ color: 'rgba(255,248,220,0.55)' }}>
            What3Words {w3wLoading && <Loader2 className="w-3 h-3 inline animate-spin ml-1" />}
          </span>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ border: '1px solid var(--lux-border)' }}>
            <span className="text-gold">///</span>
            <input value={v.what3words || ''} onChange={(e) => update({ what3words: e.target.value })}
              placeholder="filled.count.soap" className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: '#FFF8DC' }} data-testid={`${testidPrefix}-w3w`} />
          </div>
        </div>
        <Field label="Parking instructions" value={v.parking_info || ''} onChange={(x) => update({ parking_info: x })}
          placeholder="Park near Gate 3, ask security for Aarav-Riya Wedding"
          testid={`${testidPrefix}-parking`} icon={Car} />
      </div>

      {error && (
        <div className="px-3 py-2 rounded text-xs flex items-center gap-2"
          style={{ background: 'rgba(139,0,0,0.15)', color: '#FFD7C9' }}>
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </div>
      )}
    </div>
  );
};

// ---- subcomponents ----

const TabBtn = ({ id, icon: Icon, active, onClick, label, testid }) => (
  <button type="button" onClick={() => onClick(id)}
    className="px-3 py-1.5 rounded-full text-[11px] tracking-[0.18em] uppercase inline-flex items-center gap-1.5 transition-all"
    style={active === id
      ? { background: '#D4AF37', color: '#16110C', fontWeight: 600 }
      : { background: 'transparent', border: '1px solid var(--lux-border)', color: 'rgba(255,248,220,0.7)' }}
    data-testid={testid}>
    <Icon className="w-3 h-3" /> {label}
  </button>
);

const Field = ({ label, value, onChange, placeholder, testid, textarea, icon: Icon }) => (
  <label className="block">
    {label && (
      <span className="text-[10px] tracking-[0.3em] uppercase block mb-1" style={{ color: 'rgba(255,248,220,0.55)' }}>
        {Icon && <Icon className="w-3 h-3 inline mr-1 text-gold" />}{label}
      </span>
    )}
    {textarea ? (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={2}
        className="w-full px-3 py-2 rounded-lg bg-transparent outline-none text-sm"
        style={{ color: '#FFF8DC', border: '1px solid var(--lux-border)' }} data-testid={testid} />
    ) : (
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-transparent outline-none text-sm"
        style={{ color: '#FFF8DC', border: '1px solid var(--lux-border)' }} data-testid={testid} />
    )}
  </label>
);

const UrlInput = ({ onSubmit, busy, testid, initial = '' }) => {
  const [url, setUrl] = useState(initial);
  useEffect(() => { setUrl(initial); }, [initial]);
  return (
    <div>
      <span className="text-[10px] tracking-[0.3em] uppercase block mb-1" style={{ color: 'rgba(255,248,220,0.55)' }}>
        Google Maps link
      </span>
      <div className="flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)}
          placeholder="https://maps.app.goo.gl/abc or https://www.google.com/maps/..."
          className="flex-1 px-3 py-2 rounded-lg bg-transparent outline-none text-sm"
          style={{ color: '#FFF8DC', border: '1px solid var(--lux-border)' }} data-testid={testid} />
        <button type="button" onClick={() => onSubmit(url)} disabled={busy || !url}
          className="px-4 py-2 rounded-lg text-xs tracking-[0.15em] uppercase font-medium"
          style={{ background: '#D4AF37', color: '#16110C', opacity: busy || !url ? 0.5 : 1 }}
          data-testid={`${testid}-go`}>
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Extract'}
        </button>
      </div>
      <div className="mt-1 text-[10px]" style={{ color: 'rgba(255,248,220,0.4)' }}>
        Paste any maps.app.goo.gl/... or google.com/maps/... link — we'll extract the exact pin.
      </div>
    </div>
  );
};

const SuccessBadge = ({ text }) => (
  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
    style={{ background: 'rgba(0,170,80,0.1)', border: '1px solid rgba(67,224,127,0.3)', color: '#86EFAC' }}>
    <Check className="w-3 h-3" /> {text}
  </div>
);

const PinHandler = ({ value, onChange }) => {
  useMapEvents({
    click(e) { onChange({ latitude: e.latlng.lat, longitude: e.latlng.lng }); },
  });
  return null;
};
const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => { if (Number.isFinite(lat) && Number.isFinite(lng)) map.setView([lat, lng]); }, [lat, lng, map]);
  return null;
};

export default VenuePicker;
