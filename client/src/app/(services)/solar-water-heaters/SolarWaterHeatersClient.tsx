// app/(services)/solar-water-heaters/SolarWaterHeatersClient.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Droplets, 
  CheckCircle, 
  ArrowRight,
  Thermometer,
  Shield,
  Clock,
  ThumbsUp,
  TrendingDown,
} from 'lucide-react';
import CircularGallery from '@/components/CircularGallery';
import { useTheme } from '@/context/ThemeContext';
import { getProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types/product';


const waterHeaterImages = [
  { image: '/solar-heaters/300L-Stainless-Flat-Panel-Seven-Stars-Solar-Water-Heater-1-1.jpg', location: 'Runda, Nairobi', system: '300L Solar Water Heater' },
  { image: '/solar-heaters/150L-Seven-Star-Pressurized-Solar-Water-Heater-White-300x300.jpg', location: 'Kiambu Road', system: '150L Solar Water Heater' },
  { image: '/solar-heaters/150L-Stainless-Seven-Stars-Non-Pressurized-Solar-WaterHeat.jpg', location: 'Westlands, Nairobi', system: '150L Solar Water Heater' },
  { image: '/solar-heaters/Seven-SS-Stars-300-Liters-indirect-flat-plate-solar-water-heater.webp', location: 'Karen, Nairobi', system: '300L Solar Water Heater' },
];

const formattedGalleryItems = waterHeaterImages.map(item => ({
  image: item.image,
  text: `${item.location}\n${item.system}`
}));

const benefits = [
  { value: '85+%', label: 'Energy Savings' },
  { value: '25+', label: 'Years Lifespan' },
  { value: '100+', label: 'Installations Completed' },
  { value: '365', label: 'Days of Hot Water'},
];

const features = [
  { icon: Shield, title: 'Premium Quality', description: 'Kenya\'s most trusted solar water heater' },
  { icon: Thermometer, title: 'All-Weather Performance', description: 'Works efficiently even on cloudy days' },
  { icon: Clock, title: 'Instant Hot Water', description: 'Endless hot water whenever you need it' },
  { icon: ThumbsUp, title: 'Easy Installation', description: 'Professional installation in 1-2 days' },
  { icon: Shield, title: 'Low Maintenance', description: 'Minimal maintenance required' },
  { icon: TrendingDown, title: 'Immediate Savings', description: 'Start saving from day one' },
];

const whySolarBenefits = [
  'Reduces electricity bill',
  'Provides free hot water for 25+ years',
  'Works efficiently in all weather conditions',
  'Environmentally friendly',
  'Increases property resale value',
  'Qualifies for green energy incentives',
];

export default function SolarWaterHeatersClient() {
  const { theme } = useTheme();
  const galleryTextColor = theme === 'dark' ? '#ffffff' : '#1f2937';
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchSolarWaterHeaterProducts();
  }, []);

  const fetchSolarWaterHeaterProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts({
        category: 'Solar Water Heaters',
        limit: 6,
        sort: 'createdAt',
        order: 'desc'
      });
      
      // ProductListResponse has a 'products' property directly
      const productsData = response.products || [];
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching solar water heater products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Show loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-xl" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );

  // Show empty state when no products found
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
        <Droplets className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No Products Available
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Solar water heater products are coming soon. Check back later!
      </p>
      <Link 
        href="/contact" 
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all"
      >
        Contact Us for Availability <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 lg:pt-24 pb-16 lg:pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-white dark:hidden" />
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-gray-900 via-blue-950/20 to-gray-950" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-2 mb-6">
                <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Solar Water Heaters</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Solar{' '}
                <span className="text-blue-600 dark:text-blue-400">
                  Water Heaters
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Save up to 85% on water heating costs with Kenya's premier solar water heaters. 
                Endless hot water, zero electricity bills for heating.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-base transition-all">
                  Get Free Quote <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                {benefits.map((benefit, i) => {
                  return (
                    <div key={i} className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{benefit.value}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{benefit.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="relative">
              <div className="relative h-[400px] rounded-xl overflow-hidden shadow-xl">
                <Image
                  src="/solar-heaters/solar_water_heaters-preview.png"
                  alt="Solar water heater installation"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 lg:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose{' '}
              <span className="text-blue-600 dark:text-blue-400">Us?</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We deliver excellence in every solar water heater installation
            </p>
            <div className="w-20 h-0.5 bg-blue-600 dark:bg-blue-400 mx-auto mt-4 rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits List Section */}
      <section className="py-20 lg:py-24 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 dark:text-white mb-6">
              Benefits of{' '}
              <span className="text-blue-600 dark:text-blue-400">Solar Water Heating</span>
            </h2>
            <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-10">
              Join thousands of Kenyan homeowners saving money with solar water heaters
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {whySolarBenefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solar Water Heaters Products Section */}
      <section className="py-20 lg:py-24 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our{' '}
              <span className="text-blue-600 dark:text-blue-400">Products</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Explore our range of high-quality solar water heaters
            </p>
            <div className="w-20 h-0.5 bg-blue-600 dark:bg-blue-400 mx-auto mt-4 rounded-full" />
          </div>
          
          {loading ? (
            <LoadingSkeleton />
          ) : products.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {products.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product}
                  // Remove isList if it's not a valid prop, or set to false if it's optional
                  // If ProductCard requires isList, uncomment the line below
                  // isList={false}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>            
      </section>
          
      {/* Gallery Section */}
      <section className="py-20 lg:py-24 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our{' '}
              <span className="text-blue-600 dark:text-blue-400">Installations</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              See how we've helped homes across Kenya enjoy free hot water
            </p>
            <div className="w-20 h-0.5 bg-blue-600 dark:bg-blue-400 mx-auto mt-4 rounded-full" />
          </div>
          
          <div className="h-[500px] md:h-[550px] rounded-xl overflow-hidden shadow-lg">
            {mounted && (
              <CircularGallery
                items={formattedGalleryItems}
                bend={2.5}
                textColor={galleryTextColor}
                borderRadius={0.08}
                font="bold 16px Figtree, sans-serif"
                scrollSpeed={2.8}
                scrollEase={0.05}
              />
            )}
          </div>
          <p className="text-center text-base text-gray-500 dark:text-gray-400 mt-4">
            Hover or drag to explore - Each location features system size details
          </p>
        </div>
      </section>

      {/* Brand Section */}
      <section className="py-20 lg:py-24 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Ready to install a Solar Water Heater?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Kenya's most trusted solar water heater brand. Engineered for Kenyan conditions with 
              high-efficiency collectors and durable storage tanks.
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-all shadow-lg"
            >
              Request Installation <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}