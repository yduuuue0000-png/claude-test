# 📒 전화번호부 (Next.js + Supabase + Vercel)

회원가입·로그인 없이 바로 연락처(이름·전화번호·이메일·그룹·메모·즐겨찾기)를 관리하는 웹앱입니다.
> ⚠️ 로그인이 없으므로 앱 주소를 아는 사람은 누구나 연락처를 보고 수정할 수 있습니다.

## 1. Supabase 설정

1. https://supabase.com 에서 새 프로젝트 생성
2. **SQL Editor** → `supabase/schema.sql` 내용을 붙여넣고 **Run**
3. **Project Settings → API** 에서 `Project URL`, `anon public` 키 복사

## 2. 로컬 실행

```bash
cp .env.local.example .env.local   # 값 채우기
npm install
npm run dev                         # http://localhost:3000
```

## 3. Vercel 배포

1. 이 폴더를 GitHub 저장소에 push
2. https://vercel.com/new 에서 저장소 Import (Framework: Next.js 자동 인식)
3. **Environment Variables** 에 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy**

또는 CLI: `npx vercel` → `npx vercel env add ...` → `npx vercel --prod`
