import {useState} from 'react';
export default function useForm(init){
  const[v,setV]=useState(init);
  return[v,k=>({value:v[k]??'',onChange:e=>setV({...v,[k]:e.target.type==='checkbox'?e.target.checked:e.target.value})}),setV];
}
