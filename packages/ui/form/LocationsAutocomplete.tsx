import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { useDebounce } from "@calcom/lib/hooks/useDebounce";
import useOnClickOutside from "@calcom/lib/hooks/useOnclickOutside";
import { Input } from "@calcom/ui";

declare global {
  interface Window {
    google: {
      maps: {
        places: {
          AutocompleteService: new () => {
            getPlacePredictions: (
              request: {
                input: string;
                types?: string[];
                componentRestrictions?: {
                  country?: string | string[];
                };
              },
              callback: (predictions: { description: string }[] | null, status: string) => void
            ) => void;
          };
        };
      };
    };
  }
}

interface LocationsAutocompleteProps {
  value: string | undefined;
  placeholder: string;
  name: string;
  required?: boolean;
  watchInitialValue?: boolean;
  onSave: (place: string) => void;
  onError?: (error: Error) => void;
}

function LocationsAutocomplete({
  name,
  placeholder,
  value = "",
  required,
  watchInitialValue = false,
  onSave,
  onError,
  ...rest
}: LocationsAutocompleteProps) {
  const locationsContainerRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const scriptLoaded = useRef<boolean>(false);

  useOnClickOutside(locationsContainerRef, () => setShowSuggestedLocations(false));
  const [location, setLocation] = useState(() => value || "");
  const debouncedLocation = useDebounce(location, 750);

  const [suggestedLocations, setSuggestedLocations] = useState<string[]>([]);
  const [showSuggestedLocations, setShowSuggestedLocations] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load the Google Maps script
  useEffect(() => {
    if (scriptLoaded.current) return;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log("Google Maps script loaded successfully");
      scriptLoaded.current = true;
      try {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        console.log("AutocompleteService initialized successfully");
      } catch (error) {
        console.error("Error initializing Places Autocomplete:", error);
        onError?.(error instanceof Error ? error : new Error("Failed to initialize Places Autocomplete"));
      }
    };

    script.onerror = (error) => {
      console.error("Error loading Google Maps script:", error);
      onError?.(new Error("Failed to load Google Maps script"));
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [onError]);

  const handlePlacesAutocomplete = useCallback(async () => {
    console.log("handlePlacesAutocomplete called with:", debouncedLocation);

    if (debouncedLocation === "" || (watchInitialValue && debouncedLocation === value)) {
      setSuggestedLocations([]);
      return;
    }

    if (!autocompleteService.current) {
      console.log("AutocompleteService not initialized yet");
      return;
    }

    setIsLoading(true);

    try {
      autocompleteService.current.getPlacePredictions(
        {
          input: debouncedLocation,
          types: ["address", "establishment", "geocode"],
        },
        (predictions, status) => {
          console.log("Places API response:", { status, predictions });
          setIsLoading(false);

          if (status !== "OK" && status !== "ZERO_RESULTS") {
            console.error("Places Autocomplete Error:", status);
            onError?.(new Error(`Places Autocomplete Error: ${status}`));
            return;
          }

          setSuggestedLocations(predictions ? predictions.map((p) => p.description) : []);
        }
      );
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching place predictions:", error);
      onError?.(error instanceof Error ? error : new Error("Error fetching place predictions"));
    }
  }, [debouncedLocation, value, watchInitialValue, onError]);

  const saveLocation = (place: string) => {
    setLocation(place);
    onSave(place);
    setShowSuggestedLocations(false);
  };

  useEffect(() => {
    if (debouncedLocation && scriptLoaded.current) {
      handlePlacesAutocomplete();
    }
  }, [debouncedLocation, handlePlacesAutocomplete]);

  return (
    <div className="relative w-full" ref={locationsContainerRef}>
      <Input
        name={name}
        placeholder={placeholder}
        type="text"
        required={required}
        onChange={(e) => {
          setLocation(e.target.value);
          setShowSuggestedLocations(true);
        }}
        value={location}
        className={`my-0 ${isLoading ? "loading" : ""}`}
        {...rest}
        onFocus={() => setShowSuggestedLocations(true)}
        onFocusCapture={() => setShowSuggestedLocations(true)}
      />

      {suggestedLocations.length > 0 && showSuggestedLocations ? (
        <div className="dark:bg-darkgray-50 border-subtle absolute z-10 mt-1 w-full rounded-md border bg-white p-2 shadow-md">
          <ul className="space-y-2">
            {suggestedLocations.map((place, idx) => (
              <li
                key={`${idx}-${place}`}
                className="hover:bg-subtle flex items-center gap-x-2 rounded-md px-2 py-1">
                <Image
                  height={20}
                  width={20}
                  src="/map-pin-dark.svg"
                  alt="location icon"
                  className="inline-block h-3 w-3 dark:invert"
                />
                <button
                  data-testid={`suggested-location-${place}`}
                  className="w-full text-left text-sm"
                  onClick={() => saveLocation(place)}>
                  {place}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default LocationsAutocomplete;
