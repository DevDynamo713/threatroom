"use client";
import { useState, useEffect, useRef } from 'react';
export default function Room({ params }: { params: { id: string } }) {
  const [threats, setThreats] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [mitreId, setMitreId] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const ws = new WebSocket(`wss://threatroom.devdynamo713.com/room/${params.id}/ws`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'threat') {
        setThreats(prev => [...prev, data.data]);
      }
    };
    wsRef.current = ws;
    const poll = setInterval(async () => {
      const res = await fetch(`https://threatroom.devdynamo713.com/room/${params.id}/threats`);
      if (res.ok) setThreats(await res.json());
    }, 3000);
    return () => { ws.close(); clearInterval(poll); };
  }, [params.id]);
  const addThreat = async () => {
    const data = { title, source, severity, mitreId: mitreId || undefined };
    await fetch(`https://threatroom.devdynamo713.com/room/${params.id}/threat`, { method: 'POST', body: JSON.stringify(data) });
    setTitle(''); setSource(''); setSeverity('medium'); setMitreId('');
  };
  const colorMap: Record<string, string> = { critical: '#f87171', high: '#fb923c', medium: '#fbbf24', low: '#60a5fa' };
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', background: '#0a0a0a', color: '#e5e5e5', minHeight: '100vh' }}>
      <h1>ThreatRoom: {params.id}</h1>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="threat title" className="title-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="source" className="source-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="severity-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }}>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
          <option value="critical">critical</option>
        </select>
        <input value={mitreId} onChange={(e) => setMitreId(e.target.value)} placeholder="MITRE ID (optional)" className="mitre-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <button className="add-btn" onClick={addThreat} disabled={!title.trim() || !source.trim()} style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Log Threat</button>
      </div>
      <div className="threat-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {threats.map(t => (
          <div key={t.id} style={{ padding: 16, border: `1px solid ${colorMap[t.severity] || '#27272a'}`, borderRadius: 12, background: '#09090b' }}>
            <strong style={{ fontSize: 18, color: colorMap[t.severity] }}>{t.title}</strong>
            <div style={{ marginTop: 4, color: '#a1a1aa', fontSize: 13 }}>Source: {t.source}</div>
            {t.mitreId && <div style={{ marginTop: 4, color: '#60a5fa', fontSize: 13 }}>{t.mitreId}</div>}
            <div style={{ marginTop: 4, fontWeight: 'bold', color: colorMap[t.severity] }}>{t.severity.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}