import GroupAdd from '@/myComponents/Chat/GroupAdd'
import Navbar from '@/myComponents/Navbar'

export default function AddPage() {
    return (
        <div>
            <div>
                <Navbar />
            </div>
            <div className='mt-20'>
                <GroupAdd />
            </div>
        </div>
    )
}