"use client";
import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';


export default function HealthConcernsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const healthConcerns = [
    {
      id: 1,
      name: 'Cough & Cold?',
      price: '₹399',
      image: 'https://images.unsplash.com/photo-1516900557549-41557d405adf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      alt: 'Cough & Cold',
      link: '/consult/direct/new_consultation?id=22'
    },
    {
      id: 2,
      name: 'Period problems?',
      price: '₹499',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      alt: 'Period problems',
      link: '/consult/direct/new_consultation?id=16'
    },
    {
      id: 3,
      name: 'Performance issues in bed?',
      price: '₹499',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      alt: 'Performance issues in bed',
      link: '/consult/direct/new_consultation?id=14'
    },
    {
      id: 4,
      name: 'Skin problems?',
      price: '₹449',
      image: 'https://images.unsplash.com/photo-1556228578-9c360e1d8d34?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      alt: 'Skin problems',
      link: '/consult/direct/new_consultation?id=5'
    },
    {
      id: 5,
      name: 'Depression or anxiety?',
      price: '₹499',
      image: 'https://images.unsplash.com/photo-1598257006626-48b0c252350d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      alt: 'Depression or anxiety',
      link: '/consult/direct/new_consultation?id=2'
    },
    {
      id: 6,
      name: 'Want to lose weight?',
      price: '₹350',
      image: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      alt: 'Want to lose weight',
      link: '/consult/direct/new_consultation?id=18'
    },
    {
      id: 7,
      name: 'Stomach issues?',
      price: '₹399',
      image: 'https://images.unsplash.com/photo-1540202403-a2c2908e9c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      alt: 'Stomach issues',
      link: '/consult/direct/new_consultation?id=22'
    },
    {
      id: 8,
      name: 'Vaginal infections?',
      price: '₹499',
      image: 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      alt: 'Vaginal infections',
      link: '/consult/direct/new_consultation?id=16'
    },
    {
      id: 9,
      name: 'Sick kid?',
      price: '₹499',
      image: 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      alt: 'Sick kid',
      link: '/consult/direct/new_consultation?id=17'
    },
    {
      id: 10,
      name: 'Headache & Migraine?',
      price: '₹399',
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      alt: 'Headache & Migraine',
      link: '/consult/direct/new_consultation?id=22'
    },
    {
      id: 11,
      name: 'Joint pain?',
      price: '₹449',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      alt: 'Joint pain',
      link: '/consult/direct/new_consultation?id=7'
    },
    {
      id: 12,
      name: 'Sleep problems?',
      price: '₹499',
      image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      alt: 'Sleep problems',
      link: '/consult/direct/new_consultation?id=2'
    },
  ];

  const handleNext = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.querySelector('.health-card')?.clientWidth || 0;
      const gap = 16;
      const scrollAmount = (cardWidth + gap) * 3;
      
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setCurrentIndex(prev => Math.min(prev + 1, Math.ceil(healthConcerns.length / 3) - 1));
    }
  };

  const handlePrev = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.querySelector('.health-card')?.clientWidth || 0;
      const gap = 16;
      const scrollAmount = (cardWidth + gap) * 3;
      
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setCurrentIndex(prev => Math.max(prev - 1, 0));
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.querySelector('.health-card')?.clientWidth || 0;
      const gap = 16;
      const newIndex = Math.round(scrollLeft / ((cardWidth + gap) * 3));
      setCurrentIndex(Math.min(newIndex, Math.ceil(healthConcerns.length / 3) - 1));
    }
  };

  return (
    <section className="py-12 mt-0"> {/* REMOVED: px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto */}
     <div className="mb-10">
  <h2 className="text-3xl md:text-4xl font-bold text-left text-gray-900 mb-3">
    Common Health Concerns
  </h2>
  <p className="text-gray-600 text-left mb-6">
    Consult a doctor online for any health issue
  </p>
</div>

      <div className="relative">
        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed ${
            currentIndex === 0 ? 'opacity-0' : 'opacity-100'
          }`}
          aria-label="Previous health concerns"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex >= Math.ceil(healthConcerns.length / 3) - 1}
          className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed ${
            currentIndex >= Math.ceil(healthConcerns.length / 3) - 1 ? 'opacity-0' : 'opacity-100'
          }`}
          aria-label="Next health concerns"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide space-x-4 pb-4"
          style={{
            scrollBehavior: 'smooth',
            scrollSnapType: 'x mandatory',
          }}
          onScroll={handleScroll}
        >
          {healthConcerns.map((concern) => (
            <div
              key={concern.id}
              className="health-card flex-shrink-0 w-64 md:w-72 lg:w-80 scroll-snap-start"
            >
              <a
                href={concern.link}
                className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 h-full border border-gray-100 group overflow-hidden"
              >
                {/* Image Section */}
                <div className="relative h-40 md:h-48 overflow-hidden rounded-t-xl">
                  <img
                    src={concern.image}
                    alt={concern.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* Content Section */}
                <div className="p-5 md:p-6">
                  <h4 className="heading font-bold text-gray-900 text-lg md:text-xl mb-2 line-clamp-2 h-14">
                    {concern.name}
                  </h4>
                  <div className="flex items-center justify-between mt-4">
                    <p className="price text-green-600 font-bold text-xl md:text-2xl">
                      {concern.price}
                    </p>
                    <span className="link primary cta inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm md:text-base transition-all duration-200 group-hover:translate-x-1">
                      Consult Now
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>

        {/* Scroll Indicators */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(healthConcerns.length / 3) }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (scrollContainerRef.current) {
                  const container = scrollContainerRef.current;
                  const cardWidth = container.querySelector('.health-card')?.clientWidth || 0;
                  const gap = 16;
                  const scrollAmount = (cardWidth + gap) * 3 * index;
                  container.scrollTo({ left: scrollAmount, behavior: 'smooth' });
                  setCurrentIndex(index);
                }
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentIndex === index ? 'bg-blue-600 w-6' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* View All Symptoms Button */}
     <div className="mt-12 text-center md:text-left">
  <a
    href="/consult/symptoms"
    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-lg group"
  >
    See All Symptoms
    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
  </a>
</div>


      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scroll-snap-start {
          scroll-snap-align: start;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      `}</style>
    </section>
  );
}