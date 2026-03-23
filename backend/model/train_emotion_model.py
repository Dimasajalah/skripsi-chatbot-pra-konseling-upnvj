# backend/model/train_emotion_model.py
import os
import glob
import re
import joblib
import json
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
from sentence_transformers import SentenceTransformer
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
 
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "data", "EmotionDataset"))

MODEL_DIR = BASE_DIR

OUTPUT_DIR = BASE_DIR

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

SBERT_MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"
TRAIN_FFNN = False  
FFNN_EPOCHS = 10

all_files = glob.glob(os.path.join(DATA_DIR, "*.csv"))
df_list = []
for f in all_files:
    try:
        temp = pd.read_csv(f, sep=None, engine='python', on_bad_lines='skip', encoding='utf-8-sig')
        temp.columns = [c.strip().replace('"','') for c in temp.columns]
        if 'Tweet' in temp.columns:
            temp.rename(columns={'Tweet':'text'}, inplace=True)
        if 'Label' in temp.columns:
            temp.rename(columns={'Label':'emotion'}, inplace=True)
        temp.dropna(subset=['text','emotion'], inplace=True)
        temp['text'] = temp['text'].astype(str).str.replace('"','').str.strip()
        temp['emotion'] = temp['emotion'].astype(str).str.replace('"','').str.strip()
        df_list.append(temp)
        print("Loaded", f, len(temp))
    except Exception as e:
        print("Failed reading", f, e)

if not df_list:
    raise ValueError("No CSV files found in EmotionDataset")

df = pd.concat(df_list, ignore_index=True)
mapping = {'anger':'marah','fear':'cemas','joy':'senang','love':'senang','sad':'sedih','neutral':'netral'}
df['emotion'] = df['emotion'].map(mapping).fillna(df['emotion'])
print("Total rows:", len(df))
factory = StemmerFactory()
stemmer = factory.create_stemmer()

def clean_text(x):
    x = str(x).lower()
    x = re.sub(r"http\S+|www\S+|https\S+", '', x)
    x = re.sub(r'[^a-zA-ZÀ-ÿ0-9\s]', ' ', x)
    x = re.sub(r'\s+', ' ', x).strip()
    return x

def preprocess(x):
    return stemmer.stem(clean_text(x))

df['clean_text'] = df['text'].apply(preprocess)

X_train, X_test, y_train, y_test = train_test_split(df['clean_text'], df['emotion'], test_size=0.15, random_state=42, stratify=df['emotion'])

encoder = LabelEncoder()
y_train_enc = encoder.fit_transform(y_train)
y_test_enc = encoder.transform(y_test)

print("Embedding texts with", SBERT_MODEL_NAME)
sbert = SentenceTransformer(SBERT_MODEL_NAME)
X_train_emb = sbert.encode(X_train.tolist(), show_progress_bar=True)
X_test_emb = sbert.encode(X_test.tolist(), show_progress_bar=True)

clf = LogisticRegression(max_iter=2000, class_weight='balanced', n_jobs=-1)
clf.fit(X_train_emb, y_train_enc)

y_pred = clf.predict(X_test_emb)
report = classification_report(y_test_enc, y_pred, target_names=encoder.classes_, output_dict=True)
print(classification_report(y_test_enc, y_pred, target_names=encoder.classes_))

ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
with open(os.path.join(OUTPUT_DIR, f"classification_report_{ts}.json"), "w", encoding="utf-8") as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

cm = confusion_matrix(y_test_enc, y_pred)
plt.figure(figsize=(6,5))
plt.imshow(cm, cmap='Blues')
plt.xticks(range(len(encoder.classes_)), encoder.classes_, rotation=45)
plt.yticks(range(len(encoder.classes_)), encoder.classes_)
plt.xlabel("Prediksi")
plt.ylabel("Aktual")
plt.title("Confusion Matrix")
plt.colorbar()
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, f"confusion_matrix_{ts}.png"))
plt.close()

joblib.dump(clf, os.path.join(MODEL_DIR, "emotion_model.pkl"))
joblib.dump(encoder, os.path.join(MODEL_DIR, "label_encoder.pkl"))
print("Saved model and encoder to", MODEL_DIR)

if TRAIN_FFNN:
    import torch, torch.nn as nn, torch.optim as optim
    X_train_t = torch.tensor(X_train_emb, dtype=torch.float32)
    y_train_t = torch.tensor(y_train_enc, dtype=torch.long)
    X_val_t = torch.tensor(X_test_emb, dtype=torch.float32)
    y_val_t = torch.tensor(y_test_enc, dtype=torch.long)
    class SimpleFFNN(nn.Module):
        def __init__(self, input_dim, hidden=256, nclass=len(encoder.classes_)):
            super().__init__()
            self.fc1 = nn.Linear(input_dim, hidden)
            self.fc2 = nn.Linear(hidden, nclass)
            self.dropout = nn.Dropout(0.3)
        def forward(self, x):
            x = torch.relu(self.fc1(x))
            x = self.dropout(x)
            x = self.fc2(x)
            return x
    model = SimpleFFNN(X_train_emb.shape[1])
    optimz = optim.Adam(model.parameters(), lr=1e-3)
    crit = nn.CrossEntropyLoss()
    for epoch in range(FFNN_EPOCHS):
        model.train()
        optimz.zero_grad()
        out = model(X_train_t)
        loss = crit(out, y_train_t)
        loss.backward()
        optimz.step()
        # evaluate quick
        model.eval()
        with torch.no_grad():
            logits = model(X_val_t)
            preds = logits.argmax(dim=1).numpy()
        print(f"Epoch {epoch+1}/{FFNN_EPOCHS} loss={loss.item():.4f}")
    torch.save(model.state_dict(), os.path.join(MODEL_DIR, "ffnn_emotion.pt"))
    print("Saved FFNN model")

print("Training complete. Outputs saved to", OUTPUT_DIR)
