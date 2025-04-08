# E-commerce Project API

## 프로젝트 소개

이 프로젝트는 NestJS를 기반으로 한 이커머스 플랫폼의 백엔드 API 서버입니다. 
사용자 인증, 상품 관리, 장바구니, 주문, 배송 등 이커머스 플랫폼에 필요한 핵심 기능들을 제공합니다.

## 기술 스택

- **Framework**: NestJS v11
- **Database**: PostgreSQL (with Prisma ORM)
- **Authentication**: Passport, JWT
- **Cloud Services**: Supabase
- **Development Tools**:
  - TypeScript
  - ESLint
  - Prettier

## 주요 기능
- 사용자 인증 및 권한 관리 (Auth)
- 상품 관리 (Shop)
- 장바구니 기능 (Cart)
- 주문 처리 (Order)
- 배송 관리 (Shipping)
- 검색 기능 (Search)
- 블로그 기능 (Blog)

## 프로젝트 구조

```
src/
├── auth/         # 인증 관련 모듈
├── blog/         # 블로그 기능 모듈
├── cart/         # 장바구니 모듈
├── dto/          # Data Transfer Objects
├── entities/     # 데이터베이스 엔티티
├── home/         # 홈 페이지 관련 모듈
├── order/        # 주문 처리 모듈
├── prisma/       # Prisma 설정 및 스키마
├── search/       # 검색 기능 모듈
├── shipping/     # 배송 관리 모듈
└── shop/         # 상품 관리 모듈
```
