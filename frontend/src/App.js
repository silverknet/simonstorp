import { BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import useFetch from './hooks/useFetch'
import Infopage from './pages/Infopage'
import Homepage from './pages/Homepage'
import All_news from './pages/All_news'

function App() {
  const {loading, error, data} = useFetch('http://localhost:1337/api/pages?populate=%2A');


  if(loading) {
    return (<p>loading</p>)
  }
  if(error) {
      return (<p>Error!</p>)
  }
  
  return (
    <Router>
      <div className='App'>
        <Routes>
          <Route exact path="/" element={<Homepage />}></Route>

          {data.data.map((page, index) => {
            return (
              <Route key={page.id} path={"/" + page.attributes.url} element={<Infopage id={page.id} page={page}/>}></Route>
            )
          }
          )}
        </Routes>
      </div>
    </Router>
  );
  
}

export default App;
