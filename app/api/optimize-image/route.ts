import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { z } from "zod";

const optimizeImageSchema = z.object({
  image: z.string().min(1, "No image provided"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = optimizeImageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message ?? "Validation failed" }, { status: 400 });
    }

    const { image } = result.data;

    // Remove the base64 prefix (e.g., data:image/png;base64,)
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Optimize the image using sharp
    // We use WebP with a high quality (85) to maintain sharpness on charts
    // while significantly reducing file size.
    const optimizedBuffer = await sharp(buffer)
      .webp({ 
        quality: 85, 
        effort: 6, // Higher effort for better compression
        lossless: false, // Lossy is much smaller, 85 quality is plenty for charts
        smartSubsample: true 
      })
      .resize(1920, 1080, { // Limit max resolution to Full HD
        fit: "inside",
        withoutEnlargement: true
      })
      .toBuffer();

    const optimizedBase64 = `data:image/webp;base64,${optimizedBuffer.toString("base64")}`;

    return NextResponse.json({ 
      optimizedImage: optimizedBase64,
      originalSize: image.length,
      optimizedSize: optimizedBase64.length,
      reduction: `${Math.round((1 - optimizedBase64.length / image.length) * 100)}%`
    });
  } catch (error) {
    console.error("Image optimization error:", error);
    return NextResponse.json({ error: "Failed to optimize image" }, { status: 500 });
  }
}
