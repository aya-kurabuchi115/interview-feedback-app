import Link from "next/link";
import Image from "next/image";
import type { PersonalityInfo } from "@/lib/personality/types";

interface PersonalityCardProps {
  personality: PersonalityInfo;
}

export function PersonalityCard({ personality }: PersonalityCardProps) {
  return (
    <Link
      href={`/personality/${personality.type.toLowerCase()}`}
      className="group relative flex flex-col items-center rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
      style={{ borderColor: `${personality.color}30` }}
    >
      {/* キャラクター画像 */}
      <div
        className="mb-4 flex h-24 w-24 items-center justify-center rounded-full"
        style={{ backgroundColor: personality.colorLight }}
      >
        <Image
          src={`/images/personality/${personality.type.toLowerCase()}.svg`}
          alt={`${personality.name}のキャラクター`}
          width={80}
          height={80}
          className="transition-transform group-hover:scale-110"
        />
      </div>

      {/* タイプ名 */}
      <span
        className="mb-1 rounded-full px-3 py-0.5 text-xs font-bold text-white"
        style={{ backgroundColor: personality.color }}
      >
        {personality.type}
      </span>
      <h3 className="mt-1 text-base font-bold text-foreground">
        {personality.name}
      </h3>
      <p className="text-xs text-muted-foreground">{personality.nameEn}</p>

      {/* 動物 */}
      <p className="mt-2 text-sm">
        {personality.animalEmoji} {personality.animal}
      </p>

      {/* タグライン */}
      <p className="mt-2 text-center text-xs text-muted-foreground leading-relaxed">
        {personality.tagline}
      </p>
    </Link>
  );
}
