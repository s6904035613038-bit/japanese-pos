'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function History() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSales()
  }, [])

  async function fetchSales() {
    setLoading(true)
    const { data } = await supabase.from('sales').select('*').order('sold_at', { ascending: false })
    setSales(data || [])
    setLoading(false)
  }

  const totalRevenue = sales.reduce((sum, item) => sum + Number(item.total_price), 0)

  return (
    <div>
      <h2>📜 ประวัติการขายและสรุปยอด</h2>
      
      <div style={{ background: '#8b0000', color: '#fff', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
        <h3 style={{ margin: 0 }}>💰 ยอดขายรวมทั้งหมด</h3>
        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0 0 0' }}>{totalRevenue.toLocaleString()} ฿</p>
      </div>

      {loading ? <p>กำลังโหลดข้อมูล...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
          <thead>
            <tr style={{ background: '#2b2b2b', color: '#fff', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>วัน-เวลา</th>
              <th style={{ padding: '10px' }}>เมนูที่สั่ง</th>
              <th style={{ padding: '10px' }}>จำนวน</th>
              <th style={{ padding: '10px' }}>ยอดรวม</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{new Date(item.sold_at).toLocaleString('th-TH')}</td>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{item.product_name}</td>
                <td style={{ padding: '10px' }}>{item.quantity}</td>
                <td style={{ padding: '10px', color: '#28a745', fontWeight: 'bold' }}>{item.total_price} ฿</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
