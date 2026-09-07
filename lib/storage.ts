import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

export type UploadResult = { url: string; key: string };

export interface StorageAdapter {
  upload(buffer: Buffer, filename: string, contentType: string): Promise<UploadResult>;
  delete(key: string): Promise<void>;
}

/**
 * 로컬 디스크 저장소. `next start`로 직접 띄우는(=파일시스템이 지속되는) 서버 배포에서만 동작합니다.
 * Vercel 같은 서버리스 배포에서는 파일시스템이 요청마다 초기화되므로 S3Storage를 사용해야 합니다.
 *
 * 주의: Next.js는 `public/` 폴더를 서버 시작 시점의 정적 파일 목록으로 서빙하기 때문에,
 * 서버가 켜져 있는 동안 새로 추가된 파일은 `public/`에 있어도 404가 됩니다(직접 확인된 동작).
 * 그래서 파일은 `public/` 밖(`data/uploads`)에 저장하고, `/api/uploads/[key]` 라우트가
 * 매 요청마다 디스크에서 직접 읽어 응답합니다.
 */
class LocalDiskStorage implements StorageAdapter {
  private dir = path.join(process.cwd(), "data", "uploads");

  async upload(buffer: Buffer, filename: string, _contentType: string): Promise<UploadResult> {
    await mkdir(this.dir, { recursive: true });
    const key = `${randomUUID()}-${filename}`;
    await writeFile(path.join(this.dir, key), buffer);
    return { url: `/api/uploads/${key}`, key };
  }

  async delete(key: string): Promise<void> {
    try {
      await unlink(path.join(this.dir, key));
    } catch {
      // 이미 없는 파일이면 무시
    }
  }
}

/** S3 호환 오브젝트 스토리지 (AWS S3, Cloudflare R2, Supabase Storage S3 엔드포인트 등) */
class S3CompatibleStorage implements StorageAdapter {
  async getClient() {
    const { S3Client } = await import("@aws-sdk/client-s3");
    return new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT, // AWS S3라면 비워두세요
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    });
  }

  async upload(buffer: Buffer, filename: string, contentType: string): Promise<UploadResult> {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this.getClient();
    const bucket = process.env.S3_BUCKET!;
    const key = `uploads/${randomUUID()}-${filename}`;

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: "public-read",
      }),
    );

    const publicBaseUrl = process.env.S3_PUBLIC_URL_BASE; // 예: https://xxx.r2.dev 또는 CDN 도메인
    const url = publicBaseUrl ? `${publicBaseUrl.replace(/\/$/, "")}/${key}` : `${process.env.S3_ENDPOINT}/${bucket}/${key}`;
    return { url, key };
  }

  async delete(key: string): Promise<void> {
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this.getClient();
    await client.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }));
  }
}

let cached: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (cached) return cached;
  cached = process.env.S3_BUCKET ? new S3CompatibleStorage() : new LocalDiskStorage();
  return cached;
}

/** `/api/uploads/[key]` 라우트에서 로컬 디스크에 저장된 파일을 읽을 때 사용합니다. */
export async function readLocalUpload(key: string): Promise<Buffer> {
  const { readFile } = await import("node:fs/promises");
  return readFile(path.join(process.cwd(), "data", "uploads", key));
}
