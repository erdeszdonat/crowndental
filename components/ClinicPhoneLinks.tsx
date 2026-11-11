import { Phone } from 'lucide-react';

const contacts = [
  { id: 'primas-sziget', name: 'Prímás Sziget', phone: '+36706042500', display: '+36 70 604 2500' },
  { id: 'belvaros', name: 'Petőfi utca', phone: '+36305892468', display: '+36 30 589 2468' },
] as const;

/** Every general call CTA offers both clinics, with Prímás Sziget first. */
export default function ClinicPhoneLinks({ tone = 'light', compact = false, className = '', clinic }: {
  clinic?: 'primas-sziget';
  tone?: 'light' | 'dark';
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={`crown-clinic-phones crown-clinic-phones--${tone}${compact ? ' crown-clinic-phones--compact' : ''} ${className}`} data-clinic-phones={clinic ?? 'both'}>
      {contacts.filter(contact => !clinic || contact.id === clinic).map(contact => (
        <a key={contact.id} href={`tel:${contact.phone}`} data-clinic={contact.id}>
          <Phone size={16} aria-hidden="true" />
          <span className="crown-clinic-phones__details"><span className="crown-clinic-phones__name">{contact.name}</span><span className="crown-clinic-phones__number">{contact.display}</span></span>
        </a>
      ))}
    </span>
  );
}
