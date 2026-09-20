const landmark = 'Avalon House, Lekhnath Marg, Thamel, Kathmandu, Nepal';
const query = encodeURIComponent(landmark);

export default function ContactMap() {
  return (
    <section className="contact-location-section container" aria-labelledby="location-title">
      <div className="contact-map-card">
        <div className="contact-map-copy">
          <span className="location-symbol" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          </span>
          <p className="eyebrow">BEFORE THE MOUNTAINS, A HELLO</p>
          <h2 id="location-title">Find us<br /><em>in Thamel.</em></h2>
          <p>Below Hotel Avalon<br />Thamel, Kathmandu, Nepal</p>
          <p className="location-note">The map marks the Hotel Avalon landmark. Get in touch for help finding the entrance.</p>
          <a className="button green" href={`https://www.google.com/maps/search/?api=1&query=${query}`} target="_blank" rel="noopener noreferrer">
            Open in Google Maps <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="contact-map-frame">
          <iframe
            title="Hotel Avalon landmark in Thamel, Kathmandu"
            src={`https://maps.google.com/maps?q=${query}&z=16&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <div className="map-caption">
            <span className="map-dot" />THAMEL, KATHMANDU <span>YOUR JOURNEY STARTS HERE</span>
          </div>
        </div>
      </div>
    </section>
  );
}
