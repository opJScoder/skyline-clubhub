import React from 'react';
import {AuthProvider} from './context/AuthContext';
import UIProvider from './components/ui/UIProvider';
import AppRoutes from './routes/AppRoutes';
export default function App(){return<AuthProvider><UIProvider><AppRoutes/></UIProvider></AuthProvider>}
