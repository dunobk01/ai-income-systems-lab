#!/usr/bin/env python3
"""Builds the AI Business Engine lead-magnet PDF from src/lib/ai-business-engine.json."""
import json, os
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
                                KeepTogether, Table, TableStyle, PageBreak, Flowable)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = json.load(open(os.path.join(ROOT, "src/lib/ai-business-engine.json")))
OUT = os.path.join(ROOT, "public/downloads/ai-business-engine.pdf")
os.makedirs(os.path.dirname(OUT), exist_ok=True)

INK = colors.HexColor("#0B0B0D")
PAPER = colors.HexColor("#FFFFFF")
GOLD = colors.HexColor("#C9A227")
MUTED = colors.HexColor("#5A5A63")
LINE = colors.HexColor("#E4E4E8")
CODEBG = colors.HexColor("#111114")

H = "Helvetica"
HB = "Helvetica-Bold"
MONO = "Courier"

def S(name, **kw):
    return ParagraphStyle(name, fontName=H, fontSize=10.5, leading=15.5, textColor=INK, **kw)

st = {
    "eyebrow": S("eyebrow", fontName=HB, fontSize=8.5, leading=11, textColor=GOLD, spaceAfter=6),
    "h1": S("h1", fontName=HB, fontSize=30, leading=34, spaceAfter=10),
    "h2": S("h2", fontName=HB, fontSize=19, leading=23, spaceAfter=8),
    "h3": S("h3", fontName=HB, fontSize=13, leading=17, spaceAfter=4),
    "body": S("body", spaceAfter=8),
    "muted": S("muted", textColor=MUTED, spaceAfter=8),
    "small": S("small", fontSize=9, leading=13, textColor=MUTED),
    "tools": S("tools", fontName=HB, fontSize=8.5, leading=11, textColor=GOLD, spaceAfter=6),
    "code": ParagraphStyle("code", fontName=MONO, fontSize=8.4, leading=12.4,
                           textColor=colors.HexColor("#EDEDF2")),
    "bullet": S("bullet", leftIndent=12, bulletIndent=2, spaceAfter=4),
    "center": S("center", alignment=TA_CENTER),
}

def esc(t):
    return (t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))

class Rule(Flowable):
    def __init__(self, color=LINE, w=None, thickness=0.7):
        super().__init__(); self.color = color; self.w = w; self.t = thickness
    def wrap(self, aw, ah):
        self.width = self.w or aw; return (self.width, self.t + 6)
    def draw(self):
        self.canv.setStrokeColor(self.color); self.canv.setLineWidth(self.t)
        self.canv.line(0, 3, self.width, 3)

def code_block(text):
    lines = [esc(l) if l.strip() else "&nbsp;" for l in text.split("\n")]
    p = Paragraph("<br/>".join(lines), st["code"])
    t = Table([[p]], colWidths=[6.5 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CODEBG),
        ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 11), ("BOTTOMPADDING", (0, 0), (-1, -1), 11),
        ("LINEBEFORE", (0, 0), (0, -1), 2, GOLD),
    ]))
    return t

def callout(label, text):
    inner = [Paragraph(label, st["eyebrow"]), Paragraph(esc(text), st["small"])]
    t = Table([[inner]], colWidths=[6.5 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FBF7E9")),
        ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 9), ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LINEBEFORE", (0, 0), (0, -1), 2, GOLD),
    ]))
    return t

# ---------------- page furniture ----------------
def footer(canvas, doc):
    canvas.saveState()
    if doc.page > 1:
        canvas.setStrokeColor(LINE); canvas.setLineWidth(0.6)
        canvas.line(1 * inch, 0.78 * inch, LETTER[0] - 1 * inch, 0.78 * inch)
        canvas.setFont(H, 8); canvas.setFillColor(MUTED)
        canvas.drawString(1 * inch, 0.6 * inch, "AI Income Systems Lab \u00b7 ai-income-systems.com")
        canvas.drawRightString(LETTER[0] - 1 * inch, 0.6 * inch, "Page %d" % doc.page)
    canvas.restoreState()

def cover_bg(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(INK)
    canvas.rect(0, 0, LETTER[0], LETTER[1], stroke=0, fill=1)
    canvas.setFillColor(GOLD)
    canvas.rect(0, LETTER[1] - 10, LETTER[0], 10, stroke=0, fill=1)
    canvas.restoreState()

doc = BaseDocTemplate(OUT, pagesize=LETTER, title=DATA["title"],
                      author="AI Income Systems Lab", subject=DATA["subtitle"],
                      leftMargin=1 * inch, rightMargin=1 * inch,
                      topMargin=0.95 * inch, bottomMargin=1 * inch)
frame = Frame(1 * inch, 1 * inch, 6.5 * inch, LETTER[1] - 1.95 * inch, id="body")
doc.addPageTemplates([
    PageTemplate(id="cover", frames=[Frame(1 * inch, 1.2 * inch, 6.5 * inch, LETTER[1] - 2.4 * inch)],
                 onPage=cover_bg),
    PageTemplate(id="body", frames=[frame], onPage=footer),
])

F = []

# ---------------- cover ----------------
def w(text, style, color=None, **kw):
    s = style
    if color:
        s = ParagraphStyle(style.name + "_c", parent=style, textColor=color)
    return Paragraph(text, s, **kw)

F.append(Spacer(1, 1.1 * inch))
F.append(w(DATA["title"].upper(), st["eyebrow"], GOLD))
F.append(w(DATA["title"], st["h1"], colors.white))
F.append(w(DATA["subtitle"], ParagraphStyle("cs", parent=st["h3"], textColor=GOLD, fontSize=14, leading=19)))
F.append(Spacer(1, 10))
F.append(w(esc(DATA["promise"]), ParagraphStyle("cp", parent=st["body"], fontSize=12, leading=18,
                                                textColor=colors.HexColor("#C9C9D2"))))
F.append(Spacer(1, 26))
cells = [[w(s["value"], ParagraphStyle("sv", parent=st["h1"], fontSize=26, leading=28, textColor=GOLD,
                                       alignment=TA_CENTER)) for s in DATA["stats"]],
         [w(s["label"], ParagraphStyle("sl", parent=st["small"], alignment=TA_CENTER,
                                       textColor=colors.HexColor("#9A9AA6"))) for s in DATA["stats"]]]
tbl = Table(cells, colWidths=[1.625 * inch] * 4)
tbl.setStyle(TableStyle([("TOPPADDING", (0, 0), (-1, -1), 2), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                         ("LINEABOVE", (0, 0), (-1, 0), 0.7, colors.HexColor("#33333B")),
                         ("LINEBELOW", (0, -1), (-1, -1), 0.7, colors.HexColor("#33333B"))]))
F.append(tbl)
F.append(Spacer(1, 24))
F.append(w(esc(DATA["includesNote"]), ParagraphStyle("inc", parent=st["small"], textColor=GOLD)))
F.append(Spacer(1, 0.9 * inch))
F.append(w("AI INCOME SYSTEMS LAB \u00b7 ai-income-systems.com",
           ParagraphStyle("cf", parent=st["small"], textColor=colors.HexColor("#77777F"))))
F.append(PageBreak())

# ---------------- how to use ----------------
F.append(w("BEFORE YOU START", st["eyebrow"]))
F.append(w(DATA["howToUse"]["heading"], st["h2"]))
F.append(w(esc(DATA["howToUse"]["intro"]), st["muted"]))
F.append(Rule()); F.append(Spacer(1, 8))
for i, it in enumerate(DATA["howToUse"]["items"], 1):
    F.append(KeepTogether([
        w("%02d \u2014 %s" % (i, esc(it["title"])), st["h3"]),
        w(esc(it["text"]), st["body"]), Spacer(1, 4)]))
F.append(PageBreak())

# ---------------- contents ----------------
F.append(w("CONTENTS", st["eyebrow"]))
F.append(w("What's inside", st["h2"]))
for cat in DATA["categories"]:
    F.append(Spacer(1, 8))
    F.append(w(cat["name"].upper(), ParagraphStyle("catx", parent=st["eyebrow"], textColor=INK)))
    F.append(Rule())
    for p in cat["prompts"]:
        F.append(w("%s \u2014 %s" % (p["n"], esc(p["title"])), st["body"]))
F.append(Spacer(1, 10))
F.append(w("+ n8n automation walkthrough \u00b7 + The Lovable build story", st["small"]))
F.append(PageBreak())

# ---------------- prompts ----------------
for cat in DATA["categories"]:
    F.append(Spacer(1, 1.2 * inch))
    F.append(w(cat["range"].upper(), st["eyebrow"]))
    F.append(w(cat["name"], st["h1"]))
    F.append(w(esc(cat["blurb"]), st["muted"]))
    F.append(Rule(GOLD, w=2.2 * inch, thickness=2.5))
    F.append(PageBreak())
    for p in cat["prompts"]:
        head = [
            w("%s \u00b7 %s" % (p["n"], cat["name"].upper()), st["eyebrow"]),
            w(esc(p["title"]), st["h2"]),
            w(esc(p["subtitle"]), st["muted"]),
            w(esc(p["tools"]), st["tools"]),
        ]
        F.append(KeepTogether(head))
        F.append(code_block(p["body"]))
        F.append(Spacer(1, 10))
        F.append(callout("WHAT THIS PRODUCES", p["produces"]))
        F.append(PageBreak())

# ---------------- automation ----------------
F.append(w("THE AUTOMATION LAYER", st["eyebrow"]))
F.append(w(DATA["automation"]["heading"], st["h2"]))
F.append(w(esc(DATA["automation"]["intro"]), st["muted"]))
F.append(Rule()); F.append(Spacer(1, 6))
for i, s in enumerate(DATA["automation"]["steps"], 1):
    F.append(KeepTogether([
        w("%02d \u2014 %s" % (i, esc(s["title"])), st["h3"]),
        w(esc(s["text"]), st["body"]),
        code_block(s["flow"]), Spacer(1, 12)]))
F.append(PageBreak())

# ---------------- build story ----------------
bs = DATA["buildStory"]
F.append(w("THE BUILD STORY", st["eyebrow"]))
F.append(w(bs["heading"], st["h2"]))
F.append(w(esc(bs["sub"]), st["muted"]))
F.append(callout("IN MY WORDS", bs["quote"]))
F.append(Spacer(1, 12))
for para in bs["paragraphs"]:
    F.append(w(esc(para), st["body"]))
F.append(Spacer(1, 8))
F.append(Rule()); F.append(Spacer(1, 6))
for s in bs["steps"]:
    F.append(KeepTogether([w(esc(s["title"]), st["h3"]), w(esc(s["text"]), st["body"])]))
F.append(PageBreak())

# ---------------- what's next ----------------
nx = DATA["next"]
F.append(w("WHAT'S NEXT", st["eyebrow"]))
F.append(w(nx["heading"], st["h2"]))
F.append(w(esc(nx["intro"]), st["muted"]))
F.append(Spacer(1, 6))
for b in nx["bullets"]:
    F.append(Paragraph("\u2192 " + esc(b), st["bullet"]))
F.append(Spacer(1, 14))
F.append(callout("GET STARTED", nx["cta"]))
F.append(Spacer(1, 18))
F.append(w(esc(DATA["footer"]), st["small"]))

doc.build(F)
print("wrote", OUT, os.path.getsize(OUT), "bytes")
