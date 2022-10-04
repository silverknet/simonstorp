import useFetch from '../hooks/useFetch'

import React from 'react'
import Menubar from '../components/Menubar'

import ReactMarkdown from 'react-markdown'

import URL from '../url'



export default function Infopage(props) {


  return (
    <div className='mainContainer'> 
    <div className='divider'></div>

      <div className='home_content'>
                {/*<div className='home_B b1'>
                    
                </div>
                <div className='home_B b2'>
                </div>*/}

                <div className='infoContent'>
                <p className='big_text'>{props.page.attributes.Namn}</p>
               
                {
                  props.page.attributes.img.data.map((value, index) => {
                    return (
                      <img className="contentImage" src={URL + value.attributes.url}/>
                    )
                  })
                }
                  

                  {/*<img className="contentImage" src={URL + props.page.attributes.img.data.attributes.url}/>*/}

                  <ReactMarkdown className='small_text'>{props.page.attributes.Huvudtext}</ReactMarkdown>
                  {props.page.id === 1 ? <p className='small_text styr'>Styrelsen består av</p> : <></>}
                  <table className='styrelse'>
                  {props.page.id === 1 ? 
                  
                    props.members.data.map((value, index) => {
                      return (
                        <tr>
                          <td className='td name'>{value.attributes.Forefternamn}</td>
                          <td className='td tel'>{value.attributes.Telefonnummer}</td>
                          <td className='td email'>{value.attributes.Mejladress}</td>
                        </tr>
                      )
                    }
                    )
                  
                  : <></> }
                  </table> 
                </div>
            </div>
    </div>
  )
}
