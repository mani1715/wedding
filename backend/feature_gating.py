"""
PHASE 33: Feature Gating & Monetization System
Mock payment system with plan-based feature access control
"""

from enum import Enum
from typing import Optional, Dict, Any
from datetime import datetime, timezone


class PlanType(str, Enum):
    """Available subscription plans"""
    FREE = "FREE"
    SILVER = "SILVER"
    GOLD = "GOLD"
    PLATINUM = "PLATINUM"


class Feature(str, Enum):
    """All gated features in the application"""
    # Media Features
    BACKGROUND_MUSIC = "background_music"
    HERO_VIDEO = "hero_video"
    GALLERY_UNLIMITED = "gallery_unlimited"
    GALLERY_LIMITED = "gallery_limited"
    
    # Analytics Features
    ANALYTICS_BASIC = "analytics_basic"
    ANALYTICS_ADVANCED = "analytics_advanced"
    
    # Security Features
    PASSCODE_PROTECTION = "passcode_protection"
    
    # AI Features
    AI_TRANSLATION = "ai_translation"
    AI_DESCRIPTION = "ai_description"
    
    # Design Features
    PREMIUM_DESIGNS = "premium_designs"
    CUSTOM_COLORS = "custom_colors"
    
    # Other Features
    NO_WATERMARK = "no_watermark"
    EVENT_WISE_GALLERY = "event_wise_gallery"
    RSVP_MANAGEMENT = "rsvp_management"
    GUEST_WISHES = "guest_wishes"


# Feature access matrix: Plan -> Enabled Features
FEATURE_ACCESS: Dict[PlanType, set] = {
    PlanType.FREE: {
        Feature.GUEST_WISHES,
        Feature.RSVP_MANAGEMENT,
        # NO watermark removal
        # NO music, video, analytics, AI
    },
    
    PlanType.SILVER: {
        Feature.GUEST_WISHES,
        Feature.RSVP_MANAGEMENT,
        Feature.BACKGROUND_MUSIC,
        Feature.GALLERY_LIMITED,
        Feature.ANALYTICS_BASIC,
        Feature.NO_WATERMARK,
        Feature.CUSTOM_COLORS,
    },
    
    PlanType.GOLD: {
        Feature.GUEST_WISHES,
        Feature.RSVP_MANAGEMENT,
        Feature.BACKGROUND_MUSIC,
        Feature.HERO_VIDEO,
        Feature.GALLERY_LIMITED,
        Feature.EVENT_WISE_GALLERY,
        Feature.ANALYTICS_BASIC,
        Feature.ANALYTICS_ADVANCED,
        Feature.PASSCODE_PROTECTION,
        Feature.NO_WATERMARK,
        Feature.CUSTOM_COLORS,
        Feature.PREMIUM_DESIGNS,
    },
    
    PlanType.PLATINUM: {
        # ALL FEATURES
        Feature.GUEST_WISHES,
        Feature.RSVP_MANAGEMENT,
        Feature.BACKGROUND_MUSIC,
        Feature.HERO_VIDEO,
        Feature.GALLERY_UNLIMITED,
        Feature.EVENT_WISE_GALLERY,
        Feature.ANALYTICS_BASIC,
        Feature.ANALYTICS_ADVANCED,
        Feature.PASSCODE_PROTECTION,
        Feature.AI_TRANSLATION,
        Feature.AI_DESCRIPTION,
        Feature.NO_WATERMARK,
        Feature.CUSTOM_COLORS,
        Feature.PREMIUM_DESIGNS,
    }
}


# Gallery limits per plan
GALLERY_LIMITS: Dict[PlanType, Optional[int]] = {
    PlanType.FREE: 0,  # No gallery
    PlanType.SILVER: 10,  # Max 10 images
    PlanType.GOLD: 50,  # Max 50 images
    PlanType.PLATINUM: None,  # Unlimited
}


def has_feature(profile_data: Dict[str, Any], feature: Feature) -> bool:
    """
    Central feature gating function.
    Checks if a profile has access to a specific feature.
    
    Args:
        profile_data: Dictionary containing profile information (must have 'plan_type' and 'plan_expires_at')
        feature: Feature to check access for
        
    Returns:
        bool: True if feature is accessible, False otherwise
    """
    # Get plan type (default to FREE)
    plan_type_str = profile_data.get('plan_type', 'FREE')
    
    # Convert to PlanType enum
    try:
        plan_type = PlanType(plan_type_str)
    except ValueError:
        # Invalid plan type, default to FREE
        plan_type = PlanType.FREE
    
    # Check if plan is expired (only for paid plans)
    if plan_type != PlanType.FREE:
        plan_expires_at = profile_data.get('plan_expires_at')
        if plan_expires_at:
            # If plan_expires_at is a datetime object
            if isinstance(plan_expires_at, datetime):
                expiry_date = plan_expires_at
            # If it's a string, parse it
            elif isinstance(plan_expires_at, str):
                try:
                    expiry_date = datetime.fromisoformat(plan_expires_at.replace('Z', '+00:00'))
                except (ValueError, AttributeError):
                    # Invalid date format, treat as expired
                    plan_type = PlanType.FREE
                    expiry_date = None
            else:
                expiry_date = None
            
            # Check if expired
            if expiry_date and expiry_date < datetime.now(timezone.utc):
                # Plan expired, downgrade to FREE
                plan_type = PlanType.FREE
    
    # Check feature access
    allowed_features = FEATURE_ACCESS.get(plan_type, set())
    return feature in allowed_features


def get_gallery_limit(profile_data: Dict[str, Any]) -> Optional[int]:
    """
    Get gallery image limit for a profile's plan.
    
    Args:
        profile_data: Dictionary containing profile information
        
    Returns:
        Optional[int]: Max number of images allowed (None = unlimited, 0 = no gallery)
    """
    plan_type_str = profile_data.get('plan_type', 'FREE')
    
    try:
        plan_type = PlanType(plan_type_str)
    except ValueError:
        plan_type = PlanType.FREE
    
    # Check expiry for paid plans
    if plan_type != PlanType.FREE:
        plan_expires_at = profile_data.get('plan_expires_at')
        if plan_expires_at:
            if isinstance(plan_expires_at, datetime):
                expiry_date = plan_expires_at
            elif isinstance(plan_expires_at, str):
                try:
                    expiry_date = datetime.fromisoformat(plan_expires_at.replace('Z', '+00:00'))
                except (ValueError, AttributeError):
                    plan_type = PlanType.FREE
                    expiry_date = None
            else:
                expiry_date = None
            
            if expiry_date and expiry_date < datetime.now(timezone.utc):
                plan_type = PlanType.FREE
    
    return GALLERY_LIMITS.get(plan_type, 0)


def get_feature_flags(profile_data: Dict[str, Any]) -> Dict[str, bool]:
    """
    Get all feature flags for a profile.
    Computed dynamically based on plan and expiry.
    
    Args:
        profile_data: Dictionary containing profile information
        
    Returns:
        Dict[str, bool]: Dictionary of feature names to access status
    """
    feature_flags = {}
    
    # Check all features
    for feature in Feature:
        feature_flags[feature.value] = has_feature(profile_data, feature)
    
    return feature_flags


def requires_watermark(profile_data: Dict[str, Any]) -> bool:
    """
    Check if profile should display watermark.
    FREE plan ALWAYS shows watermark.
    Paid plans NEVER show watermark.
    
    Args:
        profile_data: Dictionary containing profile information
        
    Returns:
        bool: True if watermark should be shown
    """
    return not has_feature(profile_data, Feature.NO_WATERMARK)


def get_plan_info(plan_type: str) -> Dict[str, Any]:
    """
    Get plan information for display purposes.
    
    Args:
        plan_type: Plan type string
        
    Returns:
        Dict with plan details
    """
    plan_details = {
        "FREE": {
            "name": "Free",
            "color": "gray",
            "features": [
                "Basic invitation",
                "RSVP management",
                "Guest wishes",
                "Limited designs",
                "Watermark included"
            ],
            "limitations": [
                "No video support",
                "No analytics",
                "No background music",
                "No gallery"
            ]
        },
        "SILVER": {
            "name": "Silver",
            "color": "blue",
            "features": [
                "Background music",
                "Limited gallery (10 images)",
                "Basic analytics",
                "Custom colors",
                "No watermark"
            ],
            "limitations": [
                "No video support",
                "Limited analytics",
                "No AI features"
            ]
        },
        "GOLD": {
            "name": "Gold",
            "color": "yellow",
            "features": [
                "Hero video",
                "Event-wise gallery (50 images)",
                "Advanced analytics",
                "Passcode protection",
                "Premium designs",
                "No watermark"
            ],
            "limitations": [
                "No AI features",
                "Limited gallery"
            ]
        },
        "PLATINUM": {
            "name": "Platinum",
            "color": "purple",
            "features": [
                "✨ All features unlocked",
                "AI translation",
                "AI descriptions",
                "Unlimited gallery",
                "Advanced analytics",
                "Premium support"
            ],
            "limitations": []
        }
    }
    
    return plan_details.get(plan_type, plan_details["FREE"])
