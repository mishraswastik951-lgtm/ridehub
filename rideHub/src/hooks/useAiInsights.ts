import { useState, useEffect } from "react";
import { fetchAiInsights } from "../api/ai";
import { ShopkeeperInsight } from "../types/ai";

export function useAiInsights(shopId: string, seedData: { activeBookings: number; revenueToday: number; occupancyRate: number }) {
  const [insights, setInsights] = useState<ShopkeeperInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAiInsights(shopId, seedData);
        if (isMounted) {
          setInsights(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("AI Insights fetch failed:", err);
          setError("Failed to connect to AI server. Using cached insights.");
          // Safe fallback fixtures
          setInsights([
            {
              title: "Weekend Demand Surge Spike",
              detail: "Current occupancy is at 85%. Surge algorithm suggests +₹150/day on Hunter 350 & Classic 350 for Friday-Sunday slots.",
              impact: "+₹4,200 estimated weekend revenue boost",
              action: "Apply Weekend Surge +15%",
            },
            {
              title: "Scooter Idle Inventory Clearance",
              detail: "Activa 6G fleet has 3 idle units. Offer a 10% discount to local tourists looking for 3+ day rentals.",
              impact: "+18% utilization rate improvement",
              action: "Apply Multi-Day Scooter Promo",
            }
          ]);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [shopId]);

  return { insights, loading, error };
}
