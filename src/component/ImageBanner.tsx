'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import styles from './ImageBanner.module.css';

interface BannersConfig {
  count: number;
}

const ImageBanner: React.FC = () => {
  const [banners, setBanners] = useState<string[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [usePublicBanners, setUsePublicBanners] = useState(false);
  const autoSlideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadBanners = useCallback(async () => {
    setIsLoading(true);

    try {
      const r2BaseUrl = process.env.NEXT_PUBLIC_R2_URL || 'https://example.com';
      const maxBanners = 5;
      let validBannerUrls: string[] = [];

      const cachedBanners = sessionStorage.getItem('banners');
      if (cachedBanners) {
        setBanners(JSON.parse(cachedBanners));
        setIsLoading(false);
        return;
      }

      for (let i = 1; i <= maxBanners; i++) {
        const pngUrl = `${r2BaseUrl}/banners/${i}.png`;
        const jpgUrl = `${r2BaseUrl}/banners/${i}.jpg`;

        try {
          const pngResponse = await fetch(pngUrl, { method: 'HEAD' });
          if (pngResponse.ok) {
            validBannerUrls.push(pngUrl);
            continue;
          }

          const jpgResponse = await fetch(jpgUrl, { method: 'HEAD' });
          if (jpgResponse.ok) {
            validBannerUrls.push(jpgUrl);
          }
        } catch (error) {
          console.log(`Error checking banner ${i}:`, error);
        }
      }

      if (validBannerUrls.length === 0) {
        setUsePublicBanners(true);
        validBannerUrls = [];

        try {
          const response = await fetch('/banners/config.json');
          if (response.ok) {
            const config = await response.json() as BannersConfig;
            const bannersCount = config.count || 0;

            if (bannersCount > 0) {
              for (let i = 1; i <= bannersCount; i++) {
                validBannerUrls.push(`/banners/${i}.jpg`);
              }
            } else {
              for (let i = 1; i <= maxBanners; i++) {
                validBannerUrls.push(`/banners/${i}.jpg`);
              }
            }
          } else {
            for (let i = 1; i <= maxBanners; i++) {
              validBannerUrls.push(`/banners/${i}.jpg`);
            }
          }
        } catch (error) {
          console.error("Failed to check banners in public folder:", error);
          validBannerUrls = ['/banners/1.jpg', '/banners/2.jpg', '/banners/3.jpg'];
        }
      }

      sessionStorage.setItem('banners', JSON.stringify(validBannerUrls));
      setBanners(validBannerUrls);
    } catch (error) {
      console.error("Failed to load banners:", error);
      setUsePublicBanners(true);

      const defaultBanners = ['/banners/1.jpg', '/banners/2.jpg', '/banners/3.jpg'];
      setBanners(defaultBanners);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleImageError = useCallback((index: number) => {
    setBanners(prevBanners => {
      const newBanners = [...prevBanners];
      newBanners.splice(index, 1);
      if (currentBannerIndex >= newBanners.length && newBanners.length > 0) {
        setCurrentBannerIndex(0);
      }
      return newBanners;
    });
  }, [currentBannerIndex]);

  const changeBanner = useCallback((direction: 'next' | 'prev' | number) => {
    if (banners.length === 0) return;

    if (autoSlideTimerRef.current) {
      clearInterval(autoSlideTimerRef.current);
    }

    setCurrentBannerIndex(prevIndex => {
      if (typeof direction === 'number') {
        return direction;
      } else if (direction === 'next') {
        return (prevIndex + 1) % banners.length;
      } else {
        return prevIndex === 0 ? banners.length - 1 : prevIndex - 1;
      }
    });

    startAutoSlideTimer();
  }, [banners.length]);

  const startAutoSlideTimer = useCallback(() => {
    if (banners.length <= 1) return;

    if (autoSlideTimerRef.current) {
      clearInterval(autoSlideTimerRef.current);
    }

    autoSlideTimerRef.current = setInterval(() => {
      setCurrentBannerIndex(prevIndex => (prevIndex + 1) % banners.length);
    }, 5000);
  }, [banners.length]);

  useEffect(() => {
    if (performance?.navigation?.type === 1) {
      sessionStorage.removeItem('banners');
    }
    loadBanners();
  }, [loadBanners]);

  useEffect(() => {
    startAutoSlideTimer();

    return () => {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
      }
    };
  }, [banners, startAutoSlideTimer]);

  if (isLoading) {
    return (
      <div className={styles.bannerSkeleton}>
        <div className={styles.skeletonAnimation}></div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className={styles.noBanner}>
        <p>이미지 로드 실패</p>
      </div>
    );
  }

  return (
    <div className={styles.bannerContainer}>
      <div className={styles.bannerContent}>
        {banners.map((banner, index) => (
          <div 
            key={`banner-${index}`}
            className={`${styles.bannerItem} ${index === currentBannerIndex ? styles.active : ''}`}
          >
            {usePublicBanners ? (
              <Image 
                src={banner} 
                alt={`Banner ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                priority={index === currentBannerIndex}
                className={styles.bannerImage}
                onError={() => handleImageError(index)}
              />
            ) : (
              <img 
                src={banner} 
                alt={`Banner ${index + 1}`}
                className={styles.bannerImage}
                onError={() => handleImageError(index)}
              />
            )}
          </div>
        ))}

        {banners.length > 1 && (
          <div className={styles.navigation}>
            <button 
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={() => changeBanner('prev')}
              aria-label="Previous banner"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={() => changeBanner('next')}
              aria-label="Next banner"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}

        {banners.length > 1 && (
          <div className={styles.indicators}>
            {banners.map((_, index) => (
              <button
                key={`indicator-${index}`}
                className={`${styles.indicator} ${index === currentBannerIndex ? styles.activeIndicator : ''}`}
                onClick={() => changeBanner(index)}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageBanner;
