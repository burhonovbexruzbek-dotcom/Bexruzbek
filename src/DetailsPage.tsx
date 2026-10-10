import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Bath, BedDouble, CarFront, Flame, MapPin, Star, Users, Wifi, Waves } from 'lucide-react'
import { apiEnabled } from './services/api'

type Dacha = { id: number; name: string; location: string; price: number; rating: number; reviews: number; guests: number; beds: number; baths: number; image: string; description: string }
type Booking = { id: string; dachaId: number; checkIn: string; checkOut: string }
type BookingRequest = { id:string;dachaId:number;name:string;phone:string;checkIn:string;checkOut:string;guests:number;total:number }
type Props = { dachas:Dacha[];bookings:Booking[];submitBooking:(booking:BookingRequest)=>Promise<{ok:boolean;bookingNumber?:string;error?:string}> }
const money=(value:number)=>`${new Intl.NumberFormat('uz-UZ').format(value)} so‘m`
const nightsBetween=(from:string,to:string)=>from&&to?Math.max(0,Math.round((new Date(`${to}T12:00:00`).getTime()-new Date(`${from}T12:00:00`).getTime())/86400000)):0
const gallery=['https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=85','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85','https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1000&q=85']
const today=new Date().toISOString().slice(0,10)

export default function DetailsPage({dachas,bookings,submitBooking}:Props) {
  const {id}=useParams()
  const dacha=dachas.find((item)=>String(item.id)===id)
  const [from,setFrom]=useState('')
  const [to,setTo]=useState('')
  const [guests,setGuests]=useState(2)
  const [name,setName]=useState('')
  const [phone,setPhone]=useState('')
  const [notice,setNotice]=useState('')
  const [submitting,setSubmitting]=useState(false)
  if(!dacha)return <main className="empty-state not-found"><strong>Dacha topilmadi</strong><Link className="primary-btn" to="/">Bosh sahifa</Link></main>
  const nights=nightsBetween(from,to)
  const booked=Boolean(from&&to&&bookings.some((booking)=>booking.dachaId===dacha.id&&from<booking.checkOut&&to>booking.checkIn))
  const book=async(event:React.FormEvent)=>{
    event.preventDefault();setNotice('')
    if(!from||!to||nights<1){setNotice('Kelish va ketish sanalarini to‘g‘ri tanlang.');return}
    if(guests>dacha.guests){setNotice(`Bu dacha ko‘pi bilan ${dacha.guests} mehmon uchun.`);return}
    if(!/^\+?[0-9\s()-]{9,18}$/.test(phone)){setNotice('Telefon raqamini to‘g‘ri kiriting.');return}
    const booking={id:`DS-${crypto.randomUUID().slice(0,8).toUpperCase()}`,dachaId:dacha.id,name,phone,checkIn:from,checkOut:to,guests,total:dacha.price*nights}
    setSubmitting(true)
    try{const result=await submitBooking(booking);setNotice(result.ok?`So‘rovingiz yuborildi. Bron raqami: ${result.bookingNumber}`:result.error||'Bron yuborilmadi.')}finally{setSubmitting(false)}
  }
  return <main className="inner-page detail-page content-width"><Link className="back-link" to="/"><ArrowLeft size={16}/> Bosh sahifa</Link><div className="detail-heading"><div><div className="property-location"><MapPin size={15}/>{dacha.location}</div><h1>{dacha.name}</h1><span className="rating"><Star size={15} fill="currentColor"/>{dacha.rating} <small>· {dacha.reviews} ta sharh</small></span></div><div className="detail-price"><strong>{money(dacha.price)}</strong><span>/ kecha</span></div></div><div className="detail-gallery"><img className="gallery-main" src={dacha.image} alt={dacha.name}/><img src={gallery[0]} alt="Dacha hovlisi"/><img src={gallery[1]} alt="Dam olish maskani"/><img src={gallery[2]} alt="Dacha atrofi"/></div><div className="detail-columns"><section className="detail-copy"><span className={`availability ${booked?'booked':'unselected'}`}><i/>{booked?'Band':'Sanalar tanlanmagan'}</span><h2>Bu maskan haqida</h2><p>{dacha.description}</p><div className="detail-facts"><span><Users/> {dacha.guests} mehmon</span><span><BedDouble/> {dacha.beds} xona</span><span><Bath/> {dacha.baths} hammom</span></div><h3>Qulayliklar</h3><div className="detail-amenities"><span><Waves size={17}/> Basseyn</span><span><Wifi size={17}/> Wi-Fi</span><span><Flame size={17}/> Barbekyu</span><span><CarFront size={17}/> Avtoturargoh</span></div><h3>Uy qoidalari</h3><p>Kelish vaqti 14:00 dan, ketish vaqti 11:00 gacha. Uy ichida chekish taqiqlanadi. Iltimos, tabiatni va qo‘shnilar osoyishtaligini asrang.</p></section><form className="booking-panel" onSubmit={book}><h3>Dam olishni rejalashtiring</h3><div className="booking-dates"><label>Kelish<input type="date" required value={from} min={today} onChange={(event)=>{setFrom(event.target.value);if(to&&to<=event.target.value)setTo('')}}/></label><label>Ketish<input type="date" required value={to} min={from||today} onChange={(event)=>setTo(event.target.value)}/></label></div><label>Mehmonlar<select value={guests} onChange={(event)=>setGuests(Number(event.target.value))}>{Array.from({length:dacha.guests},(_,index)=><option key={index+1} value={index+1}>{index+1} mehmon</option>)}</select></label><label>Ismingiz<input required value={name} onChange={(event)=>setName(event.target.value)} placeholder="Ism familiya"/></label><label>Telefon raqami<input required value={phone} onChange={(event)=>setPhone(event.target.value)} placeholder="+998 90 123 45 67"/></label>{nights>0&&<div className="price-summary"><span>{money(dacha.price)} × {nights} kecha</span><strong>{money(dacha.price*nights)}</strong></div>}{notice&&<div className={`notice ${notice.startsWith('So‘rovingiz')?'success':''}`} role="status">{notice}</div>}<button className="primary-btn" disabled={booked||submitting}>{booked?'Bu sanalar band':submitting?'Yuborilmoqda...':'Bron qilish'} <ArrowRight size={16}/></button><small className="booking-note">{apiEnabled?'Bron so‘rovi serverda qayta tekshiriladi.':'Bron so‘rovi demo rejimida yuboriladi.'}</small></form></div></main>
}
