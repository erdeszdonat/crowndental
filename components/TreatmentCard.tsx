import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { sanityImageUrl } from '@/lib/sanityImage';

type Props = {
  href: string;
  title: string;
  description: string;
  imageUrl?: string;
  price?: string;
  linkLabel: string;
};

/** The whole card is one visible, keyboard-accessible link on every device. */
export default function TreatmentCard({ href, title, description, imageUrl, price, linkLabel }: Props) {
  return (
    <Link href={href} className="crown-treatment-card" data-cta-location="treatment_card">
      <div className="crown-treatment-image">
        {imageUrl && <img src={sanityImageUrl(imageUrl, 720)} alt="" loading="lazy" width={720} height={480} />}
        <span className="crown-card-arrow"><ArrowUpRight size={20} aria-hidden="true" /></span>
      </div>
      <div className="crown-treatment-body">
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="crown-treatment-bottom">
          {price && <strong>{price}</strong>}
          <span>{linkLabel}<ArrowUpRight size={16} aria-hidden="true" /></span>
        </div>
      </div>
    </Link>
  );
}
