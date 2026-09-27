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
  activeCardRanks?: number[];
  onSelect: () => void;
};

const MarkerPin = memo(function MarkerPin({
  longitude,
  latitude,
  tone,
  kind,
  count,
  label,
  activeCardRanks = [],
  onSelect,
}: MarkerPinProps) {
  const isBuilding = count > 1;
  const isCardActive = activeCardRanks.length > 0;
  const isSelected = tone === "selected";
  const isActive = isCardActive || tone === "active";

  const rankBadgeText =
    activeCardRanks.includes(1) && activeCardRanks.includes(2)
      ? "Opciones 1 y 2"
      : activeCardRanks.includes(1)
      ? "Opción 1"
      : activeCardRanks.includes(2)
      ? "Opción 2"
      : null;

  if (isBuilding) {
    const bgClass = isSelected
      ? "bg-amber-400 text-stone-950 border-white ring-4 ring-amber-400/80 scale-115 shadow-2xl"
      : isCardActive
      ? "bg-gradient-to-br from-amber-400 to-amber-500 text-stone-950 border-white ring-4 ring-amber-400/80 scale-110 shadow-[0_0_30px_rgba(245,158,11,1)]"
      : kind === "anticretico"
      ? "bg-[#7C3AED] text-white border-white dark:border-stone-900"
      : kind === "rent"
      ? "bg-[var(--color-teal-deep)] text-white border-white dark:border-stone-900"
      : kind === "buy"
      ? "bg-[var(--accent-hover)] text-stone-900 border-white dark:border-stone-900"
      : "bg-[var(--accent-main)] text-stone-900 border-white dark:border-stone-900";

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
          {/* LUZ RADIANTE Y ONDA EXPANSIVA */}
          {isCardActive && (
            <>
              <span className="absolute -inset-3 rounded-full animate-ping bg-amber-400/60 pointer-events-none" />
              <span className="absolute -inset-2 rounded-full bg-amber-400/35 blur-sm pointer-events-none" />
            </>
          )}
          {(isSelected || (isActive && !isCardActive)) ? (
            <span className={`absolute inset-0 rounded-full animate-ping ${PING_COLOR[kind]}`} />
          ) : null}

          {/* INSIGNIA NUMERADA FLOTANTE */}
          {rankBadgeText && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-stone-950 shadow-2xl ring-2 ring-stone-900 whitespace-nowrap animate-bounce pointer-events-none">
              <span>📍</span>
              <span>{rankBadgeText}</span>
            </div>
          )}

          <div
            className={`relative z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full border-[2px] font-black shadow-lg transition-all duration-300 hover:scale-115 ${bgClass} ${
              isSelected ? "ring-4 ring-amber-400 scale-110 shadow-xl" : isActive ? "ring-2 ring-[var(--accent-main)]" : ""
            }`}
            title={`🏢 ${label} · ${count} unidades disponibles · Clic para ver opciones`}
          >
            <Building2 size={13} className="shrink-0 stroke-[2.5]" />
            <span className="text-xs tracking-tight">{count}</span>
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
        {/* LUZ RADIANTE Y ONDA EXPANSIVA */}
        {isCardActive && (
          <>
            <span className="absolute -inset-3 rounded-full animate-ping bg-amber-400/60 pointer-events-none" />
            <span className="absolute -inset-2 rounded-full bg-amber-400/35 blur-sm pointer-events-none" />
          </>
        )}
        {(tone === "active" || tone === "selected") && !isCardActive ? (
          <span className={`absolute inset-0 rounded-full animate-ping ${PING_COLOR[kind]}`} />
        ) : null}

        {/* INSIGNIA NUMERADA FLOTANTE */}
        {rankBadgeText && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-stone-950 shadow-2xl ring-2 ring-stone-900 whitespace-nowrap animate-bounce pointer-events-none">
            <span>📍</span>
            <span>{rankBadgeText}</span>
          </div>
        )}

        <div
          className={`relative z-10 flex cursor-pointer items-center justify-center rounded-full transition-all duration-300 hover:scale-115 ${
            isCardActive
              ? "h-8 w-8 border-[3px] border-white bg-amber-400 text-stone-950 shadow-[0_0_30px_rgba(245,158,11,1)] ring-4 ring-amber-400/70 scale-110"
              : `${MARKER_SIZE[tone]} ${MARKER_COLOR[kind]} ${MARKER_GLOW[tone]}`
          }`}
          title={`${label} · ${kind === "anticretico" ? "Anticrético" : kind === "rent" ? "Alquiler" : kind === "buy" ? "Venta" : "Alquiler / Venta"}`}
        >
          {isCardActive ? (
            <span className="text-[11px] font-black">{activeCardRanks[0]}</span>
          ) : (
            <div className="h-1 w-1 rounded-full bg-[var(--color-ivory)] md:h-1.5 md:w-1.5" />
          )}
        </div>
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
  cardRank1: boolean;
  cardRank2: boolean;
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
  cardRank1,
  cardRank2,
  hasBuilding,
  hasRent,
  hasBuy,
  onClick,
}: ClusterPinProps) {
  const isCardActive = cardRank1 || cardRank2;
  const isRentOnly = hasRent && !hasBuy;
  const isHybrid = hasRent && hasBuy;

  const rankBadgeText =
    cardRank1 && cardRank2
      ? "Opciones 1 y 2"
      : cardRank1
      ? "Opción 1"
      : cardRank2
      ? "Opción 2"
      : null;

  const bgStyle = hasSelected
    ? "border-amber-400 bg-amber-500 text-stone-950 shadow-[0_0_25px_rgba(245,158,11,0.9)] ring-4 ring-amber-400/60"
    : isCardActive
    ? "border-amber-300 bg-gradient-to-br from-amber-400 to-amber-500 text-stone-950 shadow-[0_0_35px_rgba(245,158,11,1),0_0_15px_rgba(255,255,255,0.8)] ring-4 ring-amber-400/80 scale-115"
    : hasActive
    ? "border-[var(--color-ivory)] bg-[var(--color-teal-deep)] text-[var(--color-ivory)] shadow-[0_0_16px_rgba(47,111,115,0.7)]"
    : isRentOnly
    ? "border-[var(--color-ivory)] bg-[var(--color-teal-deep)] text-[var(--color-ivory)] shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
    : isHybrid
    ? "border-[var(--color-ivory)] bg-[var(--accent-main)] text-[var(--color-ivory)] shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
    : "border-[var(--color-chocolate)] bg-[var(--accent-hover)] text-[var(--color-chocolate)] dark:border-[var(--color-ivory)] dark:text-[var(--color-ivory)] shadow-[0_4px_16px_rgba(0,0,0,0.5)]";

  const sizeStyle =
    totalUnits >= 30
      ? "h-11 min-w-11 px-2.5 text-xs font-black ring-4 ring-[var(--accent-hover)]/30"
      : totalUnits >= 10
      ? "h-9 min-w-9 px-2 text-xs font-black ring-3 ring-[var(--accent-hover)]/25"
      : "h-8 min-w-8 px-1.5 text-[11px] font-bold ring-2 ring-[var(--accent-hover)]/20";

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
        {/* LUZ RADIANTE Y ONDA EXPANSIVA DE LA BURBUJA */}
        {isCardActive && (
          <>
            <span className="absolute -inset-3 rounded-full animate-ping bg-amber-400/60 pointer-events-none" />
            <span className="absolute -inset-2 rounded-full bg-amber-400/35 blur-sm pointer-events-none" />
          </>
        )}
        {(hasSelected || (hasActive && !isCardActive)) ? (
          <span className="absolute inset-0 rounded-full animate-ping bg-[var(--accent-hover)]/40 pointer-events-none" />
        ) : null}

        {/* INSIGNIA NUMERADA FLOTANTE */}
        {rankBadgeText && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-stone-950 shadow-2xl ring-2 ring-stone-900 whitespace-nowrap animate-bounce pointer-events-none">
            <span>📍</span>
            <span>{rankBadgeText}</span>
          </div>
        )}

        <div
          className={`relative z-10 flex cursor-pointer items-center justify-center rounded-full border-[2.5px] transition-all duration-300 group-hover:scale-115 group-hover:shadow-[0_0_24px_rgba(216,170,113,0.8)] ${sizeStyle} ${bgStyle}`}
          title={`${totalUnits} unidades en ${pointCount} edificios cercanos · Clic para acercar`}
        >
          {hasBuilding || totalUnits >= 4 ? (
            <div className="flex items-center gap-0.5">
              <Building2 size={12} className="shrink-0 stroke-[2.5]" />
              <span>{totalUnits}</span>
            </div>
          ) : (
            <span>+{totalUnits}</span>
          )}
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

const extractBuildingName = (p: Property): string => {
  if (p.complejoNombre && p.complejoNombre.trim().length > 3) {
    return p.complejoNombre.trim();
  }
  const t = p.title || "";
  const match = t.match(/(?:edificio|condominio|torre|residence|sky|smart|macoror[oó]|onix|ares|magnum|porto|stanza|swiss[oô]tel|domus|luxe)\s+([^·\-,|–\(\)]+)/i);
  if (match) {
    return match[0].trim();
  }
  if (p.zone) return `Edificio ${p.zone}`;
  return p.title;
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
  activeCardRanks: number[];
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
  cardRank1: number;
  cardRank2: number;
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
  highlightedCardMap?: Record<string, number>;
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
  highlightedCardMap = {},
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

      const activeCardRanks = items
        .map((i) => highlightedCardMap[i.property.id])
        .filter((r): r is number => Boolean(r));

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
      const hasActive = items.some((item) => item.tone === "active") || activeCardRanks.length > 0;
      const label = top.property.complejoNombre || extractBuildingName(top.property);

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
          activeCardRanks,
          hasRent,
          hasBuy,
          hasAnticretico,
        },
      });
    }

    return features;
  }, [properties, highlightedSet, matchedSet, selectedId, selectedBuildingKey, highlightedCardMap]);

  // Build Supercluster spatial index with tighter radius so buildings separate into towers
  const supercluster = useMemo(() => {
    const sc = new Supercluster<BuildingPointProps, ClusterAccumulatedProps>({
      radius: 30, // Lowered from 48 so towers separate clearly
      maxZoom: 14, // Lowered from 15 so from zoom 14+ buildings emerge
      map: (props) => ({
        totalUnits: props.unitCount,
        hasSelected: props.hasSelected ? 1 : 0,
        hasActive: props.hasActive ? 1 : 0,
        hasRent: props.hasRent ? 1 : 0,
        hasBuy: props.hasBuy ? 1 : 0,
        cardRank1: props.activeCardRanks.includes(1) ? 1 : 0,
        cardRank2: props.activeCardRanks.includes(2) ? 1 : 0,
        hasBuilding: props.unitCount > 1 ? 1 : 0,
      }),
      reduce: (acc, props) => {
        acc.totalUnits += props.totalUnits;
        acc.hasSelected += props.hasSelected;
        acc.hasActive += props.hasActive;
        acc.hasRent += props.hasRent;
        acc.hasBuy += props.hasBuy;
        acc.cardRank1 += props.cardRank1;
        acc.cardRank2 += props.cardRank2;
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
            cardRank1={clusterProps.cardRank1 > 0}
            cardRank2={clusterProps.cardRank2 > 0}
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
          activeCardRanks={buildingProps.activeCardRanks}
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

