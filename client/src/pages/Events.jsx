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

export default function Events(){
  const{user,refresh}=useAuth(),[ev,load]=useLoad('/events'),[qty,setQ]=useState({});
  const buy=e=>{const n=+qty[e.id]||1,p=user.is_member?e.member_price:e.price;ui.pay({title:`${n}× ticket · ${e.title}`,amount:p*n,note:user.is_member?'Member price applied':'Non-member price',go:act(async()=>{await api(`/events/${e.id}/buy`,'POST',{qty:n});load()},'Tickets booked – see My tickets')})};
  return<><h1>Events</h1><div className="grid">{ev?.map(e=><div className="card" key={e.id} style={{display:'grid',gap:10}}>
    <h2>{e.title}</h2><p>{e.description}</p><p>📅 {dt(e.starts_at)}<br/>📍 {e.venue}</p>
    <div className="row"><span className={'tag '+(user.is_member?'ok':'')}>Member {inr(e.member_price)}</span><span className="tag">Guest {inr(e.price)}</span></div>
    <div className="bar"><b style={{width:100-e.seats_left/e.capacity*100+'%'}}/></div><small>{e.seats_left>0?`${e.seats_left} of ${e.capacity} seats left`:'Sold out'}</small>
    {user.role==='user'?<div className="row"><select style={{width:80}} value={qty[e.id]||1} onChange={x=>setQ({...qty,[e.id]:x.target.value})}>{[1,2,3,4,5].map(i=><option key={i}>{i}</option>)}</select><button className="btn" disabled={e.seats_left<1} onClick={()=>buy(e)}>{e.seats_left<1?'Sold out':'Buy tickets'}</button></div>:<small>Staff accounts can't buy tickets.</small>}
  </div>)}</div>{ev&&!ev.length&&<Empty t="No events are on sale."/>}</>
}

