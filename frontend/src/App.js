import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'

import useFetch from './hooks/useFetch'
import Infopage from './pages/Infopage'
import Homepage from './pages/Homepage'
import AllNews from './pages/All_news'
import NewsArticlePage from './pages/NewsArticlePage'
import Menubar from './components/Menubar'
import Footer from './components/Footer'
import ErrorScreen from './components/ErrorScreen'
import Loading from './Loading'
import URL from './url'
import { toValidUrl }  from './utils/utils';

import { useState } from "react"
import React from 'react';

/**
 * Home: fixed header has no layout spacer — .App uses mobile padding-top.
 * Other routes: Menubar renders a spacer — do not add that padding again.
 */
function AppLayout({
  categories,
  pages,
  news,
  home,
  currentPage,
  setCurrentPage,
  info,
  setInfo,
}) {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const appClassName = isHome ? 'App app-home-mobile-flush' : 'App app-below-menubar-spacer'
  const pageItems = Array.isArray(pages?.data?.data) ? pages.data.data : []

  return (
    <>
      <Menubar
        categories={categories}
        pages={pages}
        setCurrentPage={setCurrentPage}
        currentPage={currentPage}
        set_loc={(i) => setInfo(i)}
        loc={info}
      />
      <div className={appClassName}>
        <Routes>
          <Route exact path="/" element={<Homepage homecontent={home} />}></Route>

          <Route exact path="/allanyheter" element={<AllNews />}></Route>

          {pageItems.map((page) => (
            <Route
              key={page.id}
              path={"/" + toValidUrl(page.title)}
              element={<Infopage documentId={page.documentId} />}
            ></Route>
          ))}
          <Route path=":slug" element={<NewsArticlePage />}></Route>
        </Routes>
      </div>
      <Footer/>
    </>
  )
}

function App() {

  const pages = useFetch(URL + '/api/pages?fields=url,title&populate=categories&sort=rank:asc');
  const categories = useFetch(URL + '/api/categories?populate=%2A&sort=rank:asc');
  const members = useFetch(URL + '/api/styrelsemedlems?sort=rank:asc')
  const home = useFetch(URL + '/api/homepage?populate=%2A');

  const [info, setInfo] = useState(0);

  const [currentPage, setCurrentPage] = useState(-1);


  if(pages.loading || categories.loading || members.loading || home.loading) {
    return (<Loading/>)
  }
  if (pages.error) {
    return (
      <ErrorScreen
        title="Kunde inte ladda innehåll"
        description="Sidlistan kunde inte hämtas från servern. Kontrollera anslutningen och försök igen."
      />
    );
  }
  if (categories.error) {
    return (
      <ErrorScreen
        title="Kunde inte ladda menyn"
        description="Kategorier kunde inte hämtas. Försök att ladda om sidan."
      />
    );
  }
  if (members.error) {
    return (
      <ErrorScreen
        title="Kunde inte ladda medlemsdata"
        description="Styrelse- och medlemslistan kunde inte hämtas just nu."
      />
    );
  }
  if (home.error) {
    return (
      <ErrorScreen
        title="Kunde inte ladda startsidan"
        description="Startsidesinnehållet kunde inte hämtas från servern."
      />
    );
  }
  
  return (
    <Router>
      <AppLayout
        categories={categories}
        pages={pages}
        home={home}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        info={info}
        setInfo={setInfo}
      />
    </Router>
  );
  
}

export default App;
