import React,{useState} from 'react';
import {ui} from '../../utils/ui';
import Checkout from '../Checkout';
export default function UIProvider({children}){
  const[toast,setToast]=useState(null),[chk,setChk]=useState(null);
  ui.say=(m,e)=>{setToast({m,e});setTimeout(()=>setToast(null),3000)};
  ui.pay=setChk;
  return<>{children}
    {toast&&<div className={'toast '+(toast.e?'err':'')} role="status">{toast.m}</div>}
    {chk&&<Checkout s={chk} close={()=>setChk(null)}/>}</>;
}
