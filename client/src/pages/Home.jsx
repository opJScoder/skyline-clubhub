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

export default function Home(){
  const{user}=useAuth(),[an]=useLoad('/announcements'),[ev]=useLoad('/events');
  return<>
    <div><h1>Hi {user.name.split(' ')[0]} 👋</h1><p>Here is what is happening around Skyline.</p></div>
    {user.role==='user'&&!user.is_member&&<div className="pass"><div><h2>Become a member</h2><p>Cheaper tickets, {''}discounts on merch and member-only events.</p></div><NavLink className="btn" style={{background:'#fff',color:'var(--d)'}} to="/membership">See membership</NavLink></div>}
    <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))'}}>
      <div className="card"><h2>Announcements</h2>{!an?<Empty t="Loading…"/>:!an.length?<Empty t="Nothing posted yet."/>:an.slice(0,5).map(a=><div key={a.id} style={{padding:'12px 0',borderBottom:'1px solid var(--ln)'}}><div className="row"><b>{a.title}</b><span className={'tag '+(a.pinned?'acc':'')}>{a.pinned?'Pinned · ':''}{a.category}</span></div><p>{a.body}</p><small style={{color:'var(--mut)'}}>{dt(a.created_at)}</small></div>)}</div>
      <div className="card"><h2>Upcoming events</h2>{!ev?<Empty t="Loading…"/>:!ev.length?<Empty t="No events yet."/>:ev.slice(0,4).map(e=><div key={e.id} style={{padding:'12px 0',borderBottom:'1px solid var(--ln)'}}><b>{e.title}</b><p>{dt(e.starts_at)} · {e.venue}</p><span className="tag">{e.seats_left>0?e.seats_left+' seats left':'Sold out'}</span></div>)}<NavLink to="/events">All events</NavLink></div>
    </div></>
}

