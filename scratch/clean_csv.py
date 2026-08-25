import os

csv_path = "data/products.csv"
with open(csv_path, "r", encoding="utf-8") as f:
    text = f.read()

# Replace any backslashes inside ingredient/product text with clean forward slashes
clean_text = text.replace("\\", "/")
# Fix any escaped quotes that were turned to /' -> ''
clean_text = clean_text.replace("/'", "'").replace('/"', '"')

with open(csv_path, "w", encoding="utf-8") as f:
    f.write(clean_text)

print("Cleaned CSV successfully!")
