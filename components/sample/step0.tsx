export function Step0() {
    return <>
        <div className="flex flex-col space-y-1">
            <video className='w-full' src={'/instructions/fd-run-1.mp4'} controls width={400}></video>
            <p className='text-sm'>Your uploaded videos should look like this.</p>
        </div>
    </>
}