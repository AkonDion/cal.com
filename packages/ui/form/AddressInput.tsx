import React, { useCallback, useEffect, useRef, useState } from "react";

import cx from "@calcom/lib/classNames";
import { useDebounce } from "@calcom/lib/hooks/useDebounce";
import useOnClickOutside from "@calcom/lib/hooks/useOnclickOutside";

import { Input } from "../components/form";
import { Icon } from "../components/icon";

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
                bounds?: {
                  north: number;
                  south: number;
                  east: number;
                  west: number;
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

export type AddressInputProps = {
  value: string;
  id?: string;
  placeholder?: string;
  required?: boolean;
  onChange: (val: string) => void;
  className?: string;
};

function AddressInput({ value = "", onChange, ...rest }: AddressInputProps) {
  const [address, setAddress] = useState(value);
  const debouncedAddress = useDebounce(address, 750);
  const [suggestedLocations, setSuggestedLocations] = useState<string[]>([]);
  const [showSuggestedLocations, setShowSuggestedLocations] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const locationsContainerRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const scriptLoaded = useRef<boolean>(false);

  useOnClickOutside(locationsContainerRef, () => setShowSuggestedLocations(false));

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
      }
    };

    script.onerror = (error) => {
      console.error("Error loading Google Maps script:", error);
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handlePlacesAutocomplete = useCallback(async () => {
    console.log("handlePlacesAutocomplete called with:", debouncedAddress);

    if (debouncedAddress === "") {
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
          input: debouncedAddress,
          types: ["address"],
          componentRestrictions: { country: "ca" },
          bounds: {
            north: 45.5415,
            south: 45.3015,
            east: -75.5772,
            west: -75.8172,
          },
        },
        (predictions, status) => {
          console.log("Places API response:", { status, predictions });
          setIsLoading(false);

          if (status !== "OK" && status !== "ZERO_RESULTS") {
            console.error("Places Autocomplete Error:", status);
            return;
          }

          setSuggestedLocations(predictions ? predictions.map((p) => p.description) : []);
        }
      );
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching place predictions:", error);
    }
  }, [debouncedAddress]);

  const saveLocation = (place: string) => {
    setAddress(place);
    onChange(place);
    setShowSuggestedLocations(false);
  };

  useEffect(() => {
    if (debouncedAddress && scriptLoaded.current) {
      handlePlacesAutocomplete();
    }
  }, [debouncedAddress, handlePlacesAutocomplete]);

  return (
    <div className="relative w-full" ref={locationsContainerRef}>
      <div className="relative flex items-center">
        <Icon
          name="map-pin"
          className="text-muted absolute left-0.5 ml-3 h-4 w-4 -translate-y-1/2"
          style={{ top: "44%" }}
        />
        <Input
          {...rest}
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            setShowSuggestedLocations(true);
          }}
          className={cx("pl-10", rest?.className, isLoading ? "loading" : "")}
          onFocus={() => setShowSuggestedLocations(true)}
          onFocusCapture={() => setShowSuggestedLocations(true)}
        />
      </div>

      {suggestedLocations.length > 0 && showSuggestedLocations ? (
        <div className="dark:bg-darkgray-50 border-subtle absolute z-10 mt-1 w-full rounded-md border bg-white p-2 shadow-md">
          <ul className="space-y-2">
            {suggestedLocations.map((place, idx) => (
              <li
                key={`${idx}-${place}`}
                className="hover:bg-subtle flex items-center gap-x-2 rounded-md px-2 py-1">
                <Icon name="map-pin" className="text-muted h-4 w-4" />
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

export default AddressInput;
