import moment from 'moment'

export default function ChatSimple({ message, isSender, isGroup, senderName, timeAgo, newDate, isPrevSender }) {
    const URL_REGEX = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;

    const formatTime = (time) => {
        const mongoDate = new Date(time)
        const timeInLT = moment(mongoDate).format('LT')
        return timeInLT
    }
    const TextMessageHyperLink = (message) => {
           let words = message?.message?.split(' ')
        return (
            <p>
                {words.map((word) => {
                    return word.match(URL_REGEX) ? (
                        <>
                            <a target='_blank' className='text-sky-400' href={word}>{word}</a>{' '}
                        </>
                    ) : (
                        word + ' '
                    );
                })}
            </p>
        );
    }
    return (
        <div className={`bg-zinc-800 p-1 px-2 text-white ${isSender ? isPrevSender ? "rounded-3xl" : " rounded-tl-3xl   rounded-tr-sm" : isPrevSender ? "rounded-3xl" : "rounded-tr-3xl rounded-tl-sm"} ${isPrevSender ? "rounded-3xl" : "rounded-b-3xl  "} max-w-[200px] sm:max-w-[280px] md:max-w-[400px] lg:max-w-[500px]  flex flex-col  justify-center`}>
            {isGroup && !isPrevSender && !isSender && (<div className='font-bold text-orange-500'>{"~" + senderName}</div>)}
            <div className={`flex  items-end gap-2 p-1`} >
                <div className='w-max-[450px] break-words '>
                    <TextMessageHyperLink message={message} />
                </div>
                <div className='text-nowrap text-gray-400 font-medium opacity-85'>
                    {timeAgo && <div className='text-[13px]'>{formatTime(timeAgo)}</div>}
                </div>
            </div>
        </div>
    )
}
