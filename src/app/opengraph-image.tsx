import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { ROASTS } from "@/lib/domain";

export const alt = "Sip Notes — コーヒー・茶・お酒のテイスティングノート";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* 系統の色。アプリ内の配色をそのまま使う。 */
const FAMILY = ["#6B4225", "#A65A22", "#4C7A3C", "#7C2F4E", "#574A8C", "#3A6B87"];

/**
 * 共有したときに出る画像。
 *
 * 画像生成の既定フォントは日本語の字形を持たないため、文字はラテン文字だけにする。
 * 日本語を入れると豆腐（□）になる。ワードマークだけはアプリと同じ Fraunces を
 * 同梱して読み込む（読めなければ既定フォントで描かれる）。
 */
export default async function OpengraphImage() {
  /* 書体を渡すと既定のフォントは使われなくなるので、太字と通常の両方を登録する */
  let fonts;
  try {
    const dir = join(process.cwd(), "assets");
    const [bold, regular] = await Promise.all([
      readFile(join(dir, "fraunces-700.woff")),
      readFile(join(dir, "fraunces-400.woff")),
    ]);
    fonts = [
      { name: "Fraunces", data: bold, weight: 700 as const, style: "normal" as const },
      { name: "Fraunces", data: regular, weight: 400 as const, style: "normal" as const },
    ];
  } catch {
    /* 読めなくても画像は出す。既定のフォントで描かれるだけ。 */
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#E9EBE6",
          padding: "0 96px",
          position: "relative",
        }}
      >
        {/* 上端に系統の色を並べる */}
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0, right: 0 }}>
          {FAMILY.map((c) => (
            <div key={c} style={{ flex: 1, height: 10, background: c }} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
          {FAMILY.map((c) => (
            <div key={c} style={{ width: 15, height: 15, borderRadius: 8, background: c }} />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 126,
            fontWeight: 700,
            letterSpacing: -2,
            fontFamily: "Fraunces",
          }}
        >
          <span style={{ color: "#181B17" }}>Sip&nbsp;</span>
          <span style={{ color: "#2C5B45" }}>Notes</span>
        </div>

        <div style={{ display: "flex", width: 560, height: 1, background: "#BAC1B3", margin: "32px 0" }} />

        <div style={{ display: "flex", fontSize: 34, fontWeight: 400, color: "#3D433C", letterSpacing: -0.5 }}>
          Coffee, tea and sake — tasting notes
        </div>
        <div style={{ display: "flex", fontSize: 25, fontWeight: 400, color: "#6A7266", marginTop: 12 }}>
          Origin, roast, flavour and pairing, one cup at a time
        </div>

        {/* 焙煎度の8段階。アプリの特徴的な部分をそのまま置く。 */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 96,
            right: 96,
            bottom: 56,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {ROASTS.map((r) => (
              <div
                key={r.v}
                style={{ width: 26, height: 26, borderRadius: 13, background: r.c }}
              />
            ))}
            <div style={{ display: "flex", fontSize: 19, fontWeight: 400, color: "#6A7266", marginLeft: 8, letterSpacing: 1 }}>
              LIGHT — ITALIAN
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 20, fontWeight: 400, color: "#6A7266", letterSpacing: 2 }}>
            SCAJ CUPPING FORM
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
