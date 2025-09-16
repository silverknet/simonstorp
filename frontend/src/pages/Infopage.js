import useFetch from '../hooks/useFetch'

import React from 'react'
import Menubar from '../components/Menubar'

import ReactMarkdown from 'react-markdown'

import URL from '../url'

import { useEffect, useState } from "react"

import useWindowDimensions from '../hooks/getWindowDimensions'
import { useHistory, useLocation } from "react-router-dom";


export default function Infopage(props) {
  const [pageData, setPageData] = useState(null);

  const {loading, error, data} = useFetch(URL + '/api/pages/' + props.id + '?populate=%2A&sort=rank:asc');

  const membersUrl =
  data?.data.attributes?.title === "Styrelsen"
    ? URL + "/api/styrelsemedlems?sort=rank:asc"
    : null;

  const { loading: membersLoading, error: membersError, data: members } = useFetch(membersUrl);

  
  const [imageTextShow, setImageTextShow] = useState(-1);
  const [centerFormat, setCenterFormat] = useState(false);

  const { height, width } = useWindowDimensions();
  
  const location = useLocation();
  

  useEffect(() => {
    if (!data) return; 
    
    data.data.attributes.img && data.data.attributes.img.data && data.data.attributes.img.data.length > 0 ? setCenterFormat(false) : setCenterFormat(true);
    window.scrollTo(0, 0)
    
  }, [data])


  const getTopImage = (value) => {
    if (value.attributes.formats?.large){
      return value.attributes.formats.large.url;
    }
    if (value.attributes.formats?.medium){
      return value.attributes.formats.medium.url;
    }
    if (value.attributes.formats?.small){
      return value.attributes.formats.small.url;
    }
  }

  if(error) {
      return (<p>Error!</p>)
  }
  if(loading) {
      return (<p></p>)
  }
  if(!data) {
      return (<p>no data</p>)
  }
  if(data.data.attributes.title === 'Styrelsen' && (membersError || membersLoading)) {
    return (<p>failed to fetch members</p>)
  }


  return (
    <div className='mainContainer'> 
    <div className='divider'></div>

      <div className='home_content'>
                {/*<div className='home_B b1'>
                    
                </div>
                <div className='home_B b2'>
                </div>*/}

                <div className='infoContent'>
                  <div className={centerFormat?'noContainer':'imageContainer'}>
                  {
                    
                     !centerFormat && data.data.attributes.img && data.data.attributes.img.data && data.data.attributes.img.data.length > 0 && data.data.attributes.img.data.map((value, index) => {
                      return (<>
                        {width > 800 ? <img key={value.id} className="contentImage" onMouseEnter={() => setImageTextShow(index)} onMouseLeave={() => setImageTextShow(-1)} src={getTopImage(value)}/> : index === 0 && <img key={value.id} className="contentImage" src={value.attributes.url}/> }
                        <p className={imageTextShow==index?"imageText":"imageTextLo"} key={index}></p>
                      </>)
                    })
                  }
                  
                  </div>

                    {/*<img className="contentImage" src={URL + data.attributes.img.data.attributes.url}/>*/}
                  <div className={centerFormat?'center_text_container':'text_container'}>
                    <h1 className='big_text'>{data.data.attributes.title}</h1>
                    <ReactMarkdown className='small_text'>{data.data.attributes.Huvudtext}</ReactMarkdown>

                    {data.data.attributes.title === 'Styrelsen' ? <p className='small_text styr'>Styrelsen består av</p> : <></>}
                    <table className='styrelse'>
                      <tbody>
                    {data.data.attributes.title === 'Styrelsen' ? 
                    
                      members.data.map((value, index) => {
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
    </div>)  
}
