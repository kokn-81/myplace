import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
// @ts-ignore
import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Marker, MapRef } from "react-map-gl/mapbox";
import Supercluster, { PointFeature, ClusterProperties } from "supercluster";
import { Building2 } from "lucide-react";
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
  anticretico: "border-[var(--color-chocolate)] bg-[#7C3AED] dark:border-[var(--color-ivory)]",
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
  anticretico: "bg-[#7C3AED]/35",
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
  const isBuilding = count > 1;
  const isSelected = tone === "selected";
  const isActive = tone === "active";

  // Pin destacado cuando una propiedad está seleccionada o en hover: insignia discreta y elegante
  if (isSelected) {
    return (
      <Marker
        longitude={longitude}
        latitude={latitude}
        onClick={(event) => {
          event.originalEvent.stopPropagation();
          onSelect();
        }}
      >
        <div className="relative flex flex-col items-center cursor-pointer group -translate-y-5 z-40">
          {/* Suave resplandor sutil en tono camel/oro */}
          <span className="absolute bottom-0 h-6 w-6 rounded-full animate-ping bg-[var(--accent-main)]/20 pointer-events-none" />

          {/* Insignia sobria con la paleta de NIA */}
          <div className="relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-panel)]/95 border border-[var(--accent-main)]/70 shadow-[0_6px_20px_rgba(0,0,0,0.45)] text-[var(--text-main)] text-xs font-medium tracking-wide backdrop-blur-md transition-transform hover:scale-105">
            <span className="text-[var(--accent-main)] text-[11px]">📍</span>
            <span className="max-w-[170px] truncate">{label || "Ubicación"}</span>
            {count > 1 && (
              <span className="rounded-full bg-[var(--surface-control)] border border-[var(--border-soft)]/50 px-1.5 py-0.2 text-[10px] text-[var(--text-muted)]">
                {count}
              </span>
            )}
          </div>

          {/* Puntero fino hacia el suelo */}
          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[var(--accent-main)]/80 -mt-[1px]" />
          {/* Punto de anclaje discreto */}
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent-main)] ring-1 ring-[var(--surface-panel)] mt-0.5" />
        </div>
      </Marker>
    );
  }

  if (isBuilding) {
    return (
      <Marker
        longitude={longitude}
        latitude={latitude}
        onClick={(event) => {
          event.originalEvent.stopPropagation();
          onSelect();
        }}
      >
        <div className="relative flex items-center justify-center cursor-pointer group">
          {isActive ? (
            <span className="absolute inset-0 rounded-full animate-ping bg-[var(--accent-main)]/25 pointer-events-none" />
          ) : null}

          <div
            className={`relative z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-medium shadow-md transition-all duration-300 hover:scale-110 ${
              isActive
                ? "border-[var(--accent-main)] bg-[var(--surface-control)] text-[var(--accent-main)] ring-1 ring-[var(--accent-main)]/40 shadow-lg scale-105"
                : "border-[var(--border-soft)]/60 bg-[var(--surface-panel)]/90 text-[var(--text-muted)] backdrop-blur-md hover:border-[var(--accent-main)]/60 hover:text-[var(--text-main)]"
            }`}
            title={`🏢 ${label} · ${count} unidades disponibles · Clic para ver opciones`}
          >
            <Building2 size={11} className="shrink-0 stroke-[2]" />
            <span className="tracking-tight">{count}</span>
          </div>
        </div>
      </Marker>
    );
  }

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      onClick={(event) => {
        event.originalEvent.stopPropagation();
        onSelect();
      }}
    >
      <div className="relative flex items-center justify-center cursor-pointer group">
        {isActive ? (
          <span className="absolute inset-0 rounded-full animate-ping bg-[var(--accent-main)]/25 pointer-events-none" />
        ) : null}

        <div
          className={`relative z-10 flex cursor-pointer items-center justify-center rounded-full transition-all duration-300 hover:scale-125 ${
            isActive
              ? "h-3.5 w-3.5 border-2 border-[var(--accent-main)] bg-[var(--surface-control)] shadow-[0_0_8px_rgba(196,147,98,0.4)] scale-110"
              : tone === "match"
              ? "h-3 w-3 border border-[var(--border-soft)] bg-[var(--accent-main)]/90 shadow-xs"
              : "h-2.5 w-2.5 border border-[var(--border-soft)]/40 bg-[var(--accent-main)]/60 opacity-70"
          }`}
          title={`${label} · ${kind === "anticretico" ? "Anticrético" : kind === "rent" ? "Alquiler" : kind === "buy" ? "Venta" : "Alquiler / Venta"}`}
        />
      </div>
    </Marker>
  );
});

type ClusterPinProps = {
  longitude: number;
  latitude: number;
  totalUnits: number;
  pointCount: number;
  hasSelected: boolean;
  hasActive: boolean;
  hasBuilding: boolean;
  hasRent: boolean;
  hasBuy: boolean;
  onClick: () => void;
};

const ClusterPin = memo(function ClusterPin({
  longitude,
  latitude,
  totalUnits,
  pointCount,
  hasSelected,
  hasActive,
  hasBuilding,
  hasRent,
  hasBuy,
  onClick,
}: ClusterPinProps) {
  const isRentOnly = hasRent && !hasBuy;

  const bgStyle = hasSelected || hasActive
    ? "border-2 border-[var(--accent-main)] bg-[var(--surface-control)] text-[var(--accent-main)] shadow-[0_4px_18px_rgba(0,0,0,0.5)] ring-2 ring-[var(--accent-main)]/25 scale-105 z-20 font-bold"
    : isRentOnly
    ? "border border-[var(--color-teal-deep)]/50 bg-[var(--surface-panel)]/92 text-[var(--color-teal-deep)] dark:text-[#67B5BA] shadow-[0_4px_12px_rgba(0,0,0,0.4)] backdrop-blur-md"
    : "border border-[var(--border-soft)]/50 bg-[var(--surface-panel)]/92 text-[var(--text-main)] shadow-[0_4px_12px_rgba(0,0,0,0.4)] backdrop-blur-md";

  const sizeStyle =
    totalUnits >= 50
      ? "h-11 w-11 min-w-[44px] text-xs font-semibold"
      : totalUnits >= 10
      ? "h-9.5 w-9.5 min-w-[38px] text-xs font-medium"
      : "h-8 w-8 min-w-[32px] text-[11px] font-medium";

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      onClick={(event) => {
        event.originalEvent.stopPropagation();
        onClick();
      }}
    >
      <div className="relative flex items-center justify-center cursor-pointer group">
        {(hasSelected || hasActive) && (
          <span className="absolute inset-0 rounded-full animate-ping bg-[var(--accent-main)]/20 pointer-events-none" />
        )}

        <div
          className={`relative z-10 flex cursor-pointer items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110 group-hover:border-[var(--accent-main)] ${sizeStyle} ${bgStyle}`}
          title={`${totalUnits} unidades en esta zona · Clic para acercar`}
        >
          <span className="tabular-nums tracking-tight">{totalUnits}</span>
        </div>
      </div>
    </Marker>
  );
});

export type BuildingGroupData = {
  key: string;
  label: string;
  count: number;
  properties: Property[];
  topProperty: Property;
  lng: number;
  lat: number;
};

const cleanBuildingName = (raw: string): string => {
  let name = raw.trim();
  name = name.replace(/\s*[-–|,/]\s*$/g, "");
  name = name.replace(/\b(?:dpto|depto|departamento|unidad|oficina|of|suite|penthouse)\.?\s*#?\s*\w+\b/gi, "");
  name = name.replace(/\bpiso\s*#?\s*\d+\b/gi, "");
  name = name.replace(/\b(?:1|2|3|4)\s*dorms?\b/gi, "");
  name = name.replace(/\b(?:en\s+)?(?:alquiler|venta|anticretico)\b/gi, "");
  name = name.replace(/\s+/g, " ").trim();
  name = name.replace(/\s*[-–|,/]\s*$/g, "");
  return name.trim() || raw.trim();
};

const extractBuildingName = (p: Property): string => {
  if (p.complejoNombre && p.complejoNombre.trim().length > 3) {
    return cleanBuildingName(p.complejoNombre);
  }
  const t = p.title || "";
  const match = t.match(/(?:edificio|condominio|torre|residence|sky|smart|macoror[oó]|onix|ares|magnum|porto|stanza|swiss[oô]tel|domus|luxe)\s+([^·\-,|–\(\)]+)/i);
  if (match) {
    return cleanBuildingName(match[0]);
  }
  if (p.zone) return `Edificio ${p.zone}`;
  return cleanBuildingName(p.title);
};

type BuildingPointProps = {
  cluster?: false;
  buildingKey: string;
  unitCount: number;
  topProperty: Property;
  properties: Property[];
  kind: MarkerKind;
  tone: MarkerTone;
  label: string;
  hasSelected: boolean;
  hasActive: boolean;
  hasRent: boolean;
  hasBuy: boolean;
  hasAnticretico: boolean;
};

type ClusterAccumulatedProps = {
  totalUnits: number;
  hasSelected: number;
  hasActive: number;
  hasRent: number;
  hasBuy: number;
  hasBuilding: number;
};

type MapCanvasProps = {
  mapboxToken: string;
  properties: Property[];
  isDarkMode: boolean;
  onSelectProperty: (property: Property) => void;
  onSelectBuilding?: (building: BuildingGroupData) => void;
  selectedBuildingKey?: string | null;
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
  onSelectBuilding,
  selectedBuildingKey = null,
  focusLocation,
  highlightedIds = [],
  matchedIds = null,
  selectedId = null,
}: MapCanvasProps) {
  const mapRef = useRef<MapRef | null>(null);

  const [zoom, setZoom] = useState<number>(14);
  const [bounds, setBounds] = useState<[number, number, number, number]>([
    -63.35, -17.95, -63.00, -17.60,
  ]);

  const updateMapState = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    try {
      const b = map.getBounds();
      const z = map.getZoom();
      if (b && Number.isFinite(z)) {
        const west = b.getWest();
        const east = b.getEast();
        const south = b.getSouth();
        const north = b.getNorth();
        const lngMargin = (east - west) * 0.15;
        const latMargin = (north - south) * 0.15;
        setBounds([west - lngMargin, south - latMargin, east + lngMargin, north + latMargin]);
        setZoom(z);
      }
    } catch {
      // Map may not be fully initialized yet
    }
  }, []);

  useEffect(() => {
    if (!focusLocation || !mapRef.current) return;

    const targetZoom = focusLocation.zoom ?? (focusLocation.source === "user" ? 15.0 : 14.0);
    const duration = focusLocation.source === "user" ? 700 : 900;

    mapRef.current.easeTo({
      center: [focusLocation.longitude, focusLocation.latitude],
      zoom: targetZoom,
      duration,
      padding: { top: 60, bottom: 230, left: 20, right: 20 },
      essential: true,
    });
  }, [focusLocation?.longitude, focusLocation?.latitude, focusLocation?.zoom, focusLocation?.key, focusLocation?.source]);

  // Fast O(1) Sets for tone checks
  const highlightedSet = useMemo(() => new Set(highlightedIds), [highlightedIds]);
  const matchedSet = useMemo(() => (matchedIds ? new Set(matchedIds) : null), [matchedIds]);

  // Group properties into unique buildings/locations
  const points = useMemo(() => {
    const plotted = properties
      .filter((property) => Number.isFinite(property.lat) && Number.isFinite(property.lng))
      .map((property) => ({
        property,
        tone: getMarkerToneFast(property.id, highlightedSet, matchedSet, selectedId),
        kind: getMarkerKind(property),
      }));

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

    const features: Array<PointFeature<BuildingPointProps>> = [];

    for (const [key, items] of Object.entries(groups)) {
      const ranked = [...items].sort((left, right) => TONE_RANK[left.tone] - TONE_RANK[right.tone]);
      const top = ranked[ranked.length - 1];
      const isBuildingSelected = selectedBuildingKey === key;
      const highlight =
        items.find((item) => item.tone === "selected") ||
        items.find((item) => item.tone === "active") ||
        top;

      const kinds = new Set(items.map((item) => item.kind));
      const hasAnticretico = kinds.has("anticretico");
      const hasRent = items.some((item) => item.kind === "rent" || item.kind === "both");
      const hasBuy = items.some((item) => item.kind === "buy" || item.kind === "both");
      const kind =
        hasRent && hasBuy
          ? "both"
          : hasAnticretico
          ? "anticretico"
          : top.kind;
      const hasSelected = isBuildingSelected || items.some((item) => item.tone === "selected");
      const hasActive = items.some((item) => item.tone === "active");
      const label = extractBuildingName(top.property);

      features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [top.property.lng, top.property.lat],
        },
        properties: {
          buildingKey: key,
          unitCount: items.length,
          topProperty: highlight.property,
          properties: items.map((i) => i.property),
          kind,
          tone: isBuildingSelected ? "selected" : highlight.tone,
          label,
          hasSelected,
          hasActive,
          hasRent,
          hasBuy,
          hasAnticretico,
        },
      });
    }

    return features;
  }, [properties, highlightedSet, matchedSet, selectedId, selectedBuildingKey]);

  // Agrupación espacial estética: agrupa limpiamente en zonas a vista de ciudad sin encimarse
  const supercluster = useMemo(() => {
    const sc = new Supercluster<BuildingPointProps, ClusterAccumulatedProps>({
      radius: 65, // Radio armónico para evitar racimos encimados
      maxZoom: 16, // Los edificios individuales emergen con elegancia a nivel calle
      map: (props) => ({
        totalUnits: props.unitCount,
        hasSelected: props.hasSelected ? 1 : 0,
        hasActive: props.hasActive ? 1 : 0,
        hasRent: props.hasRent ? 1 : 0,
        hasBuy: props.hasBuy ? 1 : 0,
        hasBuilding: props.unitCount > 1 ? 1 : 0,
      }),
      reduce: (acc, props) => {
        acc.totalUnits += props.totalUnits;
        acc.hasSelected += props.hasSelected;
        acc.hasActive += props.hasActive;
        acc.hasRent += props.hasRent;
        acc.hasBuy += props.hasBuy;
        acc.hasBuilding += props.hasBuilding;
      },
    });

    sc.load(points);
    return sc;
  }, [points]);

  const handleClusterClick = useCallback(
    (clusterId: number, lng: number, lat: number) => {
      const map = mapRef.current?.getMap();
      if (!map || !supercluster) return;

      try {
        const leaves = supercluster.getLeaves(clusterId, 1);
        if (leaves.length > 0 && leaves[0].properties?.topProperty) {
          onSelectProperty(leaves[0].properties.topProperty);
        }
      } catch {
        // ignore
      }

      try {
        const expansionZoom = supercluster.getClusterExpansionZoom(clusterId);
        const currentZoom = map.getZoom();
        const nextZoom = Math.min(Math.max(currentZoom + 1.8, expansionZoom), 16.5);
        map.easeTo({
          center: [lng, lat],
          zoom: nextZoom,
          duration: 450,
          padding: { top: 60, bottom: 230, left: 20, right: 20 },
          essential: true,
        });
      } catch {
        map.easeTo({
          center: [lng, lat],
          zoom: map.getZoom() + 2,
          duration: 450,
          padding: { top: 60, bottom: 230, left: 20, right: 20 },
          essential: true,
        });
      }
    },
    [supercluster, onSelectProperty]
  );

  const renderedMarkers = useMemo(() => {
    if (!supercluster) return null;
    const currentClusters = supercluster.getClusters(bounds, Math.round(zoom));

    return currentClusters.map((feature) => {
      const [lng, lat] = feature.geometry.coordinates;

      if ("cluster" in feature.properties && feature.properties.cluster) {
        const clusterProps = feature.properties as unknown as ClusterProperties &
          ClusterAccumulatedProps;
        const clusterId = clusterProps.cluster_id;
        const totalUnits = clusterProps.totalUnits || clusterProps.point_count;
        const pointCount = clusterProps.point_count;

        return (
          <ClusterPin
            key={`cluster-${clusterId}`}
            longitude={lng}
            latitude={lat}
            totalUnits={totalUnits}
            pointCount={pointCount}
            hasSelected={clusterProps.hasSelected > 0}
            hasActive={clusterProps.hasActive > 0}
            hasBuilding={clusterProps.hasBuilding > 0}
            hasRent={clusterProps.hasRent > 0}
            hasBuy={clusterProps.hasBuy > 0}
            onClick={() => handleClusterClick(clusterId, lng, lat)}
          />
        );
      }

      const buildingProps = feature.properties as BuildingPointProps;
      return (
        <MarkerPin
          key={buildingProps.buildingKey}
          longitude={lng}
          latitude={lat}
          tone={buildingProps.tone}
          kind={buildingProps.kind}
          count={buildingProps.unitCount}
          label={buildingProps.label}
          onSelect={() => {
            if (buildingProps.unitCount > 1 && onSelectBuilding) {
              onSelectBuilding({
                key: buildingProps.buildingKey,
                label: buildingProps.label,
                count: buildingProps.unitCount,
                properties: buildingProps.properties,
                topProperty: buildingProps.topProperty,
                lng,
                lat,
              });
            } else {
              onSelectProperty(buildingProps.topProperty);
            }
          }}
        />
      );
    });
  }, [supercluster, bounds, zoom, handleClusterClick, onSelectProperty, onSelectBuilding]);

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={{ longitude: -63.188, latitude: -17.778, zoom: 14 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={isDarkMode ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11"}
        reuseMaps
        attributionControl
        onLoad={updateMapState}
        onMoveEnd={updateMapState}
      >
        {renderedMarkers}
      </Map>
    </div>
  );
}

export default memo(MapCanvas);

