import React, { useCallback, useEffect, useRef, useState } from "react";

import cx from "@calcom/lib/classNames";
import { useDebounce } from "@calcom/lib/hooks/useDebounce";
import useOnClickOutside from "@calcom/lib/hooks/useOnclickOutside";

import { Input } from "../components/form";
import { Icon } from "../components/icon";

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

  useOnClickOutside(locationsContainerRef, () => setShowSuggestedLocations(false));

  const handlePlacesAutocomplete = useCallback(async () => {
    console.log("handlePlacesAutocomplete called with:", debouncedAddress);

    if (debouncedAddress === "") {
      setSuggestedLocations([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/location-autocomplete?input=${encodeURIComponent(debouncedAddress)}`
      );
      const data = await response.json();

      console.log("Places API response:", data);
      setIsLoading(false);

      if (!response.ok) {
        console.error("Places Autocomplete Error:", data.error);
        return;
      }

      setSuggestedLocations(data.predictions || []);
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
    if (debouncedAddress) {
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
