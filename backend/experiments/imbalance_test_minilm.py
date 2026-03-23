# backend/experiments/imbalance_test_minilm.py
import pickle
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, f1_score

# ==============================
# LOAD MINI LM EMBEDDING DATA
# ==============================
DATA_PATH = "backend/model/minilm/minilm_data.pkl"

with open(DATA_PATH, "rb") as f:
    X_train, y_train, X_test, y_test = pickle.load(f)

X_train = np.array(X_train)
X_test = np.array(X_test)
y_train = np.array(y_train)
y_test = np.array(y_test)

print("Train size:", X_train.shape)
print("Test size :", X_test.shape)

# ==============================
# BASELINE MODEL
# ==============================
baseline_clf = LogisticRegression(
    max_iter=2000,
    n_jobs=-1
)

baseline_clf.fit(X_train, y_train)
y_pred_base = baseline_clf.predict(X_test)

print("\n=== BASELINE (NO CLASS WEIGHT) ===")
print(classification_report(y_test, y_pred_base, digits=4))
print("Macro-F1:", f1_score(y_test, y_pred_base, average="macro"))

# ==============================
# BALANCED MODEL
# ==============================
balanced_clf = LogisticRegression(
    max_iter=2000,
    class_weight="balanced",
    n_jobs=-1
)

balanced_clf.fit(X_train, y_train)
y_pred_bal = balanced_clf.predict(X_test)

print("\n=== BALANCED (CLASS_WEIGHT='balanced') ===")
print(classification_report(y_test, y_pred_bal, digits=4))
print("Macro-F1:", f1_score(y_test, y_pred_bal, average="macro"))
