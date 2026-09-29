import Image from "next/image";
import type { GalleryPhoto } from "../types";

export const MOCK_GALLERY: GalleryPhoto[] = [
  {
    id: "photo-1",
    title: "Ama Dablam Sunrise from Dingboche",
    location: "Everest Khumbu Region",
    elevation: "4,410m",
    imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    photographer: "Pemba Sherpa",
  },
  {
    id: "photo-2",
    title: "Gokyo Ri Emerald Glacial Lake",
    location: "Sagarmatha National Park",
    elevation: "4,790m",
    imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80",
    photographer: "Marcus Davis",
  },
  {
    id: "photo-3",
    title: "Thorong La High Pass Prayer Flags",
    location: "Annapurna Circuit",
    elevation: "5,416m",
    imageUrl: "https://images.unsplash.com/photo-1585409677983-0f6c41ca0c33?auto=format&fit=crop&w=800&q=80",
    photographer: "Helena Lindqvist",
  },
  {
    id: "photo-4",
    title: "Larkya Glacier Ridge",
    location: "Manaslu Sanctuary",
    elevation: "5,106m",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    photographer: "Dawa Nuru",
  },
  {
    id: "photo-5",
    title: "Ancient Caves of Upper Mustang",
    location: "Lo Manthang",
    elevation: "3,840m",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    photographer: "Sarah Connor",
  },
];

export function PhotoGrid({ photos = MOCK_GALLERY }: { photos?: GalleryPhoto[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="group relative aspect-4/3 overflow-hidden rounded-2xl bg-stone-900 shadow-md"
        >
          <Image
            src={photo.imageUrl}
            alt={photo.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              {photo.location} ({photo.elevation})
            </span>
            <p className="text-sm font-bold mt-0.5">{photo.title}</p>
            <p className="text-[10px] text-stone-300">Captured by {photo.photographer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
