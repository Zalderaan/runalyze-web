import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

export interface AreaScoreDetails {
    area: string;
    score: number;
    analysis: string;
    perf_level: string;
}

const getScoreColors = (score: number | undefined) => {
    if (!score && score !== 0) return { text: 'text-gray-600', bg: 'bg-gray-100 text-gray-700' };
    if (score >= 80) return { text: 'text-green-600', bg: 'bg-green-100 text-green-700' };
    if (score >= 60) return { text: 'text-yellow-600', bg: 'bg-yellow-100 text-yellow-700' };
    return { text: 'text-red-600', bg: 'bg-red-100 text-red-700' };
};

export function AreaScore({ area, score, analysis, perf_level }: AreaScoreDetails) {
    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex-1 text-left">
                            <h4 className="font-medium text-gray-900">{area}</h4>
                            <p className="text-xs text-gray-500 line-clamp-2">{analysis}</p>
                        </div>
                        <div className="ml-4 text-right">
                            <span className={`text-2xl font-bold ${getScoreColors(score).text}`}>
                                {score?.toFixed(0) || 0}%
                            </span>
                            <div className={`text-xs px-2 py-1 rounded-full mt-1 ${getScoreColors(score).bg}`}>
                                {perf_level || 'Unknown'}
                            </div>
                        </div>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            <span className='text-2xl font-semibold'>{area}</span>
                            <p className='text-sm text-gray-500'>{analysis}</p>
                        </DialogTitle>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    );
}