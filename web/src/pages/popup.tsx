import { useContext } from 'react'
import { PopUpContext } from '../contexts/popup'

export default function PopUp() {
  const popup_ctx = useContext(PopUpContext);

  return (
    <div className='absolute backdrop-blur-sm h-screen w-full flex justify-center items-center' onClick={() => popup_ctx.close()}>
        {popup_ctx.component}
    </div>
  )
}
