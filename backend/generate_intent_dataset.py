# backend/generate_intent_dataset.py
import csv
import random
import os

random.seed(42)

OUT_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(OUT_DIR, exist_ok=True)
OUT_FILE = os.path.join(OUT_DIR, "intent_dataset.csv")

INTENTS = ["curhat", "meminta_saran", "mencari_informasi"]

TEMPLATES = {
    "curhat": [
        "Aku lagi ngerasa down akhir-akhir ini, bingung mau cerita ke siapa.",
        "Saya merasa sangat tertekan karena tugas menumpuk dan tidak tahu harus bagaimana.",
        "Temenku nyelekit terus, jadi aku kesal banget hari ini.",
        "Kayaknya aku butuh curhat, ada yang bisa dengerin?",
        "Jujur aku lagi sedih karena nilai ku jeblok semester ini.",
        "Gimana ya, aku sering nggak semangat kuliah akhir-akhir ini.",
        "Duh, rasanya semua beban numpuk, nggak tahu harus mulai dari mana.",
        "Aku sedih banget karena kangen rumah dan merasa kesepian.",
        "Ada yang pernah ngerasain panik sebelum presentasi terus susah tidur?",
        "Aku kesel karena teman kelompok males kerja sama."
    ],
    "meminta_saran": [
        "Boleh minta saran soal cara belajar efektif buat ujian?",
        "Bagaimana cara atur waktu biar tugas selesai tepat waktu?",
        "Tips menghadapi rasa cemas saat presentasi ada gak?",
        "Saran dong kalau aku susah fokus belajar di kos.",
        "Ada rekomendasi teknik relaksasi singkat sebelum ujian?",
        "Gimana caranya supaya bisa tenang saat deadline mendekat?",
        "Apa yang harus dilakukan kalau merasa burnout?",
        "Bolehkah saya minta tips untuk manajemen stres?",
        "Cara mengatasi grogi saat wawancara kerja gimana ya?",
        "Saya butuh saran untuk memperbaiki hubungan sama teman."
    ],
    "mencari_informasi": [
        "Di mana saya bisa mendaftar konseling kampus?",
        "Bagaimana prosedur untuk membuat janji dengan psikolog kampus?",
        "Jam operasional ULBK hari kerja berapa saja?",
        "Apa persyaratan untuk mendapatkan layanan konseling?",
        "Bagaimana cara menghubungi admin ULBK via web?",
        "Dimana saya bisa lihat jadwal konselor minggu ini?",
        "Apa nomor darurat kampus jika ada krisis?",
        "Bagaimana mekanisme pendaftaran konseling online?",
        "Dokumen apa yang diperlukan saat konsultasi tatap muka?",
        "Adakah panduan atau materi relaksasi dari kampus?"
    ]
}

rows = []
target = 300
i = 0
while len(rows) < target:
    for intent, templates in TEMPLATES.items():
        base = random.choice(templates)
        pref = random.choice(["", "Halo, ", "Maaf, ", "Ya ampun, ", "Permisi, "])
        suf = random.choice(["", " Terima kasih.", " Mohon bantuannya.", " :( ", " :)"])
        if random.random() < 0.15:
            base = base.replace(" ", " ").replace("aku", random.choice(["aku","gw","saya"]))
        if random.random() < 0.12:
            base = base + random.choice([" banget", " nih", " ya"])
        text = (pref + base + suf).strip()
        rows.append((text, intent))
        if len(rows) >= target:
            break

random.shuffle(rows)

with open(OUT_FILE, "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["text", "intent"])
    for text, intent in rows:
        writer.writerow([text, intent])

print(f"Wrote {len(rows)} rows to {OUT_FILE}")
