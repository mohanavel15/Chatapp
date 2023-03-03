import React from 'react'

function ToggleBtn({ children, input_ref }: { children: React.ReactNode, input_ref: React.Ref<HTMLInputElement> }) {
    return (
        <div className='toggle-button w-full flex justify-between my-1'>
        <p>{ children }</p>
        <label className='toggle'>
            <input type="checkbox" ref={input_ref} />
            <span className='toggle-btn'></span>
        </label>
        </div>
    )
}

export default ToggleBtn