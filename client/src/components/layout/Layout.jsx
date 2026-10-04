import React from 'react';
import {NavLink} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';
import {NAV} from '../../routes/navConfig';
export default function Layout({children}){
  const{user,logout}=useAuth(),R=user.role;
  return<>
    <header className="top"><div className="logo"><i>S</i>Skyline ClubHub</div>
      <nav className="nav">{NAV[R].map(([p,l])=><NavLink key={p} to={p} end={p==='/'}>{l}</NavLink>)}</nav>
      <div className="who"><span className={'tag '+(user.is_member?'ok':'')}>{R==='user'?(user.is_member?'Member':'Guest'):R}</span>{user.name}<button className="btn ghost sm" onClick={logout}>Log out</button></div></header>
    <main className="wrap">{children}</main></>;
}
