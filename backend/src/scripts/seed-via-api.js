/**
 * Alternative seeding script that uses the API instead of direct database access
 * Use this if MongoDB connection is not available or you want to seed via API
 * 
 * Make sure the backend server is running before executing this script
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:3001';

const sampleNGOs = [
  {
    name: 'Education for All Foundation',
    description: 'Providing quality education to underprivileged children worldwide. We focus on building schools, training teachers, and providing educational materials to communities in need.',
    category: 'Education',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    preferredCoin: 'USDC.polygon',
    website: 'https://educationforall.org',
  },
  {
    name: 'Global Health Initiative',
    description: 'Improving healthcare access in developing countries through medical supplies, training programs, mobile clinics, and vaccination campaigns.',
    category: 'Healthcare',
    walletAddress: '0x8ba1f109551bD432803012645Hac136c22C177',
    preferredCoin: 'USDC.polygon',
    website: 'https://globalhealth.org',
  },
  {
    name: 'Climate Action Network',
    description: 'Fighting climate change through reforestation projects, renewable energy initiatives, carbon offset programs, and environmental education.',
    category: 'Environment',
    walletAddress: '0x1234567890123456789012345678901234567890',
    preferredCoin: 'USDC.polygon',
    website: 'https://climateaction.org',
  },
  {
    name: 'Poverty Relief Organization',
    description: 'Supporting communities in need through food programs, job training, microfinance initiatives, and sustainable development projects.',
    category: 'Poverty',
    walletAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    preferredCoin: 'USDT.polygon',
    website: 'https://povertyrelief.org',
  },
  {
    name: 'Disaster Response Team',
    description: 'Rapid response to natural disasters and emergencies worldwide, providing immediate aid, shelter, medical care, and long-term recovery support.',
    category: 'Disaster Relief',
    walletAddress: '0x9876543210987654321098765432109876543210',
    preferredCoin: 'USDC.polygon',
    website: 'https://disasterresponse.org',
  },
  {
    name: 'Human Rights Watch',
    description: 'Protecting human rights globally through advocacy, legal support, documentation of abuses, and supporting victims of human rights violations.',
    category: 'Human Rights',
    walletAddress: '0x1111111111111111111111111111111111111111',
    preferredCoin: 'USDC.polygon',
    website: 'https://humanrightswatch.org',
  },
  {
    name: 'Clean Water Initiative',
    description: 'Providing access to clean drinking water in underserved communities through well construction, water filtration systems, and sanitation programs.',
    category: 'Healthcare',
    walletAddress: '0x2222222222222222222222222222222222222222',
    preferredCoin: 'USDC.polygon',
    website: 'https://cleanwater.org',
  },
  {
    name: 'Tech for Good Foundation',
    description: 'Bridging the digital divide by providing technology access, digital literacy training, and tech education to underserved communities worldwide.',
    category: 'Education',
    walletAddress: '0x3333333333333333333333333333333333333333',
    preferredCoin: 'USDC.polygon',
    website: 'https://techforgood.org',
  },
  {
    name: 'Wildlife Conservation Society',
    description: 'Protecting endangered species and their habitats through conservation programs, anti-poaching efforts, and ecosystem restoration projects.',
    category: 'Environment',
    walletAddress: '0x4444444444444444444444444444444444444444',
    preferredCoin: 'USDC.polygon',
    website: 'https://wildlifeconservation.org',
  },
  {
    name: 'Refugee Support Network',
    description: 'Providing essential services to refugees and displaced persons including shelter, food, medical care, education, and legal assistance.',
    category: 'Human Rights',
    walletAddress: '0x5555555555555555555555555555555555555555',
    preferredCoin: 'USDT.polygon',
    website: 'https://refugeesupport.org',
  },
  {
    name: 'Rural Development Fund',
    description: 'Empowering rural communities through agricultural training, infrastructure development, access to markets, and sustainable farming practices.',
    category: 'Poverty',
    walletAddress: '0x6666666666666666666666666666666666666666',
    preferredCoin: 'USDC.polygon',
    website: 'https://ruraldev.org',
  },
  {
    name: 'Mental Health Alliance',
    description: 'Providing mental health services, counseling, and support to individuals and communities, with a focus on reducing stigma and increasing access.',
    category: 'Healthcare',
    walletAddress: '0x7777777777777777777777777777777777777777',
    preferredCoin: 'USDC.polygon',
    website: 'https://mentalhealthalliance.org',
  },
];

async function seedViaAPI() {
  try {
    console.log('🌱 Starting seed via API...');
    console.log(`📡 API URL: ${API_URL}`);

    // Check if API is running
    try {
      await axios.get(`${API_URL}/health`);
      console.log('✅ Backend API is running');
    } catch (error) {
      console.error('❌ Backend API is not running. Please start it first:');
      console.error('   cd backend && npm run dev');
      process.exit(1);
    }

    let created = 0;
    let skipped = 0;

    // Create NGOs via API
    for (const ngoData of sampleNGOs) {
      try {
        const response = await axios.post(`${API_URL}/api/ngos`, ngoData);
        console.log(`✅ Created NGO: ${ngoData.name}`);
        created++;

        // Verify the NGO (admin action)
        try {
          await axios.patch(`${API_URL}/api/ngos/${response.data._id}/verify`);
          console.log(`   ✓ Verified: ${ngoData.name}`);
        } catch (verifyError) {
          console.log(`   ⚠️  Could not verify: ${ngoData.name}`);
        }
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.error?.includes('already exists')) {
          console.log(`⏭️  Skipped existing NGO: ${ngoData.name}`);
          skipped++;
        } else {
          console.error(`❌ Failed to create ${ngoData.name}:`, error.response?.data?.error || error.message);
        }
      }
    }

    console.log('\n🎉 Seed completed!');
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${sampleNGOs.length}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seedViaAPI();


