import React from 'react'
import { useState, useEffect } from 'react';
import { UNSAFE_NavigationContext } from 'react-router-dom';
import URL from '../url';


export default function ImageSlider(props) {
    const [counter, setCounter] = useState(0);
    if(counter > props.home.data.data.attributes.headerimages.data.length - 1 ){
        setCounter(0);
    }


    useEffect(() => {
      const interval = setInterval(() => {

        setCounter(prev => prev + 1)

      }, 6000);
  
      return () => clearInterval(interval);
    }, []);

    function next(){
        
    }
  
    return (
      <div className="slider">
        {props.home.data.data.attributes.headerimages.data.map((img, index) => {
                return (
                <div className= {index === counter ? 'slideimgActive' : 'slideimg'} key={index}>
                    {index === counter && (<img className="bannerimg" src={ URL + img.attributes.url} alt=""/>) }
                </div>
                )
        })}
      </div>
    );
}
/*props.home.data.data.attributes.headerimages.data */