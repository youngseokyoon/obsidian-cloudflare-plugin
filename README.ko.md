# Obsidian용 Cloudflare R2 플러그인

[English](README.md) | [한국어](README.ko.md)

이 플러그인은 이미지를 로컬 vault에 저장하는 대신 [Cloudflare R2](https://www.cloudflare.com/products/r2/)에 업로드합니다.

## 왜 사용하나요?

Obsidian은 기본적으로 모든 데이터를 로컬에 저장하는데, 이는 텍스트에는 완벽하지만 이미지의 경우 개선의 여지가 있습니다. 노트에 자주 사진을 추가하면 vault 크기가 빠르게 증가하여 다음과 같은 문제가 발생할 수 있습니다:

- 무료 클라우드 스토리지 플랜의 용량 제한 도달
- git 백업 사용 시 저장소 크기 증가
- 기기 간 동기화 속도 저하

이 플러그인은 다음과 같은 사용자에게 이상적입니다:
- 매일 노트에 이미지를 붙여넣는 사용자 (예: 스크린샷, 다이어그램)
- vault를 가볍게 유지하고 싶은 사용자
- R2의 비용 효율적인 가격으로 이미지 클라우드 저장을 선호하는 사용자
- 노트를 쉽게 공유해야 하는 사용자 (원격 이미지가 포함된 단일 파일)

## 기능

- **붙여넣기 시 자동 업로드**: 에디터에 붙여넣을 때 자동으로 이미지 업로드
- **로컬 fallback**: 업로드 실패 시에도 이미지를 로컬에 저장
- **스마트 이미지 크기 조절**: 3가지 크기 조절 모드
  - **고정(Fixed)**: 픽셀 기반 크기 조절 (80, 100, 150, 200, 300px)
  - **퍼센트(Percentage)**: 상대적 크기 조절 (50%, 75%, 100%, 150%, 200%)
  - **자동(Auto)**: 이미지 크기에 따른 스마트 크기 조절
- **폴더 구조화**: frontmatter 키로 이미지 정리
- **사용자 정의 경로**: R2 버킷 경로 및 커스텀 도메인 설정

## 설치

### Obsidian Community Plugins에서 설치

1. 설정 → Community Plugins 열기
2. "Cloudflare R2" 검색
3. Install 클릭
4. 플러그인 활성화

### 수동 설치

1. 최신 릴리스에서 `main.js`, `manifest.json`, `styles.css` 다운로드
2. 폴더 생성: `VaultFolder/.obsidian/plugins/obsidian-cloudflare-plugin/`
3. 다운로드한 파일을 이 폴더에 복사
4. Obsidian 재시작
5. 설정 → Community Plugins에서 플러그인 활성화

## 시작하기

### 1. Cloudflare R2 버킷 생성

1. [Cloudflare](https://dash.cloudflare.com/sign-up)에 가입 (미가입 시)
2. Cloudflare 대시보드에서 R2 Object Storage로 이동
3. 새 버킷 생성 (예: `obsidian-images`)

### 2. R2 API 토큰 생성

1. Cloudflare 대시보드에서 R2 → Manage R2 API Tokens로 이동
2. "Create API Token" 클릭
3. 권한 설정: Object Read & Write
4. 버킷 선택
5. Access Key ID와 Secret Access Key 복사

### 3. CORS 설정 (중요!)

Obsidian이 업로드할 수 있도록 R2 버킷에 CORS 정책 추가:

```json
[
  {
    "AllowedOrigins": [
      "app://*"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag",
      "Content-Length",
      "Content-Type"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

### 4. 플러그인 설정

1. 설정 → Cloudflare R2 Plugin 열기
2. "Auto Upload Plugin" 활성화
3. R2 인증 정보 입력:
   - **Access Key ID**: 2단계에서 복사한 값
   - **Secret Access Key**: 2단계에서 복사한 값
   - **Endpoint**: R2 엔드포인트 (예: `https://[account-id].r2.cloudflarestorage.com`)
   - **Bucket Name**: 버킷 이름 (예: `obsidian-images`)
   - **Path**: 선택적 경로 접두사 (예: `notes/images`)
   - **Custom Domain**: 공개 액세스를 위한 선택적 커스텀 도메인

## 사용법

### 기본 사용법

1. 이미지를 클립보드에 복사
2. 노트에 붙여넣기 (`Cmd/Ctrl + V`)
3. 이미지가 자동으로 R2에 업로드됨
4. 마크다운 링크가 삽입됨

### 이미지 크기 조절 모드

붙여넣은 이미지의 크기를 조절하는 방법 선택:

**고정 모드 (기본값)**
- 사전 설정된 픽셀 값 선택: 80, 100, 150, 200, 300
- 예시: `![image|150](https://r2-url.com/image.png)`

**퍼센트 모드**
- 상대적 크기 조절: 50%, 75%, 100%, 150%, 200%
- 예시: `![image|100%](https://r2-url.com/image.png)`

**자동 모드 (스마트 크기 조절)**
- 이미지 크기에 따라 자동으로 최적 크기 결정:
  - 큰 이미지 (>1200px): 600px로 축소
  - 작은 이미지 (<300px): 200%로 확대
  - 세로 이미지: 너비 400px로 제한
  - 가로 이미지: 너비 800px로 제한
  - 중간 크기 이미지: 원본 크기

### 폴더 구조화

노트의 frontmatter에 `imageNameKey`를 추가하여 이미지 정리:

```yaml
---
imageNameKey: project-alpha
---
```

이미지가 다음 경로에 저장됩니다: `attachments/project-alpha/[random-id].png`

### 로컬 복사본 유지

"Keep local copy of pasted images"를 활성화하면 이미지를 로컬과 R2 모두에 저장합니다. 업로드 실패 시 로컬 복사본이 fallback으로 사용됩니다.

## 설정

### 자동 업로드 설정

- **Enable Auto Upload Plugin**: 붙여넣기 시 자동 업로드 토글
- **Keep local copy of pasted images**: 업로드 후에도 vault에 이미지 저장

### 이미지 크기 조절

- **Image sizing mode**: Fixed, Percentage, Auto 중 선택
- **Fixed width**: 픽셀 값 선택 (80-300)
- **Image scale**: 퍼센트 선택 (50%-200%)

### R2 설정

- **Access Key ID**: R2 API 액세스 키
- **Secret Access Key**: R2 API 시크릿 키
- **Endpoint**: R2 스토리지 엔드포인트 URL
- **Bucket Name**: 대상 R2 버킷
- **Path**: 버킷 내 선택적 경로 접두사
- **Custom Domain Name**: 공개 URL을 위한 선택적 커스텀 도메인

### 추가 설정

- **Use image name as Alt Text**: 파일명을 alt 텍스트로 사용
- **Update original document**: 내부 링크를 R2 링크로 교체
- **Ignore note properties**: 복사 시 frontmatter 제외

## FAQ

**Q: 이 방식은 얼마나 안전한가요?**  
A: 이미지는 개인 R2 버킷에 저장됩니다. 버킷을 공개로 설정하거나 URL을 공유하지 않는 한 아무도 액세스할 수 없습니다.

**Q: 업로드 실패 시 어떻게 되나요?**  
A: "Keep local copy"가 활성화되어 있으면 이미지가 로컬에 저장되고 로컬 wiki-link가 삽입됩니다. 이미지를 잃어버리지 않습니다.

**Q: 업로드된 이미지를 삭제할 수 있나요?**  
A: 네, Cloudflare 대시보드를 통해 R2 버킷을 관리하고 필요에 따라 이미지를 삭제할 수 있습니다.

**Q: 비용은 얼마인가요?**  
A: Cloudflare R2는 월 10GB 무료 스토리지를 제공합니다. 그 이상은 GB당 월 $0.015이며 egress 비용이 없습니다.

**Q: 커스텀 도메인을 사용할 수 있나요?**  
A: 네! R2 버킷 설정에서 커스텀 도메인을 구성하고 플러그인 설정에 추가하세요.

**Q: 모바일에서 작동하나요?**  
A: 이 플러그인은 데스크톱 전용으로 설계되었습니다. 모바일 지원은 향후 추가될 수 있습니다.

## 알려진 제한사항

- 데스크톱 전용 (모바일 미지원)
- 클립보드에서 붙여넣은 애니메이션 GIF는 작동하지 않을 수 있음 (대신 드래그 앤 드롭 사용)
- R2 버킷에 CORS 설정 필요

## 문제 해결

### CORS 오류

CORS 관련 오류가 표시되는 경우:
1. R2 버킷 설정에서 CORS 정책이 올바르게 설정되었는지 확인
2. AllowedOrigins에 `app://*`가 있는지 확인
3. CORS 변경사항이 전파될 때까지 몇 분 대기

### 업로드 실패

업로드가 실패하는 경우:
1. R2 API 인증 정보 확인
2. 버킷 이름과 엔드포인트가 올바른지 확인
3. R2 API 토큰에 쓰기 권한이 있는지 확인
4. Cloudflare R2 대시보드에서 서비스 문제 확인

## 개발

### 플러그인 빌드

```bash
npm install
npm run build
```

### 개발 모드

```bash
npm run dev
```

## 지원

이 플러그인이 도움이 되었다면:
- ⭐ GitHub에서 저장소에 별표 주기
- 🐛 버그 보고 및 기능 제안
- 📝 코드 기여

## 라이선스

MIT License - 자세한 내용은 LICENSE 파일 참조

## 크레딧

[obsidian-imgur-plugin](https://github.com/gavvvr/obsidian-imgur-plugin)에서 영감을 받았습니다
