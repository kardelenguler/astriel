// Backend'deki UserOut şemasının karşılığı
export interface User {
  id: string;
  username: string;
  email: string | null;
  display_name: string | null;
}

// POST /auth/register isteğinin gövdesi
export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;         // isteğe bağlı
  display_name?: string;  // isteğe bağlı
}

// POST /auth/login cevabı
export interface TokenResponse {
  access_token: string;
  token_type: string;
}