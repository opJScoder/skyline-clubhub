import {useState,useEffect,useCallback} from 'react';
import {api} from '../services/api';
import {ui} from '../utils/ui';
export default function useLoad(path,skip){
  const[d,setD]=useState(null);
  const load=useCallback(()=>{if(!skip)api(path).then(setD).catch(e=>ui.say(e.message,1))},[path,skip]);
  useEffect(load,[load]);
  return[d,load];
}
