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

export default function Expenses(){
  const{user}=useAuth(),tre=user.role==='treasurer',[x,load]=useLoad('/expenses'),[ev]=useLoad('/events'),[f,b,setF]=useForm({});
  return<><h1>Expenses</h1>
  <div className="card"><h3>Submit an expense for reimbursement</h3><div className="form"><Field l="Amount ₹" type="number" {...b('amount')}/><Field l="What was it for?" {...b('description')}/><Field l="Receipt link" placeholder="https://…" {...b('receipt_url')}/><Field l="Event" as="select" {...b('event_id')}><option value="">None</option>{ev?.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</Field><button className="btn" onClick={act(async()=>{await api('/expenses','POST',{...f,amount:+f.amount});setF({});load()},'Claim submitted')}>Submit claim</button></div></div>
  <div className="card scroll"><table><thead><tr><th>Who</th><th>For</th><th>Amount</th><th>Receipt</th><th>Status</th>{tre&&<th/>}</tr></thead><tbody>{x?.map(e=><tr key={e.id}><td>{e.claimant}</td><td>{e.description}</td><td>{inr(e.amount)}</td><td>{e.receipt_url?<a href={e.receipt_url} target="_blank">View</a>:'–'}</td><td><span className={'tag '+(e.status==='reimbursed'?'ok':e.status==='rejected'?'bad':'')}>{e.status}</span></td>{tre&&<td className="row">{e.status==='pending'&&<><button className="btn ghost sm" onClick={act(()=>api('/expenses/'+e.id,'PUT',{status:'approved'}),'Approved',load)}>Approve</button><button className="btn red sm" onClick={act(()=>api('/expenses/'+e.id,'PUT',{status:'rejected'}),'Rejected',load)}>Reject</button></>}{e.status==='approved'&&<button className="btn sm" onClick={act(()=>api('/expenses/'+e.id,'PUT',{status:'reimbursed'}),'Reimbursed & added to ledger',load)}>Mark reimbursed</button>}</td>}</tr>)}</tbody></table>{x&&!x.length&&<Empty t="No expense claims yet."/>}</div></>
}

