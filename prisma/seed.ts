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
    console.log('✅ Admin created')
  }

  // Create hotel registration
  let reg = await prisma.hotelRegistration.findFirst()
  if (!reg) {
    reg = await prisma.hotelRegistration.create({
      data: {
        hotelName: 'Grand Islamabad Hotel',
        managerEmail: 'manager@grandislamabad.com',
        managerFirstName: 'Hotel',
        managerLastName: 'Manager',
        status: 'approved',
      }
    })
  }

  // Create a hotel
  const hotel = await prisma.hotel.upsert({
    where: { registrationId: 1 },
    update: {},
    create: {
      name: 'Grand Islamabad Hotel',
      description: 'Luxury hotel with stunning views of the Margalla Hills. Located in the heart of Islamabad, offering world-class amenities and exceptional service.',
      address: 'F-6, Islamabad',
      city: 'Islamabad',
      country: 'Pakistan',
      phone: '+92 51 1234567',
      email: 'info@grandislamabad.com',
      status: 'approved',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      registrationId: 1,
    },
  })
  console.log('✅ Hotel created')

  // 4. Create Room Types
  const roomTypes = [
    { 
      name: 'Deluxe King', 
      basePrice: 12000, 
      capacity: 2, 
      imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
      amenities: ['WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Room Service']
    },
    { 
      name: 'Executive Suite', 
      basePrice: 18000, 
      capacity: 4, 
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
      amenities: ['WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Kitchen', 'Living Room']
    },
    { 
      name: 'Presidential Suite', 
      basePrice: 35000, 
      capacity: 6, 
      imageUrl: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop',
      amenities: ['WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Kitchen', 'Living Room', 'Dining Room', 'Private Balcony']
    },
    { 
      name: 'Standard Double', 
      basePrice: 8000, 
      capacity: 2, 
      imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop',
      amenities: ['WiFi', 'Air Conditioning', 'TV']
    },
  ]

  for (const rt of roomTypes) {
    const roomType = await prisma.roomType.create({
      data: {
        hotelId: hotel.id,
        name: rt.name,
        basePrice: rt.basePrice,
        capacity: rt.capacity,
        imageUrl: rt.imageUrl,
        amenities: rt.amenities,
      },
    })
    console.log(`✅ Room type created: ${rt.name}`)

    // Create 3 rooms for each type
    for (let i = 1; i <= 3; i++) {
      await prisma.room.create({
        data: {
          roomTypeId: roomType.id,
          roomNumber: `${rt.name.split(' ')[0].substring(0, 2).toUpperCase()}${String(i).padStart(2, '0')}`,
          floor: Math.floor(Math.random() * 5) + 1,
          status: 'available',
        },
      })
    }
    console.log(`✅ 3 rooms created for ${rt.name}`)
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