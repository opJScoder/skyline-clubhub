import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import api, { errMsg, inr } from '../api';
import { useAuth } from '../context/AuthContext';
import { pay } from '../payments';

export default function Membership() {
  const { user, refresh, isActiveMember } = useAuth();
  const [settings, setSettings] = useState(null);
  const [qr, setQr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.get('/settings').then(r => setSettings(r.data)); }, []);
  useEffect(() => { QRCode.toDataURL(user.memberId, { width: 220, margin: 1 }).then(setQr); }, [user.memberId]);

  const payDues = async () => {
    setBusy(true); setMsg('');
    try {
      const { data: order } = await api.post('/membership/pay');
      const ok = await pay(order, 'Membership dues', user);
      setMsg(ok ? 'Payment received — activating your membership…' : 'Payment cancelled.');
      if (ok) setTimeout(refresh, 1500); // webhook activates it; refetch the profile shortly after
    } catch (e) { setMsg(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <div className="card mx-auto max-w-md space-y-3 text-center">
      <h1 className="text-xl font-semibold">Membership</h1>
      <p className={`inline-block rounded-full px-3 py-1 text-sm ${isActiveMember ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
        {isActiveMember ? 'Active' : user.membershipStatus === 'expired' ? 'Expired' : 'Not a member yet'}
      </p>
      {isActiveMember && <p className="text-sm text-slate-500">Valid until {new Date(user.membershipExpiresAt).toLocaleDateString()}</p>}
      {qr && <img src={qr} alt="Membership QR" className="mx-auto h-44 w-44" />}
      <p className="text-sm text-slate-500">Show this card at events. Members get cheaper tickets.</p>
      {settings && <button className="btn w-full" onClick={payDues} disabled={busy}>{isActiveMember ? 'Renew' : 'Pay dues'} · {inr(settings.duesAmount)}</button>}
      {msg && <p className="text-sm text-indigo-700">{msg}</p>}
    </div>
  );
}
