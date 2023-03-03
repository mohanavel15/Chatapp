export default function SettingsItem({ title, children }: { title: string, children: any }) {
  return (
    <div className='w-11/12 sm:w-4/5 lg:w-1/2 items-start p-4 flex flex-col border-t border-solid border-gray-600'>
        <h3 className='text-gray-600'>{title}</h3>
        {children}
    </div>
  )
}
