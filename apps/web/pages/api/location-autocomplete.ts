import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { input } = req.query;

  if (!input || typeof input !== "string") {
    return res.status(400).json({ message: "Input parameter is required" });
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&types=address&components=country:ca&location=45.4215,-75.6972&radius=50000&key=${
        process.env.NEXT_PUBLIC_GOOGLE_API_KEY
      }`
    );

    const data = await response.json();

    if (data.status === "OK" || data.status === "ZERO_RESULTS") {
      return res.status(200).json({
        predictions: data.predictions?.map((p: { description: string }) => p.description) || [],
      });
    }

    console.error("Google Places API Error:", data);
    return res.status(500).json({ error: "Failed to fetch predictions", status: data.status });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
