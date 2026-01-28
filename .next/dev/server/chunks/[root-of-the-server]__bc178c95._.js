module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/fs/promises [external] (fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs/promises", () => require("fs/promises"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addVideo",
    ()=>addVideo,
    "deleteVideo",
    ()=>deleteVideo,
    "getVideo",
    ()=>getVideo,
    "getVideos",
    ()=>getVideos,
    "incrementView",
    ()=>incrementView,
    "updateCompletion",
    ()=>updateCompletion
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanoid$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/nanoid/index.js [app-route] (ecmascript) <locals>");
;
;
;
const dataDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), 'data');
const dataFile = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(dataDir, 'videos.json');
const tmpDataFile = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(dataDir, 'videos.json.tmp');
async function ensureStore() {
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].mkdir(dataDir, {
        recursive: true
    });
    try {
        const content = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readFile(dataFile, 'utf-8');
        return JSON.parse(content);
    } catch (err) {
        if (err?.code === 'ENOENT') {
            const initial = {
                videos: []
            };
            await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(dataFile, JSON.stringify(initial, null, 2), 'utf-8');
            return initial;
        }
        throw err;
    }
}
async function saveStore(store) {
    const payload = JSON.stringify(store, null, 2);
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(tmpDataFile, payload, 'utf-8');
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].rename(tmpDataFile, dataFile);
}
async function addVideo(params) {
    const store = await ensureStore();
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanoid$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["nanoid"])(10);
    const shareId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanoid$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["nanoid"])(8);
    const record = {
        id,
        title: params.title,
        sourceUrl: params.url,
        trimmedUrl: params.url,
        durationSeconds: params.durationSeconds ?? null,
        trimStart: params.trimStart,
        trimEnd: params.trimEnd,
        shareId,
        viewCount: 0,
        completionPercent: 0,
        createdAt: new Date().toISOString()
    };
    store.videos.push(record);
    await saveStore(store);
    return record;
}
async function getVideo(idOrShare) {
    const store = await ensureStore();
    return store.videos.find((v)=>v.id === idOrShare || v.shareId === idOrShare);
}
async function getVideos() {
    const store = await ensureStore();
    return store.videos;
}
async function deleteVideo(idOrShare) {
    const store = await ensureStore();
    const index = store.videos.findIndex((v)=>v.id === idOrShare || v.shareId === idOrShare);
    if (index === -1) return undefined;
    const [removed] = store.videos.splice(index, 1);
    await saveStore(store);
    return removed;
}
async function incrementView(id) {
    const store = await ensureStore();
    const video = store.videos.find((v)=>v.id === id || v.shareId === id);
    if (video) {
        video.viewCount += 1;
        await saveStore(store);
    }
    return video;
}
async function updateCompletion(id, completionPercent) {
    const store = await ensureStore();
    const video = store.videos.find((v)=>v.id === id || v.shareId === id);
    if (video) {
        video.completionPercent = Math.max(video.completionPercent, completionPercent);
        await saveStore(store);
    }
    return video;
}
}),
"[project]/app/api/upload/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__ = __turbopack_context__.i("[externals]/@aws-sdk/client-s3 [external] (@aws-sdk/client-s3, cjs, [project]/node_modules/@aws-sdk/client-s3)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanoid$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/nanoid/index.js [app-route] (ecmascript) <locals>");
;
;
;
;
;
;
const runtime = 'nodejs';
const hasS3Config = !!process.env.S3_BUCKET && !!process.env.AWS_REGION && !!process.env.AWS_ACCESS_KEY_ID && !!process.env.AWS_SECRET_ACCESS_KEY;
const s3Client = hasS3Config ? new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__["S3Client"]({
    region: process.env.S3_REGION || process.env.AWS_REGION,
    endpoint: process.env.S3_ENDPOINT
}) : null;
async function uploadToS3(file, key) {
    if (!s3Client || !process.env.S3_BUCKET) return null;
    try {
        const arrayBuffer = await file.arrayBuffer();
        // Prepare S3 parameters - remove ACL as it's deprecated in newer S3 versions
        const params = {
            Bucket: process.env.S3_BUCKET,
            Key: key,
            Body: Buffer.from(arrayBuffer),
            ContentType: file.type || "video/webm"
        };
        // Only add ACL if explicitly configured (for older S3 setups)
        if (process.env.S3_USE_ACL === 'true') {
            params.ACL = "public-read";
        }
        await s3Client.send(new __TURBOPACK__imported__module__$5b$externals$5d2f40$aws$2d$sdk$2f$client$2d$s3__$5b$external$5d$__$2840$aws$2d$sdk$2f$client$2d$s3$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$aws$2d$sdk$2f$client$2d$s3$29$__["PutObjectCommand"](params));
        // Generate the public URL
        const endpoint = process.env.S3_PUBLIC_URL || `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`;
        const publicUrl = `${endpoint}/${key}`;
        console.log('S3 upload successful:', {
            key,
            size: file.size,
            url: publicUrl
        });
        return publicUrl;
    } catch (error) {
        console.error('S3 upload error:', error);
        throw error;
    }
}
async function uploadToLocal(file, key) {
    const uploadsDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(process.cwd(), "public", "uploads");
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].mkdir(uploadsDir, {
        recursive: true
    });
    const arrayBuffer = await file.arrayBuffer();
    const filePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(uploadsDir, key);
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(filePath, Buffer.from(arrayBuffer));
    return `/uploads/${key}`;
}
async function POST(request) {
    try {
        const origin = new URL(request.url).origin;
        const formData = await request.formData();
        const file = formData.get("file");
        const title = formData.get("title") || "Recording";
        const duration = Number(formData.get("duration")) || undefined;
        const trimStart = formData.get("trimStart");
        const trimEnd = formData.get("trimEnd");
        if (!file) {
            console.error('Upload error: No file provided');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Missing file"
            }, {
                status: 400
            });
        }
        console.log('Upload request:', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            title,
            duration
        });
        const safeName = (file.name || "recording.webm").replace(/[^a-zA-Z0-9\\.\\-]/g, "-");
        const key = `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nanoid$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["nanoid"])(8)}-${safeName}`;
        let url;
        try {
            if (hasS3Config) {
                console.log('Attempting S3 upload...');
                url = await uploadToS3(file, key);
                if (!url) {
                    throw new Error('S3 upload returned null');
                }
                console.log('S3 upload successful:', url);
            } else {
                console.log('Using local storage...');
                url = await uploadToLocal(file, key);
                console.log('Local upload successful:', url);
            }
        } catch (uploadError) {
            console.error('Upload failed:', uploadError);
            // Try local fallback if S3 fails
            if (hasS3Config) {
                console.log('S3 failed, trying local fallback...');
                url = await uploadToLocal(file, key);
                console.log('Local fallback successful:', url);
            } else {
                throw uploadError;
            }
        }
        if (!url) {
            console.error('Upload failed: No URL generated');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Failed to store file"
            }, {
                status: 500
            });
        }
        const video = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addVideo"])({
            title,
            url: url.startsWith("http") ? url : `${origin}${url}`,
            durationSeconds: duration,
            trimStart: trimStart ? Number(trimStart) : undefined,
            trimEnd: trimEnd ? Number(trimEnd) : undefined
        });
        const shareUrl = `${origin}/watch/${video.shareId}`;
        console.log('Video record created:', {
            videoId: video.id,
            shareUrl
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            video,
            shareUrl
        });
    } catch (error) {
        console.error("Upload error:", error);
        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: errorMessage
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__bc178c95._.js.map