"""
Script untuk membandingkan performa 3 model emotion detection:
1. Mini-LM (dengan MLP)
2. TF-IDF 
3. Word2Vec

Metrics: Akurasi, Confusion Matrix, dan test dengan satu sample teks
"""

import os
import numpy as np
import pandas as pd
import joblib
import pickle
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import normalize, LabelEncoder
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import confusion_matrix, accuracy_score, classification_report, f1_score
from sentence_transformers import SentenceTransformer
from gensim.models import Word2Vec
import string

BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE_DIR, "model")
DATA_DIR = os.path.join(BASE_DIR, "data")
EMOTION_DATA = os.path.join(DATA_DIR, "EmotionDataset_clean", "EmotionDataset_standardized.csv")

# ===========================
# 1. Load Dataset
# ===========================
def load_emotion_dataset():
    """Load emotion dataset yang sudah di-standardize"""
    df = pd.read_csv(EMOTION_DATA)
    df = df.dropna(subset=["text", "label"])
    df["text"] = df["text"].astype(str).str.strip()
    df["label"] = df["label"].astype(str).str.lower().str.strip()
    VALID_LABELS = {"marah", "cemas", "senang", "sedih"}
    df = df[df["label"].isin(VALID_LABELS)]
    return df

# ===========================
# 2. Mini-LM Model
# ===========================
def evaluate_minilm(X_test, y_test, le):
    """Evaluasi Mini-LM model"""
    print("\n" + "="*60)
    print("MINI-LM MODEL EVALUATION")
    print("="*60)
    
    model_path = os.path.join(MODEL_DIR, "emotion", "emotion_minilm_clf.pkl")
    if not os.path.exists(model_path):
        print(f"❌ Mini-LM model tidak ditemukan: {model_path}")
        return None
    
    clf = joblib.load(model_path)
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average='macro')
    cm = confusion_matrix(y_test, y_pred)
    
    print(f"Accuracy: {acc:.4f} ({acc*100:.2f}%)")
    print(f"F1-Score (macro): {f1:.4f}")
    print("\nConfusion Matrix:")
    print(cm)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))
    
    return {
        "name": "Mini-LM",
        "accuracy": acc,
        "f1_score": f1,
        "predictions": y_pred,
        "confusion_matrix": cm,
        "le": le
    }

def predict_minilm_single(text):
    """Prediksi single text dengan Mini-LM"""
    le_path = os.path.join(MODEL_DIR, "emotion", "emotion_label_encoder.pkl")
    model_path = os.path.join(MODEL_DIR, "emotion", "emotion_minilm_clf.pkl")
    
    if not os.path.exists(model_path) or not os.path.exists(le_path):
        return None
    
    le = joblib.load(le_path)
    clf = joblib.load(model_path)
    
    # Encode text
    sbert = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    X = sbert.encode([text])
    X = normalize(X, norm='l2')
    
    pred = clf.predict(X)[0]
    pred_proba = clf.predict_proba(X)[0]
    
    return {
        "model": "Mini-LM",
        "prediction": le.classes_[pred],
        "confidence": float(np.max(pred_proba)),
        "probabilities": {le.classes_[i]: float(p) for i, p in enumerate(pred_proba)}
    }

# ===========================
# 3. TF-IDF Model
# ===========================
def evaluate_tfidf(texts, y_test, le):
    """Evaluasi TF-IDF model"""
    print("\n" + "="*60)
    print("TF-IDF MODEL EVALUATION")
    print("="*60)
    
    tfidf_path = os.path.join(MODEL_DIR, "tfidf", "tfidf_vectorizer.pkl")
    
    if not os.path.exists(tfidf_path):
        print(f"❌ TF-IDF vectorizer tidak ditemukan: {tfidf_path}")
        return None
    
    tfidf = joblib.load(tfidf_path)
    X_test = tfidf.transform(texts)
    
    # Cari classifier TF-IDF
    # Biasanya disimpan dengan nama berbeda, mari kita cari
    possible_paths = [
        os.path.join(MODEL_DIR, "tfidf", "tfidf_classifier.pkl"),
        os.path.join(MODEL_DIR, "tfidf_classifier.pkl"),
    ]
    
    clf_path = None
    for p in possible_paths:
        if os.path.exists(p):
            clf_path = p
            break
    
    if clf_path is None:
        print("❌ TF-IDF classifier tidak ditemukan")
        return None
    
    clf = joblib.load(clf_path)
    
    # Load TF-IDF label encoder
    le_tfidf_path = os.path.join(MODEL_DIR, "tfidf", "label_encoder_tfidf.pkl")
    if os.path.exists(le_tfidf_path):
        le = joblib.load(le_tfidf_path)
    
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)
    
    print(f"Accuracy: {acc:.4f} ({acc*100:.2f}%)")
    print("\nConfusion Matrix:")
    print(cm)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))
    
    return {
        "name": "TF-IDF",
        "accuracy": acc,
        "predictions": y_pred,
        "confusion_matrix": cm,
        "le": le,
        "tfidf": tfidf,
        "clf": clf
    }

def predict_tfidf_single(text):
    """Prediksi single text dengan TF-IDF"""
    tfidf_path = os.path.join(MODEL_DIR, "tfidf", "tfidf_vectorizer.pkl")
    
    possible_clf_paths = [
        os.path.join(MODEL_DIR, "tfidf", "tfidf_classifier.pkl"),
        os.path.join(MODEL_DIR, "tfidf_classifier.pkl"),
    ]
    
    le_path = os.path.join(MODEL_DIR, "tfidf", "label_encoder_tfidf.pkl")
    
    if not os.path.exists(tfidf_path):
        return None
    
    clf_path = None
    for p in possible_clf_paths:
        if os.path.exists(p):
            clf_path = p
            break
    
    if clf_path is None or not os.path.exists(le_path):
        return None
    
    tfidf = joblib.load(tfidf_path)
    clf = joblib.load(clf_path)
    le = joblib.load(le_path)
    
    X = tfidf.transform([text])
    pred = clf.predict(X)[0]
    pred_proba = clf.predict_proba(X)[0]
    
    return {
        "model": "TF-IDF",
        "prediction": le.classes_[pred],
        "confidence": float(np.max(pred_proba)),
        "probabilities": {le.classes_[i]: float(p) for i, p in enumerate(pred_proba)}
    }

# ===========================
# 4. Word2Vec Model
# ===========================
def preprocess_text(text):
    """Preprocessing untuk Word2Vec"""
    text = text.lower()
    text = text.translate(str.maketrans("", "", string.punctuation))
    return text.split()

def doc_to_vec(tokens, w2v_model, size=100):
    """Convert tokens to vector using Word2Vec"""
    if not tokens:
        return np.zeros(size, dtype=float)
    vecs = []
    for t in tokens:
        if t in w2v_model.wv:
            vecs.append(w2v_model.wv[t])
    if not vecs:
        return np.zeros(size, dtype=float)
    return np.mean(vecs, axis=0)

def evaluate_word2vec(texts, y_test, le):
    """Evaluasi Word2Vec model"""
    print("\n" + "="*60)
    print("WORD2VEC MODEL EVALUATION")
    print("="*60)
    
    w2v_model_path = os.path.join(MODEL_DIR, "word2vec.model")
    w2v_clf_path = os.path.join(MODEL_DIR, "word2vec_classifier.pkl")
    
    if not os.path.exists(w2v_model_path) or not os.path.exists(w2v_clf_path):
        print(f"❌ Word2Vec model tidak ditemukan")
        return None
    
    w2v_model = Word2Vec.load(w2v_model_path)
    clf = joblib.load(w2v_clf_path)
    
    # Preprocess texts dan convert to vectors
    tokens_list = [preprocess_text(text) for text in texts]
    X_test = np.array([doc_to_vec(toks, w2v_model) for toks in tokens_list])
    
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)
    
    print(f"Accuracy: {acc:.4f} ({acc*100:.2f}%)")
    print("\nConfusion Matrix:")
    print(cm)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))
    
    return {
        "name": "Word2Vec",
        "accuracy": acc,
        "predictions": y_pred,
        "confusion_matrix": cm,
        "le": le,
        "w2v_model": w2v_model,
        "clf": clf
    }

def predict_word2vec_single(text):
    """Prediksi single text dengan Word2Vec"""
    w2v_model_path = os.path.join(MODEL_DIR, "word2vec.model")
    w2v_clf_path = os.path.join(MODEL_DIR, "word2vec_classifier.pkl")
    
    possible_le_paths = [
        os.path.join(MODEL_DIR, "label_encoder_word2vec.pkl"),
        os.path.join(MODEL_DIR, "label_encoder.pkl"),
    ]
    
    if not os.path.exists(w2v_model_path) or not os.path.exists(w2v_clf_path):
        return None
    
    le_path = None
    for p in possible_le_paths:
        if os.path.exists(p):
            le_path = p
            break
    
    if le_path is None:
        return None
    
    w2v_model = Word2Vec.load(w2v_model_path)
    clf = joblib.load(w2v_clf_path)
    le = joblib.load(le_path)
    
    tokens = preprocess_text(text)
    X = np.array([doc_to_vec(tokens, w2v_model)])
    
    pred = clf.predict(X)[0]
    pred_proba = clf.predict_proba(X)[0]
    
    return {
        "model": "Word2Vec",
        "prediction": le.classes_[pred],
        "confidence": float(np.max(pred_proba)),
        "probabilities": {le.classes_[i]: float(p) for i, p in enumerate(pred_proba)}
    }

# ===========================
# 5. Visualization & Comparison
# ===========================
def plot_confusion_matrices(results):
    """Plot confusion matrix untuk semua model"""
    fig, axes = plt.subplots(1, 3, figsize=(15, 4))
    
    for idx, (ax, res) in enumerate(zip(axes, results)):
        if res is None:
            ax.text(0.5, 0.5, "Model tidak tersedia", ha='center', va='center')
            continue
        
        sns.heatmap(res["confusion_matrix"], annot=True, fmt='d', cmap='Blues', ax=ax,
                    xticklabels=res["le"].classes_, yticklabels=res["le"].classes_)
        ax.set_title(f"{res['name']}\nAccuracy: {res['accuracy']:.2%}")
        ax.set_ylabel("True Label")
        ax.set_xlabel("Predicted Label")
    
    plt.tight_layout()
    output_path = os.path.join(BASE_DIR, "model", "outputs", "confusion_matrices_comparison.png")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"\n✅ Confusion matrix comparison saved: {output_path}")
    plt.close()

def plot_accuracy_comparison(results):
    """Plot perbandingan akurasi"""
    models = [r["name"] for r in results if r is not None]
    accuracies = [r["accuracy"] * 100 for r in results if r is not None]
    
    fig, ax = plt.subplots(figsize=(8, 5))
    bars = ax.bar(models, accuracies, color=['#1f77b4', '#ff7f0e', '#2ca02c'])
    ax.set_ylabel("Accuracy (%)")
    ax.set_title("Emotion Detection Model Accuracy Comparison")
    ax.set_ylim([0, 100])
    
    # Add value labels on bars
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{height:.2f}%', ha='center', va='bottom', fontsize=12, fontweight='bold')
    
    plt.tight_layout()
    output_path = os.path.join(BASE_DIR, "model", "outputs", "accuracy_comparison.png")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"✅ Accuracy comparison saved: {output_path}")
    plt.close()

# ===========================
# 6. Main Execution
# ===========================
def main():
    print("="*60)
    print("EMOTION DETECTION MODEL COMPARISON")
    print("(Using StratifiedKFold Cross-Validation)")
    print("="*60)
    
    # Load dataset
    print("\n📚 Loading emotion dataset...")
    df = load_emotion_dataset()
    print(f"Dataset loaded: {len(df)} samples")
    print(f"Classes: {df['label'].unique()}")
    
    # Prepare data
    texts = df["text"].tolist()
    labels = df["label"].tolist()
    
    le = LabelEncoder()
    y = le.fit_transform(labels)
    
    print(f"\nUsing 5-Fold StratifiedKFold Cross-Validation...")
    
    # Initialize StratifiedKFold
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    # Store results from all folds
    minilm_accs, minilm_f1s = [], []
    tfidf_accs, tfidf_f1s = [], []
    w2v_accs, w2v_f1s = [], []
    
    all_y_test = []
    all_y_pred_minilm = []
    all_y_pred_tfidf = []
    all_y_pred_w2v = []
    
    fold_num = 1
    
    for train_idx, test_idx in skf.split(texts, y):
        print(f"\n{'='*60}")
        print(f"FOLD {fold_num}")
        print('='*60)
        
        X_test_texts = [texts[i] for i in test_idx]
        y_test = y[test_idx]
        
        all_y_test.extend(y_test)
        
        # ===== Mini-LM Evaluation =====
        print("\n🔄 Mini-LM...")
        try:
            model_path = os.path.join(MODEL_DIR, "emotion", "emotion_minilm_clf.pkl")
            minilm_clf = joblib.load(model_path)
            
            sbert = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
            X_test_minilm = sbert.encode(X_test_texts, show_progress_bar=False)
            X_test_minilm = normalize(X_test_minilm, norm='l2')
            
            y_pred = minilm_clf.predict(X_test_minilm)
            acc = accuracy_score(y_test, y_pred)
            f1 = f1_score(y_test, y_pred, average='macro')
            
            minilm_accs.append(acc)
            minilm_f1s.append(f1)
            all_y_pred_minilm.extend(y_pred)
            
            print(f"  Accuracy: {acc:.4f}, F1: {f1:.4f}")
        except Exception as e:
            print(f"  ❌ Error: {e}")
        
        # ===== TF-IDF Evaluation =====
        print("🔄 TF-IDF...")
        try:
            tfidf_path = os.path.join(MODEL_DIR, "tfidf", "tfidf_vectorizer.pkl")
            clf_path = os.path.join(MODEL_DIR, "tfidf", "tfidf_classifier.pkl")
            le_path = os.path.join(MODEL_DIR, "tfidf", "label_encoder_tfidf.pkl")
            
            tfidf = joblib.load(tfidf_path)
            tfidf_clf = joblib.load(clf_path)
            
            X_test_tfidf = tfidf.transform(X_test_texts)
            y_pred = tfidf_clf.predict(X_test_tfidf)
            acc = accuracy_score(y_test, y_pred)
            f1 = f1_score(y_test, y_pred, average='macro')
            
            tfidf_accs.append(acc)
            tfidf_f1s.append(f1)
            all_y_pred_tfidf.extend(y_pred)
            
            print(f"  Accuracy: {acc:.4f}, F1: {f1:.4f}")
        except Exception as e:
            print(f"  ❌ Error: {e}")
        
        # ===== Word2Vec Evaluation =====
        print("🔄 Word2Vec...")
        try:
            w2v_model_path = os.path.join(MODEL_DIR, "word2vec.model")
            w2v_clf_path = os.path.join(MODEL_DIR, "word2vec_classifier.pkl")
            
            w2v_model = Word2Vec.load(w2v_model_path)
            w2v_clf = joblib.load(w2v_clf_path)
            
            tokens_list = [preprocess_text(text) for text in X_test_texts]
            X_test_w2v = np.array([doc_to_vec(toks, w2v_model) for toks in tokens_list])
            
            y_pred = w2v_clf.predict(X_test_w2v)
            acc = accuracy_score(y_test, y_pred)
            f1 = f1_score(y_test, y_pred, average='macro')
            
            w2v_accs.append(acc)
            w2v_f1s.append(f1)
            all_y_pred_w2v.extend(y_pred)
            
            print(f"  Accuracy: {acc:.4f}, F1: {f1:.4f}")
        except Exception as e:
            print(f"  ❌ Error: {e}")
        
        fold_num += 1
    
    # ===========================
    # Summary & Visualization
    # ===========================
    print("\n" + "="*60)
    print("CROSS-VALIDATION SUMMARY")
    print("="*60)
    
    results = []
    
    if minilm_accs:
        avg_acc = np.mean(minilm_accs)
        avg_f1 = np.mean(minilm_f1s)
        std_acc = np.std(minilm_accs)
        print(f"\n🔵 Mini-LM:")
        print(f"   Accuracy: {avg_acc:.4f} ± {std_acc:.4f} ({avg_acc*100:.2f}%)")
        print(f"   F1-Score: {avg_f1:.4f}")
        print(f"   Folds: {[f'{a:.4f}' for a in minilm_accs]}")
        
        cm_minilm = confusion_matrix(all_y_test, all_y_pred_minilm)
        results.append({
            "name": "Mini-LM",
            "accuracy": avg_acc,
            "f1_score": avg_f1,
            "confusion_matrix": cm_minilm,
            "le": le
        })
    
    if tfidf_accs:
        avg_acc = np.mean(tfidf_accs)
        avg_f1 = np.mean(tfidf_f1s)
        std_acc = np.std(tfidf_accs)
        print(f"\n🟠 TF-IDF:")
        print(f"   Accuracy: {avg_acc:.4f} ± {std_acc:.4f} ({avg_acc*100:.2f}%)")
        print(f"   F1-Score: {avg_f1:.4f}")
        print(f"   Folds: {[f'{a:.4f}' for a in tfidf_accs]}")
        
        cm_tfidf = confusion_matrix(all_y_test, all_y_pred_tfidf)
        results.append({
            "name": "TF-IDF",
            "accuracy": avg_acc,
            "f1_score": avg_f1,
            "confusion_matrix": cm_tfidf,
            "le": le
        })
    
    if w2v_accs:
        avg_acc = np.mean(w2v_accs)
        avg_f1 = np.mean(w2v_f1s)
        std_acc = np.std(w2v_accs)
        print(f"\n🟢 Word2Vec:")
        print(f"   Accuracy: {avg_acc:.4f} ± {std_acc:.4f} ({avg_acc*100:.2f}%)")
        print(f"   F1-Score: {avg_f1:.4f}")
        print(f"   Folds: {[f'{a:.4f}' for a in w2v_accs]}")
        
        cm_w2v = confusion_matrix(all_y_test, all_y_pred_w2v)
        results.append({
            "name": "Word2Vec",
            "accuracy": avg_acc,
            "f1_score": avg_f1,
            "confusion_matrix": cm_w2v,
            "le": le
        })
    
    # Best model
    if results:
        print("\n" + "="*60)
        best_model = max(results, key=lambda x: x['accuracy'])
        print(f"🏆 Best Model: {best_model['name']} ({best_model['accuracy']*100:.2f}%)")
        print("="*60)
    
    # Plot visualizations
    plot_confusion_matrices(results)
    plot_accuracy_comparison(results)
    
    # ===========================
    # Test dengan sample teks
    # ===========================
    print("\n" + "="*60)
    print("TESTING WITH SAMPLE TEXT")
    print("="*60)
    
    test_text = "Saya merasa sangat sedih akhir-akhir ini"
    print(f"\nTest text: \"{test_text}\"")
    
    # Mini-LM prediction
    print("\n--- Mini-LM ---")
    pred_minilm = predict_minilm_single(test_text)
    if pred_minilm:
        print(f"Prediction: {pred_minilm['prediction']} (confidence: {pred_minilm['confidence']:.4f})")
        print("Probabilities:")
        for emotion, prob in pred_minilm['probabilities'].items():
            print(f"  {emotion}: {prob:.4f}")
    else:
        print("❌ Model tidak tersedia")
    
    # TF-IDF prediction
    print("\n--- TF-IDF ---")
    pred_tfidf = predict_tfidf_single(test_text)
    if pred_tfidf:
        print(f"Prediction: {pred_tfidf['prediction']} (confidence: {pred_tfidf['confidence']:.4f})")
        print("Probabilities:")
        for emotion, prob in pred_tfidf['probabilities'].items():
            print(f"  {emotion}: {prob:.4f}")
    else:
        print("❌ Model tidak tersedia")
    
    # Word2Vec prediction
    print("\n--- Word2Vec ---")
    pred_w2v = predict_word2vec_single(test_text)
    if pred_w2v:
        print(f"Prediction: {pred_w2v['prediction']} (confidence: {pred_w2v['confidence']:.4f})")
        print("Probabilities:")
        for emotion, prob in pred_w2v['probabilities'].items():
            print(f"  {emotion}: {prob:.4f}")
    else:
        print("❌ Model tidak tersedia")
    
    print("\n" + "="*60)
    print("✅ Evaluation Complete!")
    print("="*60)

if __name__ == "__main__":
    main()
