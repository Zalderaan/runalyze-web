'use client'

import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import Image from "next/image";

export function Step1() {
    const [imgLoading, setImgLoading] = useState(true);

    return (
        <>
            {imgLoading && <Skeleton className="h-[200px] w-[200px]" />}

            <div className="p-2 bg-gray-800 rounded-md">
                <Image
                    src={'/steps/step1.svg'}
                    alt="Step 1"
                    width={200}
                    height={200}
                    className="w-full"
                    onLoad={() => setImgLoading(false)}
                />
            </div>

            <div className="flex flex-col space-y-2 my-1">
                <p>General Tips</p>

                <div className="flex flex-col space-y-1 text-sm">
                    <ul className="text-red-600">
                        <li>The camera must be stable</li>
                        <li>The runner must be visible from head to toe</li>
                    </ul>

                    <ul className="text-green-600">
                        <li>Seek assistance from fellow runners/nearby people to hold the camera, or;</li>
                        <li>Use a tripod to keep camera stable</li>
                    </ul>
                </div>
            </div>
        </>
    )
}