import React from 'react'
import ReactMarkdown from 'react-markdown'
import useFetch from '../hooks/useFetch'
import URL from '../url'


export default function Footer() {
    const {loading, error, data} = useFetch(URL + '/api/footer');

    if( loading || error){
        return (<p>loading</p>)
    }
  return (
    <div className='outerFooter'>
        <div className='footerBox'>
            <div className='location'>
                <iframe className='locationIFRAME' frameborder="0" scrolling="no" marginheight="0" marginwidth="0" id="gmap_canvas" src="https://maps.google.com/maps?width=559&amp;height=535&amp;hl=en&amp;q=Simonstorp&amp;t=&amp;z=10&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"></iframe> <script type='text/javascript' src='https://embedmaps.com/google-maps-authorization/script.js?id=fde0f4ca5f76dd86407649d2f8b34e9eb6e58722'></script>
            </div>
            <div className='footercontent'>
                <ReactMarkdown>
                    {data.data.attributes.Footercontent}

                </ReactMarkdown>
            </div>
            
        </div>
    </div>
  )
}

