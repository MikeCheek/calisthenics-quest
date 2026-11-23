"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Circle, LayerGroup, Map as LMap, Marker } from "leaflet";
import type { Park } from "@/lib/parks";

type LeafletNS = typeof import("leaflet");
export interface LatLon {
  lat: number;
  lon: number;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// The parks map, full screen: OpenStreetMap tiles restyled dark to match the
// app, the search range as a circle, and smart pins — the number of kit
// items known, coloured by where the park comes from, named when zoomed in,
// and grouped into one bubble when they'd overlap. Loaded only on the parks
// page (next/dynamic), so Leaflet never weighs on other screens.
export default function ParksMap({
  initial,
  flyTo,
  range,
  me,
  parks,
  selected,
  onSelect,
  onMove,
  picking,
  label,
  labels,
}: {
  initial: LatLon & { zoom: number };
  flyTo?: (LatLon & { zoom?: number; n: number }) | null; // n changes to fly again
  range?: (LatLon & { radiusM: number }) | null;
  me?: LatLon | null;
  parks: Park[];
  selected?: string | null;
  onSelect: (id: string) => void;
  onMove?: (center: LatLon, zoom: number) => void;
  picking?: boolean; // tapping the map moves its centre there (the pin is drawn by the page)
  label: string;
  labels: { cluster: (n: number) => string; park: (p: Park) => string; you: string };
}) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const L = useRef<LeafletNS | null>(null);
  const pins = useRef<LayerGroup | null>(null);
  const circle = useRef<Circle | null>(null);
  const meDot = useRef<Marker | null>(null);
  const latest = useRef({ parks, selected, onSelect, onMove, picking, labels, flyTo, range, me });
  latest.current = { parks, selected, onSelect, onMove, picking, labels, flyTo, range, me };

  // the search range, as a dashed circle
  function drawRange() {
    const l = L.current, m = map.current, r = latest.current.range;
    if (!l || !m) return;
    circle.current?.remove();
    circle.current = r
      ? l.circle([r.lat, r.lon], { radius: r.radiusM, color: "#f97316", weight: 1.5, opacity: 0.85, fillColor: "#f97316", fillOpacity: 0.07, dashArray: "6 6", interactive: false }).addTo(m)
      : null;
  }

  // where you are
  function drawMe() {
    const l = L.current, m = map.current, p = latest.current.me;
    if (!l || !m) return;
    meDot.current?.remove();
    meDot.current = p
      ? l.marker([p.lat, p.lon], { icon: l.divIcon({ className: "", html: '<div class="me-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), keyboard: false, interactive: false }).addTo(m)
      : null;
  }

  // pins, grouped when they'd overlap at this zoom
  function draw() {
    const l = L.current, m = map.current;
    if (!l || !m || !pins.current) return;
    pins.current.clearLayers();
    const { parks, selected, labels } = latest.current;
    const zoom = m.getZoom();
    const clusters: { pt: { x: number; y: number }; items: Park[] }[] = [];
    for (const p of parks) {
      const pt = m.project([p.lat, p.lon], zoom);
      const near = p.id === selected ? null : clusters.find((c) => !c.items.some((i) => i.id === selected) && Math.hypot(c.pt.x - pt.x, c.pt.y - pt.y) < 44);
      if (near) near.items.push(p);
      else clusters.push({ pt, items: [p] });
    }
    for (const c of clusters) {
      if (c.items.length > 1 && zoom < 17) {
        const bounds = l.latLngBounds(c.items.map((p) => [p.lat, p.lon] as [number, number]));
        l.marker(bounds.getCenter(), {
          icon: l.divIcon({ className: "", html: `<div class="park-cluster">${c.items.length}</div>`, iconSize: [40, 40], iconAnchor: [20, 20] }),
          title: labels.cluster(c.items.length),
          keyboard: true,
        })
          .on("click", () => m.fitBounds(bounds.pad(0.4), { maxZoom: 17 }))
          .addTo(pins.current);
        continue;
      }
      for (const p of c.items) {
        const kind = p.source === "user" ? "user" : p.edit ? "edited" : "osm";
        const on = p.id === selected;
        const count = p.mapKit.length;
        const name = p.name ? `<span class="park-pin-label">${esc(p.name)}</span>` : "";
        l.marker([p.lat, p.lon], {
          icon: l.divIcon({
            className: "",
            html: `<div class="park-pin park-pin--${kind}${on ? " is-selected" : ""}"><span>${count || "•"}</span></div>${name}`,
            iconSize: [34, 34],
            iconAnchor: [17, 34],
          }),
          title: labels.park(p),
          keyboard: true,
          zIndexOffset: on ? 1000 : 0,
        })
          .on("click", () => latest.current.onSelect(p.id))
          .addTo(pins.current);
      }
    }
    box.current?.classList.toggle("parks-map--near", zoom >= 15);
  }

  useEffect(() => {
    let gone = false;
    import("leaflet")
      .then((l) => {
        if (gone || !box.current || map.current) return;
        L.current = l;
        // a fly-to asked for while Leaflet was still loading isn't lost
        const start = latest.current.flyTo ?? initial;
        const m = l.map(box.current, { zoomControl: false, attributionControl: true }).setView([start.lat, start.lon], start.zoom ?? initial.zoom);
        map.current = m;
        l.control.zoom({ position: "topright" }).addTo(m);
        l.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          className: "parks-tiles",
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(m);
        pins.current = l.layerGroup().addTo(m);
        m.on("zoomend", draw);
        m.on("moveend", () => {
          const c = m.getCenter();
          latest.current.onMove?.({ lat: c.lat, lon: c.lng }, m.getZoom());
        });
        m.on("click", (e) => {
          if (latest.current.picking) m.panTo(e.latlng);
        });
        // anything asked for while Leaflet was loading
        draw();
        drawRange();
        drawMe();
        const c = m.getCenter();
        latest.current.onMove?.({ lat: c.lat, lon: c.lng }, m.getZoom());
      })
      .catch(() => {}); // offline: the list still works
    return () => {
      gone = true;
      map.current?.remove();
      map.current = null;
      pins.current = null;
      circle.current = null;
      meDot.current = null;
    };
    // the map is made once; everything else follows below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(draw, [parks, selected]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(drawRange, [range?.lat, range?.lon, range?.radiusM]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(drawMe, [me?.lat, me?.lon]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const m = map.current;
    if (!m || !flyTo) return;
    m.flyTo([flyTo.lat, flyTo.lon], flyTo.zoom ?? m.getZoom(), { duration: 0.6 });
  }, [flyTo?.n]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    box.current?.classList.toggle("parks-map--picking", !!picking);
  }, [picking]);

  return <div ref={box} role="region" aria-label={label} className="parks-map absolute inset-0 z-0 bg-zinc-900" />;
}
