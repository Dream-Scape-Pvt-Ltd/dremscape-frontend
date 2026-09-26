/**
 * Decorative ridgelines behind the search areas: three ranges fading into the
 * distance, a snowline and a trail climbing toward the highest summit. Purely
 * visual, so it is hidden from assistive technology.
 */
export default function SearchBackdrop() {
  return <div className="search-backdrop" aria-hidden="true">
    <svg viewBox="0 0 1440 360" preserveAspectRatio="xMidYMax slice" focusable="false">
      <defs>
        <linearGradient id="sb-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dfeae6" stopOpacity="0"/><stop offset="1" stopColor="#dfeae6"/></linearGradient>
        <linearGradient id="sb-near" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#153d2f" stopOpacity=".22"/><stop offset="1" stopColor="#153d2f" stopOpacity=".06"/></linearGradient>
      </defs>
      <rect width="1440" height="360" fill="url(#sb-sky)"/>
      {/* Far range */}
      <path d="M0 214 L96 176 L168 196 L262 132 L330 168 L410 110 L468 142 L560 86 L640 150 L720 118 L806 160 L884 98 L948 126 L1040 64 L1112 124 L1188 96 L1270 150 L1350 120 L1440 158 V360 H0Z" fill="#153d2f" fillOpacity=".07"/>
      {/* Snow caps on the far range */}
      <path d="M1040 64 L1012 84 L1026 82 L1036 92 L1048 80 L1062 88 L1070 80Z M560 86 L538 102 L552 100 L562 108 L574 98 L588 102Z" fill="#fff" fillOpacity=".85"/>
      {/* Middle range */}
      <path d="M0 262 L120 218 L214 244 L318 194 L408 230 L520 184 L610 226 L700 200 L812 240 L930 180 L1030 222 L1128 188 L1240 236 L1340 206 L1440 232 V360 H0Z" fill="#153d2f" fillOpacity=".09"/>
      {/* Snowline */}
      <path d="M0 150 H1440" stroke="#5d98aa" strokeOpacity=".35" strokeDasharray="3 7"/>
      {/* Near range */}
      <path d="M0 312 L140 268 L250 292 L372 250 L486 286 L610 246 L736 290 L860 258 L990 296 L1110 262 L1236 300 L1350 272 L1440 290 V360 H0Z" fill="url(#sb-near)"/>
      {/* A trail toward the summit */}
      <path d="M702 360 C742 322 690 300 760 282 C830 262 790 238 866 220 C932 204 900 170 972 150 C1004 140 1018 108 1040 66" fill="none" stroke="#b8964f" strokeOpacity=".55" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round"/>
      <circle cx="1040" cy="64" r="4.5" fill="#b8964f" fillOpacity=".8"/>
    </svg>
  </div>;
}
