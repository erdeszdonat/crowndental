'use client';

import Image from 'next/image';
import { sanityImageLoader } from '@/lib/sanityImage';

export default function VeneerImage({ src }: { src: string }) {
  return <Image src={src} loader={sanityImageLoader} alt="" width={1000} height={850}
    sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1248px) 45vw, 520px"
    loading="eager" fetchPriority="high" />;
}
