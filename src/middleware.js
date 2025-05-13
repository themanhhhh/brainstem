// src/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Lấy đường dẫn hiện tại
  const path = request.nextUrl.pathname;

  // Các đường dẫn công khai không cần xác thực
  const isPublicPath = path === '/login' || path === '/' || path === '/menu';

  // Kiểm tra xem có token trong cookies không
  const token = request.cookies.get('token')?.value || '';

  

  // Nếu không phải đường dẫn công khai và chưa đăng nhập
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Cấu hình các đường dẫn cần áp dụng middleware
export const config = {
  matcher: [
    '/',
    '/login',
    '/admin/:path*',
    '/menu',
    '/cart',
    '/payment',
    '/aboutus'
  ]
};