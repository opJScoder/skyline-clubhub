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

export default function Auth({setAuth}){
  const[reg,setReg]=useState(false),[v,b]=useForm({}),[sh,setSh]=useState(false),nav=useNavigate();
  const go=act(async()=>{const r=await api(reg?'/auth/register':'/auth/login','POST',v);localStorage.t=r.token;setAuth(r.user);nav('/')});
  return<div className="auth"><div>
    <div className="logo"><i>S</i>Skyline ClubHub</div>
    <h1>{reg?'Make campus feel smaller.':'Welcome back.'}</h1>
    <p>{reg?'Create your free account and find your people, your events, and your next story.':'Log in to see your events, tickets and membership.'}</p>
    <div className="form" style={{gridTemplateColumns:'1fr',maxWidth:420}}>
      {reg&&<Field l="Full name" {...b('name')}/>}
      <Field l="Email address" type="email" {...b('email')}/>
      <Field l="Password" type={sh?'text':'password'} {...b('password')} onKeyDown={e=>e.key==='Enter'&&go()}/>
      <div className="row sp"><button className="btn" onClick={go}>{reg?'Create account':'Log in'}</button><a href="#" onClick={e=>{e.preventDefault();setSh(!sh)}}>{sh?'Hide':'Show'} password</a></div>
      <a href="#" onClick={e=>{e.preventDefault();setReg(!reg)}}>{reg?'Have an account? Log in':'New here? Create an account'}</a>
      <p style={{fontSize:'.8rem'}}>Demo logins (password123): admin@skyline.edu · treasurer@skyline.edu · user@skyline.edu</p>
    </div></div>
    <div className="r"><b style={{color:'#7fd0ff'}}>The clubhouse for campus</b><h1>Show up for the moments that matter.</h1><p>One calm space for busy clubs, bright ideas, and the people who make university memorable.</p></div></div>
}

