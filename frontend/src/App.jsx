import { BrowserRouter, Routes,Route } from 'react-router'
import Layout from './Layout'
import React from 'react'

function App() {

  return (
    <>
    <BrowserRouter>
  <Routes>
    <Route path="/" element={<Layout />}>
      {/* <Route index element={} />
      <Route path="" element={} />
      
      <Route path="" element={}>
        <Route path="" element={} />
        <Route path="" element={} />
        <Route path="" element={} />
        <Route path="" element={} />
        <Route path="" element={} />
      </Route> */}
      
    </Route>
  </Routes>
</BrowserRouter>


    </>
  )
}

export default App