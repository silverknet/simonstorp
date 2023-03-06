import { BrowserRouter as Router, Route, Routes} from 'react-router-dom'

import useFetch from './hooks/useFetch'
import Infopage from './pages/Infopage'
import Full_news from './pages/Full_news'
import Homepage from './pages/Homepage'
import All_news from './pages/All_news'
import Menubar from './components/Menubar'
import Footer from './components/Footer'
import URL from './url'
import { useLocation } from 'react-router-dom'


import { useEffect, useState } from "react"
import React, { Suspense } from 'react';




function App() {

  
  return (
    <>
    <div className='loadingContainer'><div className='spinner'></div></div>
    </>
  )
  
}

export default App;
