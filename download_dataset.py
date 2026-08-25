import kagglehub

print("Downloading dataset...")
path = kagglehub.dataset_download("nadyinky/sephora-products-and-skincare-reviews")
print(f"Dataset downloaded successfully to: {path}")
