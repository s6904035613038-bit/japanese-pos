'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ sku: '', name: '', price: '', stock: '', unit: 'จาน', category: 'ทั่วไป' })

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (!error) setProducts(data || [])
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.sku || !form.name || !form.price) return alert('กรุณากรอกข้อมูลให้ครบถ้วน')
    
    const { error } = await supabase.from('products').insert([
      { ...form, price: parseFloat(form.price), stock: parseInt(form.stock || 0) }
    ])

    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } else {
      setForm({ sku: '', name: '', price: '', stock: '', unit: 'จาน', category: 'ทั่วไป' })
      fetchProducts()
    }
  }

  async function handleDelete(id) {
    if (confirm('ยืนยันลบเมนูนี้?')) {
      await supabase.from('products').delete().eq('id', id)
      fetchProducts()
    }
  }

  return (
    <div>
      <h2>📋 รายการเมนูอาหารญี่ปุ่น</h2>
      
      {/* ฟอร์มเพิ่มเมนู */}
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3>➕ เพิ่มเมนูอาหารใหม่</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <input placeholder="รหัส SKU (เช่น JPN-01)" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} style={{ padding: '8px' }} />
          <input placeholder="ชื่อเมนูอาหาร" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ padding: '8px' }} />
          <input placeholder="ราคา (บาท)" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} style={{ padding: '8px' }} />
          <input placeholder="จำนวนสต๊อกคงเหลือ" type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} style={{ padding: '8px' }} />
          <input placeholder="หน่วยนับ (เช่น จาน, ชาม)" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} style={{ padding: '8px' }} />
          <input placeholder="หมวดหมู่ (เช่น ราเมง, ซูชิ)" value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ padding: '8px' }} />
        </div>
        <button type="submit" style={{ background: '#8b0000', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>บันทึกเมนู</button>
      </form>

      {/* ตารางแสดงเมนู */}
      {loading ? <p>กำลังโหลดข้อมูล...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
          <thead>
            <tr style={{ background: '#2b2b2b', color: '#fff', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>SKU</th>
              <th style={{ padding: '10px' }}>ชื่อเมนู</th>
              <th style={{ padding: '10px' }}>หมวดหมู่</th>
              <th style={{ padding: '10px' }}>ราคา</th>
              <th style={{ padding: '10px' }}>คงเหลือ</th>
              <th style={{ padding: '10px' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {products.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{item.sku}</td>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{item.name}</td>
                <td style={{ padding: '10px' }}>{item.category}</td>
                <td style={{ padding: '10px' }}>{item.price} ฿</td>
                <td style={{ padding: '10px' }}>{item.stock} {item.unit}</td>
                <td style={{ padding: '10px' }}>
                  <button onClick={() => handleDelete(item.id)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
