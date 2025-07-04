interface AnalysisDetailsProps {
    id: string
}

export default async function AnalysisDetails({params}: {
    params: Promise<{aid: string}>;
}) {
    const analysisId = (await params).aid
    return (
        <>
            Analysis Details ID: {analysisId}
        </>
    );
}