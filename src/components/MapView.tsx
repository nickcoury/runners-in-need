import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapNeed {
  id: string;
  title: string;
  lat: number;
  lng: number;
}

interface MapViewProps {
  needs?: MapNeed[];
  fullscreen?: boolean;
}

export default function MapView({ needs: propNeeds, fullscreen }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchedNeeds, setFetchedNeeds] = useState<MapNeed[] | null>(null);

  // Fetch needs if not provided as props
  useEffect(() => {
    if (propNeeds) return;
    fetch("/api/needs")
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then((data: Array<{ id: string; title: string; lat?: number | null; lng?: number | null }>) => {
        setFetchedNeeds(
          data
            .filter((n) => n.lat != null && n.lng != null)
            .map((n) => ({ id: n.id, title: n.title, lat: n.lat!, lng: n.lng! }))
        );
      })
      .catch(() => setFetchedNeeds([]));
  }, [propNeeds]);

  const needs = propNeeds ?? fetchedNeeds ?? [];

  // Stabilize the dependency — only re-run when the actual data changes,
  // not when the parent passes a new array reference with the same contents.
  const needsKey = JSON.stringify(needs.map((n) => n.id).sort());

  useEffect(() => {
    if (!containerRef.current) return;

    // Default center: continental US
    const map = L.map(containerRef.current, {
      scrollWheelZoom: false,
    }).setView([39.8, -98.5], 4);

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    // Green marker icon matching the design system
    const greenIcon = L.divIcon({
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
      const bounds = L.latLngBounds([]);

      for (const need of needs) {
        const marker = L.marker([need.lat, need.lng], { icon: greenIcon }).addTo(
          map
        );

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

    setLoading(false);

    // Fix tile rendering after container becomes visible
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [needsKey]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        role="region"
        aria-label="Interactive map showing locations of gear needs. Use arrow keys to pan, plus and minus to zoom."
        className={fullscreen ? "w-full h-full" : "rounded-lg h-56 w-full"}
        style={{ background: "#e5e7eb" }}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-sm text-gray-500">Loading map...</div>
        </div>
      )}
    </div>
  );
}
