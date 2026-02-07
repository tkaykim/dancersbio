import { cn } from "@/lib/utils";

interface MobileContainerProps {
    children: React.ReactNode;
    className?: string;
}

export default function MobileContainer({ children, className }: MobileContainerProps) {
    return (
        <div className="flex min-h-screen justify-center bg-black">
            <div
                className={cn(
                    "w-full max-w-[480px] min-h-screen bg-background shadow-xl relative flex flex-col overflow-hidden",
                    className
                )}
            >
                {children}
            </div>
        </div>
    );
}
