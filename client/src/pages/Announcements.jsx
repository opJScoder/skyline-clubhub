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

export default function Announcements(){
  const[a,load]=useLoad('/announcements'),[f,b,setF]=useForm({category:'general'});
  return<><h1>Announcements</h1><div className="card"><div className="form" style={{gridTemplateColumns:'1fr 1fr'}}><Field l="Title" {...b('title')}/><Field l="Category" as="select" {...b('category')}>{['general','meeting','deadline','change-of-plan'].map(c=><option key={c}>{c}</option>)}</Field><div style={{gridColumn:'1/-1'}}><Field l="Message" as="textarea" rows={3} {...b('body')}/></div><label className="row"><input style={{width:'auto'}} type="checkbox" checked={!!f.pinned} onChange={e=>setF({...f,pinned:e.target.checked})}/>Pin to top</label><button className="btn" onClick={act(async()=>{await api('/announcements','POST',f);setF({category:'general'});load()},'Published')}>Publish</button></div></div>
  {a?.map(x=><div className="card row sp" key={x.id}><div><b>{x.title}</b> <span className="tag">{x.category}</span>{x.pinned&&<span className="tag acc">pinned</span>}<p>{x.body}</p><small>{dt(x.created_at)} · {x.author||'Admin'}</small></div><div className="row"><button className="btn ghost sm" onClick={act(()=>api('/announcements/'+x.id,'PUT',{...x,pinned:!x.pinned}),'Updated',load)}>{x.pinned?'Unpin':'Pin'}</button><button className="btn red sm" onClick={()=>confirm('Delete?')&&act(()=>api('/announcements/'+x.id,'DELETE'),'Deleted',load)()}>Delete</button></div></div>)}</>
}

