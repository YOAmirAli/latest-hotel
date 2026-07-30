import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Create Admin
  const adminExists = await prisma.user.findUnique({
    where: { email: 'admin@luxestay.com' }
  })
  if (!adminExists) {
    await prisma.user.create({
      data: {
        email: 'admin@luxestay.com',
        password: bcrypt.hashSync('admin123', 12),
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
      }
    })
    console.log('✅ Admin created (admin@luxestay.com / admin123)')
  }

  // Define 3 Default Hotels
  const hotelsData = [
    {
      id: 1,
      name: 'Grand Islamabad Hotel',
      description: 'Experience premier hospitality in the diplomatic enclave of Islamabad. Offering majestic Margalla views, fine international dining, rooftop pool, and 24/7 concierge service.',
      address: 'F-6 Markaz, Islamabad',
      city: 'Islamabad',
      country: 'Pakistan',
      phone: '+92 51 111 234 567',
      email: 'info@grandislamabad.com',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      roomTypes: [
        {
          name: 'Deluxe King Suite',
          basePrice: 15000,
          capacity: 2,
          imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
          amenities: ['WiFi', 'Air Conditioning', 'Flat TV', 'Mini Bar', 'Buffet Breakfast Included', 'Margalla View']
        },
        {
          name: 'Executive Club Suite',
          basePrice: 24000,
          capacity: 4,
          imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
          amenities: ['WiFi', 'Air Conditioning', 'Kitchenette', 'Living Area', 'Executive Lounge Access']
        },
        {
          name: 'Presidential Royal Suite',
          basePrice: 45000,
          capacity: 6,
          imageUrl: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop',
          amenities: ['Private Balcony', 'Personal Butler', 'Jacuzzi', 'Dining Hall', 'Chauffeur Service']
        }
      ]
    },
    {
      id: 2,
      name: 'Serena Resort & Spa',
      description: 'Set amid 6 acres of lush gardens in Islamabad, Serena Resort combines traditional heritage architecture with world-class wellness treatments, temperature-controlled pools, and gourmet dining.',
      address: 'Khayaban-e-Suhrawardy, Sector G-5, Islamabad',
      city: 'Islamabad',
      country: 'Pakistan',
      phone: '+92 51 287 4000',
      email: 'reservations@serenaresort.com',
      imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop',
      roomTypes: [
        {
          name: 'Garden Sanctuary Suite',
          basePrice: 22000,
          capacity: 2,
          imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&fit=crop',
          amenities: ['Private Terrace', 'Spa Pass Included', 'WiFi', 'Organic Breakfast', 'King Bed']
        },
        {
          name: 'Royal Heritage Suite',
          basePrice: 38000,
          capacity: 4,
          imageUrl: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&h=600&fit=crop',
          amenities: ['Garden View', 'Marble Bath', 'Espresso Machine', '24h Room Service']
        }
      ]
    },
    {
      id: 3,
      name: 'Margalla Heights Residency',
      description: 'A contemporary boutique hotel perched near Sector E-7 offering peaceful ambient mountain breezes, high-speed fiber connectivity, and signature Pakistani warm hospitality.',
      address: 'Hill Road, Sector E-7, Islamabad',
      city: 'Islamabad',
      country: 'Pakistan',
      phone: '+92 51 265 1200',
      email: 'stay@margallaheights.com',
      imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
      roomTypes: [
        {
          name: 'Mountain Panorama Suite',
          basePrice: 18000,
          capacity: 2,
          imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop',
          amenities: ['High Speed WiFi', 'Smart TV', 'Balcony', 'Breakfast', 'Workstation']
        },
        {
          name: 'Family Penthouse',
          basePrice: 32000,
          capacity: 5,
          imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&h=600&fit=crop',
          amenities: ['2 Bedrooms', 'Full Kitchen', 'Mountain Terrace', 'Washing Machine']
        }
      ]
    }
  ]

  for (const hData of hotelsData) {
    let reg = await prisma.hotelRegistration.findFirst({
      where: { hotelName: hData.name }
    })
    if (!reg) {
      reg = await prisma.hotelRegistration.create({
        data: {
          hotelName: hData.name,
          managerEmail: hData.email,
          managerFirstName: 'Manager',
          managerLastName: hData.name.split(' ')[0],
          status: 'approved',
          description: hData.description,
          hotelAddress: hData.address,
          hotelCity: hData.city,
          hotelCountry: hData.country,
          hotelPhone: hData.phone,
          hotelEmail: hData.email,
        }
      })
    }

    const hotel = await prisma.hotel.upsert({
      where: { registrationId: reg.id },
      update: {
        name: hData.name,
        description: hData.description,
        address: hData.address,
        city: hData.city,
        country: hData.country,
        phone: hData.phone,
        email: hData.email,
        imageUrl: hData.imageUrl,
        status: 'approved',
      },
      create: {
        name: hData.name,
        description: hData.description,
        address: hData.address,
        city: hData.city,
        country: hData.country,
        phone: hData.phone,
        email: hData.email,
        imageUrl: hData.imageUrl,
        status: 'approved',
        registrationId: reg.id,
      },
    })
    console.log(`✅ Hotel created/updated: ${hotel.name}`)

    for (const rt of hData.roomTypes) {
      const existingRt = await prisma.roomType.findFirst({
        where: { hotelId: hotel.id, name: rt.name }
      })

      const roomType = existingRt
        ? existingRt
        : await prisma.roomType.create({
            data: {
              hotelId: hotel.id,
              name: rt.name,
              basePrice: rt.basePrice,
              capacity: rt.capacity,
              imageUrl: rt.imageUrl,
              amenities: rt.amenities,
            },
          })

      // Create 3 available room units for each type if none exist
      const existingRooms = await prisma.room.count({
        where: { roomTypeId: roomType.id }
      })

      if (existingRooms === 0) {
        for (let i = 1; i <= 3; i++) {
          const code = rt.name.split(' ')[0].substring(0, 2).toUpperCase()
          await prisma.room.create({
            data: {
              roomTypeId: roomType.id,
              roomNumber: `${code}-${hotel.id}0${i}`,
              floor: i,
              status: 'available',
            },
          })
        }
        console.log(`✅ Created 3 room units for ${rt.name}`)
      }
    }
  }

  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })