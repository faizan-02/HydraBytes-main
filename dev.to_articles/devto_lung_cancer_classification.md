---
title: "Building a 3-Class Lung Cancer Image Classifier with TensorFlow and Flask"
published: true
description: "A walkthrough of how we built a CNN-based lung cancer image classifier that distinguishes Adenocarcinoma, Benign, and Squamous Cell Carcinoma tissue, wrapped in a Flask API with a clean upload interface."
tags: python, machinelearning, tensorflow, flask
cover_image: https://raw.githubusercontent.com/faizan-02/Lung-Cancer-Classification/master/git_images/img(1).png
canonical_url: https://github.com/faizan-02/Lung-Cancer-Classification
---

Medical imaging is one of the most rewarding spaces to apply deep learning. Pathologists spend years learning to distinguish subtle visual patterns in tissue samples, and even then, fatigue and caseload pressure can creep into decisions. A well-trained CNN does not replace that expertise, but it can serve as a useful second opinion, especially in triage workflows.

In this post we will walk through how we built a lung cancer image classifier that sorts tissue images into three classes: **Adenocarcinoma**, **Benign**, and **Squamous Cell Carcinoma**. The model runs behind a Flask API with a simple upload-and-predict web interface, so anyone can drop in an image and see the prediction in real time.

Full code and dataset links are on [GitHub](https://github.com/faizan-02/Lung-Cancer-Classification).

## Why these three classes

Lung cancer is commonly divided into small cell and non-small cell types. Within non-small cell lung cancer, adenocarcinoma and squamous cell carcinoma are the two most prevalent subtypes, together making up the majority of cases. Correctly separating them matters because treatment pathways can differ meaningfully.

Adding a **benign** class gives the model a "nothing to worry about" option so it does not force every input into a cancer label. That three-class setup reflects the kind of decision a real classifier would need to make in a triage tool.

## The dataset

We used a public Kaggle lung cancer histopathology dataset, organized into three balanced classes with separate training and testing folders. The directory structure looked like this:

```
dataset/
├── train/
│   ├── adenocarcinoma/
│   ├── benign/
│   └── squamous_cell_carcinoma/
└── test/
    ├── adenocarcinoma/
    ├── benign/
    └── squamous_cell_carcinoma/
```

Keras' `ImageDataGenerator` made it trivial to load images directly from these folders and apply augmentation on the fly. Data augmentation matters a lot for medical imaging because real datasets are almost always smaller than what a fresh CNN would prefer. We used random flips, small rotations, and zoom to expand the effective training set without collecting new samples.

## Model architecture

We went with a custom CNN instead of a pretrained backbone like ResNet or VGG. The reasoning: histopathology images have different statistics from natural photographs (no sky, no faces, strong staining colors), so the features learned on ImageNet are not always the best starting point. A purpose-built network with fewer parameters also trains faster and is easier to reason about.

The architecture is intentionally simple:

| Layer           | Details                     |
| --------------- | --------------------------- |
| Conv2D + ReLU   | 32 filters, 3x3 kernel      |
| MaxPooling2D    | 2x2 pool                    |
| Conv2D + ReLU   | 64 filters, 3x3 kernel      |
| MaxPooling2D    | 2x2 pool                    |
| Flatten         |                             |
| Dense + ReLU    | 128 units                   |
| Dropout         | 0.5                         |
| Dense + Softmax | 3 output units              |

Two convolutional blocks are enough to capture the low and mid-level texture patterns that distinguish tumor tissue from benign tissue. The dropout layer before the final dense block is doing heavy lifting: without it, the model happily memorized the training set and validation accuracy plateaued much earlier.

Here is the model definition in Keras:

```python
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout

model = Sequential([
    Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
    MaxPooling2D((2, 2)),
    Conv2D(64, (3, 3), activation='relu'),
    MaxPooling2D((2, 2)),
    Flatten(),
    Dense(128, activation='relu'),
    Dropout(0.5),
    Dense(3, activation='softmax'),
])

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy'],
)
```

## Training

Training ran for a modest number of epochs with early stopping watching validation loss. Adam as the optimizer, categorical cross-entropy as the loss, and a 70/15/15 train/validation/test split. Nothing exotic. The trained weights are saved to `models/lung_cancer_model.h5` so the Flask app can load them at startup instead of retraining every time.

A lesson we learned early: **always shuffle within each class before splitting**. Our first split was sequential and it put nearly all adenocarcinoma images from one subfolder into the training set and the rest into validation, which tanked validation accuracy for that class. Shuffling fixed it in one line.

## Flask integration

The serving side is a tiny Flask app with a single route that handles both the GET (render upload page) and POST (accept image, run prediction) flows:

```python
from flask import Flask, request, render_template
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np

app = Flask(__name__)
model = load_model('models/lung_cancer_model.h5')
CLASSES = ['Adenocarcinoma', 'Benign', 'Squamous Cell Carcinoma']

@app.route('/', methods=['GET', 'POST'])
def upload_and_predict():
    if request.method == 'POST':
        file = request.files['image']
        img = Image.open(file).resize((224, 224)).convert('RGB')
        arr = np.expand_dims(np.array(img) / 255.0, axis=0)
        preds = model.predict(arr)[0]
        predicted = CLASSES[np.argmax(preds)]
        confidence = float(np.max(preds))
        return render_template(
            'index.html',
            prediction=predicted,
            confidence=f'{confidence:.1%}',
            image_path=file.filename,
        )
    return render_template('index.html')
```

Loading the model once at startup (instead of per request) is a small detail that matters a lot for response times. The first prediction warms up TensorFlow, and everything after that returns in well under a second on CPU.

## The front-end

The user-facing interface is plain HTML, CSS, and a sprinkle of Bootstrap. No React, no framework overhead. A big drop zone for the image, a preview, and a result card that renders the predicted class with its confidence score. The goal was to keep the whole experience friction-free so someone without technical background can still use it.

## Results

After training, our numbers landed at:

- **Training accuracy:** around 95%
- **Validation accuracy:** around 96%
- **Test accuracy:** around 97%

The validation accuracy sitting slightly above training is a little unusual and usually a sign that dropout is doing its job, regularizing the model enough that it generalizes cleanly. We also checked per-class precision and recall to make sure the model was not gaming its accuracy by over-predicting the majority class. All three classes came back balanced.

## Limitations and honest caveats

A few things we want to be upfront about:

1. **This is not a clinical tool.** Public histopathology datasets are carefully curated and do not capture the full range of tissue variation you would see in a real lab. High test accuracy on a clean dataset does not translate to clinical-grade reliability.
2. **Stain variation is the biggest gap.** The model has not been tested against images with different staining protocols, scanners, or magnifications.
3. **Three classes is a simplification.** Real pathology has many more subtypes and gradings. A production version would need a much deeper label space.

These caveats are part of the reason we picked a custom CNN instead of pretending a ResNet fine-tune on Kaggle data is "ready for deployment". The architecture, training pipeline, and Flask wrapper are all meant to be a solid starting point that a team could extend into a real diagnostic aid with the right dataset partnerships and regulatory path.

## Wrapping up

Building this project was a great exercise in the full loop: curating data, designing a CNN small enough to train on a single GPU, wiring it up behind a web interface, and making predictions available in a form anyone could use. The accuracy numbers are strong for a public dataset, but the bigger win was shipping something end to end, from raw images to a working upload-and-predict app.

If you want to try it yourself, clone the repo, drop in the dataset, train the model, and start the Flask server:

```bash
python train_model.py
python app.py
```

The code, architecture diagrams, and screenshots are all on [GitHub](https://github.com/faizan-02/Lung-Cancer-Classification). Feedback and pull requests are welcome.

At **HydraBytes**, we love projects like this one: real-world AI problems where the challenge is not just model accuracy but shaping the pipeline so the end result is useful. If you are exploring medical imaging, computer vision, or any ML use case, [let's talk](https://www.hydrabytes.tech/contact).
