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

export default function Checkout({s,close}){const[busy,setB]=useState(false);return<div className="modal"><div className="card"><h2>Confirm payment</h2><p>{s.title}</p><div className="big">{inr(s.amount)}</div>{s.note&&<span className="tag ok">{s.note}</span>}<p style={{fontSize:'.8rem'}}>Demo checkout – no real money moves. Plug in Razorpay/Stripe in the API route to go live.</p><div className="row"><button className="btn" disabled={busy} onClick={async()=>{setB(true);await s.go();close()}}>{busy?'Processing…':'Pay now'}</button><button className="btn ghost" onClick={close}>Cancel</button></div></div></div>}

