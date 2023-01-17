import useFetch from '../hooks/useFetch'

import React from 'react'
import Menubar from '../components/Menubar'

import ReactMarkdown from 'react-markdown'

import URL from '../url'

import { useEffect, useState } from "react"

import useWindowDimensions from '../hooks/getWindowDimensions'




export default function Infopage(props) {

  const { height, width } = useWindowDimensions();

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])


  return (
    <div className='mainContainer'> 
    <div className='divider'></div>

      <div className='home_content'>
                {/*<div className='home_B b1'>
                    
                </div>
                <div className='home_B b2'>
                </div>*/}

                <div className='infoContent'>
                  <div className='imageContainer'>
                  {
                    props.page.attributes.img.data.map((value, index) => {
                      return (<>
                        {width > 800 ? <img key={value.id} className="contentImage" src={value.attributes.formats.large.url}/> : index === 0 && <img key={value.id} className="contentImage" src={value.attributes.formats.large.url}/> }
                      </>)
                    })
                  }
                  </div>

                    {/*<img className="contentImage" src={URL + props.page.attributes.img.data.attributes.url}/>*/}
                  <div className='text_container'>
                    <h1 className='big_text'>{props.page.attributes.title}</h1>
                    <ReactMarkdown className='small_text'>{props.page.attributes.Huvudtext}</ReactMarkdown>

                    {props.page.id === 17 ? <p className='small_text styr'>Styrelsen består av</p> : <></>}
                    <table className='styrelse'>
                      <tbody>
                    {props.page.id === 17 ? 
                    
                      props.members.data.map((value, index) => {
                        return (
                          <tr key={value.id}>
                            <td key={"name_" + value.id} className='td name'>{value.attributes.Forefternamn}</td>
                            <td key={"roll_" + value.id} className='td rol'>{value.attributes.Roll}</td>
                            <td key={"email_" + value.id} className='td email'>{value.attributes.Mejladress}</td>
                          </tr>
                        )
                      }
                      )
                    
                    : <></> }
                    </tbody>
                    </table> 
                  </div>        
                </div>
            </div>
    </div>
  )
}
