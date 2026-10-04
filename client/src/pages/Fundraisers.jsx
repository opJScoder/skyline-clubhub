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

const COLS=[['todo','To do'],['in_progress','In progress'],['done','Done']];
export default function Fundraisers(){
  const{user}=useAuth(),staff=user.role!=='user',tre=user.role==='treasurer',[fs,load]=useLoad('/fundraisers'),[us]=useLoad('/users',!staff),[f,b,setF]=useForm({}),[t,tb,setT]=useForm({});
  return<><h1>{staff?'Fundraisers & volunteers':'My volunteer tasks'}</h1>
  {tre&&<div className="card"><div className="form"><Field l="Fundraiser" {...b('title')}/><Field l="Goal ₹" type="number" {...b('goal')}/><Field l="Date" type="date" {...b('event_date')}/><button className="btn" onClick={act(async()=>{await api('/fundraisers','POST',{...f,goal:+f.goal});setF({});load()},'Fundraiser created')}>Create</button></div></div>}
  {fs&&!fs.length&&<Empty t={staff?'No fundraisers yet.':'No tasks assigned to you yet. The treasurer can assign you as a volunteer.'}/>}
  {fs?.map(x=>{const done=x.tasks.filter(k=>k.status==='done').length,pct=x.tasks.length?Math.round(done/x.tasks.length*100):0,late=x.tasks.filter(k=>k.status!=='done'&&k.due&&new Date(k.due)<new Date()).length;
  return<div className="card" key={x.id} style={{display:'grid',gap:12}}><div className="row sp"><h2>{x.title}</h2>{tre&&<button className="btn red sm" onClick={()=>confirm('Delete fundraiser?')&&act(()=>api('/fundraisers/'+x.id,'DELETE'),'Deleted',load)()}>Delete</button>}</div>
    {staff&&<><div className="row"><span className="tag">{pct}% tasks done</span>{late>0&&<span className="tag bad">{late} overdue</span>}<span className="tag ok">Raised {inr(x.raised)} / {inr(x.goal)}</span></div><div className="bar"><b style={{width:pct+'%'}}/></div></>}
    <div className="cols">{COLS.map(([s,l])=><div key={s}><b>{l}</b>{x.tasks.filter(k=>k.status===s).map(k=><div className="task" key={k.id}><b>{k.title}</b><p>👤 {k.assignee||'Unassigned'}{k.due&&' · due '+dd(k.due)}</p><div className="row"><select value={k.status} onChange={e=>act(()=>api('/tasks/'+k.id,'PUT',{status:e.target.value}),'Task updated',load)()}>{COLS.map(([v,n])=><option key={v} value={v}>{n}</option>)}</select>{tre&&<button className="btn red sm" onClick={act(()=>api('/tasks/'+k.id,'DELETE'),'Removed',load)}>✕</button>}</div></div>)}</div>)}</div>
    {tre&&<div className="form"><Field l="New task" {...tb('title')}/><Field l="Volunteer" as="select" {...tb('assignee_id')}><option value="">Unassigned</option>{us?.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</Field><Field l="Due" type="date" {...tb('due')}/><button className="btn ghost" onClick={act(async()=>{await api(`/fundraisers/${x.id}/tasks`,'POST',t);setT({});load()},'Task assigned')}>Assign task</button><button className="btn ghost" onClick={()=>{const a=prompt('Amount raised (₹)');a&&act(()=>api(`/fundraisers/${x.id}/raised`,'POST',{amount:+a}),'Income recorded',load)()}}>Record money raised</button></div>}</div>})}</>
}

