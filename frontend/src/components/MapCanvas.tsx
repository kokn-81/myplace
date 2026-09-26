import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
// @ts-ignore
import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Marker, MapRef } from "react-map-gl/mapbox";
import { Property } from "../types";
import { MarkerKind, MarkerTone, getMarkerKind } from "../mapLocation";

export type MapFocus = {
  longitude: number;
  latitude: number;
  zoom?: number;
  key?: number;
  source?: "user" | "search";
};

const MARKER_SIZE: Record<MarkerTone, string> = {
  muted: "h-4 w-4 border-[2px] md:h-[1.15rem] md:w-[1.15rem]",
  match: "h-5 w-5 border-[2px] md:h-6 md:w-6",
  active: "h-7 w-7 border-[3px] md:h-8 md:w-8",
  selected: "h-8 w-8 border-[3px] md:h-9 md:w-9",
};

const MARKER_COLOR: Record<MarkerKind, string> = {
  rent: "border-[var(--color-chocolate)] bg-[var(--color-teal-deep)] dark:border-[var(--color-ivory)]",
  buy: "border-[var(--color-chocolate)] bg-[var(--accent-hover)] dark:border-[var(--color-ivory)]",
  both: "border-[var(--color-chocolate)] bg-[var(--accent-main)] dark:border-[var(--color-ivory)]",
};

const MARKER_GLOW: Record<MarkerTone, string> = {
  muted: "shadow-[0_0_0_3px_rgba(248,243,231,0.5)]",
  match: "shadow-[0_0_0_3px_rgba(248,243,231,0.62)]",
  active: "shadow-[0_0_0_5px_rgba(47,111,115,0.22),0_10px_24px_rgba(58,33,25,0.32)]",
  selected: "shadow-[0_0_0_6px_rgba(196,147,98,0.38),0_12px_28px_rgba(58,33,25,0.4)]",
};

const PING_COLOR: Record<MarkerKind, string> = {
  rent: "bg-[var(--color-teal-deep)]/35",
  buy: "bg-[var(--accent-hover)]/35",
  both: "bg-[var(--accent-main)]/35",
};

const TONE_RANK: Record<MarkerTone, number> = { muted: 0, match: 1, active: 2, selected: 3 };

const getMarkerToneFast = (
  id: string,
  highlightedSet: Set<string>,
  matchedSet: Set<string> | null,
  selectedId?: string | null,
): MarkerTone => {
  if (selectedId && id === selectedId) return "selected";
  if (highlightedSet.has(id)) return "active";
  if (matchedSet !== null && matchedSet.has(id)) return "match";
  return "muted";
};

type MarkerPinProps = {
  longitude: number;
  latitude: number;
  tone: MarkerTone;
  kind: MarkerKind;
  count: number;
  label: string;
  onSelect: () => void;
};

const MarkerPin = memo(function MarkerPin({
  longitude,
  latitude,
  tone,
  kind,
  count,
  label,
  onSelect,
}: MarkerPinProps) {
  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      onClick={(event) => {
        event.originalEvent.stopPropagation();
        onSelect();
      }}
    >
      <div className="relative flex items-center justify-center">
        {tone === "active" || tone === "selected" ? (
          <span className={`absolute inset-0 rounded-full animate-ping ${PING_COLOR[kind]}`} />
        ) : null}
        <div
          className={`relative z-10 flex cursor-pointer items-center justify-center rounded-full transition-all duration-300 hover:scale-110 ${MARKER_SIZE[tone]} ${MARKER_COLOR[kind]} ${MARKER_GLOW[tone]}`}
          title={`${label}${count > 1 ? ` · ${count} unidades` : ""} · ${kind === "rent" ? "Alquiler" : kind === "buy" ? "Venta" : "Alquiler / Venta"}`}
        >
          {count > 1 ? (
            <span className="text-[9px] font-black text-[var(--color-ivory)]">{count}</span>
          ) : (
            <div className="h-1 w-1 rounded-full bg-[var(--color-ivory)] md:h-1.5 md:w-1.5" />
          )}
        </div>
      </div>
    </Marker>
  );
});

type MapCanvasProps = {
  mapboxToken: string;
  properties: Property[];
  isDarkMode: boolean;
  onSelectProperty: (property: Property) => void;
  focusLocation?: MapFocus | null;
  highlightedIds?: string[];
  matchedIds?: string[] | null;
  selectedId?: string | null;
};

function MapCanvas({
  mapboxToken,
  properties,
  isDarkMode,
  onSelectProperty,
  focusLocation,
  highlightedIds = [],
  matchedIds = null,
  selectedId = null,
}: MapCanvasProps) {
  const mapRef = useRef<MapRef | null>(null);

  // Viewport bounds for culling offscreen markers (with a generous 35% margin)
  const [viewportBounds, setViewportBounds] = useState<{
    west: number;
    east: number;
    south: number;
    north: number;
  } | null>(null);

  const updateViewportBounds = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    try {
      const b = map.getBounds();
      if (!b) return;
      const west = b.getWest();
      const east = b.getEast();
      const south = b.getSouth();
      const north = b.getNorth();
      const lngMargin = (east - west) * 0.35;
      const latMargin = (north - south) * 0.35;
      setViewportBounds({
        west: west - lngMargin,
        east: east + lngMargin,
        south: south - latMargin,
        north: north + latMargin,
      });
    } catch {
      // Map may not be fully initialized yet
    }
  }, []);

  useEffect(() => {
    if (!focusLocation || !mapRef.current) return;

    const targetZoom = focusLocation.zoom ?? (focusLocation.source === "user" ? 12 : 11.8);
    const duration = focusLocation.source === "user" ? 650 : 900;

    mapRef.current.easeTo({
      center: [focusLocation.longitude, focusLocation.latitude],
      zoom: targetZoom,
      duration,
      essential: true,
    });
  }, [focusLocation?.longitude, focusLocation?.latitude, focusLocation?.zoom, focusLocation?.key, focusLocation?.source]);

  // Fast O(1) Sets for tone checks
  const highlightedSet = useMemo(() => new Set(highlightedIds), [highlightedIds]);
  const matchedSet = useMemo(() => (matchedIds ? new Set(matchedIds) : null), [matchedIds]);

  const markers = useMemo(() => {
    const plotted = properties
      .filter((property) => Number.isFinite(property.lat) && Number.isFinite(property.lng))
      .map((property) => ({
        property,
        tone: getMarkerToneFast(property.id, highlightedSet, matchedSet, selectedId),
        kind: getMarkerKind(property),
      }));

    // Group units in same building or same location
    const groups: Record<string, typeof plotted> = {};
    for (const item of plotted) {
      const p = item.property;
      const key =
        p.complejoId
          ? `c-${p.complejoId}`
          : p.complejoNombre && p.complejoNombre.trim().length > 3
          ? `b-${p.complejoNombre.trim().toLowerCase()}`
          : `l-${p.lat.toFixed(4)}-${p.lng.toFixed(4)}`;

      groups[key] = groups[key] || [];
      groups[key].push(item);
    }

    const result: React.ReactNode[] = [];

    for (const [key, items] of Object.entries(groups)) {
      const ranked = [...items].sort((left, right) => TONE_RANK[left.tone] - TONE_RANK[right.tone]);
      const top = ranked[ranked.length - 1];
      const highlight =
        items.find((item) => item.tone === "selected") ||
        items.find((item) => item.tone === "active") ||
        top;

      const lng = top.property.lng;
      const lat = top.property.lat;

      // Viewport culling: skip rendering if offscreen, UNLESS it is currently selected or active
      if (
        viewportBounds &&
        top.tone !== "selected" &&
        top.tone !== "active" &&
        (lng < viewportBounds.west ||
          lng > viewportBounds.east ||
          lat < viewportBounds.south ||
          lat > viewportBounds.north)
      ) {
        continue;
      }

      const kinds = new Set(items.map((item) => item.kind));
      const kind = kinds.has("rent") && kinds.has("buy") ? "both" : top.kind;
      const count = items.length;
      const label = top.property.complejoNombre || top.property.title;

      result.push(
        <MarkerPin
          key={key}
          longitude={lng}
          latitude={lat}
          tone={top.tone}
          kind={kind}
          count={count}
          label={label}
          onSelect={() => onSelectProperty(highlight.property)}
        />
      );
    }

    return result;
  }, [highlightedSet, matchedSet, onSelectProperty, properties, selectedId, viewportBounds]);

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={{ longitude: -63.18, latitude: -17.784, zoom: 13 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={isDarkMode ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11"}
        reuseMaps
        attributionControl
        onLoad={updateViewportBounds}
        onMoveEnd={updateViewportBounds}
      >
        {markers}
      </Map>
    </div>
  );
}

export default memo(MapCanvas);

