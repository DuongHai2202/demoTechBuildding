package com.techbuildding.demoTechBuildding.util;

/**
 * Utility class for geographic calculations.
 *
 * Uses the Haversine formula to calculate the great-circle distance
 * between two GPS coordinates on Earth's surface.
 *
 * Formula accuracy: ~0.5% error for short distances (< 20km),
 * which is more than sufficient for geofencing (typically < 500m).
 */
public class GeoUtils {

    private static final double EARTH_RADIUS_METERS = 6_371_000; // Earth radius in meters

    /**
     * Calculate the distance between two GPS coordinates using the Haversine
     * formula.
     *
     * @param lat1 Latitude of point 1 (degrees)
     * @param lon1 Longitude of point 1 (degrees)
     * @param lat2 Latitude of point 2 (degrees)
     * @param lon2 Longitude of point 2 (degrees)
     * @return Distance in meters
     */
    public static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_METERS * c;
    }

    /**
     * Check if a point is within the geofencing radius of a project.
     *
     * @param projectLat   Latitude of project center
     * @param projectLon   Longitude of project center
     * @param radiusMeters Geofencing radius in meters
     * @param userLat      User's current latitude
     * @param userLon      User's current longitude
     * @return true if user is within the radius
     */
    public static boolean isWithinRadius(double projectLat, double projectLon,
            int radiusMeters,
            double userLat, double userLon) {
        double distance = calculateDistance(projectLat, projectLon, userLat, userLon);
        return distance <= radiusMeters;
    }

    private GeoUtils() {
        // Prevent instantiation
    }
}
