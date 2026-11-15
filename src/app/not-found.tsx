import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div className="max-w-md text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 text-4xl">This page is not on Upskyla.</h1>
        <Link href="/" className="mt-6 inline-block text-electric">Back to the homepage</Link>
      </div>
    </main>
  );
}
