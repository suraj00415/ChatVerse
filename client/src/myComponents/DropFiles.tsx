import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaInfoCircle } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
export function DropFiles({ setValue, register, type, errors, imgs = "", disable = false }: any) {
    const [file, setFile] = useState('')
    const [imgFile, setImgFile] = useState(imgs)
    const [fileType, setFileType] = useState('')
    const [error, setError] = useState('')
    const onDrop = useCallback((acceptedFiles: any, rejectedfiles: any) => {
        console.log(acceptedFiles)
        if (acceptedFiles.length === 1) {
            setFileType(acceptedFiles[0]?.type)
            setValue(type, acceptedFiles[0])
            setFile(URL.createObjectURL(acceptedFiles[0]))
            setError('')
        }
        if (Object.keys(rejectedfiles).length > 0) {
            setFileType('')
            setValue(type, null)
            setError("More Than One Files is Not Allowed")
        }
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 })
    return (
        <>
            <div className="h-full  bg-slate-200 dark:bg-zinc-900 rounded-lg flex justify-center items-center ">
                <div className='border-[3px] border-dotted  border-lime-400 p-3 h-[90%] w-[96%] cursor-pointer  flex justify-center items-center gap-2 text-gray-500'>
                    <div {...getRootProps({ className: " p-8" })}>
                        <input {...getInputProps()} {...register(type)} />
                        {
                            isDragActive ?
                                <p>Drop the files here ...</p> :
                                <p>Drag 'n' drop some files here, or click to select files</p>
                        }
                    </div>
                    {
                        file.length > 0 || imgFile ?
                            <div className='relative'>
                                {fileType?.includes("video") && <video src={file} width={120} height={120}></video>}
                                {fileType?.includes("image") && <img src={file} width={120} height={120} />}
                                {imgs && !file && <img src={imgFile} width={120} height={120} />}
                                <div className='absolute -top-2 text-white -right-1 cursor-pointer' onClick={(() => {
                                    setFile('')
                                    setFileType('')
                                    setValue(type, null)
                                    setImgFile((prev) => {
                                        if (disable) return prev
                                        else return ''
                                    })
                                })}><IoCloseCircle className='h-6 w-auto' /></div>
                            </div>
                            : ""
                    }
                </div>
            </div>
            {!file && errors[type] &&
                (
                    <div className="text-red-600 text-[.78rem] flex items-center gap-2  bg-red-200 rounded-lg p-1 w-fit px-4 "><FaInfoCircle />{errors[type].message}</div>
                )
            }
            {error &&
                (
                    <div className="text-red-600 text-[.78rem] flex items-center gap-2  bg-red-200 rounded-lg p-1 w-fit px-4 "><FaInfoCircle />{error}</div>
                )
            }
        </>
    )
}