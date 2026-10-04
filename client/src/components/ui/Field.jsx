import React from 'react';
export default function Field({l,as,children,...p}){
  return<label>{l}{as==='textarea'?<textarea {...p}/>:as==='select'?<select {...p}>{children}</select>:<input {...p}/>}</label>;
}
