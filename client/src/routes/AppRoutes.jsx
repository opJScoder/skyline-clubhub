import React from 'react';
import {Routes,Route,Navigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import Auth from '../pages/Auth';
import Home from '../pages/Home';
import Events from '../pages/Events';
import Shop from '../pages/Shop';
import Membership from '../pages/Membership';
import MyTickets from '../pages/MyTickets';
import Fundraisers from '../pages/Fundraisers';
import Expenses from '../pages/Expenses';
import ManageEvents from '../pages/ManageEvents';
import Announcements from '../pages/Announcements';
import Finance from '../pages/Finance';
import People from '../pages/People';
import Scanner from '../pages/Scanner';

export default function AppRoutes(){
  const{user,setUser,ready}=useAuth();
  if(!ready)return null;
  if(!user)return<Auth setAuth={setUser}/>;
  const R=user.role;
  return<Layout><Routes>
    <Route path="/" element={<Home/>}/><Route path="/events" element={<Events/>}/><Route path="/shop" element={<Shop/>}/>
    <Route path="/membership" element={<Membership/>}/><Route path="/mine" element={<MyTickets/>}/>
    <Route path="/tasks" element={<Fundraisers/>}/><Route path="/expenses" element={<Expenses/>}/>
    {R==='admin'&&<><Route path="/manage-events" element={<ManageEvents/>}/><Route path="/announce" element={<Announcements/>}/></>}
    {R!=='user'&&<><Route path="/finance" element={<Finance/>}/><Route path="/people" element={<People/>}/><Route path="/scan" element={<Scanner/>}/></>}
    <Route path="*" element={<Navigate to="/"/>}/></Routes></Layout>;
}
