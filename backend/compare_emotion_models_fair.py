"""
Evaluasi model emotion detection dengan data ORIGINAL (tanpa augmentasi)
Menggunakan 5-Fold StratifiedKFold CV untuk fair comparison

Models:
1. Mini-LM + MLP
2. TF-IDF + LogisticRegression  
3. Word2Vec + GaussianNB (dari training sebelumnya)
"""

import os
import numpy as np
import pandas as pd
import joblib
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

VALID_LABELS = {"marah", "cemas", "senang", "sedih"}

# ===========================
# Data Loading
# ===========================
def load_emotion_dataset():
    """Load emotion dataset - ORIGINAL DATA WITHOUT AUGMENTATION"""
    df = pd.read_csv(EMOTION_DATA)
    df = df.dropna(subset=["text", "label"])
    df["text"] = df["text"].astype(str).str.strip()
    df["label"] = df["label"].astype(str).str.lower().str.strip()
    df = df[df["label"].isin(VALID_LABELS)]
    if df.empty:
        raise RuntimeError("Dataset kosong!")
    print(f"✓ Dataset loaded: {len(df)} samples (ORIGINAL, NO AUGMENTATION)")
    return df

# ===========================
# Helper Functions
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

# ===========================
# Visualization Functions
# ===========================
def plot_confusion_matrices(results):
    """Plot confusion matrix untuk semua model"""
    fig, axes = plt.subplots(1, 3, figsize=(16, 4))
    
    for idx, (ax, res) in enumerate(zip(axes, results)):
        if res is None:
            ax.text(0.5, 0.5, "Model tidak tersedia", ha='center', va='center')
            continue
        
        sns.heatmap(res["confusion_matrix"], annot=True, fmt='d', cmap='Blues', ax=ax,
                    xticklabels=res["le"].classes_, yticklabels=res["le"].classes_)
        ax.set_title(f"{res['name']}\nAccuracy: {res['accuracy']:.2%} ± {res.get('std_acc', 0):.2%}")
        ax.set_ylabel("True Label")
        ax.set_xlabel("Predicted Label")
    
    plt.tight_layout()
    output_path = os.path.join(BASE_DIR, "model", "outputs", "confusion_matrices_cv_fair.png")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"\n✅ Confusion matrix comparison saved: {output_path}")
    plt.close()

def plot_accuracy_comparison(results):
    """Plot perbandingan akurasi dengan error bar"""
    models = []
    accuracies = []
    stds = []
    
    for r in results:
        if r is not None:
            models.append(r["name"])
            accuracies.append(r["accuracy"] * 100)
            stds.append(r.get("std_acc", 0) * 100)
    
    fig, ax = plt.subplots(figsize=(10, 6))
    colors = ['#1f77b4', '#ff7f0e', '#2ca02c']
    bars = ax.bar(models, accuracies, yerr=stds, capsize=10, color=colors, alpha=0.8, error_kw={'elinewidth': 2})
    
    ax.set_ylabel("Accuracy (%)", fontsize=12)
    ax.set_title("Emotion Detection Model Accuracy Comparison\n(5-Fold Stratified CV, Original Data)", fontsize=14)
    ax.set_ylim([0, 105])
    
    # Add value labels on bars
    for i, (bar, acc, std) in enumerate(zip(bars, accuracies, stds)):
        ax.text(bar.get_x() + bar.get_width()/2., acc + std + 2,
                f'{acc:.2f}%\n±{std:.2f}%', ha='center', va='bottom', fontsize=11, fontweight='bold')
    
    plt.tight_layout()
    output_path = os.path.join(BASE_DIR, "model", "outputs", "accuracy_comparison_cv_fair.png")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"✅ Accuracy comparison saved: {output_path}")
    plt.close()

# ===========================
# Main Execution
# ===========================
def main():
    print("\n" + "="*70)
    print("EMOTION DETECTION MODEL COMPARISON")
    print("(5-Fold Stratified CV with Original Data - Fair Evaluation)")
    print("="*70)
    
    # Load dataset
    print("\n📚 Loading emotion dataset...")
    df = load_emotion_dataset()
    print(f"Classes: {sorted(df['label'].unique())}")
    print(f"Distribution:\n{df['label'].value_counts().sort_index()}")
    
    # Prepare data
    texts = df["text"].tolist()
    labels = df["label"].tolist()
    
    le = LabelEncoder()
    y = le.fit_transform(labels)
    
    print(f"\n🔄 Using 5-Fold StratifiedKFold Cross-Validation (Fair Comparison)...")
    
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
        print(f"\n{'-'*70}")
        print(f"FOLD {fold_num}")
        print('-'*70)
        
        X_test_texts = [texts[i] for i in test_idx]
        y_test = y[test_idx]
        
        all_y_test.extend(y_test)
        
        # ===== Mini-LM Evaluation =====
        print("🔵 Mini-LM...", end=" ")
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
            
            print(f"✓ Acc: {acc:.4f}, F1: {f1:.4f}")
        except Exception as e:
            print(f"✗ Error: {e}")
        
        # ===== TF-IDF Evaluation =====
        print("🟠 TF-IDF...", end=" ")
        try:
            tfidf_path = os.path.join(MODEL_DIR, "tfidf", "tfidf_vectorizer.pkl")
            clf_path = os.path.join(MODEL_DIR, "tfidf", "tfidf_classifier.pkl")
            
            tfidf = joblib.load(tfidf_path)
            tfidf_clf = joblib.load(clf_path)
            
            X_test_tfidf = tfidf.transform(X_test_texts)
            y_pred = tfidf_clf.predict(X_test_tfidf)
            acc = accuracy_score(y_test, y_pred)
            f1 = f1_score(y_test, y_pred, average='macro')
            
            tfidf_accs.append(acc)
            tfidf_f1s.append(f1)
            all_y_pred_tfidf.extend(y_pred)
            
            print(f"✓ Acc: {acc:.4f}, F1: {f1:.4f}")
        except Exception as e:
            print(f"✗ Error: {e}")
        
        # ===== Word2Vec Evaluation =====
        print("🟢 Word2Vec...", end=" ")
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
            
            print(f"✓ Acc: {acc:.4f}, F1: {f1:.4f}")
        except Exception as e:
            print(f"✗ Error: {e}")
        
        fold_num += 1
    
    # ===========================
    # Summary & Visualization
    # ===========================
    print("\n" + "="*70)
    print("📊 CROSS-VALIDATION SUMMARY (FAIR COMPARISON)")
    print("="*70)
    
    results = []
    
    if minilm_accs:
        avg_acc = np.mean(minilm_accs)
        avg_f1 = np.mean(minilm_f1s)
        std_acc = np.std(minilm_accs)
        print(f"\n🔵 Mini-LM:")
        print(f"   Accuracy: {avg_acc:.4f} ± {std_acc:.4f} ({avg_acc*100:.2f}%)")
        print(f"   F1-Score: {avg_f1:.4f}")
        print(f"   Per-fold: {[f'{a*100:.2f}%' for a in minilm_accs]}")
        
        cm_minilm = confusion_matrix(all_y_test, all_y_pred_minilm)
        results.append({
            "name": "Mini-LM",
            "accuracy": avg_acc,
            "std_acc": std_acc,
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
        print(f"   Per-fold: {[f'{a*100:.2f}%' for a in tfidf_accs]}")
        
        cm_tfidf = confusion_matrix(all_y_test, all_y_pred_tfidf)
        results.append({
            "name": "TF-IDF",
            "accuracy": avg_acc,
            "std_acc": std_acc,
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
        print(f"   Per-fold: {[f'{a*100:.2f}%' for a in w2v_accs]}")
        
        cm_w2v = confusion_matrix(all_y_test, all_y_pred_w2v)
        results.append({
            "name": "Word2Vec",
            "accuracy": avg_acc,
            "std_acc": std_acc,
            "f1_score": avg_f1,
            "confusion_matrix": cm_w2v,
            "le": le
        })
    
    # Best model
    if results:
        print("\n" + "-"*70)
        best_model = max(results, key=lambda x: x['accuracy'])
        print(f"🏆 BEST MODEL: {best_model['name']} ({best_model['accuracy']*100:.2f}%)")
        print("-"*70)
    
    # Plot visualizations
    plot_confusion_matrices(results)
    plot_accuracy_comparison(results)
    
    # ===========================
    # Test dengan sample teks
    # ===========================
    print("\n" + "="*70)
    print("💬 TESTING WITH SAMPLE TEXT")
    print("="*70)
    
    test_text = "Saya merasa sangat sedih akhir-akhir ini"
    print(f"\nTest: \"{test_text}\"")
    
    # Mini-LM prediction
    print("\n🔵 Mini-LM:")
    try:
        le_path = os.path.join(MODEL_DIR, "emotion", "emotion_label_encoder.pkl")
        model_path = os.path.join(MODEL_DIR, "emotion", "emotion_minilm_clf.pkl")
        
        le_test = joblib.load(le_path)
        clf = joblib.load(model_path)
        
        sbert = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        X = sbert.encode([test_text])
        X = normalize(X, norm='l2')
        
        pred = clf.predict(X)[0]
        pred_proba = clf.predict_proba(X)[0]
        
        print(f"   Prediction: {le_test.classes_[pred]} (confidence: {np.max(pred_proba):.4f})")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # TF-IDF prediction
    print("\n🟠 TF-IDF:")
    try:
        tfidf_path = os.path.join(MODEL_DIR, "tfidf", "tfidf_vectorizer.pkl")
        clf_path = os.path.join(MODEL_DIR, "tfidf", "tfidf_classifier.pkl")
        le_path = os.path.join(MODEL_DIR, "tfidf", "label_encoder_tfidf.pkl")
        
        tfidf = joblib.load(tfidf_path)
        clf = joblib.load(clf_path)
        le_test = joblib.load(le_path)
        
        X = tfidf.transform([test_text])
        pred = clf.predict(X)[0]
        pred_proba = clf.predict_proba(X)[0]
        
        print(f"   Prediction: {le_test.classes_[pred]} (confidence: {np.max(pred_proba):.4f})")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # Word2Vec prediction
    print("\n🟢 Word2Vec:")
    try:
        w2v_model_path = os.path.join(MODEL_DIR, "word2vec.model")
        clf_path = os.path.join(MODEL_DIR, "word2vec_classifier.pkl")
        le_path = os.path.join(MODEL_DIR, "label_encoder_word2vec.pkl")
        
        w2v_model = Word2Vec.load(w2v_model_path)
        clf = joblib.load(clf_path)
        le_test = joblib.load(le_path)
        
        tokens = preprocess_text(test_text)
        X = np.array([doc_to_vec(tokens, w2v_model)])
        
        pred = clf.predict(X)[0]
        pred_proba = clf.predict_proba(X)[0]
        
        print(f"   Prediction: {le_test.classes_[pred]} (confidence: {np.max(pred_proba):.4f})")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    print("\n" + "="*70)
    print("✅ Evaluation Complete!")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
