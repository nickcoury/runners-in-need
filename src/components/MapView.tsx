import { useEffect, useRef } from "react";

interface MapNeed {
  id: string;
  title: string;
  lat: number;
  lng: number;
}

interface MapViewProps {
  needs: MapNeed[];
}

export default function MapView({ needs }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    (async () => {
      const L = await import("leaflet");

      // Inject leaflet CSS if not already present
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (cancelled || !containerRef.current) return;

      // Default center: continental US
      const map = L.default.map(containerRef.current, {
        scrollWheelZoom: false,
      }).setView([39.8, -98.5], 4);

      mapRef.current = map;

      L.default
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
        })
        .addTo(map);

      // Green marker icon matching the design system
      const greenIcon = L.default.divIcon({
        className: "",
        html: `<div style="
          width: 12px;
          height: 12px;
          background: #2D4A2D;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
        popupAnchor: [0, -8],
      });

      if (needs.length > 0) {
        const bounds = L.default.latLngBounds([]);

        for (const need of needs) {
          const marker = L.default
            .marker([need.lat, need.lng], { icon: greenIcon })
            .addTo(map);

          // Build popup with DOM methods to avoid XSS
          const popupDiv = document.createElement("div");
          popupDiv.style.fontSize = "13px";
          const strong = document.createElement("strong");
          strong.textContent = need.title;
          const br = document.createElement("br");
          const link = document.createElement("a");
          link.href = `/needs/${encodeURIComponent(need.id)}`;
          link.style.color = "#2D4A2D";
          link.innerHTML = "View details &rarr;";
          popupDiv.append(strong, br, link);
          marker.bindPopup(popupDiv);

          bounds.extend([need.lat, need.lng]);
        }

        map.fitBounds(bounds, { padding: [20, 20], maxZoom: 6 });
      }

      // Fix tile rendering after container becomes visible
      setTimeout(() => map.invalidateSize(), 100);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [needs]);

  return (
    <div
      ref={containerRef}
      className="rounded-lg h-56 w-full"
      style={{ background: "#e5e7eb" }}
    />
  );
}
