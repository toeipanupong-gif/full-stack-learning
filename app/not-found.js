import Link from "next/link";

export const metadata = {
  title: "ไม่พบหน้านี้",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-[70ch] px-5 py-16">
      <h1 className="font-reading text-3xl font-semibold text-ink">ไม่พบหน้านี้</h1>
      <p className="mt-4 font-reading text-lg leading-relaxed text-ink-soft">หน้าที่ขอไม่มีในบทเรียนชุดนี้</p>
      <Link href="/" className="mt-8 inline-block font-ui text-ink underline">
        กลับหน้าแรก
      </Link>
    </main>
  );
}
