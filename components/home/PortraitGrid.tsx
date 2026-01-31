import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase, type Dancer } from "@/lib/supabase";

export default function PortraitGrid() {
    const [dancers, setDancers] = useState<Dancer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDancers() {
            const { data, error } = await supabase
                .from('dancers')
                .select('*')
                .order('is_verified', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(30);

            if (error) {
                console.error('Error fetching dancers:', error);
            } else {
                setDancers(data || []);
            }
            setLoading(false);
        }

        fetchDancers();
    }, []);

    if (loading) {
        return (
            <div className="px-6 pb-10">
                <h2 className="text-lg font-bold mb-4">Discover Dancers</h2>
                <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-[3/4] bg-neutral-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="px-6 pb-10">
            <h2 className="text-lg font-bold mb-4">Discover Dancers</h2>
            <div className="grid grid-cols-2 gap-4">
                {dancers.map((dancer) => (
                    <Link
                        key={dancer.id}
                        href={`/profile/${dancer.id}`}
                        className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-900"
                    >
                        {/* Image Rendering */}
                        {dancer.profile_img ? (
                            <Image
                                src={dancer.profile_img}
                                alt={dancer.stage_name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 768px) 50vw, 33vw"
                            />
                        ) : (
                            // Fallback Placeholder
                            <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
                                <span className="text-6xl opacity-20 font-bold uppercase">{dancer.stage_name[0]}</span>
                            </div>
                        )}

                        {/* Gradient Overlay for Text Readability */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />

                        {/* Text Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                            <h3 className="text-white font-bold text-base mb-1 group-hover:text-primary transition-colors">
                                {dancer.stage_name}
                            </h3>
                            <div className="flex flex-wrap gap-1 mb-2">
                                {dancer.genres?.slice(0, 2).map((genre) => (
                                    <span key={genre} className="text-[10px] text-white/60">
                                        {genre}
                                    </span>
                                ))}
                            </div>
                            {dancer.is_verified && (
                                <span className="text-[10px] text-primary">✓ Verified</span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
