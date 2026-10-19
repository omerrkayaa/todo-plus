"""Raporda kullanilan mimari diyagramlarini (PNG) uretir.

Kaynak degil, gorsel yardimci materyaldir; Docket_Genel_Proje_Raporu.md
icinde [[IMG:rapor-gorseller/<dosya>.png|Aciklama]] seklinde referans verilir
ve scripts/build_full_report.py tarafindan docx'e gomulur.

Kullanim:
    python scripts/generate_report_diagrams.py
"""

from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "rapor-gorseller"
OUT_DIR.mkdir(exist_ok=True)

NAVY = "#17324D"
BLUE = "#2563EB"
LIGHT = "#EAF1FB"
PALE = "#F4F6F9"
GREEN = "#18794E"
AMBER = "#9A6700"
INK = "#17202A"
GRAY = "#667085"
WHITE = "#FFFFFF"

plt.rcParams["font.family"] = "DejaVu Sans"


def new_fig(w, h):
    fig, ax = plt.subplots(figsize=(w, h), dpi=200)
    ax.set_xlim(0, w)
    ax.set_ylim(0, h)
    ax.axis("off")
    return fig, ax


def box(ax, x, y, w, h, text, fc=LIGHT, ec=NAVY, tc=INK, fs=11, bold=True, lw=1.6):
    p = FancyBboxPatch(
        (x, y), w, h,
        boxstyle="round,pad=0.02,rounding_size=0.08",
        linewidth=lw, edgecolor=ec, facecolor=fc,
    )
    ax.add_patch(p)
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center",
             fontsize=fs, color=tc, fontweight="bold" if bold else "normal",
             wrap=True)
    return p


def arrow(ax, x1, y1, x2, y2, color=NAVY, lw=2.0, label=None, style="-|>", ls="solid"):
    a = FancyArrowPatch((x1, y1), (x2, y2), arrowstyle=style, mutation_scale=16,
                         linewidth=lw, color=color, linestyle=ls)
    ax.add_patch(a)
    if label:
        ax.text((x1 + x2) / 2, (y1 + y2) / 2 + 0.18, label, ha="center", va="bottom",
                 fontsize=9, color=GRAY, style="italic")


def save(fig, name):
    path = OUT_DIR / name
    fig.savefig(path, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print(path)


# ---------------------------------------------------------------------------
# 1) Iki calisma modu
# ---------------------------------------------------------------------------
fig, ax = new_fig(10, 5.2)
box(ax, 3.2, 3.9, 3.6, 1.0, "Docket — Tek Kod Tabanı\n(index.html / app.js)", fc=NAVY, tc=WHITE, fs=12)
box(ax, 0.4, 1.2, 4.0, 1.5, "DEMO MOD\n\nsupabaseReady = false\nVeri: tarayıcı localStorage\nKurulum gerekmez", fc=LIGHT, ec=BLUE, fs=10.5)
box(ax, 5.6, 1.2, 4.0, 1.5, "SUPABASE MODU\n\nsupabaseReady = true\nVeri: PostgreSQL + Auth\nÇok kullanıcılı, kalıcı", fc=LIGHT, ec=GREEN, fs=10.5)
arrow(ax, 4.3, 3.9, 2.4, 2.7, label="supabase-config.js boş")
arrow(ax, 6.1, 3.9, 7.6, 2.7, label="supabase-config.js dolu")
ax.text(5, 0.55, "Aynı arayüz kodu, tek değişkenle iki farklı veri katmanına bağlanır — kod tekrarı yok.",
        ha="center", fontsize=9.5, color=GRAY, style="italic")
save(fig, "iki-calisma-modu.png")

# ---------------------------------------------------------------------------
# 2) Iki katmanli savunma
# ---------------------------------------------------------------------------
fig, ax = new_fig(10, 5.4)
box(ax, 3.5, 4.4, 3.0, 0.9, "Kullanıcı İsteği\n(örn. görev başlığını değiştir)", fc=PALE, ec=GRAY, fs=10.5, tc=INK)
box(ax, 0.6, 2.6, 4.0, 1.3, "1) ARAYÜZ (UI) KATMANI\n\ndisabled alan, gizli buton\n→ kullanıcı deneyimi içindir", fc=LIGHT, ec=BLUE, fs=10)
box(ax, 5.4, 2.6, 4.0, 1.3, "2) VERİTABANI KATMANI\n\nprotect_task_management_fields\n(PostgreSQL trigger)", fc="#FFF4E5", ec=AMBER, fs=10)
box(ax, 5.4, 0.5, 4.0, 1.3, "Yetkisiz değişiklik\nveritabanı seviyesinde\nREDDEDİLİR", fc="#FCE8E6", ec="#B3261E", fs=10.5, tc="#7A1E17")
arrow(ax, 5, 4.4, 2.6, 3.9)
arrow(ax, 5, 4.4, 7.4, 3.9, label="konsoldan atlatılsa bile")
arrow(ax, 7.4, 2.6, 7.4, 1.8)
ax.text(5, 0.05, "Gerçek güvenlik sınırı her zaman veritabanı katmanındadır — arayüz sadece ilk savunma hattıdır (\"defense in depth\").",
        ha="center", fontsize=9.3, color=GRAY, style="italic")
save(fig, "iki-katmanli-savunma.png")

# ---------------------------------------------------------------------------
# 3) Offline sync - uc yonlu birlestirme
# ---------------------------------------------------------------------------
fig, ax = new_fig(10, 5.6)
box(ax, 0.3, 3.9, 2.7, 1.0, "TABAN\n(son senkron veri)", fc=PALE, ec=GRAY, fs=10)
box(ax, 3.65, 3.9, 2.7, 1.0, "YEREL\n(cihazda değişen)", fc=LIGHT, ec=BLUE, fs=10)
box(ax, 7.0, 3.9, 2.7, 1.0, "BULUT\n(sunucuda değişen)", fc=LIGHT, ec=GREEN, fs=10)
box(ax, 2.8, 2.1, 4.4, 1.1, "app-sync-merge.js\nalan bazlı üç yönlü birleştirme\n(15 birim testle doğrulanmış)", fc=NAVY, tc=WHITE, fs=10)
box(ax, 0.6, 0.3, 4.0, 1.3, "Sadece bir taraf değişmiş\n→ otomatik birleşir,\nveri kaybı olmaz", fc="#E6F4EA", ec=GREEN, fs=10)
box(ax, 5.4, 0.3, 4.0, 1.3, "İki taraf da aynı alanı\nfarklı değiştirmiş\n→ \"Hangisi kalsın?\" kartı", fc="#FFF4E5", ec=AMBER, fs=10)
for x in (1.65, 5.0, 8.35):
    arrow(ax, x, 3.9, 5.0, 3.2)
arrow(ax, 3.8, 2.1, 2.6, 1.6)
arrow(ax, 6.2, 2.1, 7.4, 1.6)
save(fig, "offline-sync-uc-yonlu-birlestirme.png")

# ---------------------------------------------------------------------------
# 4) RAG dokuman asistani pipeline
# ---------------------------------------------------------------------------
fig, ax = new_fig(10, 6.2)
box(ax, 3.4, 5.1, 3.2, 0.9, "PDF / DOCX / TXT\nyükleme (görev eki)", fc=PALE, ec=GRAY, fs=10)
box(ax, 3.4, 3.8, 3.2, 0.9, "Backend metni çıkarır\n(server/index.js)", fc=LIGHT, ec=BLUE, fs=10)
box(ax, 0.4, 2.4, 3.9, 1.1, "KISA doküman\n→ doğrudan Gemini'ye\nbağlam olarak verilir", fc="#E6F4EA", ec=GREEN, fs=9.8)
box(ax, 5.7, 2.4, 3.9, 1.1, "UZUN doküman\n→ parçalara bölünür (chunk)\n→ Voyage AI ile vektörleştirilir\n→ Supabase pgvector'da saklanır", fc="#FFF4E5", ec=AMBER, fs=9.3)
box(ax, 5.7, 1.0, 3.9, 1.0, "Kullanıcı soru sorar\n→ soru da vektöre çevrilir\n→ en alakalı parçalar bulunur", fc=LIGHT, ec=BLUE, fs=9.3)
box(ax, 3.0, -0.3, 4.0, 1.0, "Google Gemini API\ncevabı üretir", fc=NAVY, tc=WHITE, fs=10.5)
arrow(ax, 5.0, 5.1, 5.0, 4.7)
arrow(ax, 4.3, 3.8, 2.3, 3.5)
arrow(ax, 5.7, 3.8, 7.6, 3.5)
arrow(ax, 7.6, 2.4, 7.6, 2.0)
arrow(ax, 2.3, 2.4, 4.2, 0.4, label="bağlam")
arrow(ax, 7.6, 1.0, 5.6, 0.2, label="ilgili parçalar")
save(fig, "rag-dokuman-asistani.png")

# ---------------------------------------------------------------------------
# 5) 10 fazli gelisim zaman cizelgesi
# ---------------------------------------------------------------------------
phases = [
    ("9 Tem", "1. Temel"),
    ("12 Tem", "2. Çok kullanıcı"),
    ("13 Tem", "3. Erişilebilirlik"),
    ("14 Tem", "4. AI entegrasyonu"),
    ("15 Tem", "5. Asistan olgunlaştırma"),
    ("16 Tem", "6. Zengin özellikler"),
    ("17 Tem", "7. Arayüz cilası"),
    ("18 Tem", "8. Otomasyon"),
    ("19 Tem", "9. Kalite/dayanıklılık"),
    ("20 Tem", "10. UX iyileştirme"),
]
fig, ax = new_fig(12, 4.4)
n = len(phases)
xs = [0.7 + i * (10.6 / (n - 1)) for i in range(n)]
ax.plot([xs[0] - 0.3, xs[-1] + 0.3], [2.2, 2.2], color=NAVY, linewidth=3, zorder=1)
for i, (date, label) in enumerate(phases):
    x = xs[i]
    ax.scatter([x], [2.2], s=170, color=BLUE if i % 2 == 0 else NAVY, zorder=3, edgecolor="white", linewidth=1.5)
    y_text = 2.9 if i % 2 == 0 else 1.5
    va = "bottom" if i % 2 == 0 else "top"
    ax.plot([x, x], [2.2, y_text + (0.05 if i % 2 == 0 else -0.05)], color=GRAY, linewidth=1, zorder=2, linestyle=(0, (2, 2)))
    ax.text(x, y_text + (0.15 if i % 2 == 0 else -0.15), label, ha="center", va=va, fontsize=8.6, color=INK, fontweight="bold", wrap=True)
    ax.text(x, 2.2 - 0.32 if i % 2 == 0 else 2.2 + 0.32, date, ha="center", va="top" if i % 2 == 0 else "bottom", fontsize=8, color=GRAY)
ax.set_xlim(0, 12)
ax.set_ylim(0, 4.4)
save(fig, "gelisim-zaman-cizelgesi.png")

# ---------------------------------------------------------------------------
# 6) Veri modeli (ER diyagrami, sadelestirilmis)
# ---------------------------------------------------------------------------
fig, ax = new_fig(11, 7.4)
box(ax, 4.0, 6.3, 3.0, 0.85, "USERS", fc=NAVY, tc=WHITE, fs=11.5)
box(ax, 4.0, 4.9, 3.0, 0.85, "PROJECTS", fc=LIGHT, ec=BLUE, fs=11)
box(ax, 4.0, 3.5, 3.0, 0.85, "TASKS", fc=LIGHT, ec=BLUE, fs=11)
box(ax, 0.2, 1.9, 2.2, 0.85, "TASK_\nASSIGNMENTS", fc=PALE, ec=GRAY, fs=9.5, bold=False)
box(ax, 2.7, 1.9, 2.2, 0.85, "TASK_\nGIVERS", fc=PALE, ec=GRAY, fs=9.5, bold=False)
box(ax, 5.2, 1.9, 2.2, 0.85, "TASK_\nHISTORY", fc=PALE, ec=GRAY, fs=9.5, bold=False)
box(ax, 7.7, 1.9, 2.2, 0.85, "TASK_\nCOMMENTS", fc=PALE, ec=GRAY, fs=9.5, bold=False)
box(ax, 4.4, 0.3, 2.2, 0.85, "TASK_\nATTACHMENTS", fc="#FFF4E5", ec=AMBER, fs=9.5, bold=False)

arrow(ax, 5.5, 6.3, 5.5, 5.75, label="oluşturur (1:N)")
arrow(ax, 5.5, 4.9, 5.5, 4.35, label="içerir (1:N)")
for cx in (1.3, 3.8, 6.3, 8.8):
    arrow(ax, 5.0, 3.5, cx + 1.1, 2.75)
arrow(ax, 5.5, 1.9, 5.5, 1.15)

ax.text(5.5, 7.55, "Docket Veri Modeli (özet)", ha="center", fontsize=13, fontweight="bold", color=NAVY)
ax.text(5.5, -0.15, "Her tablo Row Level Security (RLS) ile korunur; bir kullanıcı yalnızca ilişkili olduğu satırları görebilir.",
        ha="center", fontsize=9.3, color=GRAY, style="italic")
save(fig, "veri-modeli-er.png")

print("Tum diyagramlar uretildi:", OUT_DIR)
