from datetime import date

from sqlalchemy import Connection
from sqlalchemy.dialects.postgresql import insert as postgresql_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert

from ..models import MandiPrice

TAMIL_NADU_DISTRICTS = [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul",
    "Erode", "Kallakurichi", "Kancheepuram", "Kanniyakumari", "Karur", "Krishnagiri", "Madurai",
    "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
    "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni",
    "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur",
    "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar",
]

INDIAN_STATES_AND_UTS = [
    "Tamil Nadu", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
    "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry",
]

CROP_CATALOG = [
    {"category": "Food grains", "crop": "Paddy", "tamil_name": "நெல்", "aliases": ["Rice", "Paddy", "Nellu"], "base_price": 2200},
    {"category": "Food grains", "crop": "Rice", "tamil_name": "அரிசி", "aliases": ["Rice", "Paddy", "Nellu"], "base_price": 2300},
    {"category": "Food grains", "crop": "Wheat", "tamil_name": "கோதுமை", "aliases": ["Wheat", "Gehun"], "base_price": 2400},
    {"category": "Food grains", "crop": "Maize", "tamil_name": "சேறு மக்காச்சோளம்", "aliases": ["Maize", "Corn"], "base_price": 2100},
    {"category": "Food grains", "crop": "Sorghum", "tamil_name": "சோளம்", "aliases": ["Sorghum", "Jowar"], "base_price": 2000},
    {"category": "Food grains", "crop": "Pearl Millet", "tamil_name": "கம்பு", "aliases": ["Pearl Millet", "Bajra"], "base_price": 1900},
    {"category": "Food grains", "crop": "Finger Millet", "tamil_name": "கேழ்வரகு", "aliases": ["Finger Millet", "Ragi"], "base_price": 2100},
    {"category": "Food grains", "crop": "Barley", "tamil_name": "பார்லி", "aliases": ["Barley", "Jau"], "base_price": 1800},
    {"category": "Pulses", "crop": "Black Gram", "tamil_name": "உளுந்து", "aliases": ["Black Gram", "Urad"], "base_price": 6200},
    {"category": "Pulses", "crop": "Green Gram", "tamil_name": "பசளைப் பருப்பு", "aliases": ["Green Gram", "Moong"], "base_price": 7000},
    {"category": "Pulses", "crop": "Red Gram", "tamil_name": "துவரம் பருப்பு", "aliases": ["Red Gram", "Tur", "Arhar"], "base_price": 7200},
    {"category": "Pulses", "crop": "Chickpea", "tamil_name": "கச்சான் பருப்பு", "aliases": ["Chickpea", "Bengal Gram", "Chana"], "base_price": 6800},
    {"category": "Pulses", "crop": "Cowpea", "tamil_name": "கொத்தவரை", "aliases": ["Cowpea", "Lobia"], "base_price": 5400},
    {"category": "Pulses", "crop": "Horse Gram", "tamil_name": "கொள்ளு", "aliases": ["Horse Gram", "Kulthi"], "base_price": 4200},
    {"category": "Pulses", "crop": "Lentil", "tamil_name": "மசூர்தானா", "aliases": ["Lentil", "Masoor"], "base_price": 6100},
    {"category": "Oilseeds", "crop": "Groundnut", "tamil_name": "நிலக்கடலை", "aliases": ["Groundnut", "Peanut"], "base_price": 6600},
    {"category": "Oilseeds", "crop": "Sesame", "tamil_name": "எள்", "aliases": ["Sesame", "Til"], "base_price": 8200},
    {"category": "Oilseeds", "crop": "Sunflower", "tamil_name": "சூரியகாந்தி", "aliases": ["Sunflower"], "base_price": 6100},
    {"category": "Oilseeds", "crop": "Castor", "tamil_name": "அமணக்கு", "aliases": ["Castor"], "base_price": 5800},
    {"category": "Oilseeds", "crop": "Soybean", "tamil_name": "சோயா", "aliases": ["Soybean"], "base_price": 4800},
    {"category": "Oilseeds", "crop": "Mustard", "tamil_name": "கடுகு", "aliases": ["Mustard", "Sarson"], "base_price": 5200},
    {"category": "Oilseeds", "crop": "Coconut", "tamil_name": "தென்னை", "aliases": ["Coconut"], "base_price": 22000},
    {"category": "Vegetables", "crop": "Tomato", "tamil_name": "தக்காளி", "aliases": ["Tomato"], "base_price": 2200},
    {"category": "Vegetables", "crop": "Onion", "tamil_name": "வெங்காயம்", "aliases": ["Onion", "Pyaz"], "base_price": 1800},
    {"category": "Vegetables", "crop": "Brinjal", "tamil_name": "கத்தரி", "aliases": ["Brinjal", "Eggplant"], "base_price": 2000},
    {"category": "Vegetables", "crop": "Potato", "tamil_name": "உருளைக்கிழங்கு", "aliases": ["Potato"], "base_price": 1700},
    {"category": "Vegetables", "crop": "Green Chilli", "tamil_name": "பச்சை மிளகாய்", "aliases": ["Green Chilli"], "base_price": 2600},
    {"category": "Vegetables", "crop": "Drumstick", "tamil_name": "முருங்கை", "aliases": ["Drumstick", "Moringa"], "base_price": 3000},
    {"category": "Vegetables", "crop": "Bhendi", "tamil_name": "வெண்டை", "aliases": ["Bhendi", "Okra"], "base_price": 2100},
    {"category": "Vegetables", "crop": "Cabbage", "tamil_name": "மல்லிகை பீன்ஸ்", "aliases": ["Cabbage"], "base_price": 1600},
    {"category": "Vegetables", "crop": "Cauliflower", "tamil_name": "கோசு", "aliases": ["Cauliflower"], "base_price": 1800},
    {"category": "Vegetables", "crop": "Carrot", "tamil_name": "கேரட்", "aliases": ["Carrot"], "base_price": 1700},
    {"category": "Vegetables", "crop": "Beetroot", "tamil_name": "பீட்ரூட்", "aliases": ["Beetroot"], "base_price": 1600},
    {"category": "Vegetables", "crop": "Beans", "tamil_name": "பீன்ஸ்", "aliases": ["Beans"], "base_price": 2200},
    {"category": "Vegetables", "crop": "Bottle Gourd", "tamil_name": "சுரைக்காய்", "aliases": ["Bottle Gourd"], "base_price": 1800},
    {"category": "Vegetables", "crop": "Cucumber", "tamil_name": "வெள்ளரி", "aliases": ["Cucumber"], "base_price": 1600},
    {"category": "Vegetables", "crop": "Radish", "tamil_name": "முருக்கு", "aliases": ["Radish"], "base_price": 1500},
    {"category": "Vegetables", "crop": "Tapioca", "tamil_name": "மரவள்ளிக்கிழங்கு", "aliases": ["Tapioca", "Cassava"], "base_price": 1700},
    {"category": "Vegetables", "crop": "Sweet Potato", "tamil_name": "சர்க்கரை வள்ளிக்கிழங்கு", "aliases": ["Sweet Potato"], "base_price": 1800},
    {"category": "Vegetables", "crop": "Garlic", "tamil_name": "பூண்டை", "aliases": ["Garlic"], "base_price": 3400},
    {"category": "Vegetables", "crop": "Ginger", "tamil_name": "இஞ்சி", "aliases": ["Ginger"], "base_price": 3300},
    {"category": "Fruits", "crop": "Banana", "tamil_name": "வாழை", "aliases": ["Banana"], "base_price": 5000},
    {"category": "Fruits", "crop": "Mango", "tamil_name": "மாம்பழம்", "aliases": ["Mango"], "base_price": 7500},
    {"category": "Fruits", "crop": "Papaya", "tamil_name": "பப்பாளி", "aliases": ["Papaya"], "base_price": 4200},
    {"category": "Fruits", "crop": "Guava", "tamil_name": "கொய்யா", "aliases": ["Guava"], "base_price": 4800},
    {"category": "Fruits", "crop": "Watermelon", "tamil_name": "தர்பூசணி", "aliases": ["Watermelon"], "base_price": 3200},
    {"category": "Fruits", "crop": "Grapes", "tamil_name": "திராட்சை", "aliases": ["Grapes"], "base_price": 8500},
    {"category": "Fruits", "crop": "Pomegranate", "tamil_name": "மாதுளை", "aliases": ["Pomegranate"], "base_price": 9000},
    {"category": "Fruits", "crop": "Sapota", "tamil_name": "சப்போட்டா", "aliases": ["Sapota"], "base_price": 6400},
    {"category": "Fruits", "crop": "Jackfruit", "tamil_name": "புளியங்காய்", "aliases": ["Jackfruit"], "base_price": 5200},
    {"category": "Fruits", "crop": "Pineapple", "tamil_name": "அன்னாசி", "aliases": ["Pineapple"], "base_price": 4700},
    {"category": "Fruits", "crop": "Lemon", "tamil_name": "எலுமிச்சை", "aliases": ["Lemon"], "base_price": 3500},
    {"category": "Fruits", "crop": "Orange", "tamil_name": "ஆரஞ்சு", "aliases": ["Orange"], "base_price": 6100},
    {"category": "Commercial crops", "crop": "Sugarcane", "tamil_name": "கரும்பு", "aliases": ["Sugarcane"], "base_price": 3400},
    {"category": "Commercial crops", "crop": "Cotton", "tamil_name": "பருத்தி", "aliases": ["Cotton"], "base_price": 6500},
    {"category": "Commercial crops", "crop": "Tobacco", "tamil_name": "புகையிலை", "aliases": ["Tobacco"], "base_price": 5800},
    {"category": "Commercial crops", "crop": "Jute", "tamil_name": "சணல்", "aliases": ["Jute"], "base_price": 4200},
    {"category": "Commercial crops", "crop": "Turmeric", "tamil_name": "மஞ்சள்", "aliases": ["Turmeric"], "base_price": 12000},
    {"category": "Commercial crops", "crop": "Coffee", "tamil_name": "காபி", "aliases": ["Coffee"], "base_price": 18000},
    {"category": "Commercial crops", "crop": "Tea", "tamil_name": "தேநீர்", "aliases": ["Tea"], "base_price": 16000},
    {"category": "Commercial crops", "crop": "Rubber", "tamil_name": "ரப்பர்", "aliases": ["Rubber"], "base_price": 14000},
    {"category": "Spices", "crop": "Dry Chilli", "tamil_name": "காய்ந்த மிளகாய்", "aliases": ["Dry Chilli", "Red Chilli"], "base_price": 9800},
    {"category": "Spices", "crop": "Coriander", "tamil_name": "மல்லி", "aliases": ["Coriander"], "base_price": 5400},
    {"category": "Spices", "crop": "Cumin", "tamil_name": "சீரகம்", "aliases": ["Cumin"], "base_price": 6400},
    {"category": "Spices", "crop": "Black Pepper", "tamil_name": "கருப்பு மிளகு", "aliases": ["Black Pepper"], "base_price": 15000},
    {"category": "Spices", "crop": "Cardamom", "tamil_name": "ஏலக்காய்", "aliases": ["Cardamom"], "base_price": 22000},
    {"category": "Spices", "crop": "Cloves", "tamil_name": "கிராம்பு", "aliases": ["Cloves"], "base_price": 11000},
    {"category": "Spices", "crop": "Fenugreek", "tamil_name": "வெந்தயம்", "aliases": ["Fenugreek"], "base_price": 4600},
    {"category": "Flowers", "crop": "Jasmine", "tamil_name": "மல்லிகை", "aliases": ["Jasmine"], "base_price": 3000},
    {"category": "Flowers", "crop": "Marigold", "tamil_name": "சந்தனம்", "aliases": ["Marigold"], "base_price": 2800},
    {"category": "Flowers", "crop": "Rose", "tamil_name": "ரோஜா", "aliases": ["Rose"], "base_price": 3200},
    {"category": "Flowers", "crop": "Tuberose", "tamil_name": "துளசி", "aliases": ["Tuberose"], "base_price": 3100},
    {"category": "Other", "crop": "Moringa", "tamil_name": "முருங்கை", "aliases": ["Moringa", "Drumstick"], "base_price": 3200},
    {"category": "Other", "crop": "Fodder Crops", "tamil_name": "கொள்ளு மேம்பாடு", "aliases": ["Fodder Crops", "Green fodder"], "base_price": 1500},
]


def get_crop_catalog() -> list[dict]:
    return CROP_CATALOG


def _price_sequence(seed_value: float, day_step: int) -> tuple[float, float, float, float]:
    modal = seed_value + (day_step * 65)
    min_price = max(0.0, modal * 0.92)
    max_price = modal * 1.12
    return round(min_price, 2), round(max_price, 2), round(modal, 2), round(modal * 0.75, 2)


def _districts_for_state(state: str) -> list[str]:
    if state == "Tamil Nadu":
        return TAMIL_NADU_DISTRICTS
    return {
        "Maharashtra": ["Nagpur", "Nashik", "Amravati", "Pune", "Solapur"],
        "Andhra Pradesh": ["Guntur", "Visakhapatnam", "Kurnool", "Vijayawada"],
        "Karnataka": ["Bengaluru Rural", "Mysuru", "Belagavi", "Hubballi"],
        "Punjab": ["Ludhiana", "Amritsar", "Bathinda", "Patiala"],
        "Gujarat": ["Rajkot", "Junagadh", "Ahmedabad", "Surat"],
        "Rajasthan": ["Jaipur", "Sikar", "Jodhpur", "Bikaner"],
        "West Bengal": ["Nadia", "Midnapore", "Cooch Behar", "Malda"],
        "Uttar Pradesh": ["Kanpur", "Agra", "Varanasi", "Meerut"],
        "Tamil Nadu": TAMIL_NADU_DISTRICTS,
    }.get(state, ["Primary Market District"])


def build_seed_market_data() -> list[dict]:
    all_dates = [date(2026, 11, day) for day in range(1, 6)]
    prioritized_states = [
        "Tamil Nadu", "Maharashtra", "Punjab", "Andhra Pradesh", "Karnataka",
        "Gujarat", "Rajasthan", "West Bengal", "Uttar Pradesh", "Madhya Pradesh",
    ]
    records: list[dict] = []

    for crop_meta in CROP_CATALOG:
        crop_name = crop_meta["crop"]
        for state_index, state in enumerate(prioritized_states):
            districts = _districts_for_state(state)
            district_list = districts if state == "Tamil Nadu" else districts[:3]
            for district_index, district in enumerate(district_list):
                base_price = crop_meta["base_price"] + (state_index * 140) + (district_index * 150)
                for day_index, price_date in enumerate(all_dates):
                    min_price, max_price, modal_price, arrival_quantity = _price_sequence(base_price, day_index + district_index)
                    mandi_name = f"{district} Regulated Market"
                    records.append(
                        {
                            "crop": crop_name,
                            "state": state,
                            "district": district,
                            "mandi_name": mandi_name,
                            "min_price": min_price,
                            "max_price": max_price,
                            "modal_price": modal_price,
                            "arrival_quantity": round(arrival_quantity * 5, 2),
                            "price_date": price_date,
                        }
                    )
    return records


def load_seed_data(connection: Connection) -> int:
    if connection.dialect.name == "postgresql":
        insert_statement = postgresql_insert
    elif connection.dialect.name == "sqlite":
        insert_statement = sqlite_insert
    else:
        raise RuntimeError(
            f"Market seed data is not supported for {connection.dialect.name}."
        )

    natural_key = [
        MandiPrice.crop,
        MandiPrice.state,
        MandiPrice.district,
        MandiPrice.mandi_name,
        MandiPrice.price_date,
    ]
    inserted_count = 0
    batch_size = 500
    seed_market_data = build_seed_market_data()
    for offset in range(0, len(seed_market_data), batch_size):
        batch = seed_market_data[offset : offset + batch_size]
        statement = insert_statement(MandiPrice).values(batch).on_conflict_do_nothing(
            index_elements=natural_key
        )
        result = connection.execute(statement)
        inserted_count += result.rowcount or 0

    return inserted_count
