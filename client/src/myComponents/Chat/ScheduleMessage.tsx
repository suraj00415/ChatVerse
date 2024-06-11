import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider, MobileDateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});


export default function ScheduleMessage() {
    return (

        <ThemeProvider theme={darkTheme}>
            <div className='w-full h-full flex justify-center items-center '>
                <div className='flex p-3 h-full items-center justify-center'>
                    <div className='  w-[100%]  bg-zinc-800 gap-10 flex flex-col-reverse lg:flex-row justify-around py-7 rounded-md px-8 '>
                        <div>
                            <ScrollArea className="h-[300px] rounded-md border p-2 pr-3 mt-4 bg-zinc-900">
                                <div className='flex flex-col gap-3 '>
                                    <div className=' bg-zinc-800 cursor-pointer rounded-lg p-2 flex justify-between items-center hover:bg-zinc-700' >
                                        <div className='flex gap-2 items-center'>
                                            <div>
                                                <div className='font-semibold'>Hello From Suraj</div>
                                                <div className=''><span className='text-lime-400'>@</span>Hi</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </div>
                        <div>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <div>
                                    <MobileDateTimePicker
                                        disablePast
                                        orientation='landscape'
                                        onChange={(date) => console.log(date)}
                                    />
                                </div>
                            </LocalizationProvider>
                            <div>
                                Send Message To:
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ThemeProvider >
    )
}
