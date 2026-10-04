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

export default function MyTickets(){
  const[t]=useLoad('/tickets/mine'),[o]=useLoad('/orders/mine'),{user}=useAuth();
  return<><h1>My tickets & orders</h1>
  <div className="grid">{t?.map(k=><div className="card row sp" key={k.id}><div><h3>{k.title}</h3><p>{dt(k.starts_at)}<br/>{k.venue}</p><span className={'tag '+(k.checked_in?'ok':'')}>{k.checked_in?'Checked in':'Valid'}</span><p><b>{k.code}</b></p></div><div className="qr"><QRCodeSVG value={k.code} size={110}/></div></div>)}</div>
  {t&&!t.length&&<Empty t="No tickets yet – grab one from Events."/>}
  <div className="card scroll"><h2>Merch orders</h2><table><thead><tr><th>Item</th><th>Size</th><th>Qty</th><th>Paid</th><th>Status</th></tr></thead><tbody>{o?.map(x=><tr key={x.id}><td>{x.product_name}</td><td>{x.size}</td><td>{x.qty}</td><td>{inr(x.total)}{x.discount>0&&<small> (saved {inr(x.discount)})</small>}</td><td><span className="tag">{x.status}</span></td></tr>)}</tbody></table>{o&&!o.length&&<Empty t="No orders yet."/>}</div></>
}

