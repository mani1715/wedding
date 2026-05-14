"""
PHASE 37: Wedding Credit Pricing Configuration

This module defines credit costs for designs and features.
Super Admin can modify these values via API in future phases.
"""

from typing import Dict, List, Optional
from models import DesignPricing, FeaturePricing

# ==========================================
# DESIGN PRICING
# ==========================================

DESIGN_PRICING: List[Dict] = [
    {
        "design_key": "royal_heritage",
        "design_name": "Royal Heritage",
        "credit_cost": 100,
        "description": "Crimson and gold traditional design"
    },
    {
        "design_key": "temple_gold",
        "design_name": "Temple Gold",
        "credit_cost": 100,
        "description": "Golden temple-inspired design"
    },
    {
        "design_key": "peacock_dream",
        "design_name": "Peacock Dream",
        "credit_cost": 150,
        "description": "Teal and emerald modern design"
    },
    {
        "design_key": "modern_lotus",
        "design_name": "Modern Lotus",
        "credit_cost": 150,
        "description": "Pink and purple elegant design"
    },
    {
        "design_key": "modern_pastel",
        "design_name": "Modern Pastel",
        "credit_cost": 200,
        "description": "Rose and sage sophisticated design"
    },
    {
        "design_key": "midnight_sangeet",
        "design_name": "Midnight Sangeet",
        "credit_cost": 200,
        "description": "Indigo and silver festive design"
    },
    {
        "design_key": "ivory_elegance",
        "design_name": "Ivory Elegance",
        "credit_cost": 300,
        "description": "Premium ivory and champagne design"
    },
    {
        "design_key": "dark_royal",
        "design_name": "Dark Royal",
        "credit_cost": 300,
        "description": "Luxury purple and gold design"
    },
]

# ==========================================
# FEATURE PRICING
# ==========================================

FEATURE_PRICING: List[Dict] = [
    # Gallery Features
    {
        "feature_key": "photo_gallery",
        "feature_name": "Photo Gallery",
        "credit_cost": 50,
        "description": "Upload and display wedding photos",
        "category": "gallery"
    },
    {
        "feature_key": "video_gallery",
        "feature_name": "Video Gallery",
        "credit_cost": 75,
        "description": "Upload and display wedding videos",
        "category": "gallery"
    },
    {
        "feature_key": "unlimited_photos",
        "feature_name": "Unlimited Photos",
        "credit_cost": 100,
        "description": "No limit on photo uploads",
        "category": "gallery"
    },
    
    # RSVP Features
    {
        "feature_key": "rsvp_system",
        "feature_name": "RSVP System",
        "credit_cost": 50,
        "description": "Guest response management",
        "category": "rsvp"
    },
    {
        "feature_key": "meal_preferences",
        "feature_name": "Meal Preferences",
        "credit_cost": 25,
        "description": "Collect guest meal choices",
        "category": "rsvp"
    },
    {
        "feature_key": "plus_one_tracking",
        "feature_name": "Plus One Tracking",
        "credit_cost": 25,
        "description": "Track additional guests",
        "category": "rsvp"
    },
    
    # Guest Engagement
    {
        "feature_key": "guest_wishes",
        "feature_name": "Guest Wishes",
        "credit_cost": 30,
        "description": "Allow guests to leave wishes",
        "category": "engagement"
    },
    {
        "feature_key": "guest_photos",
        "feature_name": "Guest Photo Upload",
        "credit_cost": 50,
        "description": "Let guests upload their photos",
        "category": "engagement"
    },
    {
        "feature_key": "live_streaming",
        "feature_name": "Live Streaming",
        "credit_cost": 200,
        "description": "Stream wedding ceremony live",
        "category": "engagement"
    },
    
    # Premium Features
    {
        "feature_key": "custom_domain",
        "feature_name": "Custom Domain",
        "credit_cost": 150,
        "description": "Use your own domain name",
        "category": "premium"
    },
    {
        "feature_key": "no_watermark",
        "feature_name": "Remove Watermark",
        "credit_cost": 50,
        "description": "Remove platform branding",
        "category": "premium"
    },
    {
        "feature_key": "advanced_analytics",
        "feature_name": "Advanced Analytics",
        "credit_cost": 75,
        "description": "Detailed guest tracking and insights",
        "category": "premium"
    },
    
    # Design Enhancements
    {
        "feature_key": "animation_effects",
        "feature_name": "Animation Effects",
        "credit_cost": 40,
        "description": "Premium animations and transitions",
        "category": "design"
    },
    {
        "feature_key": "background_music",
        "feature_name": "Background Music",
        "credit_cost": 30,
        "description": "Add custom background music",
        "category": "design"
    },
    {
        "feature_key": "video_background",
        "feature_name": "Video Background",
        "credit_cost": 60,
        "description": "Use video as background",
        "category": "design"
    },
    
    # Multi-event Support
    {
        "feature_key": "multiple_events",
        "feature_name": "Multiple Events",
        "credit_cost": 75,
        "description": "Create multiple event pages",
        "category": "events"
    },
    {
        "feature_key": "event_countdown",
        "feature_name": "Event Countdown",
        "credit_cost": 20,
        "description": "Display countdown timers",
        "category": "events"
    },
    {
        "feature_key": "event_schedule",
        "feature_name": "Event Schedule",
        "credit_cost": 25,
        "description": "Detailed event timeline",
        "category": "events"
    },
    
    # Location & Travel
    {
        "feature_key": "google_maps",
        "feature_name": "Google Maps Integration",
        "credit_cost": 20,
        "description": "Show venue location on map",
        "category": "location"
    },
    {
        "feature_key": "travel_info",
        "feature_name": "Travel Information",
        "credit_cost": 15,
        "description": "Hotel and travel details",
        "category": "location"
    },
    
    # QR & Sharing
    {
        "feature_key": "qr_code",
        "feature_name": "QR Code Generation",
        "credit_cost": 10,
        "description": "Generate shareable QR code",
        "category": "sharing"
    },
    {
        "feature_key": "social_sharing",
        "feature_name": "Social Sharing",
        "credit_cost": 15,
        "description": "Share on social media",
        "category": "sharing"
    },
]


def get_design_pricing() -> List[DesignPricing]:
    """Get all design pricing configurations"""
    return [DesignPricing(**design) for design in DESIGN_PRICING]


def get_feature_pricing() -> List[FeaturePricing]:
    """Get all feature pricing configurations"""
    return [FeaturePricing(**feature) for feature in FEATURE_PRICING]


def get_design_cost(design_key: str) -> int:
    """Get credit cost for a specific design"""
    for design in DESIGN_PRICING:
        if design["design_key"] == design_key:
            return design["credit_cost"]
    return 0  # Default design or not found


def get_feature_cost(feature_key: str) -> int:
    """Get credit cost for a specific feature"""
    for feature in FEATURE_PRICING:
        if feature["feature_key"] == feature_key:
            return feature["credit_cost"]
    return 0  # Feature not found


def calculate_total_cost(design_key: Optional[str], feature_keys: List[str]) -> Dict[str, int]:
    """
    Calculate total credit cost for a wedding configuration
    
    Returns:
        {
            "design_cost": int,
            "features_cost": int,
            "total_cost": int
        }
    """
    design_cost = get_design_cost(design_key) if design_key else 0
    features_cost = sum(get_feature_cost(key) for key in feature_keys)
    
    return {
        "design_cost": design_cost,
        "features_cost": features_cost,
        "total_cost": design_cost + features_cost
    }


def get_feature_cost_breakdown(feature_keys: List[str]) -> Dict[str, int]:
    """Get individual cost for each feature"""
    return {key: get_feature_cost(key) for key in feature_keys}
