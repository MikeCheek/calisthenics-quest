"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LMap, LayerGroup } from "leaflet";
import type { Park } from "@/lib/parks";

// OpenStreetMap tiles with a dot per park; tap one to open it. Loaded only
// on the parks page (next/dynamic), so Leaflet never weighs on other screens.
export default function ParksMap({
  center,
  parks,
  selected,
  onSelect,
  label,
}: {
  center: { lat: number; lon: number };
  parks: Park[];
  selected?: string | null;
  onSelect: (id: string) => void;
  label: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);
  const select = useRef(onSelect);
  select.current = onSelect;
  const latest = useRef({ parks, selected });
  latest.current = { parks, selected };

  function draw(L: typeof import("leaflet")) {
    if (!layer.current) return;
    layer.current.clearLayers();
    const { parks, selected } = latest.current;
    for (const p of parks) {
      const on = p.id === selected;
      L.circleMarker([p.lat, p.lon], {
        radius: on ? 10 : 8,
        color: on ? "#fde68a" : "#7c2d12",
        fillColor: p.source === "user" ? "#a855f7" : "#f97316",
        fillOpacity: 0.9,
        weight: on ? 3 : 2,
      })
        .on("click", () => select.current(p.id))
        .addTo(layer.current);
    }
  }

  useEffect(() => {
    let gone = false;
    import("leaflet")
      .then((L) => {
        if (gone || !box.current || map.current) return;
        map.current = L.map(box.current).setView([center.lat, center.lon], 14);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map.current);
        L.circleMarker([center.lat, center.lon], { radius: 6, color: "#0c4a6e", fillColor: "#38bdf8", fillOpacity: 1, weight: 2 }).addTo(map.current);
        layer.current = L.layerGroup().addTo(map.current);
        draw(L);
      })
      .catch(() => {}); // offline: the list below still works
    return () => {
      gone = true;
      map.current?.remove();
      map.current = null;
      layer.current = null;
    };
    // the map is made once; markers and centre follow below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    import("leaflet").then(draw).catch(() => {});
    const p = parks.find((x) => x.id === selected);
    if (p && map.current) map.current.panTo([p.lat, p.lon]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parks, selected]);

  useEffect(() => {
    map.current?.setView([center.lat, center.lon], map.current.getZoom());
  }, [center.lat, center.lon]);

  return <div ref={box} role="region" aria-label={label} className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 relative z-0" />;
}
