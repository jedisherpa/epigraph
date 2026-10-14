import { palette } from "@/viz/palette";

export function ink(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size = 13, align: CanvasTextAlign = "left", color: string = palette.ink) {
  ctx.fillStyle = color;
  ctx.font = `${size}px Outfit, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

export function kicker(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
  ink(ctx, text.toUpperCase(), x, y, 11, "left", palette.brass);
}

export function strokeCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, width = 1.25) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

export function fillDot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

export function line(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, width = 1.25) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

export function arrow(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string) {
  line(ctx, x0, y0, x1, y1, color, 1.5);
  const a = Math.atan2(y1 - y0, x1 - x0);
  const s = 7;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 - s * Math.cos(a - 0.4), y1 - s * Math.sin(a - 0.4));
  ctx.lineTo(x1 - s * Math.cos(a + 0.4), y1 - s * Math.sin(a + 0.4));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}
