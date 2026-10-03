import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api, { errMsg } from '../api';

export default function Scanner() {
  const [result, setResult] = useState(null);
  const [code, setCode] = useState('');
  const last = useRef({ v: '', t: 0 });

  const submit = async value => {
    const v = value.trim();
    if (!v || (v === last.current.v && Date.now() - last.current.t < 3000)) return; // debounce repeat reads
    last.current = { v, t: Date.now() };
    try {
      // Membership QR = 16 hex chars, ticket QR = 20 hex chars
      if (v.length === 16) { const { data } = await api.get(`/members/verify/${v}`); setResult({ ok: data.status === 'active', message: `${data.name}: membership ${data.status}` }); }
      else { const { data } = await api.post('/tickets/check-in', { ticketCode: v }); setResult({ ok: true, message: `${data.message} — ${data.holder} (${data.event})` }); }
    } catch (e) { setResult({ ok: false, message: e.response?.data?.message || errMsg(e) }); }
  };

  useEffect(() => {
    const sc = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 220 }, false);
    sc.render(text => submit(text), () => {});
    return () => { sc.clear().catch(() => {}); };
  }, []);

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Door Scanner</h1>
      <div id="reader" className="card" />
      {result && <div className={`rounded-lg p-4 text-center text-lg font-semibold ${result.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{result.message}</div>}
      <form className="flex gap-2" onSubmit={e => { e.preventDefault(); last.current = { v: '', t: 0 }; submit(code); setCode(''); }}>
        <input className="input" placeholder="Or type a ticket / member code" value={code} onChange={e => setCode(e.target.value)} />
        <button className="btn">Check</button>
      </form>
    </div>
  );
}
