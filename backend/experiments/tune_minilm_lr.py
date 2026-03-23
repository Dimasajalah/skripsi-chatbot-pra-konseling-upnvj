# backend/experiments/tune_minilm_lr.py
import pickle
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score, classification_report

DATA_PATH = "backend/model/minilm/minilm_data.pkl"

with open(DATA_PATH, "rb") as f:
    X_train, y_train, X_test, y_test = pickle.load(f)

X_train = np.array(X_train)
X_test = np.array(X_test)
y_train = np.array(y_train)
y_test = np.array(y_test)

C_values = [0.01, 0.1, 1, 10]
solvers = ["liblinear", "lbfgs"]

results = []

for C in C_values:
    for solver in solvers:
        clf = LogisticRegression(
            C=C,
            solver=solver,
            class_weight="balanced",
            max_iter=3000,
            n_jobs=-1
        )

        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)

        macro_f1 = f1_score(y_test, y_pred, average="macro")

        results.append({
            "C": C,
            "solver": solver,
            "macro_f1": macro_f1
        })

        print(f"C={C}, solver={solver} → Macro-F1={macro_f1:.4f}")

df_results = pd.DataFrame(results).sort_values(
    by="macro_f1", ascending=False
)

print("\n=== TUNING SUMMARY ===")
print(df_results)

best = df_results.iloc[0]
print("\n=== BEST CONFIGURATION ===")
print(best)

best_clf = LogisticRegression(
    C=best["C"],
    solver=best["solver"],
    class_weight="balanced",
    max_iter=3000,
    n_jobs=-1
)

best_clf.fit(X_train, y_train)
y_best = best_clf.predict(X_test)

print("\n=== CLASSIFICATION REPORT (BEST MODEL) ===")
print(classification_report(y_test, y_best, digits=4))
print("Best Macro-F1:", f1_score(y_test, y_best, average="macro"))
