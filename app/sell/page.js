'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function Sell() {
  const [products, setProducts] = useState([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [orderType, setOrderType] = useState('ทานที่ร้าน')

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*')
    setProducts(data || [])
  }

  const selectedProduct = products.find(p => p.id === selectedProductId)
  const totalPrice = selectedProduct ? selectedProduct.price * quantity : 0

  async function handleSell(e) {
    e.preventDefault()
    if (!selectedProduct) return alert('กรุณาเลือกเมนูอาหาร')
    if (quantity > selectedProduct.stock) return alert('จำนวนสินค้าคงเหลือไม่พอ!')

    // บันทึกการขาย
    const { error: saleError } = await supabase.from('sales').insert([
      {
        product_id: selectedProduct.id,
        product_name: `${selectedProduct.name} (${orderType})`,
        quantity: parseInt(quantity),
        total_price: totalPrice
      }
    ])

    if (saleError) return alert('เกิดข้อผิดพลาดในการบันทึก: ' + saleError.message)

    // ตัดสต๊อก
    await supabase.from('products')
      .update({ stock: selectedProduct.stock - quantity })
      .eq('id', selectedProduct.id)

    alert('✅ บันทึกออเดอร์สำเร็จ!')
    setSelectedProductId('')
    setQuantity(1)
    fetchProducts()
  }

  return (
    <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2>🍣 หน้าสั่งอาหาร (POS Cashier)</h2>
      
      <form onSubmit={handleSell}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>ประเภทออเดอร์:</label>
          <select value={orderType} onChange={e => setOrderType(e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '1rem' }}>
            <option value="ทานที่ร้าน">🍽️ ทานที่ร้าน (Dine-in)</option>
            <option value="สั่งกลับบ้าน">🥡 สั่งกลับบ้าน (Takeaway)</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>เลือกเมนูอาหาร:</label>
          <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '1rem' }}>
            <option value="">-- กรุณาเลือกเมนู --</option>
            {products.map(p => (
              <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                {p.name} - {p.price} ฿ (คงเหลือ: {p.stock} {p.unit})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>จำนวน:</label>
          <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '1rem' }} />
        </div>

        <div style={{ background: '#fcf9f2', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', marginBottom: '1.5rem', border: '2px dashed #8b0000' }}>
          <h3 style={{ margin: 0, color: '#8b0000' }}>ยอดรวมทั้งหมด</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0 0 0' }}>{totalPrice} ฿</p>
        </div>

        <button type="submit" style={{ width: '100%', background: '#28a745', color: '#fff', border: 'none', padding: '15px', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>
          ✅ ยืนยันชำระเงิน / ยืนยันออเดอร์
        </button>
      </form>
    </div>
  )
}
