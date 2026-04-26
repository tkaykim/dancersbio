import { cn } from "@/lib/utils";

interface MobileContainerProps {
    children: React.ReactNode;
    className?: string;
}

export default function MobileContainer({ children, className }: MobileContainerProps) {
    return (
        <div
            className="flex min-h-screen justify-center"
            style={{ background: '#000' }}
        >
            <div
                className={cn(
                    "w-full max-w-[480px] min-h-screen relative flex flex-col overflow-hidden",
                    className
                )}
                style={{
                    background: 'var(--cue-bg)',
                    color: 'var(--cue-ink)',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
                }}
            >
                {children}
            </div>
        </div>
    );
}
