'use client';

import { useLanguage } from '@/context/LanguageContext';

const formatTime = (timeString: string) => {
  if (!timeString) return '';
  // Try to parse H:M format
  const [hours, minutes] = timeString.split(':');
  if (hours && minutes) {
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  return timeString;
};

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

          {/* Operating Hours */}
          {(store.opening_time || store.closing_time) && (
            <div>
              <h3 className="font-semibold text-foreground mb-1">{t('hoursLabel') || 'Operating Hours'}</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>
                  {store.opening_time ? formatTime(store.opening_time) : 'Open'} - {store.closing_time ? formatTime(store.closing_time) : 'Close'}
                </span>
              </div>
            </div>
          )}

          {/* Service Options */}
          {(store.delivery_available || store.takeaway_available) && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">{t('servicesLabel') || 'Services'}</h3>
              <div className="flex flex-wrap gap-2">
                {store.delivery_available && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    {t('deliveryAvailable') || 'Delivery Available'}
                  </span>
                )}
                {store.takeaway_available && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    {t('takeawayAvailable') || 'Takeaway / Booking'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Temporary Closure Info (if not hidden) */}
          {store.is_temporarily_closed && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {t('temporarilyClosed') || 'Temporarily Closed'}
              </h3>
              <div className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
                {store.closure_reason && <p><strong>Reason:</strong> {store.closure_reason}</p>}
                {store.closure_start_date && (
                  <p><strong>From:</strong> {new Date(store.closure_start_date).toLocaleDateString()}</p>
                )}
                {store.closure_end_date && (
                  <p><strong>Until:</strong> {new Date(store.closure_end_date).toLocaleDateString()}</p>
                )}
              </div>
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

