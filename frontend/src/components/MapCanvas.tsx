import React, { memo, useEffect, useMemo, useRef } from "react";
// @ts-ignore
import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Marker, MapRef } from "react-map-gl/mapbox";
import { Property } from "../types";
import { MarkerTone, getMarkerTone } from "../mapLocation";


export type MapFocus = {
  longitude: number;
  latitude: number;
  zoom?: number;
  key?: number;
  source?: "user" | "search";
};

const MARKER_CLASS: Record<MarkerTone, string> = {
  muted:
    "h-3 w-3 border border-[var(--border-strong)]/50 bg-[var(--text-muted)]/45 opacity-45 shadow-none md:h-3.5 md:w-3.5",
  match:
    "h-4 w-4 border-[2px] border-[var(--color-chocolate)] bg-[var(--accent-main)]/80 opacity-90 shadow-[0_0_0_3px_rgba(248,243,231,0.55)] md:h-5 md:w-5 dark:border-[var(--border-soft)]",
  active:
    "h-7 w-7 border-[3px] border-[var(--color-chocolate)] bg-[var(--accent-hover)] shadow-[0_0_0_5px_rgba(182,87,55,0.28),0_10px_24px_rgba(58,33,25,0.35)] md:h-8 md:w-8 dark:border-[var(--color-ivory)]",
  selected:
    "h-8 w-8 border-[3px] border-[var(--accent-main)] bg-[var(--accent-hover)] shadow-[0_0_0_6px_rgba(196,147,98,0.4),0_12px_28px_rgba(58,33,25,0.4)] md:h-9 md:w-9",
};

const TONE_RANK: Record<MarkerTone, number> = { muted: 0, match: 1, active: 2, selected: 3 };

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

  const markers = useMemo(() => {
    const plotted = properties
      .filter((property) => Number.isFinite(property.lat) && Number.isFinite(property.lng))
      .map((property) => ({
        property,
        tone: getMarkerTone(property.id, highlightedIds, matchedIds, selectedId),
      }))
      .sort((left, right) => TONE_RANK[left.tone] - TONE_RANK[right.tone]);

    return plotted.map(({ property, tone }) => (
      <Marker
        key={property.id}
        longitude={property.lng}
        latitude={property.lat}
        onClick={(event) => {
          event.originalEvent.stopPropagation();
          onSelectProperty(property);
        }}
      >
        <div className="relative flex items-center justify-center">
          {tone === "active" || tone === "selected" ? (
            <span className="absolute inset-0 rounded-full bg-[var(--accent-hover)]/35 animate-ping" />
          ) : null}
          <div
            className={`relative z-10 flex cursor-pointer items-center justify-center rounded-full transition-all duration-300 hover:scale-110 ${MARKER_CLASS[tone]}`}
            title={property.title}
          >
            <div className="h-1 w-1 rounded-full bg-[var(--color-ivory)] md:h-1.5 md:w-1.5" />
          </div>
        </div>
      </Marker>
    ));
  }, [highlightedIds, matchedIds, onSelectProperty, properties, selectedId]);

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={mapboxToken}
      initialViewState={{ longitude: -63.18, latitude: -17.784, zoom: 13 }}
      style={{ width: "100%", height: "100%" }}
      mapStyle={isDarkMode ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11"}
      reuseMaps
      attributionControl
    >
      {markers}
    </Map>
  );
}

export default memo(MapCanvas);
