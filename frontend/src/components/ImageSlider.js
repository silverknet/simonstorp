import React from 'react'
import { useState, useEffect } from 'react';
import { UNSAFE_NavigationContext } from 'react-router-dom';
import URL from '../url';


export default function ImageSlider(props) {
    const [counter, setCounter] = useState(0);

    let length = props.home.data.data.attributes.headerimages.data.length;
    
    counter > length - 1 ? setCounter(0): void(0);
    

    useEffect(() => {
      
      const interval = setInterval(() => {

        setCounter(prev => prev + 1)

      }, 16000);
      return () => clearInterval(interval);
    }, []);
    
    return (
      <div className="slider">
        {props.home.data.data.attributes.headerimages.data.map((img, index) => {
                return (
                <div className= {index === counter ? 'slideimgActive' : 'slideimg'} key={index}>
                    { (index === counter || index === (counter - 1 >= 0 ? counter - 1 : length - 1)) && <img className="bannerimg" src={ img.attributes.url} alt=""/> }
                </div>
                )
        })}
      </div>
    );
}
/*props.home.data.data.attributes.headerimages.data */