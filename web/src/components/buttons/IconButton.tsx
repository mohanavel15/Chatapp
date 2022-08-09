import React from 'react'

export default function IconButton({ children, tooltip, onClick } : {children : React.ReactNode, tooltip?: string, onClick?: () => void}) {
  return (
    <div className='flex items-center justify-center absolute right-2 p-1 rounded mx-2 hover:cursor-pointer hover:bg-gray-800'
        onClick={onClick}>
        { children }
    </div>
  )
}
