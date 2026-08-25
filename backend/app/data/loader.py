import os
import ast
import re
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple, Optional
from sklearn.feature_extraction.text import TfidfVectorizer

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DATA_DIR = os.path.join(BASE_DIR, "data")

def _parse_list_field(val: Any) -> List[str]:
    if pd.isna(val) or val is None:
        return []
    if isinstance(val, list):
        return [str(item).strip().lower() for item in val if str(item).strip()]
    val_str = str(val).strip()
    if val_str.startswith("[") and val_str.endswith("]"):
        try:
            parsed = ast.literal_eval(val_str)
            if isinstance(parsed, list):
                # May contain nested lists or multi-item strings
                flat_items = []
                for item in parsed:
                    if isinstance(item, str):
                        # Split on commas or clean quotes
                        parts = [p.strip().strip("'\"").lower() for p in item.split(",") if p.strip().strip("'\"")]
                        flat_items.extend(parts)
                    else:
                        flat_items.append(str(item).strip().lower())
                return flat_items
        except Exception:
            pass
    # Fallback to comma/regex split
    cleaned = re.sub(r"[\[\]'\"\(\)]", "", val_str)
    return [p.strip().lower() for p in cleaned.split(",") if p.strip()]

class DataLoader:
    _instance = None

    def __init__(self):
        self.products_df: Optional[pd.DataFrame] = None
        self.ingredients_df: Optional[pd.DataFrame] = None
        self.evidence_df: Optional[pd.DataFrame] = None
        self.tfidf_vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix = None
        self.load_all()

    @classmethod
    def get_instance(cls) -> "DataLoader":
        if cls._instance is None:
            cls._instance = DataLoader()
        return cls._instance

    def load_all(self):
        products_path = os.path.join(DATA_DIR, "products.csv")
        ingredients_path = os.path.join(DATA_DIR, "ingredients.csv")
        evidence_path = os.path.join(DATA_DIR, "evidence.csv")

        if os.path.exists(products_path):
            df = pd.read_csv(products_path)

            # Ensure essential columns
            if 'product_id' not in df.columns:
                df['product_id'] = [f"PROD_{i}" for i in range(len(df))]
            df['product_id'] = df['product_id'].astype(str)

            if 'name' not in df.columns:
                df['name'] = 'Skincare Product'
            df['name'] = df['name'].astype(str)

            if 'brand' not in df.columns:
                df['brand'] = 'SkinSolve Essentials'
            df['brand'] = df['brand'].astype(str)

            if 'category' not in df.columns:
                df['category'] = 'Treatment'
            df['category'] = df['category'].astype(str)

            if 'price' in df.columns:
                df['price'] = pd.to_numeric(df['price'], errors='coerce').fillna(500.0)
            else:
                df['price'] = 500.0

            if 'rating' in df.columns:
                df['rating'] = pd.to_numeric(df['rating'], errors='coerce').fillna(4.2).clip(1.0, 5.0)
            else:
                df['rating'] = 4.2

            if 'reviews_count' in df.columns:
                df['reviews_count'] = pd.to_numeric(df['reviews_count'], errors='coerce').fillna(350).astype(int)
            else:
                df['reviews_count'] = 350

            if 'description' not in df.columns:
                df['description'] = df['name']
            df['description'] = df['description'].astype(str)

            # Clean list fields into native lists
            df['skin_types_list'] = df['skin_types'].apply(_parse_list_field) if 'skin_types' in df.columns else [[] for _ in range(len(df))]
            df['concerns_list'] = df['concerns'].apply(_parse_list_field) if 'concerns' in df.columns else [[] for _ in range(len(df))]
            df['ingredients_list'] = df['ingredients'].apply(_parse_list_field) if 'ingredients' in df.columns else [[] for _ in range(len(df))]
            
            # String representation for quick regex/contains search
            df['ingredients_text'] = df['ingredients_list'].apply(lambda lst: " ".join(lst) if lst else "")
            df['concerns_text'] = df['concerns_list'].apply(lambda lst: " ".join(lst) if lst else "")
            df['skin_types_text'] = df['skin_types_list'].apply(lambda lst: " ".join(lst) if lst else "")

            # Boolean constraint flags
            if 'fragrance_free' in df.columns:
                df['fragrance_free'] = df['fragrance_free'].astype(bool)
            else:
                df['fragrance_free'] = ~df['ingredients_text'].str.contains(r'fragrance|parfum|perfume', case=False, na=False)

            if 'alcohol_free' in df.columns:
                df['alcohol_free'] = df['alcohol_free'].astype(bool)
            else:
                df['alcohol_free'] = ~df['ingredients_text'].str.contains(r'alcohol denat|sd alcohol', case=False, na=False)

            if 'vegan' in df.columns:
                df['vegan'] = df['vegan'].astype(bool)
            else:
                # Default true for plant-based / clean formulations without animal derivatives
                df['vegan'] = ~df['ingredients_text'].str.contains(r'beeswax|lanolin|carmine|collagen|honey', case=False, na=False)

            if 'cruelty_free' in df.columns:
                df['cruelty_free'] = df['cruelty_free'].astype(bool)
            else:
                df['cruelty_free'] = True

            # Evidence scoring
            if 'evidence_tags' in df.columns:
                df['evidence_score'] = pd.to_numeric(df['evidence_tags'], errors='coerce').fillna(0.85)
            else:
                df['evidence_score'] = 0.85

            if 'image_url' not in df.columns:
                df['image_url'] = ""

            self.products_df = df
            self._fit_tfidf()
        else:
            self.products_df = pd.DataFrame()

        if os.path.exists(ingredients_path):
            self.ingredients_df = pd.read_csv(ingredients_path)
        else:
            self.ingredients_df = pd.DataFrame()

        if os.path.exists(evidence_path):
            self.evidence_df = pd.read_csv(evidence_path)
        else:
            self.evidence_df = pd.DataFrame()

    def _fit_tfidf(self):
        if self.products_df is not None and not self.products_df.empty:
            self.products_df['_matrix_idx'] = np.arange(len(self.products_df))
            corpus = (
                self.products_df['name'] + " " +
                self.products_df['concerns_text'] + " " +
                self.products_df['ingredients_text'] + " " +
                self.products_df['description']
            )
            self.tfidf_vectorizer = TfidfVectorizer(
                stop_words='english',
                ngram_range=(1, 2),
                max_features=500
            )
            self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(corpus)

    def get_products(self) -> pd.DataFrame:
        if self.products_df is None or self.products_df.empty:
            self.load_all()
        return self.products_df.copy()

    def get_ingredients(self) -> pd.DataFrame:
        if self.ingredients_df is None:
            self.load_all()
        return self.ingredients_df.copy()

    def get_evidence(self) -> pd.DataFrame:
        if self.evidence_df is None:
            self.load_all()
        return self.evidence_df.copy()

    def get_tfidf(self) -> Tuple[Optional[TfidfVectorizer], Any]:
        return self.tfidf_vectorizer, self.tfidf_matrix