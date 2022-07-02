import useFetch from '../hooks/useFetch'

import React from 'react'
import Menubar from '../components/Menubar'

import ReactMarkdown from 'react-markdown'



export default function Infopage(props) {

  const {loading, error, data} = useFetch('http://localhost:1337/api/categories?populate=%2A');
  if( error || loading){
    return (<p>loading</p>)
  }

  return (
    <div className='mainContainer'> 
      <Menubar loading={loading} error={error} data={data} />
      <div className='home_content'>
                <div className='home_B b1'>
                    <p className='big_text'>{props.page.attributes.Namn}</p>
                    <ReactMarkdown className='small_text'>{props.page.attributes.Huvudtext}</ReactMarkdown>
                </div>
                <div className='home_B b2'>
                  <img className="contentImage" src={"http://localhost:1337" + props.page.attributes.img.data.attributes.url}/>
                </div>
            </div>
    </div>
  )
}
