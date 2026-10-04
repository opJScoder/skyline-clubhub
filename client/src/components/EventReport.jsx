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

export default function EventReport({r,close}){const s=r.summary;return<div className="card"><div className="row sp"><h2>{r.e.title} report</h2><button className="btn ghost sm" onClick={close}>Close</button></div>
  <div className="row" style={{gap:30}}>{[['Sold',s.sold],['Attended',s.attended],['No-shows',s.sold-s.attended],['Revenue',inr(s.revenue)],['Spent',inr(r.spend)],['Profit',inr(s.revenue-r.spend)]].map(([k,v])=><div key={k}><p>{k}</p><div className="big">{v}</div></div>)}</div>
  <div className="scroll"><table><thead><tr><th>Name</th><th>Email</th><th>Type</th><th>Code</th><th>Paid</th><th>In</th></tr></thead><tbody>{r.attendees.map(a=><tr key={a.code}><td>{a.name}</td><td>{a.email}</td><td>{a.member?'Member':'Guest'}</td><td>{a.code}</td><td>{inr(a.price)}</td><td>{a.checked_in?'✅':'–'}</td></tr>)}</tbody></table></div></div>}

