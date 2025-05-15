// export default function Layout({
//     children,
// }: {
//     children: React.ReactNode;
// }) {
//     return (
//         <div className="flex flex-col gap-4">
//             <div className="flex flex-col gap-4">{children}</div>
//         </div>
//     );
// }
'use client';

export default function DashboardLayout({children}: {children: React.ReactNode}) {
    return (
        <div className="flex flex-col gap-4 h-screen">
            <div className="flex flex-col gap-4 flex-1 bg-blue-200">
                {children}
            </div>
        </div>
    );
}