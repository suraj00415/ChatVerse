import VerifyUser from '@/myComponents/Chat/VerifyUser'
import Navbar from '@/myComponents/Navbar'
import React from 'react'

export default function VerifyPage() {
    return (
        <div>
            <Navbar />
            <div className='mt-20'>
                <VerifyUser />
            </div>
        </div>
    )
}
