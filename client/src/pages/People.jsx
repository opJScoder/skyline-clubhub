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

export default function People(){
  const{user}=useAuth(),[u,load]=useLoad('/users'),[m]=useLoad('/members'),admin=user.role==='admin';
  return<><h1>People & members</h1>
  <div className="card scroll"><h2>Memberships bought ({m?.length||0})</h2><table><thead><tr><th>Member</th><th>Code</th><th>Valid until</th><th>Tickets</th><th>Orders</th></tr></thead><tbody>{m?.map(x=><tr key={x.id}><td>{x.name}<br/><small>{x.email}</small></td><td><b>{x.member_code}</b></td><td>{dd(x.member_until)} {new Date(x.member_until)>new Date()?<span className="tag ok">active</span>:<span className="tag bad">expired</span>}</td><td>{x.tickets}</td><td>{x.orders}</td></tr>)}</tbody></table>{m&&!m.length&&<Empty t="No members yet."/>}</div>
  <div className="card scroll"><h2>All accounts</h2><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th/></tr></thead><tbody>{u?.map(x=><tr key={x.id}><td>{x.name}</td><td>{x.email}</td><td>{admin?<select value={x.role} onChange={e=>act(()=>api(`/users/${x.id}/role`,'PUT',{role:e.target.value}),'Role updated',load)()}>{['user','treasurer','admin'].map(r=><option key={r}>{r}</option>)}</select>:x.role}</td><td>{admin&&x.id!==user.id&&<button className="btn red sm" onClick={()=>confirm('Delete account?')&&act(()=>api('/users/'+x.id,'DELETE'),'Deleted',load)()}>Delete</button>}</td></tr>)}</tbody></table></div></>
}

