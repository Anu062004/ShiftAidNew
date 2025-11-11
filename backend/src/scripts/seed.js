import mongoose from 'mongoose';
import dotenv from 'dotenv';
import NGO from '../models/NGO.js';

dotenv.config();

const sampleNGOs = [
  {
    name: 'Education for All Foundation',
    description: 'Providing quality education to underprivileged children worldwide. We focus on building schools, training teachers, and providing educational materials to communities in need.',
    category: 'Education',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    preferredCoin: 'USDC.polygon',
    website: 'https://educationforall.org',
    verified: true,
  },
  {
    name: 'Global Health Initiative',
    description: 'Improving healthcare access in developing countries through medical supplies, training programs, mobile clinics, and vaccination campaigns.',
    category: 'Healthcare',
    walletAddress: '0x8ba1f109551bD432803012645Hac136c22C177',
    preferredCoin: 'USDC.polygon',
    website: 'https://globalhealth.org',
    verified: true,
  },
  {
    name: 'Climate Action Network',
    description: 'Fighting climate change through reforestation projects, renewable energy initiatives, carbon offset programs, and environmental education.',
    category: 'Environment',
    walletAddress: '0x1234567890123456789012345678901234567890',
    preferredCoin: 'USDC.polygon',
    website: 'https://climateaction.org',
    verified: true,
  },
  {
    name: 'Poverty Relief Organization',
    description: 'Supporting communities in need through food programs, job training, microfinance initiatives, and sustainable development projects.',
    category: 'Poverty',
    walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    preferredCoin: 'USDT.polygon',
    website: 'https://povertyrelief.org',
    verified: true,
  },
  {
    name: 'Disaster Response Team',
    description: 'Rapid response to natural disasters and emergencies worldwide, providing immediate aid, shelter, medical care, and long-term recovery support.',
    category: 'Disaster Relief',
    walletAddress: '0x9876543210987654321098765432109876543210',
    preferredCoin: 'USDC.polygon',
    website: 'https://disasterresponse.org',
    verified: true,
  },
  {
    name: 'Human Rights Watch',
    description: 'Protecting human rights globally through advocacy, legal support, documentation of abuses, and supporting victims of human rights violations.',
    category: 'Human Rights',
    walletAddress: '0x1111111111111111111111111111111111111111',
    preferredCoin: 'USDC.polygon',
    website: 'https://humanrightswatch.org',
    verified: true,
  },
  {
    name: 'Clean Water Initiative',
    description: 'Providing access to clean drinking water in underserved communities through well construction, water filtration systems, and sanitation programs.',
    category: 'Healthcare',
    walletAddress: '0x2222222222222222222222222222222222222222',
    preferredCoin: 'USDC.polygon',
    website: 'https://cleanwater.org',
    verified: true,
  },
  {
    name: 'Tech for Good Foundation',
    description: 'Bridging the digital divide by providing technology access, digital literacy training, and tech education to underserved communities worldwide.',
    category: 'Education',
    walletAddress: '0x3333333333333333333333333333333333333333',
    preferredCoin: 'USDC.polygon',
    website: 'https://techforgood.org',
    verified: true,
  },
  {
    name: 'Wildlife Conservation Society',
    description: 'Protecting endangered species and their habitats through conservation programs, anti-poaching efforts, and ecosystem restoration projects.',
    category: 'Environment',
    walletAddress: '0x4444444444444444444444444444444444444444',
    preferredCoin: 'USDC.polygon',
    website: 'https://wildlifeconservation.org',
    verified: true,
  },
  {
    name: 'Refugee Support Network',
    description: 'Providing essential services to refugees and displaced persons including shelter, food, medical care, education, and legal assistance.',
    category: 'Human Rights',
    walletAddress: '0x5555555555555555555555555555555555555555',
    preferredCoin: 'USDT.polygon',
    website: 'https://refugeesupport.org',
    verified: true,
  },
  {
    name: 'Rural Development Fund',
    description: 'Empowering rural communities through agricultural training, infrastructure development, access to markets, and sustainable farming practices.',
    category: 'Poverty',
    walletAddress: '0x6666666666666666666666666666666666666666',
    preferredCoin: 'USDC.polygon',
    website: 'https://ruraldev.org',
    verified: true,
  },
  {
    name: 'Mental Health Alliance',
    description: 'Providing mental health services, counseling, and support to individuals and communities, with a focus on reducing stigma and increasing access.',
    category: 'Healthcare',
    walletAddress: '0x7777777777777777777777777777777777777777',
    preferredCoin: 'USDC.polygon',
    website: 'https://mentalhealthalliance.org',
    verified: true,
  },
];

async function seed() {
  try {
    console.log('🌱 Starting seed...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shiftaid');
    console.log('✅ Connected to MongoDB');

    // Clear existing NGOs (optional - comment out if you want to keep existing)
    // await NGO.deleteMany({});
    // console.log('🗑️  Cleared existing NGOs');

    // Insert sample NGOs
    for (const ngoData of sampleNGOs) {
      const existing = await NGO.findOne({ walletAddress: ngoData.walletAddress.toLowerCase() });
      if (!existing) {
        const ngo = new NGO(ngoData);
        await ngo.save();
        console.log(`✅ Created NGO: ${ngo.name}`);
      } else {
        console.log(`⏭️  Skipped existing NGO: ${existing.name}`);
      }
    }

    console.log('🎉 Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();

