import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Logo({ href, name }: { href: string; name: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 font-semibold tracking-tight">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 text-white shadow-card">
        <GraduationCap className="size-5" aria-hidden />
      </span>
      <span className="text-lg">{name}</span>
    </Link>
  );
}
