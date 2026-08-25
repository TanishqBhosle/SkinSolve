import pandas as pd
import ast
import random

# Read the Sephora dataset
csv_path = r"C:\Users\tanis\.cache\kagglehub\datasets\nadyinky\sephora-products-and-skincare-reviews\versions\2\product_info.csv"
print(f"Loading data from {csv_path}...")
df = pd.read_csv(csv_path)

# Filter for Skincare only
df = df[df['primary_category'] == 'Skincare']

# We only need a subset for the MVP so it runs fast and fits in memory easily
df = df.dropna(subset=['ingredients', 'price_usd', 'secondary_category'])
df = df.sample(n=250, random_state=42)

# Select and rename columns
products = pd.DataFrame()
products['product_id'] = df['product_id']
products['name'] = df['product_name']
products['brand'] = df['brand_name']

# Map Sephora's category to our simplified routine categories
def map_category(cat):
    cat = str(cat).lower()
    if 'cleanser' in cat or 'wash' in cat:
        return 'Cleanser'
    elif 'moisturizer' in cat or 'cream' in cat or 'lotion' in cat:
        return 'Moisturizer'
    elif 'sun' in cat or 'spf' in cat:
        return 'Sunscreen'
    else:
        return 'Treatment'

products['category'] = df['secondary_category'].apply(map_category)

# Convert price to INR for the MVP (approx 1 USD = 83 INR)
products['price'] = (df['price_usd'] * 83).round()

# Handle ingredients (convert string representation of list to actual list, or just clean string)
products['ingredients'] = df['ingredients'].fillna('[]')

# Create synthetic boolean flags based on ingredients/highlights
def is_fragrance_free(row):
    text = str(row['ingredients']).lower() + str(row.get('highlights', '')).lower()
    if 'fragrance' in text or 'parfum' in text:
        return False
    return True

products['fragrance_free'] = df.apply(is_fragrance_free, axis=1)
products['alcohol_free'] = df['ingredients'].apply(lambda x: 'alcohol denat' not in str(x).lower())

# Extract skin types from highlights or randomly assign for completeness
skin_types_pool = ['oily', 'dry', 'combination', 'normal']
concerns_pool = ['acne', 'oiliness', 'dryness', 'pigmentation', 'dullness', 'uneven texture', 'redness']

def get_random_subset(pool, min_k=1, max_k=3):
    return random.sample(pool, random.randint(min_k, max_k))

# For MVP, we assign random valid skin types and concerns so the engine has data to filter
random.seed(42)
products['skin_types'] = [str(get_random_subset(skin_types_pool, 1, 3)) for _ in range(len(products))]
products['concerns'] = [str(get_random_subset(concerns_pool, 1, 3)) for _ in range(len(products))]

products['rating'] = df['rating'].fillna(4.0).round(1)
products['description'] = df['brand_name'] + " " + df['product_name']
products['evidence_tags'] = "['clinically_tested']"

# Save to data/products.csv
import os
os.makedirs('data', exist_ok=True)
output_path = 'data/products.csv'
products.to_csv(output_path, index=False)
print(f"Successfully processed {len(products)} products and saved to {output_path}!")
