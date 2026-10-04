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

const parseSizes=s=>Object.fromEntries(s.split(',').map(x=>x.split(':').map(y=>y.trim())).filter(x=>x[0]).map(([k,v])=>[k,+v||0]));
export default function Shop(){
  const{user}=useAuth(),[ps,load]=useLoad('/products'),[os,loadO]=useLoad('/orders',user.role==='user'),[sel,setSel]=useState({}),[f,b,setF]=useForm({sizes:'S:10,M:10,L:10,XL:5'}),staff=user.role!=='user',manage=user.role==='treasurer';
  const order=p=>{const s=sel[p.id];if(!s)return ui.say('Pick a size first',1);const price=user.is_member?Math.round(p.price*.9):p.price;ui.pay({title:`${p.name} · ${s}`,amount:price,note:user.is_member?'Member discount applied':'Become a member to save 10%',go:act(async()=>{await api('/orders','POST',{product_id:p.id,size:s,qty:1});load()},'Order placed!')})};
  return<><h1>Merch store</h1>
  {manage&&<div className="card"><h3>Add product</h3><div className="form"><Field l="Name" {...b('name')}/><Field l="Price ₹" type="number" {...b('price')}/><Field l="Sizes (S:10,M:5)" {...b('sizes')}/><Field l="Description" {...b('description')}/><button className="btn" onClick={act(async()=>{await api('/products','POST',{...f,price:+f.price,sizes:parseSizes(f.sizes)});setF({sizes:'S:10,M:10,L:10,XL:5'});load()},'Product added')}>Add</button></div></div>}
  <div className="grid">{ps?.map(p=><div className="card" key={p.id} style={{display:'grid',gap:10}}><div style={{height:110,borderRadius:12,background:'linear-gradient(135deg,#bfe3f8,#e4f2fb)',display:'grid',placeItems:'center',fontSize:44}}>{p.name.includes('Hood')?'🧥':'👕'}</div>
    <h3>{p.name}</h3><p>{p.description}</p><div><b>{inr(p.price)}</b>{!staff&&user.is_member&&<span className="tag ok" style={{marginLeft:8}}>You pay {inr(Math.round(p.price*.9))}</span>}</div>
    <div className="chips">{Object.entries(p.sizes).map(([s,n])=><button key={s} disabled={n<1&&!staff} className={'chip '+(sel[p.id]===s?'on':'')} onClick={()=>setSel({...sel,[p.id]:s})} title={n+' left'}>{s} · {n}</button>)}</div>
    {!staff&&<button className="btn" onClick={()=>order(p)}>Buy now</button>}
    {manage&&<div className="row"><button className="btn ghost sm" onClick={()=>{const v=prompt('Update stock, e.g. S:10,M:5',Object.entries(p.sizes).map(([k,n])=>k+':'+n));v&&act(()=>api('/products/'+p.id,'PUT',{...p,sizes:parseSizes(v)}),'Stock updated',load)()}}>Edit stock</button><button className="btn red sm" onClick={()=>confirm('Delete product?')&&act(()=>api('/products/'+p.id,'DELETE'),'Deleted',load)()}>Delete</button></div>}
  </div>)}</div>
  {staff&&<div className="card scroll"><h2>All shop orders</h2><table><thead><tr><th>Buyer</th><th>Item</th><th>Size</th><th>Paid</th><th>Status</th></tr></thead><tbody>{os?.map(o=><tr key={o.id}><td>{o.buyer} {o.member&&<span className="tag ok">member</span>}</td><td>{o.qty}× {o.product_name}</td><td>{o.size}</td><td>{inr(o.total)}</td><td>{manage?<select value={o.status} onChange={e=>act(()=>api('/orders/'+o.id,'PUT',{status:e.target.value}),'Updated',loadO)()}>{['paid','ready','collected','cancelled'].map(s=><option key={s}>{s}</option>)}</select>:<span className="tag">{o.status}</span>}</td></tr>)}</tbody></table>{os&&!os.length&&<Empty t="No orders yet."/>}</div>}</>
}

