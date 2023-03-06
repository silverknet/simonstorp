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


  const {loading, error, data} = useFetch(URL + '/api/pages?populate=%2A&sort=rank:asc');
  const categories = useFetch(URL + '/api/categories?populate=%2A&sort=rank:asc');
  const news = useFetch(URL + '/api/nyhets?populate=%2A&sort=rank:asc');
  const members = useFetch(URL + '/api/styrelsemedlems?sort=rank:asc')
  const home = useFetch(URL + '/api/homepage?populate=%2A');

  const [info, setInfo] = useState(0);


  if(loading) {
    return (<p></p>)
  }
  if(error) {
      return (<p>Error!</p>)
  }
  if(categories.loading) {
    return (<p></p>)
  }
  if(categories.error) {
      return (<p>Error!</p>)
  }
  if(news.loading) {
    return (<p></p>)
  }
  if(news.error) {
      return (<p>Error!</p>)
  }
  if(members.loading) {
    return (<p></p>)
  }
  if(members.error) {
      return (<p>Error!</p>)
  }
  if(home.loading || home.error){
    return (<p></p>)
  }
  
  return (
    <Router>
      <Menubar loading={categories.loading} error={categories.error} data={categories.data} page_data={data} set_loc={(i) => setInfo(i)} loc  = {info}/>
      <div className='App'>
          <Routes>
              <Route exact path="/" element={<Homepage categories={categories.data} news={news} homecontent={home}/>}></Route>

            <Route exact path="/allanyheter" element={<All_news />}></Route>


            {data.data.map((page, index) => {
              return (
                <Route key={page.id} path={"/" + page.attributes.url} element={<Infopage id={page.id} page={page} members={members.data}/>}></Route>
              )
            }
            )}
            {news.data.data.map((page, index) =>{
              return (
                <Route key={page.id} path={"/" + page.attributes.url} element={<Full_news id={page.id} page={page}/>}></Route>
              )
            })}
          </Routes>
        
        
      </div>
      <Footer/>
      
    </Router>
    
  );
  
}

export default App;
