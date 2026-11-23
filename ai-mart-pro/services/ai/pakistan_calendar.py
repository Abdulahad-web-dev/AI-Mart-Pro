"""Pakistan Commercial & Cultural Calendar for E-Commerce Demand Modeling.
Includes official statutory holidays, Islamic festival windows (Ramadan, Eid ul-Fitr, Eid ul-Adha),
commercial sales (11.11, Blessed Friday), and the monthly salary liquidity cycle (25th to 5th).
"""
from datetime import date, timedelta
from typing import Tuple, Dict, Any

# Approximate Islamic festival windows (Gregorian mapping 2024-2028)
# Actual sighting dates may vary by +/- 1 day; captured as multi-day windows for retail anticipation.
ISLAMIC_WINDOWS = [
    # 2024
    ("Ramadan", date(2024, 3, 11), date(2024, 4, 9)),
    ("Eid ul-Fitr Shopping & Festival", date(2024, 4, 1), date(2024, 4, 13)),
    ("Eid ul-Adha", date(2024, 6, 15), date(2024, 6, 19)),
    ("Ashura (9-10 Muharram)", date(2024, 7, 16), date(2024, 7, 17)),
    ("Eid Milad-un-Nabi", date(2024, 9, 16), date(2024, 9, 17)),
    # 2025
    ("Ramadan", date(2025, 3, 1), date(2025, 3, 29)),
    ("Eid ul-Fitr Shopping & Festival", date(2025, 3, 22), date(2025, 4, 2)),
    ("Eid ul-Adha", date(2025, 6, 5), date(2025, 6, 9)),
    ("Ashura (9-10 Muharram)", date(2025, 7, 5), date(2025, 7, 6)),
    ("Eid Milad-un-Nabi", date(2025, 9, 5), date(2025, 9, 6)),
    # 2026
    ("Ramadan", date(2026, 2, 18), date(2026, 3, 19)),
    ("Eid ul-Fitr Shopping & Festival", date(2026, 3, 11), date(2026, 3, 23)),
    ("Eid ul-Adha", date(2026, 5, 26), date(2026, 5, 30)),
    ("Ashura (9-10 Muharram)", date(2026, 6, 24), date(2026, 6, 25)),
    ("Eid Milad-un-Nabi", date(2026, 8, 25), date(2026, 8, 26)),
    # 2027
    ("Ramadan", date(2027, 2, 8), date(2027, 3, 8)),
    ("Eid ul-Fitr Shopping & Festival", date(2027, 3, 1), date(2027, 3, 12)),
    ("Eid ul-Adha", date(2027, 5, 15), date(2027, 5, 19)),
    ("Ashura (9-10 Muharram)", date(2027, 6, 14), date(2027, 6, 15)),
    ("Eid Milad-un-Nabi", date(2027, 8, 14), date(2027, 8, 15)),
]

FIXED_PAKISTAN_HOLIDAYS = {
    (2, 5): "Kashmir Day",
    (3, 23): "Pakistan Day",
    (5, 1): "Labour Day",
    (8, 14): "Independence Day (Azadi)",
    (9, 6): "Defense Day",
    (11, 9): "Iqbal Day",
    (12, 25): "Quaid-e-Azam Day / Christmas"
}


def is_blessed_friday(d: date) -> bool:
    """Returns True if the date is the final Friday of November (Blessed Friday / Black Friday)."""
    if d.month == 11 and d.weekday() == 4:  # Friday
        return (d + timedelta(days=7)).month == 12
    return False


def get_pakistan_event(d: date) -> Tuple[bool, str, float]:
    """Returns (is_event, event_name, expected_commercial_multiplier)."""
    # 1. 11.11 Mega Sale (Largest ecommerce GMV event in Pakistan)
    if d.month == 11 and d.day == 11:
        return True, "11.11 Mega Sale", 2.20

    # 2. Blessed Friday (Final Friday of November)
    if is_blessed_friday(d):
        return True, "Blessed Friday Sale", 1.85

    # 3. Fixed statutory holidays
    if (d.month, d.day) in FIXED_PAKISTAN_HOLIDAYS:
        name = FIXED_PAKISTAN_HOLIDAYS[(d.month, d.day)]
        multiplier = 1.45 if d.month == 8 and d.day == 14 else 1.20
        return True, name, multiplier

    # 4. Islamic Windows
    for name, start, end in ISLAMIC_WINDOWS:
        if start <= d <= end:
            if "Eid ul-Fitr" in name:
                mult = 1.90
            elif "Eid ul-Adha" in name:
                mult = 1.65
            elif "Ramadan" in name:
                mult = 1.25
            else:
                mult = 1.10
            return True, name, mult

    return False, "Regular Day", 1.0


def is_salary_cycle(d: date) -> bool:
    """True between 25th of current month and 5th of next month (peak liquidity in Pakistan)."""
    return d.day >= 25 or d.day <= 5


def get_calendar_feature_vector(d: date) -> Dict[str, Any]:
    """Extracts Pakistani temporal & commercial features for forecasting models."""
    is_event, event_name, event_mult = get_pakistan_event(d)
    is_sal = is_salary_cycle(d)
    dow = d.weekday()
    is_wknd = 1 if dow in (4, 5, 6) else 0  # Friday, Saturday, Sunday

    # Composite promotional & retail surge flag
    is_promo_surge = 1 if (is_event and event_mult >= 1.4) or (is_sal and is_wknd) else 0

    return {
        "day_of_week": dow,
        "day_of_month": d.day,
        "month": d.month,
        "is_weekend": is_wknd,
        "is_salary_week": 1 if is_sal else 0,
        "is_event": 1 if is_event else 0,
        "event_multiplier": event_mult,
        "is_promo_surge": is_promo_surge,
        "event_name": event_name,
    }
