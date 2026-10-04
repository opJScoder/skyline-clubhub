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

import EventReport from '../components/EventReport';
export default function ManageEvents(){
  const[ev,load]=useLoad('/events/all'),[f,b,setF]=useForm({status:'published'}),[rep,setRep]=useState(null);
  const show=async e=>setRep({e,...await api(`/events/${e.id}/report`)});
  return<><h1>Manage events</h1><div className="card"><div className="form"><Field l="Title" {...b('title')}/><Field l="Venue" {...b('venue')}/><Field l="Starts" type="datetime-local" {...b('starts_at')}/><Field l="Capacity" type="number" {...b('capacity')}/><Field l="Member price ₹" type="number" {...b('member_price')}/><Field l="Guest price ₹" type="number" {...b('price')}/><Field l="Description" {...b('description')}/><button className="btn" onClick={act(async()=>{await api('/events','POST',{...f,capacity:+f.capacity,price:+f.price,member_price:+f.member_price});setF({status:'published'});load()},'Event created')}>Create event</button></div></div>
  <div className="card scroll"><table><thead><tr><th>Event</th><th>When</th><th>Seats</th><th>Status</th><th/></tr></thead><tbody>{ev?.map(e=><tr key={e.id}><td><b>{e.title}</b></td><td>{dt(e.starts_at)}</td><td>{e.capacity-e.seats_left}/{e.capacity}</td><td><select value={e.status} onChange={x=>act(()=>api('/events/'+e.id,'PUT',{...e,status:x.target.value}),'Updated',load)()}>{['draft','published','cancelled','completed'].map(s=><option key={s}>{s}</option>)}</select></td><td className="row"><button className="btn ghost sm" onClick={()=>show(e)}>Report</button><button className="btn red sm" onClick={()=>confirm('Delete event and its tickets?')&&act(()=>api('/events/'+e.id,'DELETE'),'Deleted',load)()}>Delete</button></td></tr>)}</tbody></table></div>
  {rep&&<EventReport r={rep} close={()=>setRep(null)}/>}</>
}
