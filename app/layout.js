import './globals.css'

export const metadata = {
  title: '居酒屋 Japanese Restaurant POS',
  description: 'ระบบจัดการร้านอาหารญี่ปุ่น',
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <nav style={{
          backgroundColor: '#8b0000',
          color: '#ffffff',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>🍱 居酒屋 Japanese POS</h1>
          <div style={{ display: 'flex', gap: '20px', fontWeight: 'bold' }}>
            <a href="/" style={{ color: '#fff' }}>หน้าแรก/เมนู</a>
            <a href="/sell" style={{ color: '#fff' }}>รับออเดอร์ (ขาย)</a>
            <a href="/history" style={{ color: '#fff' }}>ประวัติการขาย</a>
          </div>
        </nav>
        <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
