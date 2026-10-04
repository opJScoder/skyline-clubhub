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

export default function Membership(){
  const{user,refresh}=useAuth(),[pr]=useLoad('/membership/price');
  if(user.role!=='user')return<><h1>Membership</h1><p>Staff accounts don't hold memberships. See the Members page for who has joined.</p></>;
  const buy=()=>ui.pay({title:user.is_member?'Renew membership (+1 year)':'Club membership (1 year)',amount:pr.fee,go:act(async()=>{await api('/membership/buy','POST');await refresh()},'Membership active!')});
  return<><h1>Membership</h1>
  {user.is_member?<div className="pass"><div><span className="tag acc">ACTIVE</span><h2 style={{marginTop:8}}>{user.name}</h2><p>Valid until {dd(user.member_until)}</p><p>Your member code</p><div className="big">{user.member_code}</div><p>Show this at events and the shop counter.</p></div><div className="qr"><QRCodeSVG value={user.member_code} size={130}/></div></div>
  :<div className="card"><h2>{user.member_code?'Your membership expired':'Join Skyline for '+inr(pr?.fee)+' / year'}</h2><p>Members get a personal code and QR card.</p></div>}
  <div className="card"><h3>Member perks</h3><p>🎟 Lower ticket prices on every event · 👕 {pr?.discount}% off all merchandise · 🔒 Member-only events · 🪪 QR card for quick check-in</p><button className="btn" disabled={!pr} onClick={buy}>{user.is_member?'Renew now':'Buy membership'}</button></div></>
}

