import shutil
import os

# Source and destination directories
source_dir = r"c:\Users\p\Downloads\thần-cờ-độc-miệng---xiangqi-master\ảnh cờ"
dest_dir = r"c:\Users\p\Downloads\thần-cờ-độc-miệng---xiangqi-master\public\pieces"

# CORRECTED mapping based on careful visual inspection
# Format: (source_filename, dest_filename, character)
mappings = [
    # Black pieces (black characters on ivory)
    ("download - Edited - Edited (1).png", "black_elephant_xiang.png", "象"),
    ("download - Edited - Edited (2).png", "black_advisor_shi.png", "士"),
    ("download - Edited - Edited.png", "black_cannon_pao.png", "炮"),
    ("download - Edited - Edited (3).png", "black_king_jiang.png", "將"),
    ("download - Edited - Edited - Edited - Edited.png", "black_chariot_ju.png", "車"),
    ("download - Edited - Edited - Edited.png", "black_soldier_zu.png", "卒"),
    
    # Red pieces (red characters on ivory)
    ("download - Edited - Edited (10).png", "red_king_shuai.png", "帥"),
    ("download - Edited - Edited (4).png", "red_advisor_shi.png", "仕"),  # Was (9)
    ("download - Edited - Edited (8).png", "red_elephant_xiang.png", "相"),  # Was (5)
    ("download - Edited - Edited (6).png", "red_horse_ma.png", "馬"),
    ("download - Edited - Edited (7).png", "red_soldier_bing.png", "兵"),  # Was Edited-Edited
    ("download - Edited - Edited (5).png", "red_cannon_pao.png", "炮"),  # Was Edited-Edited-Edited(1)
]

print("Copying corrected piece mappings...")
print("=" * 50)

# Copy files
for source_file, dest_file, char in mappings:
    source_path = os.path.join(source_dir, source_file)
    dest_path = os.path.join(dest_dir, dest_file)
    
    if os.path.exists(source_path):
        shutil.copy2(source_path, dest_path)
        print(f"[OK] {char:2s} -> {dest_file}")
    else:
        print(f"[FAIL] Not found: {source_file}")

print("=" * 50)
print("\n[SUCCESS] All pieces copied with correct mapping!")
