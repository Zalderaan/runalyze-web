import {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardAction,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";


export interface DrillPreview {
    id: string | number,
    title: string,
    area: string,
    performance_level: string,
}

export function DrillsCard({ title, area, performance_level, id }: DrillPreview) {
    return (
        <Link href={`/dashboard/drills/${id}`} className="block w-full h-full">
            <Card>
                <CardContent>
                    <span>
                        insert video here
                    </span>
                </CardContent>
                <CardFooter className="flex flex-col items-start space-y-2">
                    <span className="font-medium">{title === '' ? 'No name' : `${title}`}</span>
                    <div className="flex flex-row items-center space-x-2">
                        <Badge>{area}</Badge>
                        <Badge variant={"secondary"}>{performance_level}</Badge>
                    </div>
                </CardFooter>
            </Card >
        </Link>
    )
}