#backend/model/open_pkl.py
import joblib

def open_joblib_file(path=r"C:\Users\DIMAS ANGGORO SAKTI\Dropbox\My PC (LAPTOP-FMDVD92V)\Downloads\New folder (20)\backend\model\emotion_model.pkl"):
    try:
        le = joblib.load(path)

        print("=== File Loaded Successfully (JOBLIB) ===")
        print("Type:", type(le))

        # Show full content of the label encoder
        print("\nContent:")
        print(le)

        # If it's a LabelEncoder, print the learned classes
        if hasattr(le, "classes_"):
            print("\nLabelEncoder classes:")
            for c in le.classes_:
                print(" -", c)
        else:
            print("\nNo classes_ found inside this object.")

        return le

    except FileNotFoundError:
        print("Error: File not found:", path)
    except Exception as e:
        print("Error loading with joblib:", e)

if __name__ == "__main__":
    open_joblib_file()
