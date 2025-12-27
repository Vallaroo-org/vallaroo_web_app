export interface DistanceResult {
    [shopId: string]: string; // Distance in km formatted as string
}

const OSRM_API_BASE = 'http://router.project-osrm.org/table/v1/driving';

interface LocationShop {
    id: string;
    latitude?: number;
    longitude?: number;
}

// Simple in-memory cache: key = `${shopId}_${startLat}_${startLng}`, value = distance string
const distanceCache = new Map<string, string>();

// Request queue to serialize API calls
const requestQueue: (() => Promise<void>)[] = [];
let isProcessingQueue = false;

const processQueue = async () => {
    if (isProcessingQueue) return;
    isProcessingQueue = true;

    while (requestQueue.length > 0) {
        const task = requestQueue.shift();
        if (task) {
            try {
                await task();
            } catch (err) {
                console.error("Error processing location task:", err);
            }
        }
        // Wait 1 second between requests to respect OSRM demo server rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    isProcessingQueue = false;
};

export const getDrivingDistances = async (
    startLat: number,
    startLng: number,
    shops: LocationShop[]
): Promise<DistanceResult> => {
    // 1. Check Cache first
    const results: DistanceResult = {};
    const shopsToFetch: LocationShop[] = [];

    shops.forEach(shop => {
        const key = `${shop.id}_${startLat}_${startLng}`;
        if (distanceCache.has(key)) {
            results[shop.id] = distanceCache.get(key)!;
        } else if (shop.latitude != null && shop.longitude != null) {
            shopsToFetch.push(shop);
        }
    });

    if (shopsToFetch.length === 0) {
        return results;
    }

    // 2. Queue the fetch for remaining shops
    return new Promise<DistanceResult>((resolve) => {
        requestQueue.push(async () => {
            const BATCH_SIZE = 25; // Reduce batch size slightly to be safe

            for (let i = 0; i < shopsToFetch.length; i += BATCH_SIZE) {
                const batch = shopsToFetch.slice(i, i + BATCH_SIZE);

                try {
                    const coords = [`${startLng},${startLat}`];
                    batch.forEach(shop => {
                        coords.push(`${shop.longitude},${shop.latitude}`);
                    });

                    const coordsString = coords.join(';');
                    const url = `${OSRM_API_BASE}/${coordsString}?sources=0&annotations=distance`;

                    const response = await fetch(url);

                    if (response.status === 429) {
                        console.warn("OSRM Rate Limit hit, waiting longer...");
                        await new Promise(r => setTimeout(r, 2000));
                        // Ideally strictly retry, but for simplicity we skip this batch to avoid infinite loops 
                        // or complex retry logic in this simple queue.
                        // A better approach would be to unshift this task back? 
                        // For now, let's just log and continue. Use cache next time.
                        continue;
                    }

                    if (!response.ok) {
                        console.error(`OSRM API error: ${response.status}`);
                        continue;
                    }

                    const data = await response.json();

                    if (data.code === 'Ok' && data.distances && data.distances[0]) {
                        const distanceArray = data.distances[0];
                        batch.forEach((shop, index) => {
                            const distanceMeters = distanceArray[index + 1];
                            if (distanceMeters !== null && distanceMeters !== undefined) {
                                const distanceKm = (distanceMeters / 1000).toFixed(1);
                                results[shop.id] = distanceKm;
                                // Update Cache
                                distanceCache.set(`${shop.id}_${startLat}_${startLng}`, distanceKm);
                            }
                        });
                    }
                } catch (error) {
                    console.error('Error in batched distance fetch:', error);
                }

                // Small delay between batches even within the same task
                if (i + BATCH_SIZE < shopsToFetch.length) {
                    await new Promise(r => setTimeout(r, 1000));
                }
            }

            resolve(results);
        });

        processQueue();
    });
};

export const getPlaceName = async (lat: number, lng: number): Promise<string | null> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
            {
                headers: {
                    'User-Agent': 'VallarooWebApp/1.0'
                }
            }
        );

        if (!response.ok) return null;

        const data = await response.json();

        // exact structure depends on location, usually address.city, address.town, address.village
        if (data.address) {
            return data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.county || "Unknown Location";
        }

        return null;
    } catch (error) {
        console.error('Error fetching place name:', error);
        return null;
    }
};

export interface GeocodeResult {
    latitude: number;
    longitude: number;
    displayName: string;
}

export const geocodeLocation = async (locationName: string): Promise<GeocodeResult | null> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`,
            {
                headers: {
                    'User-Agent': 'VallarooWebApp/1.0'
                }
            }
        );

        if (!response.ok) return null;

        const data = await response.json();

        if (data && data.length > 0) {
            const result = data[0];
            return {
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon),
                displayName: result.display_name
            };
        }

        return null;
    } catch (error) {
        console.error('Error geocoding location:', error);
        return null;
    }
};
