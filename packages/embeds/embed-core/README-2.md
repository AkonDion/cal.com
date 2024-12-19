# Google Places Autocomplete Integration for Cal.com

This package contains the necessary files to implement Google Places Autocomplete functionality in Cal.com. It provides a reusable component for location search with Google Places API integration.

## Files Structure

```
google-places-autocomplete/
├── components/
│   └── LocationsAutocomplete.tsx    # The main autocomplete component
├── api/
│   └── location-autocomplete.ts     # API endpoint for Google Places
├── lib/
│   └── hooks/
│       ├── useDebounce.tsx         # Debounce hook for input handling
│       └── useOnclickOutside.ts    # Click outside detection hook
├── ui/
│   └── Input.tsx                   # Base input component
├── public/
│   └── map-pin-dark.svg           # Location pin icon
├── package.json                    # Package dependencies
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This documentation
```

## Component Details

### LocationsAutocomplete.tsx
A React component that provides a location search input field with Google Places Autocomplete functionality. It includes:
- Debounced input handling
- Error handling
- Loading states
- Type-ahead suggestions
- Accessibility support

### location-autocomplete.ts
An API endpoint that securely handles Google Places API requests. It:
- Validates incoming requests
- Makes secure calls to Google Places API
- Handles error cases
- Returns formatted location data

### Utility Hooks

#### useDebounce.tsx
A custom hook that provides debounced values, used to prevent excessive API calls when typing.

#### useOnclickOutside.ts
A custom hook that handles clicking outside of a component, used for closing the suggestions dropdown.

### UI Components

#### Input.tsx
A base input component with proper styling and accessibility features.

## Installation Steps

1. **Copy Files**
   Copy the entire directory structure to your project, maintaining the same hierarchy:
   ```
   google-places-autocomplete/
   ├── components/ -> packages/ui/form/
   ├── api/ -> apps/web/pages/api/
   ├── lib/hooks/ -> packages/lib/hooks/
   ├── ui/ -> packages/ui/form/
   └── public/ -> public/
   ```

2. **Update Dependencies**
   Add the following dependencies to your project:
   ```bash
   yarn add @googlemaps/google-maps-services-js
   ```

3. **Environment Variables**
   Add the following to your `.env` file:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   ```
   Make sure your Google API key has the following APIs enabled:
   - Places API
   - Geocoding API
   - Maps JavaScript API

4. **Import the Component**
   Add the following export to `packages/ui/index.ts`:
   ```typescript
   export { default as LocationsAutocomplete } from "./form/LocationsAutocomplete";
   ```

5. **Usage**
   ```typescript
   import { LocationsAutocomplete } from "@calcom/ui";

   function YourComponent() {
     return (
       <LocationsAutocomplete
         value={locationValue}
         onChange={(location) => {
           // Handle location change
         }}
         onError={(error) => {
           // Handle error
         }}
       />
     );
   }
   ```

## Component Props

### LocationsAutocomplete
| Prop | Type | Description |
|------|------|-------------|
| value | string | The current location value |
| onChange | (location: string) => void | Callback when location changes |
| onError | (error: Error) => void | Callback when an error occurs |
| placeholder | string | Placeholder text for the input |
| name | string | Input name attribute |
| required | boolean | Whether the input is required |
| watchInitialValue | boolean | Whether to watch for changes to initial value |

## API Endpoint

The `/api/location-autocomplete` endpoint accepts the following query parameters:
- `place`: The search string for location lookup

Returns:
```typescript
{
  predictions: Array<{
    description: string;
    place_id: string;
  }>;
}
```

## Security Considerations

1. The API key is kept secure on the server side
2. Rate limiting is implemented on the API endpoint
3. Input validation is performed on both client and server
4. Debouncing prevents excessive API calls

## Troubleshooting

Common issues and solutions:

1. **No predictions appearing**
   - Verify Google API key is valid
   - Check if Places API is enabled
   - Verify network requests in browser dev tools
   - Check if the location is within the specified radius and country

2. **API errors**
   - Check server logs for detailed error messages
   - Verify environment variables are properly set
   - Ensure API key has proper permissions
   - Verify the API quota hasn't been exceeded

3. **Styling issues**
   - Make sure all required CSS classes are available
   - Check if the map-pin-dark.svg file is in the correct location
   - Verify the dark mode classes are working correctly

## Notes

- The component uses debouncing to prevent excessive API calls
- Location data is cached to improve performance
- The component is fully typed with TypeScript
- Accessibility features are built-in
- The implementation includes proper error handling
- The search is restricted to addresses only
- Results are limited to a specific radius and country (configurable)
- Dark mode support is included