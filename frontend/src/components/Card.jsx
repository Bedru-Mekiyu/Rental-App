import React from 'react'

export default function Card({children}) {
  return (
    <div className='bg-white rounded-xl shadow-sm p-8 m-8'>
      {children}
    </div>
  )
}
