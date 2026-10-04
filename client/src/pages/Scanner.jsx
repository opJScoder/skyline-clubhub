import React,{useState,useEffect} from 'react';
import {NavLink,useNavigate} from 'react-router-dom';
import {QRCodeSVG} from 'qrcode.react';
import {api} from '../services/api';
import {inr,dt,dd} from '../utils/format';
import {ui} from '../utils/ui';
import {act} from '../utils/act';
import useLoad from '../hooks/useLoad';
import useForm from '../hooks/useForm';
import {useAuth} from '../context/AuthContext';
import Field from '../components/ui/Field';
import Empty from '../components/ui/Empty';

export default function Scanner(){
  const[c,setC]=useState(''),[m,setM]=useState(''),[r,setR]=useState(null);
  return<><h1>Door scanner</h1><p>Type or scan a ticket code with a USB/phone scanner, then press Enter.</p>
  <div className="grid"><div className="card"><h3>Check in a ticket</h3><div className="row"><input placeholder="TK…" value={c} onChange={e=>setC(e.target.value)} onKeyDown={e=>e.key==='Enter'&&e.target.nextSibling.click()}/><button className="btn" onClick={async()=>{try{const x=await api('/checkin','POST',{code:c});setR({ok:1,t:`✅ ${x.name} is in for ${x.event}`});setC('')}catch(e){setR({t:'❌ '+e.message})}}}>Check in</button></div></div>
  <div className="card"><h3>Verify a member</h3><div className="row"><input placeholder="SKY-…" value={m} onChange={e=>setM(e.target.value)}/><button className="btn" onClick={async()=>{try{const x=await api('/verify/'+m);setR({ok:x.valid,t:x.name?`${x.valid?'✅ Active':'❌ Expired'} member: ${x.name} (until ${dd(x.until)})`:'❌ Code not found'})}catch(e){setR({t:e.message})}}}>Verify</button></div></div></div>
  {r&&<div className="card" style={{borderColor:r.ok?'var(--ok)':'var(--bad)'}}><h2>{r.t}</h2></div>}</>
}

