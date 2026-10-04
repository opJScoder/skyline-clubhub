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

export default function Finance(){
  const{user}=useAuth(),tre=user.role==='treasurer',[d,load]=useLoad('/finance'),[ev]=useLoad('/events'),[f,b,setF]=useForm({type:'expense',source:'other'});
  if(!d)return<h1>Finance</h1>;
  const csv=()=>{const r=[['Date','Type','Source','Amount','Description','Event'],...d.entries.map(e=>[e.created_at,e.type,e.source,e.amount,'"'+(e.description||'').replace(/"/g,'""')+'"',e.event||''])].map(x=>x.join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([r]));a.download='ledger.csv';a.click()};
  const mx=Math.max(1,...Object.values(d.sources));
  return<><div className="row sp"><h1>Finance</h1><button className="btn ghost" onClick={csv}>Export CSV</button></div>
  <div className="grid">{[['Money in',d.income,'var(--ok)'],['Money out',d.expense,'var(--bad)'],['Balance left',d.income-d.expense,'var(--d)']].map(([k,v,c])=><div className="card" key={k}><p>{k}</p><div className="big" style={{color:c}}>{inr(v)}</div></div>)}</div>
  <div className="card"><h2>Where it came from and went</h2>{Object.entries(d.sources).map(([k,v])=>{const[t,s]=k.split(':');return<div key={k} style={{margin:'10px 0'}}><div className="row sp"><span>{t==='income'?'⬆':'⬇'} {s}</span><b>{inr(v)}</b></div><div className="bar"><b style={{width:v/mx*100+'%',background:t==='income'?'var(--ok)':'var(--bad)'}}/></div></div>})}</div>
  <div className="card scroll"><h2>Per event</h2><table><thead><tr><th>Event</th><th>Earned</th><th>Spent</th><th>Profit</th></tr></thead><tbody>{d.events.map(e=><tr key={e.id}><td>{e.title}</td><td>{inr(e.income)}</td><td>{inr(e.expense)}</td><td><b>{inr(e.income-e.expense)}</b></td></tr>)}</tbody></table></div>
  {tre&&<div className="card"><h3>Add manual entry</h3><div className="form"><Field l="Type" as="select" {...b('type')}><option>expense</option><option>income</option></Field><Field l="Category" {...b('source')}/><Field l="Amount ₹" type="number" {...b('amount')}/><Field l="Description" {...b('description')}/><Field l="Event" as="select" {...b('event_id')}><option value="">None</option>{ev?.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</Field><button className="btn" onClick={act(async()=>{await api('/ledger','POST',{...f,amount:+f.amount});setF({type:'expense',source:'other'});load()},'Entry added')}>Add</button></div></div>}
  <div className="card scroll"><h2>Ledger</h2><table><thead><tr><th>Date</th><th>Source</th><th>Description</th><th>Amount</th></tr></thead><tbody>{d.entries.map(e=><tr key={e.id}><td>{dd(e.created_at)}</td><td><span className="tag">{e.source}</span></td><td>{e.description}</td><td style={{color:e.type==='income'?'var(--ok)':'var(--bad)'}}><b>{e.type==='income'?'+':'−'}{inr(e.amount)}</b></td></tr>)}</tbody></table></div></>
}

