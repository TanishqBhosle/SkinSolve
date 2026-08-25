import os
import pandas as pd
from typing import Dict, List, Any

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DATA_DIR = os.path.join(BASE_DIR, "data")

class DataLoader:
    _instance = None

    def __init__(self):
        self.products_df = None
        self.ingredients_df = None
        self.evidence_df = None
        self.load_all()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = DataLoader()
        return cls._instance

    def load_all(self):
        products_path = os.path.join(DATA_DIR, "products.csv")
        ingredients_path = os.path.join(DATA_DIR, "ingredients.csv")
        evidence_path = os.path.join(DATA_DIR, "evidence.csv")

        if os.path.exists(products_path):
            self.products_df = pd.read_csv(products_path)
            self.products_df['price'] = pd.to_numeric(self.products_df['price'], errors='coerce').fillna(0.0)
            self.products_df['rating'] = pd.to_numeric(self.products_df['rating'], errors='coerce').fillna(4.0)
            if 'evidence_tags' in self.products_df.columns:
                self.products_df['evidence_score'] = pd.to_numeric(self.products_df['evidence_tags'], errors='coerce').fillna(0.8)
            if 'fragrance_free' in self.products_df.columns:
                self.products_df['fragrance_free'] = self.products_df['fragrance_free'].astype(bool)
            if 'vegan' in self.products_df.columns:
                self.products_df['vegan'] = self.products_df['vegan'].astype(bool)
            if 'cruelty_free' in self.products_df.columns:
                self.products_df['cruelty_free'] = self.products_df['cruelty_free'].astype(bool)
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

    def get_products(self) -> pd.DataFrame:
        return self.products_df.copy()

    def get_ingredients(self) -> pd.DataFrame:
        return self.ingredients_df.copy()

    def get_evidence(self) -> pd.DataFrame:
        return self.evidence_df.copy()