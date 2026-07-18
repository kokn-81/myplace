import React, { memo, useEffect, useMemo, useRef } from "react";
// @ts-ignore
import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Marker, MapRef } from "react-map-gl/mapbox";
import { Property } from "../types";


export type MapFocus = {
  longitude: number;
  latitude: number;
  zoom?: number;
  key?: number;
};
type MapCanvasProps = {
  mapboxToken: string;
  properties: Property[];
  isDarkMode: boolean;
  onSelectProperty: (property: Property) => void;
  focusLocation?: MapFocus | null;
};

function MapCanvas({ mapboxToken, properties, isDarkMode, onSelectProperty, focusLocation }: MapCanvasProps) {
  const mapRef = useRef<MapRef | null>(null);

  useEffect(() => {
    if (!focusLocation || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [focusLocation.longitude, focusLocation.latitude],
      zoom: focusLocation.zoom ?? 12.5,
      duration: 1400,
      essential: true,
    });
  }, [focusLocation?.longitude, focusLocation?.latitude, focusLocation?.zoom, focusLocation?.key]);

  const markers = useMemo(
    () => properties.map((property) => (
      <Marker
        key={property.id}
        longitude={property.lng}
        latitude={property.lat}
        onClick={(event) => {
          event.originalEvent.stopPropagation();
          onSelectProperty(property);
        }}
      >
        <div className="w-5 h-5 md:w-6 md:h-6 bg-[var(--accent-hover)] dark:bg-[#FAF8F5] rounded-full border-[2.5px] border-[var(--color-chocolate)] dark:border-[var(--border-soft)] shadow-[0_0_0_4px_rgba(248,243,231,0.85),0_8px_22px_rgba(58,33,25,0.28)] dark:shadow-[0_0_15px_rgba(250,248,245,0.4)] cursor-pointer hover:scale-125 hover:bg-[var(--accent-secondary)] dark:hover:bg-[var(--accent-main)] hover:border-[var(--color-chocolate)] dark:hover:border-white transition-all duration-300 flex items-center justify-center group relative z-10">
          <div className="w-1.5 h-1.5 bg-[var(--color-ivory)] dark:bg-[var(--surface-panel)] rounded-full group-hover:bg-white transition-colors" />
        </div>
      </Marker>
    )),
    [properties, onSelectProperty]
  );

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
