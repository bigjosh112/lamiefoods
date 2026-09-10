import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/server/admin/session";
import { isBlobStorageConfigured } from "@/config/server-env";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB — product photography, not video.

/**
 * POST /api/admin/uploads — issues a short-lived Vercel Blob client-upload
 * token, so the admin's browser can PUT the file straight to Blob storage
 * without routing image bytes through this Next.js server (avoiding the
 * platform's request body-size limits entirely).
 *
 * `onBeforeGenerateToken` is where the SDK documents authorization, and
 * `getAdminSession()` also runs before `handleUpload` so a missing cookie
 * never reaches token minting. That is the same check every other admin
 * write in this app uses.
 *
 * `onUploadCompleted` is omitted on purpose: the uploaded URL is already
 * returned directly to the calling browser by `upload()` (see
 * `components/admin/image-upload.tsx`), which is what actually attaches it
 * to a product on save. Passing an empty callback still makes the SDK look
 * for a public webhook URL (`VERCEL_BLOB_CALLBACK_URL`), which localhost
 * and Railway cannot provide — a noisy warning, not a working callback.
 */
export async function POST(request: Request) {
  if (!isBlobStorageConfigured()) {
    return NextResponse.json(
      { error: "Image upload is not connected yet." },
      { status: 503 },
    );
  }

  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_CONTENT_TYPES,
        maximumSizeInBytes: MAX_SIZE_BYTES,
        addRandomSuffix: true,
      }),
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 },
    );
  }
}
