import React,{createContext,useContext,useState,useEffect,useCallback} from 'react';
import {api} from '../services/api';
const Ctx=createContext();
export const useAuth=()=>useContext(Ctx);
export function AuthProvider({children}){
  const[user,setUser]=useState(null),[ready,setReady]=useState(!localStorage.t);
  const refresh=useCallback(()=>api('/me').then(setUser).catch(()=>{}),[]);
  useEffect(()=>{if(!localStorage.t)return;api('/me').then(setUser).catch(()=>localStorage.removeItem('t')).finally(()=>setReady(true))},[]);
  const logout=()=>{localStorage.removeItem('t');setUser(null)};
  return<Ctx.Provider value={{user,setUser,refresh,logout,ready}}>{children}</Ctx.Provider>;
}
