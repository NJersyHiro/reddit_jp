import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="w-8 h-8 bg-primary-red rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-lg">い</span>
      </div>
      <span className="text-xl font-bold text-gray-900 dark:text-white">Itaita</span>
    </Link>
  );
}