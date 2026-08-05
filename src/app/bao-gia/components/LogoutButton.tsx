'use client';

export default function LogoutButton() {
  return (
    <button 
      onClick={() => {
        localStorage.removeItem('sgm_quote_auth');
        window.location.reload();
      }}
      className="text-xs text-gray-500 hover:text-red-400 ml-2"
      title="Đăng xuất"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    </button>
  );
}
