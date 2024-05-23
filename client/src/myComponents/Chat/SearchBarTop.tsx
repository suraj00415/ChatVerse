import { IoIosSearch } from 'react-icons/io'
import { IoArrowBack } from 'react-icons/io5'

export default function SearchBarTop({ setSearchInputValue, searchInputValue }) {
    return (
        <div className='bg-zinc-900 p-2'>
            <div className='w-full '>
                <div className=' outline-zinc-600 rounded-xl p-2 pl-5 bg-zinc-800 w-full flex'>
                    {!searchInputValue && <IoIosSearch className='h-6 w-auto' />}
                    {searchInputValue && <div className='cursor-pointer' onClick={()=>setSearchInputValue("")}><IoArrowBack className="h-6 w-auto   " /></div>}
                    <input type="text" value={searchInputValue} onChange={(e) => setSearchInputValue(e.target.value)} className=' bg-zinc-800 w-full outline-none pl-3' placeholder='Search the chats ' />
                </div>
            </div>
        </div>
    )
}
