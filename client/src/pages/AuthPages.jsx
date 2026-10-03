import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';

function Form({ title, fields, onSubmit, footer }) {
  const [vals, setVals] = useState({});
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async e => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await onSubmit(vals); } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="card mx-auto max-w-md space-y-3">
      <h1 className="text-xl font-semibold">{title}</h1>
      {fields.map(([k, label, type = 'text', req = true]) => (
        <label key={k} className="block text-sm">{label}
          <input className="input mt-1" type={type} required={req} onChange={e => setVals({ ...vals, [k]: e.target.value })} />
        </label>
      ))}
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button className="btn w-full" disabled={busy}>{busy ? 'Please wait…' : title}</button>
      <p className="text-sm text-slate-500">{footer}</p>
    </form>
  );
}

export function Login() {
  const { login } = useAuth(); const nav = useNavigate();
  return <Form title="Log in" fields={[['email', 'Email', 'email'], ['password', 'Password', 'password']]}
    onSubmit={async v => { await login(v.email, v.password); nav('/'); }}
    footer={<>New here? <Link className="text-indigo-600" to="/register">Create an account</Link></>} />;
}

export function Register() {
  const { register } = useAuth(); const nav = useNavigate();
  return <Form title="Sign up" fields={[['name', 'Full name'], ['email', 'Email', 'email'], ['password', 'Password (min 8 chars)', 'password'], ['phone', 'Phone (optional)', 'text', false], ['studentId', 'Student ID (optional)', 'text', false]]}
    onSubmit={async v => { await register(v); nav('/'); }}
    footer={<>Already have an account? <Link className="text-indigo-600" to="/login">Log in</Link></>} />;
}
