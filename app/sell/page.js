'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function Sell() {
  const [products, setProducts] = useState([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [orderType, setOrderType] = useState('ทานที่ร้าน')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*')
    setProducts(data || [])
  }

  const selectedProduct = products.find(p => p.id === selectedProductId)
  const totalPrice = selectedProduct ? selectedProduct.price * quantity : 0

  // ฟังก์ชันสำหรับส่งข้อความแจ้งเตือนเข้า Telegram Channel
  async function sendTelegramNotification(messageText) {
    const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID

    if (!botToken || !chatId) {
      console.warn('Telegram Credentials Not Found: กรุณาตรวจสอบ Environment Variables')
      return
    }

    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: 'HTML',
        }),
      })
    } catch (telegramError) {
      // ป้องกันไม่ให้ระบบขายหยุดทำงานหาก Telegram API มีปัญหา
      console.error('Failed to send Telegram Notification:', telegramError)
    }
  }

  async function handleSell(e) {
    e.preventDefault()
    if (!selectedProduct) return alert('กรุณาเลือกเมนูอาหาร')
    if (quantity <= 0) return alert('กรุณาระบุจำนวนสินค้าให้ถูกต้อง')
    if (quantity > selectedProduct.stock) return alert('จำนวนสินค้าคงเหลือไม่พอ!')

    setIsSubmitting(true)

    try {
      const remainingStock = selectedProduct.stock - parseInt(quantity)
      const productNameWithOption = `${selectedProduct.name} (${orderType})`

      // 1. บันทึกการขายลงตาราง sales
      const { error: saleError } = await supabase.from('sales').insert([
        {
          product_id: selectedProduct.id,
          product_name: productNameWithOption,
          quantity: parseInt(quantity),
          total_price: totalPrice,
        },
      ])

      if (saleError) throw new Error('เกิดข้อผิดพลาดในการบันทึกการขาย: ' + saleError.message)

      // 2. ตัดสต๊อกสินค้าลงในตาราง products
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: remainingStock })
        .eq('id', selectedProduct.id)

      if (updateError) throw new Error('เกิดข้อผิดพลาดในการอัปเดตสต๊อก: ' + updateError.message)

      // 3. แจ้งเตือน Order ออเดอร์อาหารเข้า (New Order Alert)
      const currentTime = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })
      const orderMessage = `🍣 <b>มีรายการสั่งซื้อใหม่! (ร้านอาหารญี่ปุ่น)</b>\n\n` +
        `• <b>เมนูอาหาร:</b> ${productNameWithOption}\n` +
        `• <b>จำนวน:</b> ${quantity} ${selectedProduct.unit || 'จาน'}\n` +
        `• <b>ราคารวม:</b> ${totalPrice.toLocaleString()} บาท\n` +
        `• <b>สต๊อกคงเหลือปัจจุบัน:</b> ${remainingStock} ${selectedProduct.unit || 'จาน'}\n` +
        `• <b>เวลา:</b> ${currentTime}`

      await sendTelegramNotification(orderMessage)

      // 4. แจ้งเตือนเมนูอาหาร/วัตถุดิบเหลือน้อย (Low Stock Alert <= 5)
      if (remainingStock <= 5) {
        const lowStockMessage = `🚨 <b>[เตือนภัย] วัตถุดิบ/เมนูอาหารใกล้หมด!</b>\n\n` +
          `• <b>เมนู:</b> ${selectedProduct.name}\n` +
          `• <b>คงเหลือเพียง:</b> ${remainingStock} ${selectedProduct.unit || 'จาน'}\n\n` +
          `⚠️ <i>กรุณาเตรียมวัตถุดิบเพิ่มด่วน!</i>`

        await sendTelegramNotification(lowStockMessage)
      }

      alert('✅ บันทึกออเดอร์สำเร็จ!')
      setSelectedProductId('')
      setQuantity(1)
      fetchProducts()
    } catch (err) {
      alert('❌ ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
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
                {p.name} - {p.price} ฿ (คงเหลือ: {p.stock} {p.unit || 'จาน'})
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
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '10px 0 0 0' }}>{totalPrice.toLocaleString()} ฿</p>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ 
            width: '100%', 
            background: isSubmitting ? '#6c757d' : '#28a745', 
            color: '#fff', 
            border: 'none', 
            padding: '15px', 
            fontSize: '1.2rem', 
            fontWeight: 'bold', 
            borderRadius: '4px', 
            cursor: isSubmitting ? 'not-allowed' : 'pointer' 
          }}
        >
          {isSubmitting ? '⏳ กำลังบันทึกข้อมูล...' : '✅ ยืนยันชำระเงิน / ยืนยันออเดอร์'}
        </button>
      </form>
    </div>
  )
}
