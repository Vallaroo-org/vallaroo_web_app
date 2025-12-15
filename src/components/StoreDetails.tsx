'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function StoreDetails({ store }: { store: any }) {
  const { t } = useLanguage();

  const openMap = () => {
    let query;
    if (store.latitude && store.longitude) {
      query = `${store.latitude},${store.longitude}`;
    } else {
      const address = [
        store.address_line1,
        store.address_line2,
        store.city,
        store.state,
        store.postal_code,
        store.country,
      ]
        .filter(Boolean)
        .join(', ');
      if (address) {
        query = address;
      }
    }

    if (query) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-4 text-foreground">{t('description') || 'Store Details'}</h2>
        <div className="space-y-5">
          {store.whatsapp_number && (
            <div>
              <h3 className="font-semibold text-foreground">WhatsApp</h3>
              <p className="text-muted-foreground">{store.whatsapp_number}</p>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-foreground">{t('addressLabel') || 'Address'}</h3>
            <address className="text-muted-foreground not-italic leading-relaxed">
              {store.address_line1 && <div>{store.address_line1}</div>}
              {store.address_line2 && <div>{store.address_line2}</div>}
              {(store.city || store.state || store.postal_code) && (
                <div>
                  {store.city && <span>{store.city}, </span>}
                  {store.state && <span>{store.state} </span>}
                  {store.postal_code && <span>{store.postal_code}</span>}
                </div>
              )}
              {store.country && <div>{store.country}</div>}
            </address>
          </div>
          {(store.latitude && store.longitude) && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">{t('openMaps') ? 'Location' : 'Location'}</h3>
              <button
                onClick={openMap}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t('openMaps') || 'Open in Maps'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

