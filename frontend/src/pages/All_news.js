import React from 'react'
import Menubar from '../components/Menubar'
import useFetch from '../hooks/useFetch'



export default function All_news() {
    const news = useFetch('http://localhost:1337/api/nyheter?populate=%2A');
    const {loading, error, data} = useFetch('http://localhost:1337/api/categories?populate=%2A');


    if(error || loading || news.loading || news.error){
        return (<p>loading</p>)
    }

  return (
    <div className='mainContainer'> 
        <Menubar loading={loading} error={error} data={data} />
        <div className='home_content'>
            {news.data.data.map((value, index) => {
                return(
                    <div className='newsBox'>
                        <img className="newsImg" src={"http://localhost:1337" + value.attributes.Bild.data.attributes.url}/>
                        <div className='newsText'>
                            <div className='newsHeadText'>
                                <p className='newsHead'>{value.attributes.Rubrik}</p>
                                <p className='newsDate'>{value.attributes.Datum}</p>
                            </div>
                            
                            <p className='newsBody'>{value.attributes.Beskrivning}</p>
                        </div>
                    </div>
                )
            })}
                
        </div>
    </div>
  )
}
