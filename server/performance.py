from ultralytics import YOLO

# Load the model
model = YOLO('best.pt')

# Validate the model
metrics = model.val(data="./datasets/content/dataset/data.yaml")
print(metrics.box.map)  # mAP50-95