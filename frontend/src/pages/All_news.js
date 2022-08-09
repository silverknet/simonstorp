import React from 'react'
import Menubar from '../components/Menubar'
import useFetch from '../hooks/useFetch'
import URL from '../url'



export default function All_news() {
    const news = useFetch(URL + '/api/nyheter?populate=%2A');

    if( news.loading || news.error){
        return (<p>loading</p>)
    }

  return (
    <div className='mainContainerAllNews'> 
        <div className='home_content'>
            {news.data.data.map((value, index) => {
                return(
                    <div className='newsBoxAll'>
                        <img className="newsImg" src={URL + value.attributes.Bild.data.attributes.url}/>
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
