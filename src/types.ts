export type Dacha = { id: number; name: string; location: string; price: number; rating: number; reviews: number; guests: number; beds: number; baths: number; image: string; tag: string; description: string }
export type Booking = { id: string; dachaId: number; name: string; phone: string; checkIn: string; checkOut: string; guests: number; total: number }
