const API=import.meta.env.VITE_API_URL||'http://localhost:5000/api';
export const api=async(p,m='GET',b)=>{
  const r=await fetch(API+p,{method:m,headers:{'Content-Type':'application/json',Authorization:'Bearer '+(localStorage.t||'')},body:b&&JSON.stringify(b)});
  const d=await r.json().catch(()=>({}));
  if(!r.ok){if(r.status===401&&localStorage.t){localStorage.removeItem('t');location.href='/'}throw new Error(d.error||'Request failed')}
  return d;
};
