import ScheduleMessage from '@/myComponents/Chat/ScheduleMessage'
import Navbar from '@/myComponents/Navbar'

export default function SchedulePage() {
    return (
        <>
            <div>
                <div>
                    <Navbar />
                </div>
                <div className='mt-20'>
                    <ScheduleMessage />
                </div>
            </div>
        </>
    )
}
