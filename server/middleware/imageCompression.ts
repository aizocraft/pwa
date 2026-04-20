// middleware/imageCompression.ts
import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export const compressImage = (options: CompressionOptions = {}) => {
  const {
    maxWidth = 500,
    maxHeight = 500,
    quality = 80,
    fit = 'cover'
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file || !req.file.buffer) {
      return next();
    }

    try {
      // Store original size before compression
      const originalSize = req.file.size;
      const sharpInstance = sharp(req.file.buffer);
      const metadata = await sharpInstance.metadata();
      
      // Check if resize is needed
      let needsResize = false;
      if (metadata.width && metadata.height) {
        needsResize = metadata.width > maxWidth || metadata.height > maxHeight;
      }
      
      // Apply transformations
      if (needsResize) {
        sharpInstance.resize(maxWidth, maxHeight, { fit });
      }
      
      // Apply format-specific compression
      let processedBuffer: Buffer;
      let finalMimeType: string;
      
      switch (req.file.mimetype) {
        case 'image/jpeg':
        case 'image/jpg':
          processedBuffer = await sharpInstance.jpeg({ quality }).toBuffer();
          finalMimeType = 'image/jpeg';
          break;
        case 'image/png':
          processedBuffer = await sharpInstance.png({ 
            quality,
            compressionLevel: 9 
          }).toBuffer();
          finalMimeType = 'image/png';
          break;
        case 'image/webp':
          processedBuffer = await sharpInstance.webp({ quality }).toBuffer();
          finalMimeType = 'image/webp';
          break;
        default:
          // Convert to JPEG for unsupported formats
          processedBuffer = await sharpInstance.jpeg({ quality }).toBuffer();
          finalMimeType = 'image/jpeg';
      }
      
      // Calculate compression ratio
      const compressedSize = processedBuffer.length;
      const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(2);
      
      // Replace original buffer with compressed version
      req.file.buffer = processedBuffer;
      req.file.mimetype = finalMimeType;
      req.file.size = compressedSize;
      
      // Add compression metadata to request
      (req as any).compressionInfo = {
        originalSize: originalSize,
        compressedSize: compressedSize,
        savedBytes: originalSize - compressedSize,
        ratio: compressionRatio,
        originalMimeType: req.file.mimetype,
        finalMimeType: finalMimeType
      };
      
      next();
    } catch (error) {
      console.error('Image compression error:', error);
      next(error);
    }
  };
};