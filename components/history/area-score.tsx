import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

import Image from 'next/image';
export interface AreaScoreDetails {
    area: string;
    score: number;
    analysis: string;
    perf_level: string;
    classification: string;
}

const getScoreColors = (score: number | undefined) => {
    if (!score && score !== 0) return { text: 'text-gray-600', bg: 'bg-gray-100 text-gray-700' };
    if (score >= 80) return { text: 'text-green-600', bg: 'bg-green-100 text-green-700' };
    if (score >= 60) return { text: 'text-yellow-600', bg: 'bg-yellow-100 text-yellow-700' };
    return { text: 'text-red-600', bg: 'bg-red-100 text-red-700' };
};

// function to dynamically get the pic path corresponding to user's perfromance specifics
const getClassificationPic = (area: string, classification: string | undefined) => {
    if (!classification) return null;

    // Map area to folder and classification to filename
    const areaMap: Record<string, string> = {
        'Head Position': 'head',
        'Arm Flexion': 'arms',
        'Back Position': 'back',
        'Foot Strike': 'foot_strike',
        'Left Knee': 'left_knee',
        'Right Knee': 'right_knee',
    }

    const fileMap: Record<string, Record<string, string>> = {
        head: {
            'well-positioned': 'head-ideal.svg',
            'tilted slightly downward': 'head-slight-down.svg',
            'tilted slightly upward': 'head-slight-up.svg',
            'tilted significantly downward': 'head-too-down.svg',
            'tilted significantly upward': 'head-too-up.svg',
        },

        back: {
            "well-positioned with good forward lean": "torso-ideal.svg",
            "leaning significantly backward": "torso-too-up.svg",
            "leaning too far forward": "torso-too-forward.svg",
            "leaning forward more than optimal": "torso-slight-forward.svg",
            "leaning backward or too upright": "torso-slightly-up.svg"
        },

        arms: {
            "well-positioned": "arm-ideal.svg",
            "too extended": "arm-over-extension.svg",
            "too bent": "arm-over-flexion.svg",
            "slightly too extended": "arm-slight-extension.svg",
            "slightly too bent": "arm-slight-flexion.svg",
        },

        right_knee: {
            "bent too much on landing": "overbent-right-knee.svg",
            "bent slightly more than optimal on landing": "slight-bend-right-knee.svg",
            "showing good bend upon foot landing": "ideal-right-knee.svg",
            "slightly too straight upon landing": "slight-straight-right-knee.svg",
            "too straight upon landing": "straight-right-knee.svg",
        },

        left_knee: {
            "showing excessive heel kick": "overflexed-left-knee.svg",
            "showing excellent heel kick": "ideal-left-knee.svg",
            "slightly low heel kick": "slight-low-left-knee.svg",
            "heel kick angle tighter than optimal": "slight-flex-left-knee.svg",
            "showing very low heel kick": "too-low-left-knee.svg"
        },

        foot_strike: {
            "excessive forefoot strike": "understride.svg",
            "slight forefoot strike": "slight-understride.svg",
            "good midfoot landing": "ideal-foot-landing.svg",
            "slight heel strike": "slight-overstride.svg",
            "landing on your heel": "overstride.svg"
        }
    };

    const folder = areaMap[area]
    console.log('folder: ', folder);
    const file = fileMap[folder][classification]

    return `/areas/${folder}/${file}`;
}

// function to show get the path of the ideal pic
const getIdealPic = (area: string) => {
    const areaMap: Record<string, string> = {
        'Head Position': 'head',
        'Arm Flexion': 'arms',
        'Back Position': 'back',
        'Foot Strike': 'foot_strike',
        'Left Knee': 'left_knee',
        'Right Knee': 'right_knee',
    };

    const idealFiles: Record<string, string> = {
        head: 'head-ideal.svg',
        arms: 'arm-ideal.svg',
        back: 'torso-ideal.svg',
        foot_strike: 'ideal-foot-landing.svg',
        left_knee: 'ideal-left-knee.svg',
        right_knee: 'ideal-right-knee.svg',
    };

    const folder = areaMap[area];
    if (!folder || !idealFiles[folder]) return null;

    return `/areas/${folder}/${idealFiles[folder]}`;
}

// function to determine whether the user has the ideal position for the area
const isIdealClassification = (area: string, classification: string | undefined) => {
    if (!classification) return false;

    const idealMap: Record<string, string> = {
        'Head Position': 'well-positioned',
        'Arm Flexion': 'well-positioned',
        'Back Position': 'well-positioned with good forward lean',
        'Foot Strike': 'good midfoot landing',
        'Left Knee': 'showing excellent heel kick',
        'Right Knee': 'showing good bend upon foot landing',
    };

    return classification === idealMap[area];
}

export function AreaScore({ area, score, analysis, perf_level, classification }: AreaScoreDetails) {
    const imgSrc = getClassificationPic(area, classification);
    const idealImgSrc = getIdealPic(area);

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
                    <DialogHeader>              {/* Show props inside the dialog for debugging */}
                        <div className="mb-4 p-2 bg-gray-50 rounded text-xs text-gray-700">
                            <div><strong>area:</strong> {area}</div>
                            <div><strong>score:</strong> {score}</div>
                            <div><strong>analysis:</strong> {analysis}</div>
                            <div><strong>perf_level:</strong> {perf_level}</div>
                            <div><strong>classification:</strong> {classification}</div>
                        </div>

                        <div className='flex flex-row bg-green-950 justify-around p-4 rounded'>
                            {imgSrc && (
                                <div className="flex flex-col items-center">
                                    <Image src={imgSrc} alt={`${classification}`} height={100} width={100} />
                                    <span className="text-xs mt-2 text-green-600">{!isIdealClassification
                                    (area, classification) ? 'Ideal Position' : 'Your position'}</span>
                                </div>
                            )}

                            {/* only show ideal picture if not already ideal */}
                            {!isIdealClassification(area, classification) && idealImgSrc && (
                                <div className="flex flex-col items-center">
                                    <Image src={idealImgSrc} alt="Ideal Position" height={100} width={100} />
                                    <span className="text-xs mt-2 text-green-600">Ideal Position</span>
                                </div>
                            )}
                        </div>
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