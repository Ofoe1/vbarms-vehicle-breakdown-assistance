import { useEffect, useState } from "react";
import {
  watchDriverRequests, watchProviderAssignedRequests, watchProviderProfile,
  watchAvailableProviders,
} from "../lib/firestore";

export function useDriverRequests(driverId) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!driverId) return;
    setLoading(true);
    const unsub = watchDriverRequests(driverId, (list) => {
      setRequests(list);
      setLoading(false);
    });
    return unsub;
  }, [driverId]);

  return { requests, loading };
}

export function useProviderAssignedRequests(providerId) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!providerId) return;
    setLoading(true);
    const unsub = watchProviderAssignedRequests(providerId, (list) => {
      setRequests(list);
      setLoading(false);
    });
    return unsub;
  }, [providerId]);

  return { requests, loading };
}

export function useProviderProfile(providerId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!providerId) return;
    setLoading(true);
    const unsub = watchProviderProfile(providerId, (p) => {
      setProfile(p);
      setLoading(false);
    });
    return unsub;
  }, [providerId]);

  return { profile, loading };
}

export function useAvailableProviders(breakdownType) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = watchAvailableProviders(breakdownType, (list) => {
      setProviders(list);
      setLoading(false);
    });
    return unsub;
  }, [breakdownType]);

  return { providers, loading };
}
