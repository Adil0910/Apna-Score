import React from 'react'
function Home() {
  return (
    <>
    <div className='main-home'>
        <h1>Apna Score</h1>
    </div>
    <div className='box1'>
        <h2 className='title-h2'>Matches</h2>
        <div className='baba'>
        <div className='box1-kabox'>
            <p className='team-name'>Rcb</p> <img className='image-team-logo' src='img/rcb.jfif'/><div className='vs'><p className='match-time'>06:00</p><p className='match-date'>30 OCT</p></div> <img className='image-team-logo' src='img/csk.jfif'/> <p className='team-name'>Csk</p>
        </div>
        <div className='box1-kabox'>
            <div className='vs'><img className='image-team-logo' src='img/rcb.jfif'/><p className='team-name-2'>Rcb</p> </div><div className='vs'><p>197/7</p><p>20 over</p></div>
            <div className='vs'><img className='image-team-logo' src='img/csk.jfif'/><p className='team-name-2'>Csk</p> </div><div className='vs'><p>200/4</p><p>19.2 over</p></div>
        </div>

        </div>
    </div>
    </>
  )
}

export default Home