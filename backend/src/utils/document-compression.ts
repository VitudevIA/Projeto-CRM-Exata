import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import fs from "fs/promises";

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
}

/**
 * Comprime uma imagem usando Sharp
 */
export async function compressImage(
  inputBuffer: Buffer,
  options: CompressionOptions = {}
): Promise<Buffer> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 80,
    format = "webp",
  } = options;

  let pipeline = sharp(inputBuffer)
    .resize(maxWidth, maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    });

  if (format === "webp") {
    pipeline = pipeline.webp({ quality });
  } else if (format === "jpeg") {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  } else if (format === "png") {
    pipeline = pipeline.png({ quality, compressionLevel: 9 });
  }

  return await pipeline.toBuffer();
}

/**
 * Comprime um PDF removendo metadados e otimizando imagens internas
 */
export async function compressPDF(inputBuffer: Buffer): Promise<Buffer> {
  try {
    const pdfDoc = await PDFDocument.load(inputBuffer);

    // Remover metadados desnecessários
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer("");
    pdfDoc.setCreator("");

    // Salvar PDF otimizado
    const pdfBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error("Error compressing PDF:", error);
    // Se falhar, retornar original
    return inputBuffer;
  }
}

/**
 * Detecta o tipo MIME e comprime adequadamente
 */
export async function compressDocument(
  inputBuffer: Buffer,
  mimeType: string,
  options: CompressionOptions = {}
): Promise<{ buffer: Buffer; mimeType: string; originalSize: number; compressedSize: number }> {
  const originalSize = inputBuffer.length;

  let compressedBuffer: Buffer;
  let finalMimeType = mimeType;

  if (mimeType.startsWith("image/")) {
    // Comprimir imagem
    compressedBuffer = await compressImage(inputBuffer, options);
    
    if (options.format === "webp") {
      finalMimeType = "image/webp";
    }
  } else if (mimeType === "application/pdf") {
    // Comprimir PDF
    compressedBuffer = await compressPDF(inputBuffer);
  } else {
    // Não comprimir outros tipos
    compressedBuffer = inputBuffer;
  }

  const compressedSize = compressedBuffer.length;
  const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

  console.log(
    `Compression: ${originalSize} bytes -> ${compressedSize} bytes (${compressionRatio.toFixed(2)}% reduction)`
  );

  return {
    buffer: compressedBuffer,
    mimeType: finalMimeType,
    originalSize,
    compressedSize,
  };
}

