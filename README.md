# PharmaLens AI Frontend

واجهة Next.js لمنصة PharmaLens AI للتحليل التجاري الدوائي واتخاذ القرار. تم تحديث الواجهة لتشمل AppShell مستوحى من AI workspaces الحديثة، Sidebar responsive، Home analysis workspace، Use-case cards، Light/Dark theme، ودعم English/Arabic مع RTL/LTR.

## التقنية

- Next.js 14 App Router
- React 18 + TypeScript
- Tailwind CSS
- Supabase Auth
- FastAPI backend عبر `NEXT_PUBLIC_API_BASE_URL`

## التشغيل محليًا

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

افتح `http://localhost:3000`. سيحوّل التطبيق المستخدم إلى `/login` أو `/dashboard` حسب جلسة Supabase.

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
NEXT_PUBLIC_API_BASE_URL=https://your-fastapi-backend.example.com
```

لا ترفع ملف `.env.local` أو أي أسرار إلى GitHub أو Vercel كملف. أضف القيم من Vercel Project Settings → Environment Variables.

## Build verification

```bash
npx tsc --noEmit
npm run build
```

تم التحقق من النسخة الحالية بنجاح باستخدام الأمرين السابقين.

## Vercel deployment

1. ارفع محتويات هذا المجلد إلى GitHub أو اربطه مباشرة من Vercel.
2. اختر Framework Preset: **Next.js**.
3. استخدم Root Directory الذي يحتوي على `package.json`.
4. أضف متغيرات البيئة الثلاثة السابقة إلى Production وPreview حسب الحاجة.
5. اضغط Deploy.
6. أضف رابط Vercel الجديد إلى `CORS_ORIGINS` في خدمة FastAPI على Render، مثل:

```text
http://localhost:3000,https://your-app.vercel.app
```

## الواجهة الحالية

- `/login`: تسجيل الدخول وإنشاء الحساب
- `/dashboard`: Home AI workspace وWorkspaces وUse Cases
- `/data-hub`: رفع وتحليل ملفات البيانات عبر FastAPI
- `/analyze`: اختيار وتشغيل Product Engines الموجودة فعليًا في FastAPI
- `/copilot`: AI Copilot متصل بـ history وask في FastAPI
- `/projects`: مساحة المشاريع
- `/dashboards`: لوحات المعلومات
- `/reports`: إنشاء Decision Brief وPDF وPowerPoint من Product Runs
- `/newsletter`: النشرة البريدية
- `/search`: البحث

تم ربط المسارات الأساسية التي لها endpoints فعلية في FastAPI. أما المسارات التي لا يوجد لها endpoint مستقل في النسخة الحالية من Backend فتظل واجهات موحدة وآمنة بانتظار إضافة العقد الخاصة بها. لم يتم تغيير Supabase Auth أو منطق Data Hub الحالي.

## FastAPI integration map

الواجهة تستخدم `lib/pharmaApi.ts` كطبقة typed فوق `lib/api.ts`، وتستعمل:

- `/api/products/catalog`
- `/api/products/run-from-file`
- `/api/product-runs`
- `/api/copilot/history`
- `/api/copilot/ask`
- `/api/reports`
- `/api/reports/from-run`
- `/api/reports/pdf-from-run`
- `/api/reports/pptx-from-run`
- `/api/reports/{id}/download`
- `/api/files`

## اللغة والثيم

من أسفل Sidebar يمكن تبديل:

- English / العربية
- Light / Dark theme

يتم حفظ الاختيار في `localStorage`، ويتغير اتجاه الصفحة تلقائيًا إلى LTR أو RTL.
