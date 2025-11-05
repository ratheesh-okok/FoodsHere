import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Route, Routes } from 'react-router-dom'
import Orders from './pages/Orders/Orders'
import List from './pages/List/List'
import Add from './pages/Add/Add'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const App = () => {

  const url = "https://foods-here.vercel.app"

  return (
    <div>
      <ToastContainer/>
      <Navbar/>
      <hr />
      <dav className="app-content">
        <Sidebar/>
        <Routes>
            <Route path = "/add" element={<Add url={url}/>}/>
            <Route path = "/list" element={<List url={url}/>}/>
            <Route path = "/orders" element={<Orders url={url}/>}/>
        </Routes>
      </dav>
    </div>
  )
}

export default App
