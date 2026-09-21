import { useState, useEffect, useRef, useCallback } from "react";
import { LatLng } from "../config/gpsConfig";

// Bearing calculation in degrees between two lat/lng points
function calculateBearing(start: LatLng, end: LatLng): number {
  const startLat = (start.lat * Math.PI) / 180;
  const startLng = (start.lng * Math.PI) / 180;
  const endLat = (end.lat * Math.PI) / 180;
  const endLng = (end.lng * Math.PI) / 180;

  const dLng = endLng - startLng;
  const y = Math.sin(dLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Distance calculation in km between two lat/lng points
function calculateDistanceKm(p1: LatLng, p2: LatLng): number {
  const R = 6371; // Earth radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export type DeliveryStatusStep =
  | "confirmed"
  | "rider_assigned"
  | "vehicle_prepared"
  | "on_the_way"
  | "arrived"
  | "handover";

export interface UseMockMovementOptions {
  route: LatLng[];
  speedMultiplier?: number;
  initialEtaMinutes?: number;
  initialDistanceKm?: number;
}

export function useMockMovement({
  route,
  speedMultiplier = 1,
  initialEtaMinutes = 12,
  initialDistanceKm = 5.4,
}: UseMockMovementOptions) {
  const [stepIndex, setStepIndex] = useState(0);
  const [multiplier, setMultiplier] = useState(speedMultiplier);
  const [isDelayed, setIsDelayed] = useState(false);
  const [isGpsLost, setIsGpsLost] = useState(false);
  const [isOverdue, setIsOverdue] = useState(false);
  const [manualEtaOffset, setManualEtaOffset] = useState(0);

  // Check prefers-reduced-motion
  const prefersReducedMotionRef = useRef<boolean>(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const totalPoints = route.length;
  const currentPos = route[stepIndex] || route[0];
  const nextPos = route[Math.min(stepIndex + 1, totalPoints - 1)];

  const heading = calculateBearing(currentPos, nextPos);

  // Calculate distance travelled vs remaining
  const traveledPath = route.slice(0, stepIndex + 1);
  const remainingPath = route.slice(stepIndex);

  let totalTraveledKm = 0;
  for (let i = 1; i < traveledPath.length; i++) {
    totalTraveledKm += calculateDistanceKm(traveledPath[i - 1], traveledPath[i]);
  }

  let totalRemainingKm = 0;
  for (let i = 1; i < remainingPath.length; i++) {
    totalRemainingKm += calculateDistanceKm(remainingPath[i - 1], remainingPath[i]);
  }
  if (totalRemainingKm === 0 && stepIndex < totalPoints - 1) {
    totalRemainingKm = initialDistanceKm;
  }

  // ETA Calculation
  const progressRatio = stepIndex / (totalPoints - 1 || 1);
  const baseEta = Math.max(0, Math.ceil(initialEtaMinutes * (1 - progressRatio)));
  const effectiveEta = baseEta + (isDelayed ? 12 : 0) + manualEtaOffset;

  const isArrived = stepIndex >= totalPoints - 1;

  // Compute status step
  let statusStep: DeliveryStatusStep = "on_the_way";
  if (stepIndex === 0) statusStep = "rider_assigned";
  if (stepIndex >= totalPoints - 1) statusStep = "arrived";

  // Step timer loop every 2 seconds
  useEffect(() => {
    if (isArrived || isGpsLost) return;

    const intervalTime = Math.max(400, 2000 / multiplier);
    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < totalPoints - 1) return prev + 1;
        return prev;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [totalPoints, multiplier, isArrived, isGpsLost]);

  const advanceStep = useCallback(() => {
    setStepIndex((prev) => Math.min(prev + 1, totalPoints - 1));
  }, [totalPoints]);

  const resetMovement = useCallback(() => {
    setStepIndex(0);
    setIsDelayed(false);
    setIsGpsLost(false);
    setIsOverdue(false);
    setManualEtaOffset(0);
  }, []);

  const triggerDelay = useCallback(() => {
    setIsDelayed((prev) => !prev);
  }, []);

  const triggerSignalDrop = useCallback(() => {
    setIsGpsLost((prev) => !prev);
  }, []);

  const triggerOverdue = useCallback(() => {
    setIsOverdue((prev) => !prev);
  }, []);

  return {
    currentPos,
    nextPos,
    heading,
    stepIndex,
    totalPoints,
    traveledPath,
    remainingPath,
    distanceTravelledKm: Math.round(totalTraveledKm * 10) / 10,
    distanceRemainingKm: Math.round(totalRemainingKm * 10) / 10,
    etaMinutes: effectiveEta,
    isArrived,
    statusStep,
    multiplier,
    setMultiplier,
    isDelayed,
    isGpsLost,
    isOverdue,
    otp: "4892",
    prefersReducedMotion: prefersReducedMotionRef.current,
    advanceStep,
    resetMovement,
    triggerDelay,
    triggerSignalDrop,
    triggerOverdue,
  };
}
