import Link from "next/link";

const NAV_ITEMS = [
  { href: "/client/home", label: "Home" },
  { href: "/client/workout", label: "Workout" },
  { href: "/client/diet", label: "Diet" },
  { href: "/client/progress", label: "Progress" },
  { href: "/client/profile", label: "Profile" },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-md pb-20">
      {children}
      <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-md justify-around border-t border-neutral-200 bg-white py-2">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="px-2 py-1 text-xs text-neutral-600">
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
