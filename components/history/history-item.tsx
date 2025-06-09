'use client'

import Image from 'next/image'

// * UI IMPORTS
import {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardAction,
    CardDescription,
    CardContent,
} from "@/components/ui/card";

interface historyIemProps {
    thumbnail: string, //* or file?
    title: string,
    date: Date,
    form_score: number
}

export function HistoryItem({ ...props }: historyIemProps) {
    const { thumbnail, title, date, form_score } = props;
    return (
        <Card className="flex flex-row w-full p-0">
            <div className='bg-red-200'>
                <Image
                    src={thumbnail}
                    alt='run thumbnail'
                    width={50}
                    height={50}
                    className=''
                />
            </div>
            <div className='flex flex-row items-center justify-center'>
                {form_score}
                <CardContent>
                    {title} - {date.toLocaleString()}
                </CardContent>
            </div>
        </Card>
    );
}