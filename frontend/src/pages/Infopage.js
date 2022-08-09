import useFetch from '../hooks/useFetch'

import React from 'react'
import Menubar from '../components/Menubar'

import ReactMarkdown from 'react-markdown'

import URL from '../url'





export default function Infopage(props) {


  return (
    <div className='mainContainer'> 
    <div className='divider'></div>
    <p className='big_text'>{props.page.attributes.Namn}</p>

      <div className='home_content'>
                {/*<div className='home_B b1'>
                    
                </div>
                <div className='home_B b2'>
                </div>*/}

                <div className='infoContent'>
                  <img className="contentImage" src={URL + props.page.attributes.img.data.attributes.url}/>

                  <ReactMarkdown className='small_text'>{props.page.attributes.Huvudtext}</ReactMarkdown>
                </div>
            </div>
    </div>
  )
}
