'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getNGOs } from '@/lib/api';
import { formatAddress } from '@/lib/utils';
import { Loader2, CheckCircle2, Search } from 'lucide-react';
import Link from 'next/link';

const categories = ['Education', 'Healthcare', 'Environment', 'Poverty', 'Disaster Relief', 'Human Rights', 'Other'];

export default function NGOsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');

  const { data: ngos = [], isLoading } = useQuery({
    queryKey: ['ngos', { verified: true, category, search }],
    queryFn: () => getNGOs({ verified: true, category: category === 'all' ? undefined : category, search: search || undefined }),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Verified NGOs</h1>
          <p className="text-lg text-gray-600">
            Support verified organizations making a difference worldwide
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search NGOs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* NGOs Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : ngos.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500 py-8">No NGOs found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ngos.map((ngo: any) => (
              <Card key={ngo._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{ngo.name}</CardTitle>
                    {ngo.verified && (
                      <div title="Verified">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                    )}
                  </div>
                  <CardDescription>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {ngo.category}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{ngo.description}</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Wallet: </span>
                      <span className="font-mono text-xs">{formatAddress(ngo.walletAddress)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Preferred: </span>
                      <span className="font-semibold">{ngo.preferredCoin}</span>
                    </div>
                    {ngo.totalDonations > 0 && (
                      <div>
                        <span className="text-gray-500">Total Received: </span>
                        <span className="font-semibold text-green-600">
                          {parseFloat(ngo.totalDonations).toFixed(2)} {ngo.preferredCoin}
                        </span>
                      </div>
                    )}
                    {ngo.website && (
                      <a
                        href={ngo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Visit Website →
                      </a>
                    )}
                  </div>
                  <Link href={`/donate?ngo=${ngo._id}`}>
                    <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                      Donate Now
                    </button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


