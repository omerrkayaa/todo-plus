"""Docket_Genel_Proje_Raporu.md dosyasini birebir Word (.docx) belgesine cevirir.

Kaynak Markdown dosyasi tek gercek kaynaktir (source of truth); bu script icerigi
elle tekrar yazmak yerine dogrudan o dosyayi parse edip bicimlendirir, boylece
rapor guncellendiginde iki dosyanin birbirinden sapmasi (icerik eksikligi) onlenir.

Kullanim:
    python scripts/build_full_report.py
"""

import re
from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "Docket_Genel_Proje_Raporu.md"
SHOTS = ROOT / "screenshots"
OUT = ROOT / "Docket_Proje_Raporu.docx"

NAVY = "17324D"
BLUE = "2563EB"
INK = "17202A"
GRAY = "667085"
LIGHT = "EAF1FB"
WHITE = "FFFFFF"


def set_font(run, size=11, bold=False, color=INK, italic=False, name="Calibri"):
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), name)
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = RGBColor.from_string(color)


def shade(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=80, start=110, bottom=80, end=110):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for edge, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{edge}"))
        if node is None:
            node = OxmlElement(f"w:{edge}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_table_geometry(table, widths):
    table.autofit = False
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    tbl_pr = table._tbl.tblPr
    tbl_w = tbl_pr.find(qn("w:tblW"))
    if tbl_w is None:
        tbl_w = OxmlElement("w:tblW")
        tbl_pr.append(tbl_w)
    tbl_w.set(qn("w:w"), str(sum(widths)))
    tbl_w.set(qn("w:type"), "dxa")
    tbl_ind = tbl_pr.find(qn("w:tblInd"))
    if tbl_ind is None:
        tbl_ind = OxmlElement("w:tblInd")
        tbl_pr.append(tbl_ind)
    tbl_ind.set(qn("w:w"), "120")
    tbl_ind.set(qn("w:type"), "dxa")
    grid = table._tbl.tblGrid
    for child in list(grid):
        grid.remove(child)
    for width in widths:
        col = OxmlElement("w:gridCol")
        col.set(qn("w:w"), str(width))
        grid.append(col)
    for row in table.rows:
        for index, cell in enumerate(row.cells):
            cell.width = Inches(widths[index] / 1440)
            tc_w = cell._tc.get_or_add_tcPr().find(qn("w:tcW"))
            tc_w.set(qn("w:w"), str(widths[index]))
            tc_w.set(qn("w:type"), "dxa")
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            set_cell_margins(cell)


def repeat_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    header = OxmlElement("w:tblHeader")
    header.set(qn("w:val"), "true")
    tr_pr.append(header)


doc = Document()
section = doc.sections[0]
section.page_width = Inches(8.5)
section.page_height = Inches(11)
section.top_margin = section.bottom_margin = Inches(1)
section.left_margin = section.right_margin = Inches(1)
section.header_distance = section.footer_distance = Inches(0.492)

normal = doc.styles["Normal"]
normal.font.name = "Calibri"
normal.font.size = Pt(11)
normal.font.color.rgb = RGBColor.from_string(INK)
normal.paragraph_format.space_after = Pt(8)
normal.paragraph_format.line_spacing = 1.28
normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

for style_name, size, color, before, after in (
    ("Heading 1", 17, BLUE, 20, 10),
    ("Heading 2", 13.5, BLUE, 14, 6),
    ("Heading 3", 12, NAVY, 10, 4),
):
    style = doc.styles[style_name]
    style.font.name = "Calibri"
    style.font.size = Pt(size)
    style.font.bold = True
    style.font.color.rgb = RGBColor.from_string(color)
    style.paragraph_format.space_before = Pt(before)
    style.paragraph_format.space_after = Pt(after)
    style.paragraph_format.keep_with_next = True

for list_name in ("List Bullet", "List Number"):
    style = doc.styles[list_name]
    style.font.name = "Calibri"
    style.font.size = Pt(11)
    style.paragraph_format.left_indent = Inches(0.375)
    style.paragraph_format.first_line_indent = Inches(-0.194)
    style.paragraph_format.space_after = Pt(4)
    style.paragraph_format.line_spacing = 1.2

header_p = section.header.paragraphs[0]
set_font(header_p.add_run("Docket | Baştan Sona Proje ve Geliştirme Süreci Raporu"), 9, True, GRAY)
footer_p = section.footer.paragraphs[0]
footer_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
set_font(footer_p.add_run("Ömer Kaya • 2026 • Sayfa "), 9, False, GRAY)


def add_page_number_field(paragraph):
    run = paragraph.add_run()
    set_font(run, 9, False, GRAY)
    fld_begin = OxmlElement("w:fldChar")
    fld_begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = "PAGE"
    fld_end = OxmlElement("w:fldChar")
    fld_end.set(qn("w:fldCharType"), "end")
    run._r.append(fld_begin)
    run._r.append(instr)
    run._r.append(fld_end)


add_page_number_field(footer_p)


def add_bold_runs(paragraph, text, size=11, base_color=INK, base_italic=False):
    """**bold** ve `kod` isaretlerini destekleyen basit inline parser."""
    token_re = re.compile(r"(\*\*.+?\*\*|`.+?`)")
    parts = token_re.split(text)
    for part in parts:
        if not part:
            continue
        if part.startswith("**") and part.endswith("**"):
            set_font(paragraph.add_run(part[2:-2]), size, True, base_color, base_italic)
        elif part.startswith("`") and part.endswith("`"):
            r = paragraph.add_run(part[1:-1])
            set_font(r, size, False, "9A2B6B", base_italic, name="Consolas")
        else:
            set_font(paragraph.add_run(part), size, False, base_color, base_italic)


def add_paragraph(text, italic=False):
    p = doc.add_paragraph()
    add_bold_runs(p, text, base_italic=italic)
    return p


def add_bullet(text):
    p = doc.add_paragraph(style="List Bullet")
    add_bold_runs(p, text)
    return p


_numbering_counter = [100]


def _new_numbering_id():
    """Her yeni numarali liste icin ayri bir numId olusturur, boylece
    onceki listenin sayaci (1,2,3...) devam etmez, her liste 1'den baslar."""
    numbering = doc.part.numbering_part.element
    num_id = _numbering_counter[0]
    _numbering_counter[0] += 1
    num = OxmlElement("w:num")
    num.set(qn("w:numId"), str(num_id))
    abstract_ref = OxmlElement("w:abstractNumId")
    abstract_ref.set(qn("w:val"), "7")
    override = OxmlElement("w:lvlOverride")
    override.set(qn("w:ilvl"), "0")
    start = OxmlElement("w:startOverride")
    start.set(qn("w:val"), "1")
    override.append(start)
    num.extend([abstract_ref, override])
    numbering.append(num)
    return num_id


_current_num_id = [None]


def add_number(text, is_new_list):
    if is_new_list or _current_num_id[0] is None:
        _current_num_id[0] = _new_numbering_id()
    p = doc.add_paragraph(style="List Number")
    p_pr = p._p.get_or_add_pPr()
    num_pr = OxmlElement("w:numPr")
    ilvl = OxmlElement("w:ilvl")
    ilvl.set(qn("w:val"), "0")
    num_id_el = OxmlElement("w:numId")
    num_id_el.set(qn("w:val"), str(_current_num_id[0]))
    num_pr.extend([ilvl, num_id_el])
    p_pr.append(num_pr)
    add_bold_runs(p, text)
    return p


def add_image(rel_path, caption):
    path = ROOT / rel_path
    if not path.exists():
        print(f"[uyarı] görsel bulunamadı: {rel_path}")
        return
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.keep_with_next = True
    p.paragraph_format.space_before = Pt(6)
    p.add_run().add_picture(str(path), width=Inches(6.1))
    cp = doc.add_paragraph()
    cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cp.paragraph_format.space_before = Pt(3)
    cp.paragraph_format.space_after = Pt(12)
    set_font(cp.add_run(caption), 9.5, False, GRAY, True)


def add_table(header_cells, rows):
    n_cols = len(header_cells)
    table = doc.add_table(rows=1, cols=n_cols)
    total = 9260
    base_w = total // n_cols
    widths = [base_w] * n_cols
    widths[0] += total - sum(widths)
    for i, h in enumerate(header_cells):
        shade(table.cell(0, i), NAVY)
        p = table.cell(0, i).paragraphs[0]
        set_font(p.add_run(h), 10, True, WHITE)
    repeat_header(table.rows[0])
    for row_cells in rows:
        cells = table.add_row().cells
        for i, value in enumerate(row_cells):
            p = cells[i].paragraphs[0]
            add_bold_runs(p, value, size=9.7)
    set_table_geometry(table, widths)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def title(text, size, color=NAVY, after=8, bold=True):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(after)
    set_font(p.add_run(text), size, bold, color)
    return p


# ----------------------------------------------------------------------------
# Kapak sayfasi
# ----------------------------------------------------------------------------
doc.add_paragraph().paragraph_format.space_after = Pt(60)
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
set_font(p.add_run("BAŞTAN SONA PROJE RAPORU"), 12, True, BLUE)
title("Docket", 34, NAVY, 4)
title("Görev Takip Sistemi", 22, BLUE, 18)
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
set_font(
    p.add_run("Projenin tamamının (ilk commit'ten bugüne) ne olduğu, nasıl geliştiği ve neden bu kararların alındığı"),
    12.5, False, GRAY,
)
doc.add_paragraph().paragraph_format.space_after = Pt(80)
meta = doc.add_table(rows=3, cols=2)
set_table_geometry(meta, [2700, 6560])
for i, (k, v) in enumerate([
    ("Hazırlayan", "Ömer Kaya"),
    ("Çalışma", "Docket Görev Takip Sistemi"),
    ("Yıl", "2026"),
]):
    shade(meta.cell(i, 0), LIGHT)
    set_font(meta.cell(i, 0).paragraphs[0].add_run(k), 11, True, NAVY)
    set_font(meta.cell(i, 1).paragraphs[0].add_run(v), 11, False, INK)
doc.add_paragraph().paragraph_format.space_after = Pt(24)
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
set_font(
    p.add_run("HTML • CSS • JavaScript • Node.js/Express • Supabase/PostgreSQL • Gemini • Voyage AI • Playwright"),
    10, False, GRAY,
)
doc.add_page_break()

# ----------------------------------------------------------------------------
# Icindekiler (basliklar onceden taranarak statik liste olarak uretilir)
# ----------------------------------------------------------------------------
lines = SRC.read_text(encoding="utf-8").splitlines()

doc.add_heading("İçindekiler", level=1)
in_fence_scan = False
for scan_line in lines:
    s = scan_line.rstrip()
    if s.strip().startswith("```"):
        in_fence_scan = not in_fence_scan
        continue
    if in_fence_scan:
        continue
    if s.startswith("## "):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(3)
        set_font(p.add_run(s[3:].strip()), 11.5, True, NAVY)
    elif s.startswith("### "):
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(0.3)
        p.paragraph_format.space_after = Pt(2)
        set_font(p.add_run(s[4:].strip()), 10, False, GRAY)
doc.add_paragraph().paragraph_format.space_after = Pt(4)
doc.add_paragraph().paragraph_format.space_after = Pt(4)
cap = doc.add_paragraph()
set_font(cap.add_run("Ek olarak: 6 mimari diyagram ve 11 ekran görüntüsü, ilgili bölümlerin içine gömülüdür."), 9.5, False, GRAY, True)
doc.add_page_break()

# ----------------------------------------------------------------------------
# Markdown -> Word govde donusumu
# ----------------------------------------------------------------------------
table_buffer = []


def flush_table():
    global table_buffer
    if not table_buffer:
        return
    rows = [
        [c.strip() for c in row.strip().strip("|").split("|")]
        for row in table_buffer
        if not re.match(r"^\|?\s*-{2,}", row)
    ]
    if rows:
        add_table(rows[0], rows[1:])
    table_buffer = []


img_re = re.compile(r"^\[\[IMG:(.+?)\|(.+?)\]\]$")

i = 0
first_h1_seen = False
in_code_fence = False
prev_was_number = False
while i < len(lines):
    raw = lines[i]
    line = raw.rstrip()

    if line.strip().startswith("```"):
        in_code_fence = not in_code_fence
        i += 1
        continue
    if in_code_fence:
        i += 1
        continue

    if line.startswith("|"):
        table_buffer.append(line)
        i += 1
        continue
    else:
        flush_table()

    if not line.strip():
        i += 1
        continue

    img_match = img_re.match(line.strip())
    if img_match:
        add_image(img_match.group(1), img_match.group(2))
        prev_was_number = False
        i += 1
        continue

    is_number_line = bool(re.match(r"^\d+\.\s+", line.strip()))

    if line.startswith("# "):
        text = line[2:].strip()
        if not first_h1_seen:
            first_h1_seen = True
        else:
            doc.add_page_break()
        doc.add_heading(text, level=1)
    elif line.startswith("## "):
        doc.add_heading(line[3:].strip(), level=2)
    elif line.startswith("### "):
        doc.add_heading(line[4:].strip(), level=3)
    elif line.strip() == "---":
        pass
    elif line.startswith("> "):
        table = doc.add_table(rows=1, cols=1)
        cell = table.cell(0, 0)
        shade(cell, LIGHT)
        p = cell.paragraphs[0]
        add_bold_runs(p, line[2:].strip(), size=10.5)
        set_table_geometry(table, [9260])
        doc.add_paragraph().paragraph_format.space_after = Pt(2)
    elif re.match(r"^\*\S.*\S\*$", line.strip()):
        add_paragraph(line.strip()[1:-1], italic=True)
    elif re.match(r"^-\s+", line.strip()):
        add_bullet(re.sub(r"^-\s+", "", line.strip()))
    elif is_number_line:
        add_number(re.sub(r"^\d+\.\s+", "", line.strip()), is_new_list=not prev_was_number)
    else:
        add_paragraph(line.strip())

    prev_was_number = is_number_line
    i += 1

flush_table()

doc.core_properties.title = "Docket — Baştan Sona Proje Raporu"
doc.core_properties.subject = "Docket projesinin tüm geliştirme sürecinin detaylı raporu"
doc.core_properties.author = "Ömer Kaya"
doc.core_properties.keywords = "Docket, görev takip, proje raporu, geliştirme süreci"
doc.save(OUT)
print(OUT)
