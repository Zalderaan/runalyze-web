'use client'

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { boolean } from "zod";

export function Step2() {
    const [imgLoading, setImgLoading] = useState(true);
    console.log(imgLoading);

    return (
        <>
            {
                imgLoading && <Skeleton className="h-[200px] w-[200px]" />
            }
            <div className="p-2 bg-gray-800 rounded-md">
                <Image
                    src='/steps/step2.svg'
                    alt="running"
                    width={200}
                    height={200}
                    className="w-full"
                    onLoad={() => setImgLoading(false)}
                />
            </div>

            <div className="flex flex-col w-full space-y-2 my-1">
                <p>General Tips</p>

                <div className="flex flex-col space-y-1 text-sm">
                    <ul className="text-red-600">
                        <li>The camera must be stable</li>
                    </ul>

                    <ul className="text-green-600">
                        <li>Take the video in <strong>landscape</strong></li>
                        <li>Run at your usual jogging pace</li>
                    </ul>
                </div>
            </div>
        </>
    )
}